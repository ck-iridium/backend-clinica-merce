'use client';

import React, { useState } from 'react';
import { Search, User, Bell, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
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
    onToday
}: ContextPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    
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
        <div className="w-full h-full flex flex-col">
            <aside className="w-full h-full flex flex-col bg-white border-r border-stone-100 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
                    
                    {/* 2. BÚSQUEDA: Reservas o Clientes */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] ml-1">Buscador Inteligente</p>
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#d9777f] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Buscar reservas o clientes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                        {/* Controles de Navegación de Agenda Movidos Aquí */}
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
                            <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf2f3] border border-[#f3c7cb] text-[#d9777f] transition-all">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Confirmadas</span>
                                </div>
                                <span className="text-[10px] font-black bg-white/50 px-2 py-0.5 rounded-full">{confirmedCount}</span>
                            </button>
                            
                            <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-100 text-stone-500 hover:border-stone-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <Clock size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Pendientes</span>
                                </div>
                                <span className="text-[10px] font-black bg-stone-50 px-2 py-0.5 rounded-full">{pendingCount}</span>
                            </button>

                            <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-100 text-stone-500 hover:border-stone-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-emerald-400"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Pagadas</span>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer de Ayuda / Info */}
                <div className="p-6 border-t border-stone-50">
                    <div className="bg-stone-900 rounded-2xl p-4 text-center">
                        <p className="text-white font-serif italic text-sm">"Diseño para la excelencia"</p>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">SaaS Model v2.0</p>
                    </div>
                </div>

            </aside>
        </div>
    );
}
