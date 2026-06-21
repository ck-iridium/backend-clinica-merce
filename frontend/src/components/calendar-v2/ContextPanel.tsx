'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Clock, PanelLeftClose } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
 * Barra lateral izquierda para la vista SaaS Edge-to-Edge.
 * Incluye perfil, notificaciones, buscador global, mini-calendario y filtros.
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

    // Lógica para generar los días del mes actual
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

        // Días del mes siguiente (relleno opcional)
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
        <aside className="w-full h-full flex flex-col bg-white border-r border-stone-100 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">

            {/* Botón de Cierre */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* 2. BÚSQUEDA Y COLAPSAR */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors" />
                        <input
                            id="calendar-search-input"
                            type="text"
                            placeholder={t('dashboard.calendar.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all shadow-sm"
                        />
                    </div>
                    {onClose && (
                        <button
                            id="calendar-close-panel-btn"
                            onClick={onClose}
                            className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-stone-500 active:scale-95 transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/10 shrink-0"
                            aria-label={t('dashboard.calendar.close_panel')}
                        >
                            <PanelLeftClose size={20} />
                        </button>
                    )}
                </div>

                {/* 3. NAVEGACIÓN: Mini-Calendario Compacto */}
                <div className="space-y-3">
                    <div className="bg-white border border-stone-100 rounded-[2rem] p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <button
                                id="calendar-prev-month-btn"
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors"
                            >
                               <ChevronLeft size={18} />
                            </button>
                            <p className="font-serif italic font-bold text-stone-800 capitalize text-sm">
                                {viewDate.toLocaleDateString(getLocaleString(), { month: 'long', year: 'numeric' })}
                            </p>
                            <button
                                id="calendar-next-month-btn"
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {daysOfWeek.map(d => (
                                <span key={d} className="text-[9px] font-black text-stone-300 uppercase">{d}</span>
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
                                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all
                                            ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' :
                                                item.currentMonth ? 'text-stone-600 hover:bg-stone-50' : 'text-stone-200 pointer-events-none'}
                                        `}
                                    >
                                        {item.day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navegación Diaria Compacta */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
                            <button 
                                id="calendar-daily-prev-btn"
                                onClick={onPrev}
                                className="p-2 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-primary transition-all"
                                title={t('dashboard.calendar.prev_day')}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button 
                                id="calendar-daily-today-btn"
                                onClick={onToday}
                                className="px-4 py-1.5 rounded-lg bg-stone-50 border border-stone-100 text-stone-600 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/10 transition-all"
                            >
                                {t('dashboard.calendar.today')}
                            </button>
                            <button 
                                id="calendar-daily-next-btn"
                                onClick={onNext}
                                className="p-2 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-primary transition-all"
                                title={t('dashboard.calendar.next_day')}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. FILTROS VISUALES */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] ml-1">{t('dashboard.calendar.filters')}</p>
                    <div className="space-y-2">
                        <button
                            id="calendar-filter-confirmed-btn"
                            onClick={() => setActiveFilter(activeFilter === 'CONFIRMADA' ? 'ALL' : 'CONFIRMADA')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'CONFIRMADA' ? 'bg-primary/5 border-primary/10 text-primary' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.calendar.filter_confirmed')}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === 'CONFIRMADA' ? 'bg-white/50' : 'bg-stone-50'}`}>{confirmedCount}</span>
                        </button>

                        <button
                            id="calendar-filter-pending-btn"
                            onClick={() => setActiveFilter(activeFilter === 'PENDIENTE' ? 'ALL' : 'PENDIENTE')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'PENDIENTE' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.calendar.filter_pending')}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === 'PENDIENTE' ? 'bg-white/50' : 'bg-stone-50'}`}>{pendingCount}</span>
                        </button>

                        <button
                            id="calendar-filter-paid-btn"
                            onClick={() => setActiveFilter(activeFilter === 'PAGADA' ? 'ALL' : 'PAGADA')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'PAGADA' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${activeFilter === 'PAGADA' ? 'border-emerald-500 bg-emerald-100' : 'border-emerald-400'}`}></div>
                                <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.calendar.filter_paid')}</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>

        </aside>
    );
}
