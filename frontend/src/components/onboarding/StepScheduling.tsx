"use client"

import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Coffee, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  CalendarCheck 
} from 'lucide-react';

interface DayOption {
  label: string;
  val: number;
}

const DAYS: DayOption[] = [
  { label: 'Lun', val: 1 },
  { label: 'Mar', val: 2 },
  { label: 'Mié', val: 3 },
  { label: 'Jue', val: 4 },
  { label: 'Vie', val: 5 },
  { label: 'Sáb', val: 6 },
  { label: 'Dom', val: 7 }
];

interface StepSchedulingProps {
  workingDays: number[];
  toggleWorkingDay: (day: number) => void;
  openTime: string;
  setOpenTime: (val: string) => void;
  closeTime: string;
  setCloseTime: (val: string) => void;
  lunchStart?: string;
  setLunchStart?: (val: string) => void;
  lunchEnd?: string;
  setLunchEnd?: (val: string) => void;
}

// Convert "HH:MM" to total minutes
const toMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Convert minutes to "HH:MM"
const toTimeString = (totalMinutes: number) => {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Micro Smart Time Picker Component (Luxury & Tactile 2026)
const SmartTimePicker: React.FC<{
  label: string;
  value: string;
  onChange: (newTime: string) => void;
  icon?: React.ReactNode;
  accent?: string;
}> = ({ label, value, onChange, icon }) => {
  const currentMin = toMinutes(value);

  const adjustMinutes = (delta: number) => {
    const next = currentMin + delta;
    onChange(toTimeString(next));
  };

  const [hours, mins] = value ? value.split(':') : ['09', '00'];

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-3.5 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Visual Display */}
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-xl font-black text-stone-900 tracking-tight">{hours}</span>
          <span className="text-stone-300 text-lg font-bold animate-pulse">:</span>
          <span className="text-xl font-black text-stone-700 tracking-tight">{mins}</span>
        </div>

        {/* Tactile Adjusters */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => adjustMinutes(-15)}
            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition-colors active:scale-95"
            title="Restar 15 minutos"
          >
            -15
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(15)}
            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs flex items-center justify-center transition-colors active:scale-95"
            title="Sumar 15 minutos"
          >
            +15
          </button>
        </div>
      </div>
    </div>
  );
};

