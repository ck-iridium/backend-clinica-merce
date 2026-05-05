import { CheckCircle2, Globe, Tag, AlertTriangle, CalendarX } from 'lucide-react';
import type { Notification } from '@/types/notification.types';

// ─── Datos Mockeados (realistas para una clínica) ────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Nueva reserva online',
    description: "Lucía R. ha reservado 'Limpieza Facial Profunda' para el martes 6 de mayo.",
    time: 'Hace 5 min',
    type: 'info',
    read: false,
    icon: Globe,
  },
  {
    id: 2,
    title: 'Pago confirmado',
    description: 'Se ha registrado un pago de 85,00 € para la factura #F-2025-0148.',
    time: 'Hace 1 hora',
    type: 'success',
    read: false,
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: 'Stock bajo de bonos',
    description: 'Quedan menos de 3 bonos de Presoterapia disponibles para la venta.',
    time: 'Hace 3 horas',
    type: 'warning',
    read: false,
    icon: Tag,
  },
  {
    id: 4,
    title: 'Cita cancelada',
    description: "Marta P. ha cancelado su cita de 'Radiofrecuencia' prevista para hoy.",
    time: 'Hace 5 horas',
    type: 'error',
    read: true,
    icon: CalendarX,
  },
  {
    id: 5,
    title: 'Recordatorio de revisión',
    description: 'Hay 2 clientes con seguimiento pendiente de la semana pasada.',
    time: 'Ayer',
    type: 'warning',
    read: true,
    icon: AlertTriangle,
  },
];

// ─── Helper: Contador de Notificaciones No Leídas ───────────────────────────
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}
