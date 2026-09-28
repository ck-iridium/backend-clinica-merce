'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, PanelLeftClose, Calendar } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface ContextPanelProps {
    clinicName?: string;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    confirmedCount?: number;
    pendingCount?: number;
    onPrev?: () => void;
    onNext?: () => void;
    onToday?: () => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    activeFilter: 'ALL' | 'CONFIRMADA' | 'PENDIENTE' | 'PAGADA';
    setActiveFilter: (filter: 'ALL' | 'CONFIRMADA' | 'PENDIENTE' | 'PAGADA') => void;
    onClose?: () => void;
}

/**
 * ContextPanel (v2)
 * Barra lateral izquierda para la vista SaaS Edge-to-Edge con diseño Quiet Luxury.
 */
export function ContextPanel({
    clinicName = "Centro",
    selectedDate = new Date(),
    onDateChange,
    confirmedCount = 0,
    pendingCount = 0,
    onPrev,
    onNext,
    onToday,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    onClose
}: ContextPanelProps) {
    const { t, language } = useLanguage();
    // Estado para la vista del mes en el mini-calendario (independiente de la fecha seleccionada)
    const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    // Navegación de meses
    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Días de la semana abreviados
    const daysOfWeek = [
        t('dashboard.settings.calendar.days.mon')?.[0] || 'L',
        t('dashboard.settings.calendar.days.tue')?.[0] || 'M',
        t('dashboard.settings.calendar.days.wed')?.[0] || 'X',
        t('dashboard.settings.calendar.days.thu')?.[0] || 'J',
        t('dashboard.settings.calendar.days.fri')?.[0] || 'V',
        t('dashboard.settings.calendar.days.sat')?.[0] || 'S',
        t('dashboard.settings.calendar.days.sun')?.[0] || 'D'
    ];

    const getDaysInMonth = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Ajustar el primer día (0=Domingo -> 6=Domingo para que Lunes sea 0)
        let startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const days = [];

        // Días del mes anterior (relleno)
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
        }

        // Días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
        }

        // Días del mes siguiente (relleno)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const calendarDays = getDaysInMonth();

    const getLocaleString = () => {
        return language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
    };

    return (
        <aside className="w-full h-full flex flex-col bg-white/95 backdrop-blur-xl border-r border-stone-200/70 flex-shrink-0 animate-in fade-in slide-in-from-left duration-300">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* 1. BÚSQUEDA Y COLAPSAR */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" />
                        <input
                            id="calendar-search-input"
                            type="text"
                            placeholder={t('dashboard.calendar.search_placeholder') || 'Buscar cita o paciente...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] focus:bg-white outline-none transition-all shadow-2xs placeholder:text-stone-400"
                        />
                    </div>
                    {onClose && (
                        <button
                            id="calendar-close-panel-btn"
                            onClick={onClose}
                            className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0"
                            aria-label={t('dashboard.calendar.close_panel')}
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}
                </div>

                {/* 2. MINI-CALENDARIO COMPACTO */}
                <div className="space-y-3">
                    <div className="bg-white border border-stone-200/70 rounded-3xl p-4 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <button
                                id="calendar-prev-month-btn"
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                            >
                               <ChevronLeft size={16} />
                            </button>
                            <p className="font-serif font-bold text-stone-900 capitalize text-sm">
                                {viewDate.toLocaleDateString(getLocaleString(), { month: 'long', year: 'numeric' })}
                            </p>
                            <button
                                id="calendar-next-month-btn"
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {daysOfWeek.map(d => (
                                <span key={d} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {calendarDays.map((item, i) => {
                                const isSelected = item.currentMonth &&
                                    item.date.getDate() === selectedDate.getDate() &&
                                    item.date.getMonth() === selectedDate.getMonth() &&
                                    item.date.getFullYear() === selectedDate.getFullYear();

                                return (
                                    <button
                                        key={i}
                                        id={item.currentMonth ? `calendar-mini-day-btn-${item.day}` : undefined}
                                        onClick={() => item.currentMonth && onDateChange?.(item.date)}
                                        className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-xl transition-all
                                            ${isSelected 
                                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-stone-950 font-bold shadow-xs scale-105' 
                                                : item.currentMonth 
                                                ? 'text-stone-700 hover:bg-amber-50 hover:text-amber-900' 
                                                : 'text-stone-200 pointer-events-none'
                                            }
                                        `}
                                    >
                                        {item.day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navegación Diaria Compacta */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                            <button 
                                id="calendar-daily-prev-btn"
                                onClick={onPrev}
                                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                                title={t('dashboard.calendar.prev_day')}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                id="calendar-daily-today-btn"
                                onClick={onToday}
                                className="px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-white border border-stone-200/70 text-stone-700 hover:text-[#B38F26] font-bold text-[10px] uppercase tracking-wider shadow-2xs transition-all"
                            >
                                {t('dashboard.calendar.today') || 'Hoy'}
                            </button>
                            <button 
                                id="calendar-daily-next-btn"
                                onClick={onNext}
                                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors"
                                title={t('dashboard.calendar.next_day')}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. FILTROS RÁPIDOS */}
                <div className="space-y-2.5">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">
                        {t('dashboard.calendar.filters') || 'Filtros Rápidos'}
                    </p>
                    <div className="space-y-1.5">
                        <button
                            id="calendar-filter-confirmed-btn"
                            type="button"
                            onClick={() => setActiveFilter(activeFilter === 'CONFIRMADA' ? 'ALL' : 'CONFIRMADA')}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border shadow-2xs ${
                                activeFilter === 'CONFIRMADA'
                                    ? 'bg-sky-50 border-sky-200 text-sky-950 font-semibold'
                                    : 'bg-white border-stone-200/70 text-stone-600 hover:border-stone-300'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 size={15} className={activeFilter === 'CONFIRMADA' ? 'text-sky-600' : 'text-stone-400'} />
                                <span className="text-xs">{t('dashboard.calendar.filter_confirmed') || 'Confirmadas'}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                {confirmedCount}
                            </span>
                        </button>

                        <button
                            id="calendar-filter-pending-btn"
                            type="button"
                            onClick={() => setActiveFilter(activeFilter === 'PENDIENTE' ? 'ALL' : 'PENDIENTE')}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border shadow-2xs ${
                                activeFilter === 'PENDIENTE'
                                    ? 'bg-amber-50 border-amber-200 text-amber-950 font-semibold'
                                    : 'bg-white border-stone-200/70 text-stone-600 hover:border-stone-300'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <Clock size={15} className={activeFilter === 'PENDIENTE' ? 'text-amber-600' : 'text-stone-400'} />
                                <span className="text-xs">{t('dashboard.calendar.filter_pending') || 'Pendientes'}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                {pendingCount}
                            </span>
                        </button>

                        <button
                            id="calendar-filter-paid-btn"
                            type="button"
                            onClick={() => setActiveFilter(activeFilter === 'PAGADA' ? 'ALL' : 'PAGADA')}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border shadow-2xs ${
                                activeFilter === 'PAGADA'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                                    : 'bg-white border-stone-200/70 text-stone-600 hover:border-stone-300'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 ${activeFilter === 'PAGADA' ? 'border-emerald-500 bg-emerald-100' : 'border-emerald-400'}`} />
                                <span className="text-xs">{t('dashboard.calendar.filter_paid') || 'Pagadas / Liquidadas'}</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </aside>
    );
}
