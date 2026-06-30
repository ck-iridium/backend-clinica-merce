"use client"
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function Step2DateTime({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableSlots,
  loadingSlots,
  selectedService,
  settings,
  onShowFeedback,
  dateTimePhase,
  setDateTimePhase,
  currentMonthOffset,
  setCurrentMonthOffset,
  staffList = [],
  selectedStaff,
  setSelectedStaff
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
  dateTimePhase: 1 | 2;
  setDateTimePhase: (p: 1 | 2) => void;
  currentMonthOffset: number;
  setCurrentMonthOffset: (o: number) => void;
  staffList?: any[];
  selectedStaff: any;
  setSelectedStaff: (s: any) => void;
}) {
  const { language, t, translate } = useLanguage();

  // Lógica de días laborables
  const getWorkingDays = (): number[] => {
    if (settings?.working_days && Array.isArray(settings.working_days)) {
      return settings.working_days;
    }
    if (typeof window === 'undefined') return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem('mercestetica_working_days');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    } catch { return [1, 2, 3, 4, 5]; }
  };
  const toWeekDayIndex = (jsDay: number) => jsDay === 0 ? 7 : jsDay;

  // Generamos los próximos 90 días de forma continua (aprox. 3 meses)
  const nextDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

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
      onShowFeedback({ type: 'info', title: t('wizard.closed_dialog_title'), message: t('wizard.closed_dialog_msg') });
      return;
    }
    setSelectedDate(date);
    setSelectedTime('');
    setDateTimePhase(2);
  };

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative bg-background text-foreground">
      <AnimatePresence mode="wait">
        {dateTimePhase === 1 ? (
          <motion.div
            key="date-selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-background">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">{t('wizard.select_day')}</h1>
              <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium">
                {t('wizard.appointment_for')} <span className="text-primary font-bold">{translate(selectedService?.name, selectedService?.translations, 'name')}</span>
              </p>
            </div>



            <div className="flex flex-col flex-grow min-h-0 relative">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />

              <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-6 pb-32 space-y-3">
                {nextDays.map((date, i) => {
                  const dayIndex = toWeekDayIndex(date.getDay());
                  
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  
                  const cache = settings?.blocked_days_cache;
                  let isBlocked = false;
                  if (cache) {
                    if (cache.global?.includes(dateStr)) {
                      isBlocked = true;
                    } else if (selectedStaff && selectedStaff.id !== 'any') {
                      if (cache.staff?.[selectedStaff.id]?.includes(dateStr)) {
                        isBlocked = true;
                      }
                    } else {
                      const activeStaffIds = staffList.filter((s: any) => s.id !== 'any').map((s: any) => s.id);
                      const allBlocked = activeStaffIds.length > 0 && activeStaffIds.every((id: string) => 
                        cache.staff?.[id]?.includes(dateStr) || cache.global?.includes(dateStr)
                      );
                      if (allBlocked) {
                        isBlocked = true;
                      }
                    }
                  }
                  
                  const isOpen = getWorkingDays().includes(dayIndex) && !isBlocked;
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();

                  const prevDate = i > 0 ? nextDays[i - 1] : null;
                  const showHeader = !prevDate || date.getMonth() !== prevDate.getMonth();
                  const localeStr = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';

                  return (
                    <React.Fragment key={i}>
                      {showHeader && (
                        <div
                          id={`month-header-${date.getMonth()}`}
                          className="pt-8 pb-3 text-center md:text-left text-[11px] md:text-xs font-bold uppercase text-primary tracking-[0.25em] scroll-mt-6 font-serif border-b border-primary/20 mb-4 first:pt-2 capitalize"
                        >
                          {date.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(20, i) * 0.01 }}
                        disabled={!isOpen}
                        onClick={() => handleDateSelect(date)}
                        className={`w-full flex items-center justify-between p-4 md:p-6 md:px-8 rounded-luxury-card border transition-all active:scale-[0.98]
                          ${isSelected
                            ? 'bg-primary border-primary shadow-lg text-primary-foreground'
                            : !isOpen
                              ? 'bg-rose-500/5 dark:bg-rose-950/15 border-rose-500/10 dark:border-rose-900/30 opacity-70'
                              : 'bg-card border-border shadow-sm hover:border-primary/30'}`}
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-luxury-btn flex flex-col items-center justify-center border
                            ${isSelected
                              ? 'bg-white/10 border-white/20'
                              : !isOpen
                                ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/10 dark:border-rose-900/30'
                                : 'bg-muted border-border'}`}>
                            <span className={`text-[10px] md:text-[11px] uppercase font-black tracking-wider
                              ${isSelected ? 'text-white/80' : !isOpen ? 'text-rose-500 dark:text-rose-300' : 'text-muted-foreground'}`}>
                              {date.toLocaleDateString(localeStr, { month: 'short' }).replace('.', '')}
                            </span>
                            <span className={`text-lg md:text-2xl font-serif font-bold leading-none mt-0.5
                               ${isSelected ? 'text-white' : !isOpen ? 'text-rose-500 dark:text-rose-300' : 'text-foreground'}`}>
                              {date.getDate()}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <span className={`text-sm md:text-xl font-bold capitalize ${isSelected ? 'text-white' : !isOpen ? 'text-rose-500 dark:text-rose-300' : 'text-foreground'}`}>
                              {date.toLocaleDateString(localeStr, { weekday: 'long' })}
                            </span>
                            <span className={`text-[11px] md:text-sm mt-0.5 ${isSelected ? 'text-white/70' : !isOpen ? 'text-rose-500/50 dark:text-rose-300/40' : 'text-muted-foreground'}`}>
                              {date.getFullYear()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-5">
                          {isToday && (
                            <span className="text-[11px] md:text-xs font-light text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-primary/10">
                              {t('wizard.today')}
                            </span>
                          )}
                          {!isOpen ? (
                            <span className="text-[9px] md:text-xs font-black text-rose-500 dark:text-rose-300 uppercase tracking-wider">{t('wizard.closed')}</span>
                          ) : (
                            <ChevronRight size={16} className={`transition-transform md:scale-125 ${isSelected ? 'text-white' : 'text-muted-foreground/30'}`} />
                          )}
                        </div>
                      </motion.button>
                    </React.Fragment>
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
            <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-background">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight leading-tight">{t('wizard.select_time_title')}</h1>
                  <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium">
                    {t('wizard.for_date')} <span className="text-primary font-bold">{selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long' })}</span>
                  </p>
                </div>
                <button
                  onClick={() => setDateTimePhase(1)}
                  className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-4.5 rounded-luxury-btn bg-primary hover:bg-primary/90 text-white transition-all shadow-md hover:shadow-lg active:scale-95 group shrink-0"
                >
                  <CalendarIcon size={16} className="text-white md:scale-125" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">{t('wizard.change_day')}</span>
                </button>
              </div>
            </div>



            <div className="flex flex-col flex-grow min-h-0 relative mt-0">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />

              <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-5 pb-6">
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center h-60 gap-3">
                    <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">{t('wizard.calculating_slots')}</p>
                  </div>
                ) : fullSchedule.length === 0 ? (
                  <div className="bg-card rounded-3xl p-10 border border-border text-center shadow-sm">
                    <Clock size={32} className="text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground italic font-serif">{t('wizard.no_availability')}</p>
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
                          className={`min-h-[56px] md:min-h-[72px] py-4 md:py-6 rounded-luxury-btn text-sm md:text-lg lg:text-xl font-bold transition-all border shadow-sm relative flex items-center justify-center
                            ${!isAvailable
                              ? 'bg-rose-500/5 border-rose-500/10 dark:border-rose-950/20 text-rose-500 dark:text-rose-300 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'bg-primary border-primary text-white shadow-lg ring-2 ring-primary/20 z-10'
                                : 'bg-card border-border text-foreground hover:border-primary hover:bg-muted'}`}
                        >
                          <span className={!isAvailable ? 'line-through decoration-rose-500/50' : ''}>{slot}</span>
                          {!isAvailable && (
                            <div className="absolute top-1 right-2 md:top-2 md:right-3">
                              <Lock size={8} className="text-rose-400 dark:text-rose-300 md:scale-125" />
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