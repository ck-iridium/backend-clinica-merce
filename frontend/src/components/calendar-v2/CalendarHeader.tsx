import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Columns3 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface CalendarHeaderProps {
  // Estado para la vista Desktop (Lunes de la semana)
  currentWeek: Date;
  // Estado para la vista Móvil (Día seleccionado)
  mobileSelectedDate: Date;
  // Vista activa (Semana o Día por especialista)
  viewMode?: 'week' | 'day';
  onViewModeChange?: (mode: 'week' | 'day') => void;
  // Acciones
  onPrev: () => void;
  onNext: () => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
  onMobileDateSelect: (date: Date) => void;
  // Elemento para el portal de la barra superior en móvil
  mobileTopbarPortal?: Element | null;
}

/**
 * CalendarHeader Component (v2)
 * Encapsula la cabecera tanto para Desktop (Título + Nav + Switcher de Vista)
 * como para Móvil (Portal inyectado en la UI global).
 */
export function CalendarHeader({
  currentWeek,
  mobileSelectedDate,
  viewMode = 'week',
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onDateSelect,
  onMobileDateSelect,
  mobileTopbarPortal
}: CalendarHeaderProps) {
  const { t, language } = useLanguage();

  const getLocaleString = () => {
    return language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
  };

  return (
    <>
      {/* VISTA DESKTOP: Cabecera con fecha, navegación y selector de vista */}
      <div className="hidden md:flex items-center justify-between pl-20 pr-6 py-3 border-b border-stone-200/70 bg-white/95 backdrop-blur-md">
        {/* Título y Navegación rápida */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif font-bold text-stone-900 capitalize text-lg tracking-tight">
              {viewMode === 'day'
                ? mobileSelectedDate.toLocaleDateString(getLocaleString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : currentWeek.toLocaleDateString(getLocaleString(), { month: 'long', year: 'numeric' })}
            </h2>
            {viewMode === 'day' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-[#99771A] border border-amber-200/70 shadow-2xs">
                {t('dashboard.calendar.day_specialists') || 'Columnas por Especialista'}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60 shadow-2xs">
                {t('dashboard.calendar.view_week') || 'Vista Semanal'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200/70 rounded-xl p-0.5 shadow-2xs">
            <button
              id="calendar-header-prev-btn"
              onClick={onPrev}
              className="p-1.5 rounded-lg hover:bg-white text-stone-500 hover:text-stone-900 transition-colors"
              title={viewMode === 'day' ? (t('dashboard.calendar.prev_day') || 'Día anterior') : (t('dashboard.calendar.prev_week') || 'Semana anterior')}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="calendar-header-today-desktop-btn"
              onClick={onToday}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 hover:bg-white hover:text-stone-900 transition-colors uppercase tracking-wider text-[10px]"
            >
              {t('dashboard.calendar.today') || 'Hoy'}
            </button>
            <button
              id="calendar-header-next-btn"
              onClick={onNext}
              className="p-1.5 rounded-lg hover:bg-white text-stone-500 hover:text-stone-900 transition-colors"
              title={viewMode === 'day' ? (t('dashboard.calendar.next_day') || 'Día siguiente') : (t('dashboard.calendar.next_week') || 'Semana siguiente')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Selector de Modo: Semana vs Día */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60 shadow-2xs">
            <button
              id="calendar-viewmode-week-btn"
              type="button"
              onClick={() => onViewModeChange?.('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CalendarDays size={14} className={viewMode === 'week' ? 'text-[#D4AF37]' : ''} />
              <span>{t('dashboard.calendar.view_week') || 'Semana'}</span>
            </button>
            <button
              id="calendar-viewmode-day-btn"
              type="button"
              onClick={() => onViewModeChange?.('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Columns3 size={14} className={viewMode === 'day' ? 'text-[#D4AF37]' : ''} />
              <span>{t('dashboard.calendar.day_specialists') || 'Día (Especialistas)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER PORTAL (DatePicker inyectado) */}
      {mobileTopbarPortal && createPortal(
        <div className="flex items-center gap-2">
          <div className="relative pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-800 rounded-xl px-4 py-2.5 font-bold shadow-sm flex items-center justify-between gap-3 min-w-[130px] max-w-[160px]">
              <Calendar size={18} className="text-[#D4AF37] shrink-0" />
              <span className="capitalize text-sm text-center flex-1 truncate">
                {mobileSelectedDate.toLocaleDateString(getLocaleString(), { month: 'short', year: 'numeric' }).replace('.', '')}
              </span>
              <ChevronDown size={18} className="text-stone-400 shrink-0" />
            </div>
            <input 
              id="calendar-header-datepicker"
              type="date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              style={{ display: 'block' }}
              value={`${mobileSelectedDate.getFullYear()}-${(mobileSelectedDate.getMonth()+1).toString().padStart(2, '0')}-${mobileSelectedDate.getDate().toString().padStart(2, '0')}`}
              onClick={(e) => {
                try {
                  if (typeof e.currentTarget.showPicker === 'function') {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {}
              }}
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
            id="calendar-header-today-btn"
            onClick={onToday}
            className="pointer-events-auto bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-600 rounded-xl px-4 py-2.5 font-bold shadow-sm active:scale-95 transition-transform text-sm"
          >
            {t('dashboard.calendar.today')}
          </button>
        </div>,
        mobileTopbarPortal
      )}
    </>
  );
}
