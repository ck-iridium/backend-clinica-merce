import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Columns3, MapPin, Building } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

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
  // Sedes / Locations
  locations?: any[];
  selectedLocationFilter?: string | 'ALL';
  onSelectLocationFilter?: (locId: string | 'ALL') => void;
  locationMap?: Map<string, any>;
  locationAppointmentCounts?: Record<string, number>;
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
  mobileTopbarPortal,
  locations = [],
  selectedLocationFilter = 'ALL',
  onSelectLocationFilter,
  locationMap,
  locationAppointmentCounts = {}
}: CalendarHeaderProps) {
  const { t, language } = useLanguage();

  const getLocaleString = () => {
    return language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
  };

  const totalAppointmentsCount = Object.values(locationAppointmentCounts || {}).reduce((acc, curr) => acc + curr, 0);

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

        {/* Selector de Sede + Modo de Vista */}
        <div className="flex items-center gap-3">
          {/* Selector de Sede (Solo si el centro tiene más de 1 sede configurada) */}
          {locations && locations.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                id="calendar-location-selector-trigger"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50/80 text-stone-800 text-xs font-semibold shadow-2xs transition-all outline-hidden cursor-pointer"
              >
                <MapPin size={13} className="text-[#D4AF37] shrink-0" />
                <span className="truncate max-w-[150px]">
                  {selectedLocationFilter === 'ALL'
                    ? (t('dashboard.calendar.all_locations') || 'Todas las sedes')
                    : (locationMap?.get(selectedLocationFilter)?.name || 'Sede')}
                </span>
                <ChevronDown size={12} className="text-stone-400 shrink-0 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl border border-stone-200/80 bg-white shadow-xl z-50">
                <DropdownMenuItem
                  id="calendar-location-all-item"
                  onClick={() => onSelectLocationFilter?.('ALL')}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    selectedLocationFilter === 'ALL'
                      ? 'bg-amber-50 text-[#99771A] font-bold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-stone-500 shrink-0" />
                    <span>{t('dashboard.calendar.all_locations') || 'Todas las sedes'}</span>
                  </div>
                  {totalAppointmentsCount !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {totalAppointmentsCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 border-t border-stone-100" />
                {locations.map((loc) => {
                  const isSelected = selectedLocationFilter === loc.id;
                  const count = locationAppointmentCounts?.[loc.id] || 0;
                  return (
                    <DropdownMenuItem
                      key={loc.id}
                      id={`calendar-location-${loc.id}-item`}
                      onClick={() => onSelectLocationFilter?.(loc.id)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50 text-[#99771A] font-bold'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin size={13} className={isSelected ? 'text-[#D4AF37]' : 'text-stone-400'} />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                        {count}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Si solo hay 1 sede, mostramos una discreta insignia informativa */}
          {locations && locations.length === 1 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/60 bg-stone-50/60 text-stone-600 text-xs font-medium shadow-2xs" title={locations[0].address || locations[0].name}>
              <MapPin size={12} className="text-[#D4AF37] shrink-0" />
              <span className="truncate max-w-[140px]">{locations[0].name}</span>
            </div>
          )}

          {/* Selector de Modo: Semana vs Día */}
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
