import { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);

  // Inicialización de cliente (Robusta)
  useEffect(() => {
    const now = new Date();
    // Lógica: Si es después de las 19:15, pasar a mañana
    if (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 15)) {
      now.setDate(now.getDate() + 1);
    }
    setMobileSelectedDate(new Date(now));
    setCarouselAnchor(new Date(now));
    setCurrentWeek(getMonday(now));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, clientRes, srvRes, blockRes, settingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
      ]);
      
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
      if (srvRes.ok) {
        const servs = await srvRes.json();
        setServices(servs.filter((s:any) => s.is_active));
      }
      if (blockRes.ok) setTimeBlocks(await blockRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
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

  const getDayClosedReason = (date: Date) => {
    const dayBlocks = getBlocksForDay(date);
    const block = dayBlocks.find(b => {
      if (b.is_annual_holiday) return true;
      const start = new Date(b.start_time.endsWith('Z') ? b.start_time.slice(0, -1) : b.start_time);
      const end = new Date(b.end_time.endsWith('Z') ? b.end_time.slice(0, -1) : b.end_time);
      return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) >= 8;
    });
    return block ? (block.reason || 'Cerrado') : null;
  };

  // Cálculo de periodos y mapas
  const days = Array.from({ length: 5 }).map((_, i) => {
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

  const startHour = settings && settings.open_time ? parseInt(settings.open_time.split(':')[0]) : 9;
  const endHour = settings && settings.close_time ? parseInt(settings.close_time.split(':')[0]) : 19;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return {
    // Estados principales
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
    
    // Helpers
    isLunchTime,
    isTimeDisabled,
    isDayClosed,
    getDayClosedReason,
    getAppointmentsForDay,
    getBlocksForDay,
    initialClientId
  };
}
