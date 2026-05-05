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

// ─── Hook Principal ──────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar el audio solo en el cliente (SSR-safe).
    // El archivo debe estar en: frontend/public/sounds/notification.mp3
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.4; // Volumen al 40%, sutil y no intrusivo
    audio.load();       // Precarga en memoria para evitar latencia en el primer play()
    audioRef.current = audio;
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
    // Encadenamos .on() ANTES de .subscribe() estrictamente para evitar race conditions
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchamos todos los cambios (INSERT/UPDATE) en un solo bloque
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = enrichNotification(payload.new as Record<string, unknown>);
            setNotifications((prev) => [newNotif, ...prev]);

            // ─── Toast de notificación en tiempo real ──────────────────────
            // richColors está activo en el Toaster, así que cada método
            // aplica su color automáticamente (verde, rojo, amarillo, etc.)
            const toastOptions = {
              description: newNotif.description,
              duration: 5000,
            };
            switch (newNotif.type) {
              case 'success': toast.success(newNotif.title, toastOptions); break;
              case 'warning': toast.warning(newNotif.title, toastOptions); break;
              case 'error':   toast.error(newNotif.title, toastOptions);   break;
              default:        toast.info(newNotif.title, toastOptions);    break;
            }

            // ─── Sonido de notificación ──────────────────────────────────────
            // try/catch obligatorio: el navegador bloquea autoplay si el
            // usuario no ha interactuado con la página todavía.
            if (audioRef.current) {
              audioRef.current.currentTime = 0; // Reiniciar si ya sonó antes
              audioRef.current.play().catch(() => {
                // Bloqueado por política de autoplay — se ignora silenciosamente
              });
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

    // Cleanup: eliminar el canal al desmontar o cambiar de usuario
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  // ─── Acción: Marcar todas como leídas ────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    // Optimistic update: actualizar la UI inmediatamente sin esperar a la DB
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('useNotifications: Error al marcar como leídas:', error.message);
      // Revertir en caso de error refetcheando
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  // ─── Helper: Contar no leídas ─────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAllAsRead };
}
