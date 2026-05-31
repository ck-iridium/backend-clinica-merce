"use client"

import React from 'react';

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
}

export const StepScheduling: React.FC<StepSchedulingProps> = ({
  workingDays,
  toggleWorkingDay,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Días Operativos de Atención
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {DAYS.map((day) => {
            const isSelected = workingDays.includes(day.val);
            return (
              <button
                key={day.val}
                type="button"
                onClick={() => toggleWorkingDay(day.val)}
                className={`h-12 flex-1 min-w-[50px] rounded-xl font-bold text-xs transition-all border flex items-center justify-center select-none active:scale-95 duration-200 ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-[#d4af37] shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Hora de Apertura
          </label>
          <input 
            type="time" 
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-850 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Hora de Cierre
          </label>
          <input 
            type="time" 
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-855 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-amber-50/10 border border-[#d4af37]/20 flex gap-3 text-stone-600">
        <span className="text-lg shrink-0">💡</span>
        <p className="text-[10px] md:text-xs leading-relaxed font-medium">
          <strong>Ajustes de Agenda:</strong> Estos horarios serán la base de tu calendario. Podrás añadir descansos, festivos o turnos para especialistas individualmente en la sección de Ajustes del panel administrativo.
        </p>
      </div>
    </div>
  );
};
