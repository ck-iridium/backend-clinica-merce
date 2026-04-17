'use client';

import React, { Suspense } from 'react';
import { useCalendarData } from '@/components/calendar-v2/hooks/useCalendarData';
import { CalendarHeader } from '@/components/calendar-v2/CalendarHeader';
import { TimeScale } from '@/components/calendar-v2/TimeScale';
import { DayColumn } from '@/components/calendar-v2/DayColumn';
import { CalendarModals } from '@/components/calendar-v2/CalendarModals';

/**
 * CalendarContent
 * Componente principal refactorizado (v2).
 * Orquesta los componentes modulares y utiliza useCalendarData para la gestión del estado.
 */
function CalendarContent() {
  const c = useCalendarData();

  if (c.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-12 h-12 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-6"></div>
        <p className="text-stone-500 font-serif italic text-lg">Cargando tu agenda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      
      {/* 1. CABECERA Y NAVEGACIÓN */}
      <CalendarHeader 
        currentWeek={c.currentWeek}
        mobileSelectedDate={c.mobileSelectedDate}
        onPrevWeek={c.handlePrevWeek}
        onNextWeek={c.handleNextWeek}
        onToday={c.handleToday}
        onDateSelect={c.handleDateSelect}
        onMobileDateSelect={c.handleMobileDateSelect}
        mobileTopbarPortal={c.mobileTopbarPortal}
      />

      {/* 2. VISTA DESKTOP (Grilla Semanal) */}
      <div className="hidden md:flex flex-col flex-1 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden relative translate-z-0 transition-all">
        
        {/* Header de Días */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-stone-200 bg-stone-50/30">
          <div className="p-4 border-r border-stone-200"></div>
          {c.days.map((date, i) => (
            <div key={i} className="p-4 text-center border-r border-stone-200 last:border-r-0">
              <p className="text-[10px] font-black text-[#d9777f] uppercase tracking-[0.2em] mb-1">
                {date.toLocaleDateString('es-ES', { weekday: 'short' })}
              </p>
              <p className="text-2xl font-serif italic font-black text-stone-800">
                {date.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Cuerpo de la Grilla (Scrollable) */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="grid grid-cols-[100px_repeat(5,1fr)] relative min-h-full" style={{ height: `${c.hours.length * 80}px` }}>
            
            {/* Guías Horizontales */}
            <TimeScale hours={c.hours} heightPerHour={80} part="guides" />

            {/* Eje de Horas */}
            <TimeScale hours={c.hours} heightPerHour={80} part="axis" viewType="desktop" />

            {/* Columnas de Días */}
            {c.days.map((date, i) => (
              <DayColumn 
                key={i}
                date={date}
                appointments={c.getAppointmentsForDay(date)}
                blocks={c.getBlocksForDay(date)}
                isClosed={c.isDayClosed(date)}
                closedReason={c.getDayClosedReason(date)}
                closedBlock={c.getClosedBlockForDay(date)}
                hours={c.hours}
                startHour={c.startHour}
                heightPerHour={80}
                viewType="desktop"
                onSlotClick={(h, m) => c.handleSlotClick(h, m, date)}
                onApptClick={c.handleApptClick}
                onBlockClick={c.handleBlockClick}
                onApptMouseEnter={c.handleApptMouseEnter}
                onApptMouseLeave={c.handleApptMouseLeave}
                checkIsLunch={c.isLunchTime}
                checkIsDisabled={c.isTimeDisabled}
                clientMap={c.clientMap}
                serviceMap={c.serviceMap}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. VISTA MÓVIL (Carrusel Diario) */}
      <div className="block md:hidden flex-1 overflow-hidden flex flex-col">
        {/* Carrusel de fechas */}
        <div className="flex overflow-x-auto gap-3 pb-6 pt-2 no-scrollbar px-1 snap-x snap-mandatory" ref={c.mobileDaysContainerRef}>
          {c.mobileDays.map((date, i) => {
            const isSelected = date.toDateString() === c.mobileSelectedDate.toDateString();
            return (
              <button
                key={i}
                ref={isSelected ? c.activeDayRef : null}
                onClick={() => c.handleMobileDateSelect(date)}
                className={`snap-center flex-shrink-0 w-16 h-24 rounded-2xl flex flex-col items-center justify-center transition-all border-2
                  ${isSelected ? 'bg-[#fdf2f3] border-[#d9777f] shadow-lg shadow-rose-100 scale-105' : 'bg-white border-stone-50 text-stone-400 hover:border-stone-200'}
                `}
              >
                <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-[#d9777f]' : 'text-stone-300'}`}>
                  {date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className={`text-xl font-serif italic font-black ${isSelected ? 'text-stone-800' : 'text-stone-400'}`}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grilla Diaria Móvil */}
        <div className="flex-1 overflow-y-auto bg-white rounded-t-[40px] shadow-2xl border-t border-stone-100 relative">
          <div className="flex relative min-h-full" style={{ height: `${c.hours.length * 72}px` }}>
            
            <TimeScale hours={c.hours} heightPerHour={72} part="axis" viewType="mobile" />

            <div className="flex-1 relative">
              <TimeScale hours={c.hours} heightPerHour={72} part="guides" />
              
              <DayColumn 
                date={c.mobileSelectedDate}
                appointments={c.getAppointmentsForDay(c.mobileSelectedDate)}
                blocks={c.getBlocksForDay(c.mobileSelectedDate)}
                isClosed={c.isDayClosed(c.mobileSelectedDate)}
                closedReason={c.getDayClosedReason(c.mobileSelectedDate)}
                closedBlock={c.getClosedBlockForDay(c.mobileSelectedDate)}
                hours={c.hours}
                startHour={c.startHour}
                heightPerHour={72}
                viewType="mobile"
                onSlotClick={(h, m) => c.handleSlotClick(h, m, c.mobileSelectedDate)}
                onApptClick={c.handleApptClick}
                onBlockClick={c.handleBlockClick}
                checkIsLunch={c.isLunchTime}
                checkIsDisabled={c.isTimeDisabled}
                clientMap={c.clientMap}
                serviceMap={c.serviceMap}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODALES Y TOOLTIPS */}
      <CalendarModals 
        showModal={c.showModal}
        setShowModal={c.setShowModal}
        showEditModal={c.showEditModal}
        setShowEditModal={c.setShowEditModal}
        showBlockDeleteModal={c.showBlockDeleteModal}
        setShowBlockDeleteModal={c.setShowBlockDeleteModal}
        selectedSlot={c.selectedSlot}
        selectedMinutes={c.selectedMinutes}
        setSelectedMinutes={c.setSelectedMinutes}
        selectedAppt={c.selectedAppt}
        setSelectedAppt={c.setSelectedAppt}
        selectedBlock={c.selectedBlock}
        setSelectedBlock={c.setSelectedBlock}
        clients={c.clients}
        services={c.services}
        settings={c.settings}
        startHour={c.startHour}
        endHour={c.endHour}
        getAppointmentsForDay={c.getAppointmentsForDay}
        getBlocksForDay={c.getBlocksForDay}
        clientMap={c.clientMap}
        serviceMap={c.serviceMap}
        fetchData={c.fetchData}
        openWhatsApp={c.openWhatsApp}
      />

      {/* Tooltip Hover (Desktop) */}
      {c.hoveredAppt && (
        <div 
          className="fixed z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: c.tooltipPos.x + 15 > (typeof window !== 'undefined' ? window.innerWidth : 1200) - 280 ? c.tooltipPos.x - 295 : c.tooltipPos.x + 15, 
            top: c.tooltipPos.y + 200 > (typeof window !== 'undefined' ? window.innerHeight : 800) ? c.tooltipPos.y - 210 : c.tooltipPos.y + 15
          }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-stone-100 shadow-2xl rounded-2xl p-5 w-[280px] ring-1 ring-black/5 relative">
            <div className="absolute top-4 right-5 bg-[#fdf2f3] text-[#d9777f] px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter">
              {new Date(c.hoveredAppt.start_time.endsWith('Z') ? c.hoveredAppt.start_time.slice(0, -1) : c.hoveredAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Cliente</p>
                <p className="font-extrabold text-stone-800 text-[15px] truncate pr-16">{c.clientMap.get(c.hoveredAppt.client_id)?.name || 'Desconocido'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Servicio / Tratamiento</p>
                <p className="font-bold text-[#d9777f] text-[12px] leading-tight">{c.serviceMap.get(c.hoveredAppt.service_id)?.name || '...'}</p>
              </div>
              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Estado</p>
                <span className={`text-[10px] font-black px-2 rounded-lg uppercase tracking-tight
                  ${c.hoveredAppt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    c.hoveredAppt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                    c.hoveredAppt.status === 'web_pending' ? 'bg-orange-100 text-orange-700' :
                    c.hoveredAppt.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f]' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {c.hoveredAppt.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-medium">Cargando orquestador...</p>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}
