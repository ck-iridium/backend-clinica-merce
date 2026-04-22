'use client';

import React, { useState } from 'react';
import { Search, User, Bell, ChevronLeft, ChevronRight, CheckCircle2, Clock, PanelLeftClose } from 'lucide-react';
import { NotificationsPopover } from '@/components/NotificationsPopover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    clinicName = "Clínica Merce",
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
    const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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

        // Días del mes siguiente (relleno opcional para completar la grilla de 6 semanas si se desea, aquí solo hasta 42)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
        }

        return days;
    };

    const calendarDays = getDaysInMonth();

    return (
        <aside className="w-full h-full flex flex-col bg-white border-r border-stone-100 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">

            {/* Botón de Cierre — solo visible en Móvil (overlay) */}
            {onClose && (
                <div className="md:hidden flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 flex-shrink-0">
                    <p className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Menú</p>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-stone-50 border border-stone-100 text-stone-500 active:scale-95 transition-all hover:bg-rose-50 hover:text-[#d9777f] hover:border-rose-100 group"
                        aria-label="Cerrar panel"
                    >
                        <PanelLeftClose size={20} className="text-stone-500 hover:text-stone-800 transition-transform w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">

                {/* 2. BÚSQUEDA: Reservas o Clientes */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] ml-1">Buscador Inteligente</p>
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#d9777f] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar reservas o clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f3c7cb] focus:bg-white outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* 3. NAVEGACIÓN: Mini-Calendario */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Agenda rápida</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-lg hover:bg-stone-50 text-stone-400 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-stone-100 rounded-[2rem] p-4 shadow-sm">
                        <p className="text-center font-serif italic font-bold text-stone-800 mb-4 capitalize">
                            {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </p>
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
                                        onClick={() => item.currentMonth && onDateChange?.(item.date)}
                                        className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all
                                            ${isSelected ? 'bg-[#d9777f] text-white shadow-lg shadow-rose-200 scale-110' :
                                                item.currentMonth ? 'text-stone-600 hover:bg-stone-50' : 'text-stone-200 pointer-events-none'}
                                        `}
                                    >
                                        {item.day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 px-1">
                        <button
                            onClick={onPrev}
                            className="py-2.5 bg-stone-50 border border-stone-100 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                            <ChevronLeft size={14} /> Ant
                        </button>
                        <button
                            onClick={onToday}
                            className="py-2.5 bg-white border border-stone-100 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-all shadow-sm"
                        >
                            Hoy
                        </button>
                        <button
                            onClick={onNext}
                            className="py-2.5 bg-stone-50 border border-stone-100 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                            Sig <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* 4. FILTROS VISUALES */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] ml-1">Filtros de Vista</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveFilter(activeFilter === 'CONFIRMADA' ? 'ALL' : 'CONFIRMADA')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'CONFIRMADA' ? 'bg-[#fdf2f3] border-[#f3c7cb] text-[#d9777f]' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Confirmadas</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === 'CONFIRMADA' ? 'bg-white/50' : 'bg-stone-50'}`}>{confirmedCount}</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter(activeFilter === 'PENDIENTE' ? 'ALL' : 'PENDIENTE')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'PENDIENTE' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Pendientes</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === 'PENDIENTE' ? 'bg-white/50' : 'bg-stone-50'}`}>{pendingCount}</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter(activeFilter === 'PAGADA' ? 'ALL' : 'PAGADA')}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border
                                ${activeFilter === 'PAGADA' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${activeFilter === 'PAGADA' ? 'border-emerald-500 bg-emerald-100' : 'border-emerald-400'}`}></div>
                                <span className="text-xs font-bold uppercase tracking-wider">Pagadas</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>

        </aside>
    );
}