export const StepScheduling: React.FC<StepSchedulingProps> = ({
  workingDays,
  toggleWorkingDay,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  lunchStart = '14:00',
  setLunchStart,
  lunchEnd = '16:00',
  setLunchEnd
}) => {
  const [scheduleMode, setScheduleMode] = useState<'continuous' | 'split'>(
    lunchStart && lunchEnd ? 'split' : 'continuous'
  );

  // Apply quick industry presets
  const applyPreset = (preset: 'medical' | 'intensive' | 'commercial') => {
    if (preset === 'medical') {
      setScheduleMode('split');
      setOpenTime('09:30');
      setCloseTime('20:30');
      setLunchStart?.('13:30');
      setLunchEnd?.('16:30');
    } else if (preset === 'intensive') {
      setScheduleMode('continuous');
      setOpenTime('10:00');
      setCloseTime('19:00');
      setLunchStart?.('');
      setLunchEnd?.('');
    } else if (preset === 'commercial') {
      setScheduleMode('continuous');
      setOpenTime('09:00');
      setCloseTime('20:00');
      setLunchStart?.('');
      setLunchEnd?.('');
    }
  };

  // Calculate weekly hours
  const dailyMinutes = scheduleMode === 'continuous'
    ? Math.max(0, toMinutes(closeTime) - toMinutes(openTime))
    : Math.max(0, (toMinutes(lunchStart) - toMinutes(openTime)) + (toMinutes(closeTime) - toMinutes(lunchEnd)));
  const weeklyHours = Math.round((dailyMinutes * workingDays.length) / 60);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* 1. Días Operativos */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
            Días Operativos de Atención
          </label>
          <span className="text-[10px] text-[#d4af37] font-semibold">
            {workingDays.length} días seleccionados ({weeklyHours}h / sem)
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {DAYS.map((day) => {
            const isSelected = workingDays.includes(day.val);
            return (
              <button
                key={day.val}
                type="button"
                onClick={() => toggleWorkingDay(day.val)}
                className={`h-11 flex-1 rounded-xl font-bold text-xs transition-all border flex items-center justify-center select-none active:scale-95 duration-200 ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-[#d4af37] shadow-sm ring-1 ring-[#d4af37]/30'
                    : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector de Jornada & Presets Inteligentes */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
            Régimen Horario & Descanso de Mediodía
          </label>

          {/* Presets de 1 Clic */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-stone-400">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('medical')}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-[#d4af37]/20 hover:text-stone-900 text-stone-600 font-bold transition-colors"
            >
              Clínico (Partida)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('intensive')}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-[#d4af37]/20 hover:text-stone-900 text-stone-600 font-bold transition-colors"
            >
              Intensivo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('commercial')}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-[#d4af37]/20 hover:text-stone-900 text-stone-600 font-bold transition-colors"
            >
              Comercial
            </button>
          </div>
        </div>

        {/* Toggle Modalidad: Continua vs Partida */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100/90 rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => {
              setScheduleMode('continuous');
              setLunchStart?.('');
              setLunchEnd?.('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
              scheduleMode === 'continuous'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun size={13} className={scheduleMode === 'continuous' ? 'text-[#d4af37]' : ''} />
            Jornada Continua
          </button>
          <button
            type="button"
            onClick={() => {
              setScheduleMode('split');
              if (!lunchStart) setLunchStart?.('14:00');
              if (!lunchEnd) setLunchEnd?.('16:00');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
              scheduleMode === 'split'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Moon size={13} className={scheduleMode === 'split' ? 'text-[#d4af37]' : ''} />
            Jornada Partida
          </button>
        </div>

        {/* Smart Time Pickers Grid */}
        {scheduleMode === 'continuous' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in fade-in duration-200">
            <SmartTimePicker 
              label="Hora de Apertura"
              value={openTime}
              onChange={setOpenTime}
              icon={<Sun size={13} className="text-[#d4af37]" />}
            />
            <SmartTimePicker 
              label="Hora de Cierre"
              value={closeTime}
              onChange={setCloseTime}
              icon={<Moon size={13} className="text-stone-400" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in fade-in duration-200">
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ☀️ Turno Mañana
              </span>
              <SmartTimePicker 
                label="Apertura Mañana"
                value={openTime}
                onChange={setOpenTime}
                icon={<Sun size={13} className="text-[#d4af37]" />}
              />
              <SmartTimePicker 
                label="Inicio Pausa Mediodía"
                value={lunchStart || '14:00'}
                onChange={(v) => setLunchStart?.(v)}
                icon={<Coffee size={13} className="text-stone-400" />}
              />
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                🌗 Turno Tarde
              </span>
              <SmartTimePicker 
                label="Reanudación Tarde"
                value={lunchEnd || '16:00'}
                onChange={(v) => setLunchEnd?.(v)}
                icon={<Sun size={13} className="text-amber-500" />}
              />
              <SmartTimePicker 
                label="Cierre Definitivo"
                value={closeTime}
                onChange={setCloseTime}
                icon={<Moon size={13} className="text-stone-400" />}
              />
            </div>
          </div>
        )}

      </div>

      {/* Tarjeta de Resumen & Tip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/40 via-[#d4af37]/10 to-amber-50/40 border border-[#d4af37]/30 flex items-start gap-3 text-stone-700">
        <Sparkles size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Motor de Disponibilidad Smart:</strong> El calendario bloqueará de forma automática las citas de clientes durante tu descanso de mediodía, garantizando turnos de trabajo cómodos y sin solapamientos.
        </div>
      </div>

    </div>
  );
};
