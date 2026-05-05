import type { LucideIcon } from 'lucide-react';

// ─── Union Type de Tipos de Notificación ────────────────────────────────────
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// ─── Interface de Notificación (espeja la tabla public.notifications en Supabase) ──
export interface Notification {
  id: string;                        // UUID en Supabase (era number en mocks)
  user_id?: string;                  // FK a profiles.id
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, unknown>; // JSONB: guarda appointment_id, invoice_id, etc.
  created_at?: string;               // ISO timestamp de Supabase
  // Campo de presentación (calculado en el hook, no existe en la DB)
  time?: string;
  icon?: LucideIcon;
}

// ─── Props del Componente NotificationCenter ────────────────────────────────
export interface NotificationCenterProps {
  isMobile: boolean;
}

// ─── Mapa de Colores por Tipo (Dark Mode Coherente con el Sidebar) ───────────
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  success: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30',
  info:    'bg-blue-950/50 text-blue-400 border-blue-800/30',
  warning: 'bg-amber-950/50 text-amber-400 border-amber-800/30',
  error:   'bg-rose-950/50 text-rose-400 border-rose-800/30',
};

// ─── Helper: Formato relativo de tiempo ─────────────────────────────────────
export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}
