"use client"
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step2DateTime({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableSlots,
  loadingSlots,
  selectedService,
  settings,
  onShowFeedback
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  availableSlots: string[];
  loadingSlots: boolean;
  selectedService: any;
  settings: any;
  onShowFeedback: (f: any) => void;
}) {
  const [phase, setPhase] = useState(selectedTime ? 2 : 1);

  // Lógica de días laborables
  const getWorkingDays = (): number[] => {
    if (typeof window === 'undefined') return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem('mercestetica_working_days');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5, 6];
    } catch { return [1, 2, 3, 4, 5, 6]; }
  };
  const toWeekDayIndex = (jsDay: number) => jsDay === 0 ? 7 : jsDay;

  // Generamos los próximos 21 días
  const nextDays = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // GENERACIÓN DE HORARIO COMPLETO (Basado en settings)
  const fullSchedule = useMemo(() => {
    const start = settings?.open_time || "09:00";
    const end = settings?.close_time || "20:00";
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);

    const slots = [];
    let current = sH * 60 + sM;
    const stopAt = eH * 60 + eM;
    const interval = 15; // Intervalo de 15 min por petición del usuario

    while (current < stopAt) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const isLunch = settings?.lunch_start && settings?.lunch_end &&
        timeStr >= settings.lunch_start && timeStr < settings.lunch_end;

      if (!isLunch) {
        slots.push(timeStr);
      }
      current += interval;
    }
    return slots;
  }, [settings]);

  const handleDateSelect = (date: Date) => {
    const dayIndex = toWeekDayIndex(date.getDay());
    if (!getWorkingDays().includes(dayIndex)) {
      onShowFeedback({ type: 'info', title: 'Cerrado', message: "Lo sentimos, no abrimos este día." });
      return;
    }
    setSelectedDate(date);
    setSelectedTime('');
    setPhase(2);
  };

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative bg-[#F7F7F5]">
      <AnimatePresence mode="wait">
        {phase === 1 ? (
          <motion.div
            key="date-selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-[#F7F7F5]">
              <h1 className="text-lg font-serif text-stone-800 tracking-tight">Selecciona el día</h1>
              <p className="text-[13px] text-stone-500 mt-1 uppercase tracking-widest font-bold">
                CITA PARA: <span className="text-stone-900">{selectedService?.name}</span>
              </p>
            </div>

            <div className="flex flex-col flex-grow min-h-0 relative">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#F7F7F5] to-transparent z-20 pointer-events-none" />

              <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-6 pb-32 space-y-3">
                {nextDays.map((date, i) => {
                  const dayIndex = toWeekDayIndex(date.getDay());
                  const isOpen = getWorkingDays().includes(dayIndex);
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = i === 0;

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      disabled={!isOpen}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]
                        ${isSelected
                          ? 'bg-stone-900 border-stone-900 shadow-lg'
                          : !isOpen
                            ? 'bg-red-50/20 border-red-100 opacity-60'
                            : 'bg-white border-stone-100 shadow-sm hover:border-stone-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border
                          ${isSelected
                            ? 'bg-white/10 border-white/20'
                            : !isOpen
                              ? 'bg-red-50 border-red-100'
                              : 'bg-stone-50 border-stone-100'}`}>
                          <span className={`text-[10px] uppercase font-black 
                            ${isSelected ? 'text-white/60' : !isOpen ? 'text-red-300' : 'text-stone-400'}`}>
                            {date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                          </span>
                          <span className={`text-lg font-serif font-bold 
                            ${isSelected ? 'text-[#d4af37]' : !isOpen ? 'text-red-400' : 'text-stone-800'}`}>
                            {date.getDate()}
                          </span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold capitalize ${isSelected ? 'text-white' : !isOpen ? 'text-red-800/40' : 'text-stone-800'}`}>
                            {date.toLocaleDateString('es-ES', { weekday: 'long' })}
                          </span>
                          <span className={`text-[11px] ${isSelected ? 'text-white/50' : !isOpen ? 'text-red-300' : 'text-stone-400'}`}>
                            {date.getFullYear()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isToday && (
                          <span className="text-[11px] font-light text-[#d4af37] uppercase tracking-widest bg-[#d4af37]/5 px-2 py-0.5 rounded-full border border-[#d4af37]/10">
                            Hoy
                          </span>
                        )}
                        {!isOpen ? (
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Cerrado</span>
                        ) : (
                          <ChevronRight size={16} className={isSelected ? 'text-[#d4af37]' : 'text-stone-200'} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="time-selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="shrink-0 px-6 pt-3 pb-1 z-30 bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <h1 className="text-lg font-serif text-stone-800 tracking-tight leading-tight">Selecciona hora</h1>
                  <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mt-1.5">
                    PARA EL <span className="text-[#d4af37]">{selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                  </p>
                </div>
                <button
                  onClick={() => setPhase(1)}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 transition-all shadow-sm active:scale-95 group"
                >
                  <CalendarIcon size={16} className="text-stone-400 group-hover:text-[#d4af37]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cambiar día</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col flex-grow min-h-0 relative mt-0">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#F7F7F5] to-transparent z-20 pointer-events-none" />

              <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-5 pb-6">
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-3">
                    <div className="w-10 h-10 border-2 border-stone-200 border-t-[#d4af37] rounded-full animate-spin"></div>
                    <p className="text-[10px] uppercase font-bold text-stone-300 tracking-widest">Calculando huecos...</p>
                  </div>
                ) : fullSchedule.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center shadow-sm">
                    <Clock size={32} className="text-stone-200 mx-auto mb-4" />
                    <p className="text-sm text-stone-400 italic font-serif">Sin disponibilidad para esta fecha.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 content-start">
                    {fullSchedule.map((slot, i) => {
                      const isAvailable = availableSlots.includes(slot);
                      const isSelected = selectedTime === slot;

                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.01 }}
                          disabled={!isAvailable}
                          onClick={() => setSelectedTime(slot)}
                          className={`min-h-[56px] py-4 rounded-2xl text-sm font-bold transition-all border shadow-sm relative flex items-center justify-center
                            ${!isAvailable
                              ? 'bg-red-50/40 border-red-100 text-red-300 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'bg-stone-900 border-stone-900 text-[#d4af37] shadow-lg ring-2 ring-[#d4af37]/20 z-10'
                                : 'bg-white border-stone-100 text-stone-700 hover:border-[#d4af37] hover:bg-stone-50'}`}
                        >
                          <span className={!isAvailable ? 'line-through decoration-red-300/50' : ''}>{slot}</span>
                          {!isAvailable && (
                            <div className="absolute top-1 right-2">
                              <Lock size={8} className="text-red-200" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
