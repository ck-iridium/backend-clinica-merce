"use client";

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Notification, NotificationCenterProps } from '@/types/notification.types';
import { NOTIFICATION_COLORS } from '@/types/notification.types';
import { mockNotifications, getUnreadCount } from '@/mocks/notification.mocks';

// ─── Sub-componente: Cabecera del Panel ──────────────────────────────────────
function NotificationHeader({
  unreadCount,
  onClose,
}: {
  unreadCount: number;
  onClose?: () => void;
}) {
  return (
    <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between shrink-0">
      <h3 className="font-serif text-xl font-semibold text-white tracking-tight">
        Notificaciones
      </h3>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-full">
            {unreadCount} sin leer
          </span>
        )}
        {/* Botón X de cierre explícito (solo en móvil) */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-500 hover:bg-stone-800 hover:text-white transition-all"
            aria-label="Cerrar notificaciones"
          >
            <X size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-componente: Lista de Notificaciones ─────────────────────────────────
function NotificationList({
  notifications,
  onMarkAllRead,
}: {
  notifications: Notification[];
  onMarkAllRead: () => void;
}) {
  const unreadCount = getUnreadCount(notifications);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Items — dark-scrollbar para coherencia con el tema oscuro */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-800/50 dark-scrollbar">
        {notifications.map((n) => {
          const Icon = n.icon;
          const colorClasses = NOTIFICATION_COLORS[n.type];

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3.5 px-4 py-4 transition-all cursor-pointer hover:bg-stone-800/40 border-l-2 ${
                !n.read ? 'border-rose-500' : 'border-transparent'
              }`}
            >
              {Icon && (
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorClasses}`}>
                  <Icon size={16} strokeWidth={1.75} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  {/* El título cambia de color según n.read — reactivo al estado del padre */}
                  <span className={`text-sm font-bold leading-snug transition-colors ${
                    n.read ? 'text-stone-400' : 'text-white'
                  }`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter whitespace-nowrap shrink-0 mt-0.5">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium leading-snug mt-0.5">
                  {n.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Marcar como leídas */}
      {unreadCount > 0 && (
        <div className="px-4 py-3.5 border-t border-stone-800 shrink-0">
          <button
            onClick={onMarkAllRead}
            className="w-full text-[11px] font-black uppercase tracking-widest text-stone-500 hover:text-[#d9777f] transition-colors py-1"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal: NotificationCenter ────────────────────────────────
export function NotificationCenter({ isMobile }: NotificationCenterProps) {
  // Estado de notificaciones: único origen de verdad para el contador y la lista
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    mockNotifications.map((n) => ({ ...n }))
  );
  // Estado de apertura del Sheet (controlado manualmente para evitar que
  // Shadcn desmonte el árbol y pierda el estado de notificaciones)
  const [sheetOpen, setSheetOpen] = useState(false);

  const unreadCount = getUnreadCount(notifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Trigger inline: accede al estado reactivo del componente padre ───────
  const bellButton = (
    <button
      className={
        isMobile
          ? 'relative p-2 text-stone-500 hover:text-stone-800 transition-colors'
          : 'relative w-full flex items-center justify-center p-3.5 rounded-2xl text-stone-500 hover:bg-stone-900 hover:text-white transition-all duration-200 outline-none'
      }
      aria-label="Abrir notificaciones"
    >
      <Bell size={22} strokeWidth={1.5} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-stone-950 animate-pulse" />
      )}
    </button>
  );

  // ── RAMA DESKTOP: Popover anclado a la derecha ───────────────────────────
  if (!isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span>{bellButton}</span>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="end"
          sideOffset={20}
          className="w-[360px] p-0 rounded-2xl bg-stone-900 border-stone-800 text-white shadow-2xl overflow-hidden animate-in slide-in-from-left-2 duration-200 flex flex-col max-h-[480px]"
        >
          <NotificationHeader unreadCount={unreadCount} />
          <NotificationList notifications={notifications} onMarkAllRead={markAllAsRead} />
        </PopoverContent>
      </Popover>
    );
  }

  // ── RAMA MÓVIL: Sheet con estado controlado + botón X explícito ──────────
  return (
    <>
      {/* Trigger manual para evitar que SheetTrigger desmonte el componente */}
      <span onClick={() => setSheetOpen(true)}>
        {bellButton}
      </span>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-stone-950 border-stone-800 text-white rounded-t-3xl max-h-[80vh] p-0 flex flex-col [&>button]:hidden z-[9999]"
        >
          <SheetTitle className="sr-only">Notificaciones</SheetTitle>

          {/* Handle visual */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-stone-700" />
          </div>

          {/* Header con botón X de cierre explícito */}
          <NotificationHeader
            unreadCount={unreadCount}
            onClose={() => setSheetOpen(false)}
          />
          <NotificationList notifications={notifications} onMarkAllRead={markAllAsRead} />
        </SheetContent>
      </Sheet>
    </>
  );
}
