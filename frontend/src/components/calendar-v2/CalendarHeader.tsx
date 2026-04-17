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
      {/* DESKTOP HEADER (Agenda Activa + Navegación) */}
      <div className="hidden md:flex flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Agenda Activa</h1>
          <p className="text-stone-500 mt-1 font-medium">Gestión de reservas y tiempos semanales</p>
        </div>
        <div className="flex gap-2">
          {/* Botón Anterior */}
          <button 
            onClick={onPrevWeek}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={18} strokeWidth={1.5} /> Ant
          </button>
          
          {/* Selector de Fecha Nativo */}
          <div className="relative flex items-center bg-white border border-stone-200 rounded-xl hover:bg-[#fdf2f3] hover:border-[#f3c7cb] transition-colors focus-within:ring-2 focus-within:ring-[#d9777f]">
            <input 
              type="date"
              className="px-4 py-2 bg-transparent text-stone-600 font-bold focus:outline-none cursor-pointer w-full h-full text-center"
              title="Saltar a fecha"
              value={currentWeek.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) onDateSelect(new Date(e.target.value));
              }}
            />
          </div>

          {/* Botón Hoy */}
          <button 
            onClick={onToday}
            className="px-5 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors"
          >
            Hoy
          </button>

          {/* Botón Siguiente */}
          <button 
            onClick={onNextWeek}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors flex items-center gap-1"
          >
            Sig <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

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
