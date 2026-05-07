"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notification.types';
import { formatRelativeTime } from '@/types/notification.types';

// ─── Helper: Obtener userId desde localStorage (patrón del proyecto) ─────────
function getUserIdFromStorage(): string | null {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Helper: Enriquecer notificación con campo `time` calculado ──────────────
function enrichNotification(raw: Record<string, unknown>): Notification {
  return {
    id: raw.id as string,
    user_id: raw.user_id as string,
    title: raw.title as string,
    description: raw.description as string,
    type: raw.type as Notification['type'],
    read: raw.read as boolean,
    metadata: raw.metadata as Record<string, unknown> | undefined,
    created_at: raw.created_at as string,
    time: raw.created_at ? formatRelativeTime(raw.created_at as string) : undefined,
  };
}

// ─── Estado Global para Deduplicación de Toasts ───────────────────────────
const recentlyToasted = new Set<string>();

// ─── Hook Principal ──────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Ref para el pool de sonidos categorizados (positive, alert, neutral)
  const soundsRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializamos el mapa de sonidos apuntando a public/sounds/ (.wav)
    const audioPool = {
      positive: new Audio('/sounds/positive.wav'),
      alert:    new Audio('/sounds/alert.wav'),
      neutral:  new Audio('/sounds/neutral.wav'),
    };

    // Configuración común y precarga para evitar latencia
    Object.values(audioPool).forEach(audio => {
      audio.volume = 0.4;
      audio.load();
    });

    soundsRef.current = audioPool;
  }, []);

  // Función interna para reproducir el sonido según el tipo
  const playNotificationSound = useCallback((type: Notification['type']) => {
    const pool = soundsRef.current;
    let audio: HTMLAudioElement | undefined;

    switch (type) {
      case 'success': audio = pool.positive; break;
      case 'error':   audio = pool.alert;    break;
      default:        audio = pool.neutral;  break; // info y warning usan el neutral
    }

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Bloqueado por política de autoplay del navegador - se ignora silenciosamente
      });
    }
  }, []);

  // Obtener el userId del localStorage al montar
  useEffect(() => {
    setUserId(getUserIdFromStorage());
  }, []);

  // Fetch inicial de notificaciones
  const fetchNotifications = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('useNotifications: Error al obtener notificaciones:', error.message);
      return;
    }

    setNotifications((data ?? []).map(enrichNotification));
  }, []);

  // Fetch inicial + suscripción Realtime
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetchNotifications(userId).finally(() => setLoading(false));

    // ─── Canal Realtime ────────────────────────────────────────────────────
    // Generamos un nombre de canal único por cada ejecución del useEffect
    // para evitar colisiones si React Strict Mode monta/desmonta rápidamente.
    const channelName = `notifications-${userId}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchamos INSERT y UPDATE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = enrichNotification(payload.new as Record<string, unknown>);
            setNotifications((prev) => [newNotif, ...prev]);

            // ─── Deduplicación global para evitar doble Toast (Desktop + Mobile) ──
            if (!recentlyToasted.has(newNotif.id)) {
              recentlyToasted.add(newNotif.id);
              setTimeout(() => recentlyToasted.delete(newNotif.id), 5000);

              // ─── Toast de notificación en tiempo real ──────────────────────
              const toastOptions = {
                description: newNotif.description,
                duration: 5000,
                // Forzamos un texto más grande y legible en el Toast
                className: 'text-base font-semibold',
                descriptionClassName: 'text-sm font-medium mt-1 opacity-90',
              };
              switch (newNotif.type) {
                case 'success': toast.success(newNotif.title, toastOptions); break;
                case 'warning': toast.warning(newNotif.title, toastOptions); break;
                case 'error':   toast.error(newNotif.title, toastOptions);   break;
                default:        toast.info(newNotif.title, toastOptions);    break;
              }

              // ─── Sonido de notificación categorizado ─────────────────────────
              playNotificationSound(newNotif.type);
            }

          } else if (payload.eventType === 'UPDATE') {
            const updated = enrichNotification(payload.new as Record<string, unknown>);
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, playNotificationSound]);

  // ─── Acción: Marcar todas como leídas ────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('useNotifications: Error al marcar como leídas:', error.message);
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  // ─── Acción: Marcar una como leída ───────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('useNotifications: Error al marcar notificación como leída:', error.message);
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAllAsRead, markAsRead };
}
