"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notification.types';
import { formatRelativeTime } from '@/types/notification.types';
import { getActiveTenantId } from '@/utils/tenantUrl';

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
    tenant_id: raw.tenant_id as string | undefined,
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
export function useNotifications(explicitTenantId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);

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

  // Obtener el userId y activeTenantId al montar o si explicitTenantId cambia
  useEffect(() => {
    setUserId(getUserIdFromStorage());
    setActiveTenantId(explicitTenantId || getActiveTenantId());
  }, [explicitTenantId]);

  // Fetch inicial de notificaciones estrictamente acotado por tenant_id
  const fetchNotifications = useCallback(async (uid: string, tenantId: string | null) => {
    if (!tenantId) {
      setNotifications([]);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('useNotifications: Error al obtener notificaciones:', error.message);
      return;
    }

    // Doble barrera de seguridad: filtrado estricto en memoria por el tenant activo
    const filtered = (data ?? []).filter((raw) => (raw as any).tenant_id === tenantId);
    setNotifications(filtered.map(enrichNotification));
  }, []);

  // Fetch inicial + suscripción Realtime
  useEffect(() => {
    if (!userId || !activeTenantId) {
      if (!userId) setLoading(false);
      return;
    }

    setLoading(true);
    fetchNotifications(userId, activeTenantId).finally(() => setLoading(false));

    // ─── Canal Realtime ────────────────────────────────────────────────────
    const channelName = `notifications-${userId}-${activeTenantId}-${Math.random().toString(36).slice(2, 9)}`;
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
          const raw = (payload.new || {}) as Record<string, unknown>;
          const notifTenantId = raw.tenant_id as string | undefined;

          // 🛡️ AISLAMIENTO MULTI-INQUILINO ESTRICTO:
          // Si la notificación pertenece a otra clínica/tenant diferente a la activa, ignorar por completo.
          if (notifTenantId && notifTenantId !== activeTenantId) {
            return;
          }

          if (payload.eventType === 'INSERT') {
            const newNotif = enrichNotification(raw);
            setNotifications((prev) => [newNotif, ...prev]);

            // Deduplicación global para evitar doble Toast (Desktop + Mobile)
            if (!recentlyToasted.has(newNotif.id)) {
              recentlyToasted.add(newNotif.id);
              setTimeout(() => recentlyToasted.delete(newNotif.id), 5000);

              // Toast de notificación en tiempo real
              const toastOptions = {
                description: newNotif.description,
                duration: 5000,
                className: 'text-base font-semibold',
                descriptionClassName: 'text-sm font-medium mt-1 opacity-90',
              };
              switch (newNotif.type) {
                case 'success': toast.success(newNotif.title, toastOptions); break;
                case 'warning': toast.warning(newNotif.title, toastOptions); break;
                case 'error':   toast.error(newNotif.title, toastOptions);   break;
                default:        toast.info(newNotif.title, toastOptions);    break;
              }

              // Sonido de notificación categorizado
              playNotificationSound(newNotif.type);
            }

          } else if (payload.eventType === 'UPDATE') {
            const updated = enrichNotification(raw);
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
  }, [userId, activeTenantId, fetchNotifications, playNotificationSound]);

  // ─── Acción: Marcar todas como leídas (restringido al tenant activo) ─────────
  const markAllAsRead = useCallback(async () => {
    if (!userId || !activeTenantId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('tenant_id', activeTenantId)
      .eq('read', false);

    if (error) {
      console.error('useNotifications: Error al marcar como leídas:', error.message);
      fetchNotifications(userId, activeTenantId);
    }
  }, [userId, activeTenantId, fetchNotifications]);

  // ─── Acción: Marcar una como leída (restringido al tenant activo) ──────────
  const markAsRead = useCallback(async (id: string) => {
    if (!userId || !activeTenantId) return;

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('tenant_id', activeTenantId);

    if (error) {
      console.error('useNotifications: Error al marcar notificación como leída:', error.message);
      fetchNotifications(userId, activeTenantId);
    }
  }, [userId, activeTenantId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAllAsRead, markAsRead, activeTenantId };
}
