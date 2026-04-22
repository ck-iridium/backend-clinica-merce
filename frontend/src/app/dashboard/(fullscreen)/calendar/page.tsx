'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useCalendarData } from '@/components/calendar-v2/hooks/useCalendarData';
import { CalendarHeader } from '@/components/calendar-v2/CalendarHeader';
import { TimeScale } from '@/components/calendar-v2/TimeScale';
import { DayColumn } from '@/components/calendar-v2/DayColumn';
import { CalendarModals } from '@/components/calendar-v2/CalendarModals';
import { ContextPanel } from '@/components/calendar-v2/ContextPanel';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { TimeIndicator } from '@/components/calendar-v2/TimeIndicator';
import { AnimatePresence, motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

/**
 * CalendarContent
 * Componente principal refactorizado (v2).
 * Orquesta los componentes modulares y utiliza useCalendarData para la gestión del estado.
 *
 * ARQUITECTURA MÓVIL:
 * - La vista móvil es hermana directa de la "isla" desktop (hidden md:flex).
 * - Ningún ancestro de la vista móvil tiene overflow-hidden → sticky funciona.
 * - pb-[75px] en el contenedor raíz móvil hace que el scrollbar termine antes del BottomNav fijo.
 * - overflow-y-visible en el carrusel evita recortar el scale-105 del día activo.
 */
function CalendarContent() {
  const c = useCalendarData();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const MOBILE_HEIGHT_PER_HOUR = 144;

  const mobileGridRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Scroll inicial al 40% de la jornada, solo una vez al montar
  useEffect(() => {
    if (!c.loading && !hasScrolled.current && mobileGridRef.current) {
      const totalHeight = c.hours.length * MOBILE_HEIGHT_PER_HOUR;
      mobileGridRef.current.scrollTo({ top: totalHeight * 0.40 });
      hasScrolled.current = true;
    }
  }, [c.loading]);

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

      {/* ── A. COLUMNA IZQUIERDA: ContextPanel ── */}

      {/* DESKTOP — Sidebar colapsable */}
      <div className={`
        hidden md:block h-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl
        ${isPanelOpen ? 'w-[280px] lg:w-[320px] opacity-100' : 'w-0 opacity-0'}
      `}>
        <div className="w-full h-full overflow-y-auto">
          <ContextPanel
            clinicName={c.settings?.clinic_name}
            selectedDate={c.mobileSelectedDate}
            onDateChange={c.handleMobileDateSelect}
            confirmedCount={confirmedCount}
            pendingCount={pendingCount}
            onPrev={c.handlePrevWeek}
            onNext={c.handleNextWeek}
            onToday={c.handleToday}
            searchTerm={c.searchTerm}
            setSearchTerm={c.setSearchTerm}
            activeFilter={c.activeFilter}
            setActiveFilter={c.setActiveFilter}
          />
        </div>
      </div>

      {/* MÓVIL — Overlay a pantalla completa con animación de entrada/salida */}
      <AnimatePresence>
        {isMobilePanelOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 top-0 bottom-[56px] z-50 bg-white md:hidden overflow-y-auto"
          >
            <ContextPanel
              clinicName={c.settings?.clinic_name}
              selectedDate={c.mobileSelectedDate}
              onDateChange={(date) => { c.handleMobileDateSelect(date); setIsMobilePanelOpen(false); }}
              confirmedCount={confirmedCount}
              pendingCount={pendingCount}
              onPrev={() => { c.handlePrevDay(); setIsMobilePanelOpen(false); }}
              onNext={() => { c.handleNextDay(); setIsMobilePanelOpen(false); }}
              onToday={() => { c.handleToday(); setIsMobilePanelOpen(false); }}
              searchTerm={c.searchTerm}
              setSearchTerm={c.setSearchTerm}
              activeFilter={c.activeFilter}
              setActiveFilter={(f) => { c.setActiveFilter(f); setIsMobilePanelOpen(false); }}
              onClose={() => setIsMobilePanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── B. COLUMNA DERECHA: Agenda ── */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">

        {/* Toggle Panel — solo Desktop */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`
            hidden md:flex absolute top-5 left-[50px] -translate-x-1/2 z-50 p-2.5 rounded-full border border-stone-200 shadow-xl transition-all duration-300 group items-center justify-center
            ${isPanelOpen ? 'bg-white/40 backdrop-blur-sm text-stone-500 hover:text-stone-800' : 'bg-white text-stone-900 hover:scale-110'}
          `}
          title={isPanelOpen ? 'Cerrar Panel' : 'Abrir Panel'}
        >
          {isPanelOpen ? (
            <PanelLeftClose size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <PanelLeftOpen size={20} className="text-[#d9777f]" />
          )}
        </button>

        {/* ── DESKTOP: "Isla" con overflow-hidden (grilla elástica sin scroll) ── */}
        <div className="hidden md:flex flex-col flex-1 bg-white shadow-2xl shadow-stone-200/40 overflow-hidden relative transition-all duration-300">
          <CalendarHeader
            currentWeek={c.currentWeek}
            mobileSelectedDate={c.mobileSelectedDate}
            onPrevWeek={c.handlePrevWeek}
            onNextWeek={c.handleNextWeek}
            onToday={c.handleToday}
            onDateSelect={c.handleDateSelect}
            onMobileDateSelect={c.handleMobileDateSelect}
          />
          {/* Header de días */}
          <div
            className="grid border-b border-stone-200 bg-stone-50/30"
            style={{ gridTemplateColumns: `100px repeat(${c.days.length}, minmax(0, 1fr))` }}
          >
            <div className="border-r border-stone-200" />
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
          {/* Cuerpo de la grilla (elástico, sin scroll) */}
          <div className="flex-1 flex flex-col relative overflow-visible h-full">
            <div
              className="grid relative h-full flex-1"
              style={{ gridTemplateColumns: `100px repeat(${c.days.length}, minmax(0, 1fr))` }}
            >
              {/* Indicador de Tiempo Real (Desktop) */}
              {c.days.some(d => d.toDateString() === new Date().toDateString()) && (
                <div
                  className="absolute inset-0 pointer-events-none z-40"
                  style={{ gridColumn: '2 / -1' }}
                >
                  <TimeIndicator
                    startHour={c.startHour}
                    totalHours={c.hours.length}
                    heightPerHour={80}
                    viewType="desktop"
                  />
                </div>
              )}

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
                  searchTerm={c.searchTerm}
                  activeFilter={c.activeFilter}
                />
              ))}
            </div>
          </div>
        </div>

        {/*
          ── MÓVIL: Layout completamente fijo (fixed inset-0) ──
          - Independiente del flujo del documento y de cualquier ancestro.
          - El header de días queda anclado y nunca se desplaza.
          - La grilla scroll solo en su propio contenedor interno.
          - top-0 bottom-[56px] deja espacio exacto para el BottomNav.
        */}
        <div className="md:hidden fixed inset-x-0 top-0 bottom-[56px] flex flex-col bg-white overflow-hidden z-10">

          {/* 1. Header estático anclado (nunca se mueve) */}
          <div className="flex-shrink-0 flex items-center bg-white shadow-sm border-b border-stone-100 p-1">

            {/* Botón abrir panel */}
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className="flex-shrink-0 px-4 py-3 active:scale-95 transition-all outline-none"
              aria-label="Abrir panel"
            >
              <PanelLeftOpen className="text-[#d9777f] w-5 h-5" />
            </button>

            {/* Carrusel de días con degradado */}
            <div className="flex-1 relative overflow-hidden">
              {/* Degradado (Fade Out) para suavizar la entrada de los días bajo el botón */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />

              <div
                className="overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory flex gap-2 px-4 py-3"
                ref={c.mobileDaysContainerRef}
              >
                {c.mobileDays.map((date, i) => {
                  const isSelected = date.toDateString() === c.mobileSelectedDate.toDateString();
                  return (
                    <button
                      key={i}
                      ref={isSelected ? c.activeDayRef : null}
                      onClick={() => c.handleMobileDateSelect(date)}
                      className={`snap-center flex-shrink-0 w-14 rounded-xl flex flex-col items-center justify-center py-2 transition-all border-2
                        ${isSelected
                          ? 'bg-[#fdf2f3] border-[#d9777f] shadow-md shadow-rose-100 scale-105'
                          : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'
                        }
                      `}
                    >
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#d9777f]' : 'text-stone-300'}`}>
                        {date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                      </span>
                      <span className={`text-base font-serif italic font-black ${isSelected ? 'text-stone-800' : 'text-stone-400'}`}>
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Grilla con scroll interno y padding para el footer */}
          <div ref={mobileGridRef} className="flex-1 min-h-0 overflow-y-auto bg-white">
            <div
              className="flex relative"
              style={{ height: `${c.hours.length * MOBILE_HEIGHT_PER_HOUR}px` }}
            >
              <TimeScale hours={c.hours} heightPerHour={MOBILE_HEIGHT_PER_HOUR} part="axis" viewType="mobile" />
              <div className="flex-1 relative border-l border-stone-100">
                {/* Indicador de Tiempo Real (Móvil) */}
                {c.mobileSelectedDate.toDateString() === new Date().toDateString() && (
                  <TimeIndicator
                    startHour={c.startHour}
                    totalHours={c.hours.length}
                    heightPerHour={MOBILE_HEIGHT_PER_HOUR}
                    viewType="mobile"
                  />
                )}

                <TimeScale hours={c.hours} heightPerHour={MOBILE_HEIGHT_PER_HOUR} part="guides" />
                <DayColumn
                  date={c.mobileSelectedDate}
                  appointments={c.getAppointmentsForDay(c.mobileSelectedDate)}
                  blocks={c.getBlocksForDay(c.mobileSelectedDate)}
                  isClosed={c.isDayClosed(c.mobileSelectedDate)}
                  closedReason={c.getDayClosedReason(c.mobileSelectedDate)}
                  closedBlock={c.getClosedBlockForDay(c.mobileSelectedDate)}
                  hours={c.hours}
                  startHour={c.startHour}
                  heightPerHour={MOBILE_HEIGHT_PER_HOUR}
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
                  searchTerm={c.searchTerm}
                  activeFilter={c.activeFilter}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── MODALES Y TOOLTIPS ── */}
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
            <div className="bg-white/98 backdrop-blur-xl border border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[0.75em] p-7 w-[380px] ring-1 ring-black/5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${c.hoveredAppt.status === 'confirmed' ? 'bg-blue-500' :
                c.hoveredAppt.status === 'completed' ? 'bg-emerald-500' :
                  c.hoveredAppt.status === 'cancelled' ? 'bg-red-500' :
                    'bg-orange-500'
                }`} />

              <div className={`absolute top-6 right-7 px-3 py-1 rounded-full text-[12px] font-black tracking-tighter border ${c.hoveredAppt.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-orange-50 text-orange-600 border-orange-100'
                }`}>
                {new Date(c.hoveredAppt.start_time.endsWith('Z') ? c.hoveredAppt.start_time.slice(0, -1) : c.hoveredAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" /> Cliente
                  </p>
                  <p className="font-extrabold text-stone-900 text-[22px] leading-tight pr-20">{c.clientMap.get(c.hoveredAppt.client_id)?.name || 'Desconocido'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" /> Servicio / Tratamiento
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
