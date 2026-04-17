import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';

interface CalendarHeaderProps {
  // Estado para la vista Desktop (Lunes de la semana)
  currentWeek: Date;
  // Estado para la vista Móvil (Día seleccionado)
  mobileSelectedDate: Date;
  // Acciones
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
  onMobileDateSelect: (date: Date) => void;
  // Elemento para el portal de la barra superior en móvil
  mobileTopbarPortal?: Element | null;
}

/**
 * CalendarHeader Component (v2)
 * Encapsula la cabecera tanto para Desktop (Título + Nav)
 * como para Móvil (Portal inyectado en la UI global).
 */
export function CalendarHeader({
  currentWeek,
  mobileSelectedDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  onDateSelect,
  onMobileDateSelect,
  mobileTopbarPortal
}: CalendarHeaderProps) {
  return (
    <>
      {/* 
          VISTA DESKTOP: Navegación eliminada de aquí (trasladada al ContextPanel lateral). 
          Solo dejamos espacio para posibles títulos o overlays si fuera necesario, 
          pero para "Fit-to-Screen" queremos maximizar el alto.
      */}
      <div className="hidden md:block h-2" />

      {/* MOBILE HEADER PORTAL (DatePicker inyectado) */}
      {mobileTopbarPortal && createPortal(
        <div className="flex items-center gap-2">
          <div className="relative pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-800 rounded-xl px-4 py-2.5 font-bold shadow-sm flex items-center justify-between gap-3 min-w-[130px] max-w-[160px]">
              <Calendar size={18} className="text-[#d9777f] shrink-0" />
              <span className="capitalize text-sm text-center flex-1 truncate">
                {mobileSelectedDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')}
              </span>
              <ChevronDown size={18} className="text-stone-400 shrink-0" />
            </div>
            <input 
              type="date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-10"
              style={{ display: 'block' }}
              value={`${mobileSelectedDate.getFullYear()}-${(mobileSelectedDate.getMonth()+1).toString().padStart(2, '0')}-${mobileSelectedDate.getDate().toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-');
                  const newLocal = new Date(Number(y), Number(m)-1, Number(d), 12, 0, 0);
                  onMobileDateSelect(newLocal);
                }
              }}
            />
          </div>
          <button 
            onClick={onToday}
            className="pointer-events-auto bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-600 rounded-xl px-4 py-2.5 font-bold shadow-sm active:scale-95 transition-transform text-sm"
          >
            Hoy
          </button>
        </div>,
        mobileTopbarPortal
      )}
    </>
  );
}
