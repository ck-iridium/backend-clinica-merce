'use client';

import React, { Suspense, useState } from 'react';
import { useCalendarData } from '@/components/calendar-v2/hooks/useCalendarData';
import { CalendarHeader } from '@/components/calendar-v2/CalendarHeader';
import { TimeScale } from '@/components/calendar-v2/TimeScale';
import { DayColumn } from '@/components/calendar-v2/DayColumn';
import { CalendarModals } from '@/components/calendar-v2/CalendarModals';
import { ContextPanel } from '@/components/calendar-v2/ContextPanel';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * CalendarContent
 * Componente principal refactorizado (v2).
 * Orquesta los componentes modulares y utiliza useCalendarData para la gestión del estado.
 */
function CalendarContent() {
  const c = useCalendarData();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  if (c.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-12 h-12 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-6"></div>
        <p className="text-stone-500 font-serif italic text-lg">Cargando tu agenda...</p>
      </div>
    );
  }

  const confirmedCount = c.appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = c.appointments.filter(a => a.status === 'web_pending').length;

  return (
    <div className="flex flex-row h-full w-full overflow-hidden bg-stone-50/50">

      {/* A. COLUMNA IZQUIERDA: ContextPanel (Colapsable) */}
      <div className={`
        hidden md:block h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl
        ${isPanelOpen ? 'w-[280px] lg:w-[320px] opacity-100' : 'w-0 opacity-0'}
      `}>
        <div className="min-w-[280px] lg:min-w-[320px] h-full overflow-y-auto">
          <ContextPanel
            clinicName={c.settings?.clinic_name}
            selectedDate={c.mobileSelectedDate}
            onDateChange={c.handleMobileDateSelect}
            confirmedCount={confirmedCount}
            pendingCount={pendingCount}
            onPrev={c.handlePrevWeek}
            onNext={c.handleNextWeek}
            onToday={c.handleToday}
          />
        </div>
      </div>

      {/* B. COLUMNA DERECHA: Agenda (Principal) */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">

        {/* Toggle Button (Focus Mode) */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`
            absolute top-5 left-5 z-50 p-2.5 rounded-full border border-stone-200 shadow-xl transition-all duration-300 group
            ${isPanelOpen ? 'bg-white/40 backdrop-blur-sm text-stone-500 hover:text-stone-800' : 'bg-white text-stone-900 hover:scale-110'}
          `}
          title={isPanelOpen ? "Cerrar Panel" : "Abrir Panel"}
        >
          {isPanelOpen ? (
            <PanelLeftClose size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <PanelLeftOpen size={20} className="text-[#d9777f]" />
          )}
        </button>

        {/* Contenedor de la Agenda como una "Isla" Elástica */}
        <div className={`
          flex-1 flex flex-col bg-white shadow-2xl shadow-stone-200/40 overflow-hidden relative transition-all duration-300 mb-[10px]
        `}>

          {/* Calendar Area (Sin paddings externos para Edge-to-Edge) */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* 1. CABECERA (Reducida a lo mínimo para maximizar espacio) */}
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

            {/* 2. VISTA DESKTOP (Grilla Semanal Elástica) */}
            <div className="hidden md:flex flex-col flex-1 bg-white overflow-hidden relative translate-z-0">
              {/* Header de Días */}
              <div 
                className="grid border-b border-stone-200 bg-stone-50/30"
                style={{ gridTemplateColumns: `100px repeat(${c.days.length}, minmax(0, 1fr))` }}
              >
                <div className="border-r border-stone-200"></div>
                {c.days.map((date, i) => (
                  <div key={i} className="py-3 px-4 text-center border-r border-stone-200 last:border-r-0">
                    <p className="text-[10px] font-black text-[#d9777f] uppercase tracking-[0.2em] mb-0.5">
                      {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </p>
                    <p className="text-2xl font-serif italic font-black text-stone-900">
                      {date.getDate()}
                    </p>
                  </div>
                ))}
              </div>
              {/* Cuerpo de la Grilla (Elástico No-Scroll) */}
              <div className="flex-1 flex flex-col relative overflow-visible h-full">
                <div 
                  className="grid relative h-full flex-1"
                  style={{ gridTemplateColumns: `100px repeat(${c.days.length}, minmax(0, 1fr))` }}
                >
                  <TimeScale hours={c.hours} heightPerHour={0} part="guides" />
                  <TimeScale hours={c.hours} heightPerHour={0} part="axis" viewType="desktop" />
                  {c.days.map((date, i) => (
                    <DayColumn 
                      key={i}
                      date={date}
                      isWorkingDay={c.workingDays.includes(date.getDay() === 0 ? 7 : date.getDay())}
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
                      onApptMouseMove={c.handleApptMouseMove}
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
                      onApptMouseEnter={c.handleApptMouseEnter}
                      onApptMouseMove={c.handleApptMouseMove}
                      onApptMouseLeave={c.handleApptMouseLeave}
                      checkIsLunch={c.isLunchTime}
                      checkIsDisabled={c.isTimeDisabled}
                      clientMap={c.clientMap}
                      serviceMap={c.serviceMap}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. MODALES Y TOOLTIPS (Inyectados fuera del flujo del canvas para evitar recortes) */}
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

        {c.hoveredAppt && (
          <div
            className="fixed z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: c.tooltipPos.x + 20 > (typeof window !== 'undefined' ? window.innerWidth : 1200) - 380 ? c.tooltipPos.x - 395 : c.tooltipPos.x + 20,
              top: c.tooltipPos.y + 250 > (typeof window !== 'undefined' ? window.innerHeight : 800) ? c.tooltipPos.y - 230 : c.tooltipPos.y + 20
            }}
          >
            <div className="bg-white/98 backdrop-blur-xl border border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-7 w-[380px] ring-1 ring-black/5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${c.hoveredAppt.status === 'confirmed' ? 'bg-blue-500' :
                c.hoveredAppt.status === 'completed' ? 'bg-emerald-500' :
                  c.hoveredAppt.status === 'cancelled' ? 'bg-red-500' :
                    'bg-orange-500'
                }`}></div>

              <div className={`absolute top-6 right-7 px-3 py-1 rounded-full text-[12px] font-black tracking-tighter border ${c.hoveredAppt.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-orange-50 text-orange-600 border-orange-100'
                }`}>
                {new Date(c.hoveredAppt.start_time.endsWith('Z') ? c.hoveredAppt.start_time.slice(0, -1) : c.hoveredAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span> Cliente
                  </p>
                  <p className="font-extrabold text-stone-900 text-[22px] leading-tight pr-20">{c.clientMap.get(c.hoveredAppt.client_id)?.name || 'Desconocido'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span> Servicio / Tratamiento
                  </p>
                  <p className={`font-black text-[17px] leading-tight ${c.hoveredAppt.status === 'confirmed' ? 'text-blue-600' :
                    c.hoveredAppt.status === 'completed' ? 'text-emerald-600' :
                      'text-orange-600'
                    }`}>{c.serviceMap.get(c.hoveredAppt.service_id)?.name || 'Sin especificar'}</p>
                </div>
                <div className="flex justify-between items-center bg-stone-50/50 p-4 rounded-2xl border border-stone-100 mt-1">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Estado Actual</p>
                  <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider
                    ${c.hoveredAppt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      c.hoveredAppt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        c.hoveredAppt.status === 'web_pending' ? 'bg-orange-100 text-orange-700' :
                          c.hoveredAppt.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700'
                    }`}>
                    {c.hoveredAppt.status === 'completed' ? 'Realizada' :
                      c.hoveredAppt.status === 'cancelled' ? 'Cancelada' :
                        c.hoveredAppt.status === 'web_pending' ? 'Pte. Confirmar' :
                          c.hoveredAppt.status === 'confirmed' ? 'Confirmada' :
                            c.hoveredAppt.status === 'no_show' ? 'No Asistió' :
                              'Pendiente'}
                  </span>
                </div>
                <div className="mt-1 bg-[#fefefe] p-4 rounded-2xl border border-stone-50 shadow-sm">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Notas del Profesional</p>
                  <p className="text-[13px] text-stone-600 font-medium italic leading-relaxed line-clamp-4">
                    {c.hoveredAppt.notes || 'Sin observaciones registradas...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
