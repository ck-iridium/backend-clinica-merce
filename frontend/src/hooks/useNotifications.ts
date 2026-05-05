import { useState, useEffect, useCallback } from 'react';
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
    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Añadir la nueva notificación al principio de la lista
          const newNotif = enrichNotification(payload.new as Record<string, unknown>);
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Actualizar la notificación modificada en la lista
          const updated = enrichNotification(payload.new as Record<string, unknown>);
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    // Limpieza: eliminar la suscripción al desmontar el componente
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
