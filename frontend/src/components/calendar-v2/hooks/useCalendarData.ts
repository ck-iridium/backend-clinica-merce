'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';

/**
 * Helper para obtener el lunes de la semana actual.
 */
const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

/**
 * Hook useCalendarData
 * Encapsula toda la lógica de estado y obtención de datos de la agenda.
 */
export function useCalendarData() {
  const { showFeedback } = useFeedback();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('client_id');

  // Estados de navegación
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));
  const [mobileSelectedDate, setMobileSelectedDate] = useState<Date>(() => new Date());
  const [carouselAnchor, setCarouselAnchor] = useState<Date>(() => new Date());
  
  // Refs
  const mobileDaysContainerRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement>(null);

  // Estados de Datos
  const [settings, setSettings] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NUEVO: Estados de UI y Modales ---
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockDeleteModal, setShowBlockDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number, staffId?: string } | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [hoveredAppt, setHoveredAppt] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mobileTopbarPortal, setMobileTopbarPortal] = useState<Element | null>(null);

  // --- VISTA Y FILTRO DE ESPECIALISTAS Y SEDES ---
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string | 'ALL'>('ALL');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string | 'ALL'>('ALL');

  // Cargar preferencia persistida de sede desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('probookia_calendar_selected_location');
      if (saved) setSelectedLocationFilter(saved);
    }
  }, []);

  const handleSelectLocationFilter = (locId: string | 'ALL') => {
    setSelectedLocationFilter(locId);
    if (typeof window !== 'undefined') {
      if (locId === 'ALL') {
        localStorage.removeItem('probookia_calendar_selected_location');
      } else {
        localStorage.setItem('probookia_calendar_selected_location', locId);
      }
    }
  };

  // --- NUEVO: Búsqueda y Filtros (Spotlight) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMADA' | 'PENDIENTE' | 'PAGADA'>('ALL');

  // Inicialización de cliente (Robusta)
  useEffect(() => {
    const now = new Date();
    // Lógica: Si es después de las 19:15, pasar a mañana
    if (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 15)) {
      now.setDate(now.getDate() + 1);
    }
    const safeNow = new Date(now);
    setMobileSelectedDate(safeNow);
    setCarouselAnchor(safeNow);
    setCurrentWeek(getMonday(safeNow));
  }, []);

  useEffect(() => {
    setMobileTopbarPortal(document.getElementById('mobile-topbar-center'));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, clientRes, srvRes, blockRes, settingsRes, staffRes, locRes, resRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/specialists`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/resources/all`)
      ]);
      
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
      if (srvRes.ok) {
        const servs = await srvRes.json();
        setServices(servs.filter((s:any) => s.is_active));
      }
      if (blockRes.ok) setTimeBlocks(await blockRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
      if (locRes.ok) setLocations(await locRes.json());
      if (resRes.ok) {
        const rList = await resRes.json();
        setResources(Array.isArray(rList) ? rList : []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar datos del calendario');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helpers de Negocio (Horarios, Bloqueos, etc.)
   */
  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const isLunchTime = (hour: number, minute: number) => {
    if (!settings || !settings.lunch_start || !settings.lunch_end) return false;
    const timeMins = hour * 60 + minute;
    const startMins = timeToMinutes(settings.lunch_start);
    const endMins = timeToMinutes(settings.lunch_end);
    return timeMins >= startMins && timeMins < endMins;
  };

  const isTimeDisabled = (hour: number, minute: number) => {
    if (!settings) return false;
    const currentMins = hour * 60 + minute;
    const openMins = timeToMinutes(settings.open_time || "09:00");
    const closeMins = timeToMinutes(settings.close_time || "19:30");
    
    if (currentMins < openMins || currentMins >= closeMins) return true;
    if (isLunchTime(hour, minute)) return true;
    return false;
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(a => {
      if (selectedLocationFilter !== 'ALL' && a.location_id && a.location_id !== selectedLocationFilter) {
        return false;
      }
      if (selectedStaffFilter !== 'ALL' && a.staff_id !== selectedStaffFilter) {
        return false;
      }
      let tString = a.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const aDate = new Date(tString);
      return (
        aDate.getDate() === date.getDate() && 
        aDate.getMonth() === date.getMonth() && 
        aDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getAppointmentsForStaffAndDay = (date: Date, staffId: string | 'unassigned') => {
    return appointments.filter(a => {
      if (selectedLocationFilter !== 'ALL' && a.location_id && a.location_id !== selectedLocationFilter) {
        return false;
      }
      let tString = a.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const aDate = new Date(tString);
      const isSameDay = (
        aDate.getDate() === date.getDate() && 
        aDate.getMonth() === date.getMonth() && 
        aDate.getFullYear() === date.getFullYear()
      );
      if (!isSameDay) return false;
      if (staffId === 'unassigned') {
        return !a.staff_id;
      }
      return a.staff_id === staffId;
    });
  };

  const getBlocksForDay = (date: Date) => {
    return timeBlocks.filter(b => {
      let tString = b.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const bDate = new Date(tString);
      
      if (b.is_annual_holiday) {
        return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth();
      }
      
      let eString = b.end_time;
      if (eString.endsWith('Z')) eString = eString.slice(0, -1);
      const eDate = new Date(eString);

      const targetTime = date.getTime();
      const startTime = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();
      const endTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), 23, 59, 59).getTime();

      return targetTime >= startTime && targetTime <= endTime;
    });
  };

  const isDayClosed = (date: Date) => {
    const dayBlocks = getBlocksForDay(date);
    return dayBlocks.some(b => {
      if (b.is_annual_holiday) return true;
      const start = new Date(b.start_time.endsWith('Z') ? b.start_time.slice(0, -1) : b.start_time);
      const end = new Date(b.end_time.endsWith('Z') ? b.end_time.slice(0, -1) : b.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return durationHours >= 8;
    });
  };

  const getClosedBlockForDay = (date: Date) => {
    const dayBlocks = getBlocksForDay(date);
    return dayBlocks.find(b => {
      if (b.is_annual_holiday) return true;
      const start = new Date(b.start_time.endsWith('Z') ? b.start_time.slice(0, -1) : b.start_time);
      const end = new Date(b.end_time.endsWith('Z') ? b.end_time.slice(0, -1) : b.end_time);
      return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) >= 8;
    });
  };

  const getDayClosedReason = (date: Date) => {
    const block = getClosedBlockForDay(date);
    return block ? (block.reason || 'Cerrado') : null;
  };

  /**
   * MANEJADORES DE NAVEGACIÓN
   */
  const handlePrevWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - 7);
    setCurrentWeek(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + 7);
    setCurrentWeek(d);
  };

  const handlePrevDay = () => {
    const d = new Date(mobileSelectedDate);
    d.setDate(d.getDate() - 1);
    handleMobileDateSelect(d);
  };

  const handleNextDay = () => {
    const d = new Date(mobileSelectedDate);
    d.setDate(d.getDate() + 1);
    handleMobileDateSelect(d);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentWeek(getMonday(now));
    setMobileSelectedDate(new Date(now));
    setCarouselAnchor(new Date(now));
    
    // Auto-scroll en móvil
    if (mobileDaysContainerRef.current && activeDayRef.current) {
        activeDayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentWeek(getMonday(date));
    setMobileSelectedDate(date);
    setCarouselAnchor(date);
  };

  const handleMobileDateSelect = (date: Date) => {
    setMobileSelectedDate(date);
    setCarouselAnchor(date);
    setCurrentWeek(getMonday(date));
  };

  const handlePrev = () => {
    if (viewMode === 'day') {
      handlePrevDay();
    } else {
      handlePrevWeek();
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      handleNextDay();
    } else {
      handleNextWeek();
    }
  };

  const handleDayHeaderClick = (date: Date) => {
    setMobileSelectedDate(date);
    setCarouselAnchor(date);
    setCurrentWeek(getMonday(date));
    setViewMode('day');
  };

  /**
   * MANEJADORES DE INTERACCIÓN
   */
  const handleSlotClick = (hour: number, minute: number, date: Date, staffId?: string) => {
    setSelectedSlot({ date, hour, staffId });
    setSelectedMinutes(minute);
    setShowModal(true);
  };

  const handleApptClick = (appt: any) => {
    setSelectedAppt(appt);
    setShowEditModal(true);
  };

  const handleBlockClick = (block: any) => {
    setSelectedBlock(block);
    setShowBlockDeleteModal(true);
  };

  const handleApptMouseEnter = (e: React.MouseEvent, appt: any) => {
    setHoveredAppt(appt);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleApptMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleApptMouseLeave = () => {
    setHoveredAppt(null);
  };

  const openWhatsApp = (clientName: string, phone: string, serviceName: string, startTime: string) => {
    if (!phone) return;
    const date = new Date(startTime.endsWith('Z') ? startTime.slice(0, -1) : startTime);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const clinicName = settings?.clinic_name || 'nuestro centro';
    const message = `¡Hola ${clientName}! Te escribo de ${clinicName} sobre tu cita para ${serviceName} el ${dateStr}.`;
    const encoded = encodeURIComponent(message);
    let cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    if (!cleanPhone.startsWith('34') && cleanPhone.length === 9) cleanPhone = '34' + cleanPhone;
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Configuración de días laborables con persistencia real (localStorage)
  const [workingDays, setWorkingDays] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercestetica_working_days');
      if (saved) return JSON.parse(saved);
    }
    return settings?.working_days || [1, 2, 3, 4, 5];
  });

  // Sincronizar cuando los settings de la API cargan (por si hay cambios remotos)
  useEffect(() => {
    if (settings?.working_days) {
      setWorkingDays(settings.working_days);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercestetica_working_days');
      if (saved) setWorkingDays(JSON.parse(saved));
    }
  }, [settings]);

  const maxDays = Math.max(...workingDays, 5);

  // Cálculo de periodos y mapas
  const days = Array.from({ length: maxDays }).map((_, i) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const mobileDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(carouselAnchor);
    d.setDate(d.getDate() - 2 + i);
    return d;
  });

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const serviceMap = new Map(services.map(s => [s.id, s]));
  const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList]);

  // Conteo de citas por especialista para el selector de personal
  const staffAppointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    staffList.forEach(s => { counts[s.id] = 0; });
    counts['unassigned'] = 0;

    appointments.forEach(a => {
      let tString = a.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const aDate = new Date(tString);

      let isInScope = false;
      if (viewMode === 'day') {
        isInScope = (
          aDate.getDate() === mobileSelectedDate.getDate() &&
          aDate.getMonth() === mobileSelectedDate.getMonth() &&
          aDate.getFullYear() === mobileSelectedDate.getFullYear()
        );
      } else {
        const dayStart = new Date(currentWeek);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentWeek);
        dayEnd.setDate(dayEnd.getDate() + maxDays);
        dayEnd.setHours(23, 59, 59, 999);
        isInScope = aDate >= dayStart && aDate <= dayEnd;
      }

      if (isInScope) {
        if (selectedLocationFilter !== 'ALL' && a.location_id && a.location_id !== selectedLocationFilter) {
          return;
        }
        const sId = a.staff_id || 'unassigned';
        counts[sId] = (counts[sId] || 0) + 1;
      }
    });

    return counts;
  }, [appointments, staffList, viewMode, mobileSelectedDate, currentWeek, maxDays, selectedLocationFilter]);

  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r])), [resources]);

  // Conteo de citas por sede en el rango visible
  const locationAppointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach(l => { counts[l.id] = 0; });

    appointments.forEach(a => {
      let tString = a.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const aDate = new Date(tString);

      let isInScope = false;
      if (viewMode === 'day') {
        isInScope = (
          aDate.getDate() === mobileSelectedDate.getDate() &&
          aDate.getMonth() === mobileSelectedDate.getMonth() &&
          aDate.getFullYear() === mobileSelectedDate.getFullYear()
        );
      } else {
        const dayStart = new Date(currentWeek);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentWeek);
        dayEnd.setDate(dayEnd.getDate() + maxDays);
        dayEnd.setHours(23, 59, 59, 999);
        isInScope = aDate >= dayStart && aDate <= dayEnd;
      }

      if (isInScope && a.status !== 'cancelled' && a.location_id && counts[a.location_id] !== undefined) {
        counts[a.location_id] = (counts[a.location_id] || 0) + 1;
      }
    });

    return counts;
  }, [locations, appointments, viewMode, mobileSelectedDate, currentWeek, maxDays]);

  const startHour = settings && settings.open_time ? parseInt(settings.open_time.split(':')[0]) : 9;
  const endHour = settings && settings.close_time 
    ? Math.ceil((parseInt(settings.close_time.split(':')[0]) * 60 + parseInt(settings.close_time.split(':')[1])) / 60) 
    : 19;
  
  // Generar array de horas dinámico desde apertura hasta cierre
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return {
    // Estados principales
    workingDays,
    currentWeek,
    setCurrentWeek,
    mobileSelectedDate,
    setMobileSelectedDate,
    carouselAnchor,
    setCarouselAnchor,
    loading,
    settings,
    appointments,
    timeBlocks,
    clients,
    services,
    staffList,
    locations,
    resources,

    // Vistas y filtros de personal y sedes
    viewMode,
    setViewMode,
    selectedStaffFilter,
    setSelectedStaffFilter,
    staffAppointmentCounts,
    selectedLocationFilter,
    setSelectedLocationFilter: handleSelectLocationFilter,
    locationAppointmentCounts,

    // Refs
    mobileDaysContainerRef,
    activeDayRef,

    // Acciones e información derivada
    fetchData,
    days,
    mobileDays,
    hours,
    startHour,
    endHour,
    clientMap,
    serviceMap,
    staffMap,
    locationMap,
    resourceMap,
    
    // Helpers
    isLunchTime,
    isTimeDisabled,
    isDayClosed,
    getDayClosedReason,
    getClosedBlockForDay,
    getAppointmentsForDay,
    getAppointmentsForStaffAndDay,
    getBlocksForDay,
    initialClientId,

    // UI States
    showModal, setShowModal,
    showEditModal, setShowEditModal,
    showBlockDeleteModal, setShowBlockDeleteModal,
    selectedSlot, setSelectedSlot,
    selectedMinutes, setSelectedMinutes,
    selectedAppt, setSelectedAppt,
    selectedBlock, setSelectedBlock,
    hoveredAppt, setHoveredAppt,
    tooltipPos, setTooltipPos,
    mobileTopbarPortal,

    // Handlers
    handlePrev,
    handleNext,
    handlePrevWeek,
    handleNextWeek,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleDateSelect,
    handleMobileDateSelect,
    handleDayHeaderClick,
    handleSlotClick,
    handleApptClick,
    handleBlockClick,
    handleApptMouseEnter,
    handleApptMouseMove,
    handleApptMouseLeave,
    openWhatsApp,

    // Búsqueda y Filtros
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter
  };
}
