import type { LucideIcon } from 'lucide-react';

// ─── Union Type de Tipos de Notificación ────────────────────────────────────
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// ─── Interface Principal de Notificación ────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
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
