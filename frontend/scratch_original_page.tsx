"use client"
import { useState, useEffect, Suspense, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { Calendar, Clock, Lock, Unlock, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Trash2, AlertTriangle, Phone, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

function CalendarContent() {
  const { showFeedback } = useFeedback();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('client_id');
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));
  const [mobileSelectedDate, setMobileSelectedDate] = useState<Date>(() => new Date());
  const [carouselAnchor, setCarouselAnchor] = useState<Date>(() => new Date());
  
  const mobileDaysContainerRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement>(null);
  
  // Robust client-side initialization
  useEffect(() => {
    const now = new Date();
    // Logic: If after 19:15, default to tomorrow
    if (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 15)) {
      now.setDate(now.getDate() + 1);
    }
    setMobileSelectedDate(new Date(now));
    setCarouselAnchor(new Date(now));
    setCurrentWeek(getMonday(now));
  }, []);
  const [settings, setSettings] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mobileTopbarPortal, setMobileTopbarPortal] = useState<Element | null>(null);

  // Time Block creation state (Step 4)
  const [modalType, setModalType] = useState<'appointment' | 'block'>('appointment');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(60);
  const [showBlockDeleteModal, setShowBlockDeleteModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  // Tooltip control for hover (Step 2)
  const [hoveredAppt, setHoveredAppt] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 border-emerald-400';
      case 'cancelled': return 'bg-red-50 border-red-500 opacity-70';
      case 'no_show': return 'bg-stone-100 border-stone-400 grayscale opacity-60';
      case 'web_pending': return 'bg-orange-50 border-orange-400';
      case 'confirmed': return 'bg-[#fdf2f3] border-[#d9777f]';
      case 'pending':
      default: return 'bg-[#fdf2f3] border-[#d9777f]';
    }
  };

  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedAppt) {
      setEditNotes(selectedAppt.notes || '');
    }
  }, [selectedAppt]);

  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    // Only scroll if we manually select a day that might be out of view
    // (The initial date is already at index 2, so it's always visible on mount)
    if (mobileDaysContainerRef.current && activeDayRef.current) {
      activeDayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [mobileSelectedDate]);

  useEffect(() => {
    setMobileTopbarPortal(document.getElementById('mobile-topbar-center'));
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
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date, hour });
    setSelectedMinutes(0); // Default to hour-start
    setModalType('appointment');
    setShowModal(true);
  };

  // Safe manual formatting for LOCAL TIME to naive ISO backend
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const openWhatsApp = (clientName: string, phone: string, serviceName: string, startTime: string) => {
    if (!phone) return;
    const date = new Date(startTime.endsWith('Z') ? startTime.slice(0, -1) : startTime);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    
    const message = `┬íHola ${clientName}! Soy Merce de Est├®tica Merce. Te escribo sobre tu cita para ${serviceName} el ${dateStr}.`;
    const encoded = encodeURIComponent(message);
    
    // Ensure 34 prefix is handled if missing
    let cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    if (!cleanPhone.startsWith('34') && cleanPhone.length === 9) cleanPhone = '34' + cleanPhone;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedServiceId || !selectedSlot) return;

    setSaving(true);
    const service = services.find(s => s.id === selectedServiceId);
    
    const start_time = new Date(selectedSlot.date);
    start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
    
    const end_time = new Date(start_time.getTime() + service.duration_minutes * 60000);
    const startISO = formatLocalISO(start_time);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          service_id: selectedServiceId,
          start_time: startISO,
          end_time: formatLocalISO(end_time),
          status: 'pending',
          notes: appointmentNotes
        })
      });

      if (res.ok) {
        await fetchData();
        setShowModal(false);
        
        setSelectedClientId('');
        setSelectedServiceId('');
        setAppointmentNotes('');
        toast.success('Cita agendada correctamente');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "No se pudo reservar la cita"}`);
      }
    } catch (err) {
      toast.error('Error de conexi├│n con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
        setShowEditModal(false);
        toast.success('Estado de la cita actualizado');
      } else {
        toast.error('Error al actualizar el estado');
      }
    } catch (e) {
      toast.error('Error de conexi├│n');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes })
      });
      if (res.ok) {
        await fetchData();
        // Update local object to sync the "Guardar" button visibility
        setSelectedAppt({ ...selectedAppt, notes: editNotes });
        toast.success('Nota guardada');
      } else {
        toast.error('Error al guardar la nota');
      }
    } catch (e) {
      toast.error('Error de conexi├│n');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSaving(true);
    const start_time = new Date(selectedSlot.date);
    
    // Si es d├¡a completo (sentinel value -1), forzamos 09:00 a 19:00
    if (blockDuration === -1) {
      start_time.setHours(9, 0, 0, 0);
    } else {
      start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
    }

    const durationMins = blockDuration === -1 ? 600 : blockDuration;
    const end_time = new Date(start_time.getTime() + durationMins * 60000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: formatLocalISO(start_time),
          end_time: formatLocalISO(end_time),
          reason: blockReason
        })
      });
      if (res.ok) {
        await fetchData();
        setShowModal(false);
        setBlockReason('');
        toast.success('Horario bloqueado');
      } else {
        toast.error('Error al bloquear horario');
      }
    } catch (err) {
      toast.error('Error de conexi├│n');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async () => {
    if (!selectedBlock) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/${selectedBlock.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        setShowBlockDeleteModal(false);
        toast.success('Horario liberado');
      } else {
        toast.error('Error al liberar horario');
      }
    } catch (err) {
      toast.error('Error de conexi├│n');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppt) return;
    
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Cita',
      message: '┬┐Est├ís seguro de que deseas eliminar esta cita? Esta acci├│n no se puede deshacer.',
      onConfirm: async () => {
        setUpdatingStatus(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            await fetchData();
            setShowEditModal(false);
            toast.success('Cita eliminada correctamente');
          } else {
            toast.error('No se pudo eliminar la cita');
          }
        } catch (e) {
          toast.error('Error de conexi├│n');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Mobile: Generamos el carrusel relativo al ANCLA (estabilidad de datos)
  // Empezar 2 d├¡as antes del ancla para que el activo sea el tercer elemento (siempre visible)
  const mobileDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(carouselAnchor);
    d.setDate(d.getDate() - 2 + i);
    return d;
  });

  // Generate hours dynamically from settings
  let startHour = 9;
  let endHour = 19;
  if (settings && settings.open_time && settings.close_time) {
    startHour = parseInt(settings.open_time.split(':')[0]);
    endHour = parseInt(settings.close_time.split(':')[0]);
  }
  const hours: number[] = [];
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i);
  }

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // Funciones auxiliares para descansos y vacaciones
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

  const isDayClosed = (date: Date) => {
    const dayBlocks = getBlocksForDay(date);
    // Para considerarse cerrado, o tiene unas vacaciones de d├¡a completo (duration = 600+) o un annual_holiday
    return dayBlocks.some(b => {
      if (b.is_annual_holiday) return true;
      // Validar si dura todo el d├¡a o si el motivo dice cerrado/vacaciones
      const start = new Date(b.start_time.endsWith('Z') ? b.start_time.slice(0, -1) : b.start_time);
      const end = new Date(b.end_time.endsWith('Z') ? b.end_time.slice(0, -1) : b.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return durationHours >= 8; // Asumimos > 8h es d├¡a completo de cierre temporal
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

  const clientMap = new Map(clients.map(c => [c.id, c]));
  const serviceMap = new Map(services.map(s => [s.id, s]));

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(a => {
      // Strip 'Z' if it exists to strictly evaluate as Local Time
      let tString = a.start_time;
      if (tString.endsWith('Z')) {
        tString = tString.slice(0, -1);
      }
      const aDate = new Date(tString);
      return aDate.getDate() === date.getDate() && aDate.getMonth() === date.getMonth() && aDate.getFullYear() === date.getFullYear();
    });
  };

  const getBlocksForDay = (date: Date) => {
    return timeBlocks.filter(b => {
      let tString = b.start_time;
      if (tString.endsWith('Z')) tString = tString.slice(0, -1);
      const bDate = new Date(tString);
      
      // Anual holiday check
      if (b.is_annual_holiday) {
        return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth();
      }
      
      let eString = b.end_time;
      if (eString.endsWith('Z')) eString = eString.slice(0, -1);
      const eDate = new Date(eString);

      // Multi-day block check (date is between start and end inclusive of days)
      const targetTime = date.getTime();
      const startTime = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();
      const endTime = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), 23, 59, 59).getTime();

      return targetTime >= startTime && targetTime <= endTime;
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Desktop Header Container (Hidden on Mobile) */}
      <div className="hidden md:flex flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Agenda Activa</h1>
          <p className="text-stone-500 mt-1 font-medium">Gesti├│n de reservas y tiempos semanales</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors flex items-center gap-1">
            <ChevronLeft size={18} strokeWidth={1.5} /> Ant
          </button>
          
          <div className="relative flex items-center bg-white border border-stone-200 rounded-xl hover:bg-[#fdf2f3] hover:border-[#f3c7cb] transition-colors focus-within:ring-2 focus-within:ring-[#d9777f]">
            <input 
              type="date"
              className="px-4 py-2 bg-transparent text-stone-600 font-bold focus:outline-none cursor-pointer w-full h-full text-center"
              title="Saltar a fecha"
              value={currentWeek.toISOString().split('T')[0]} // Bind al lunes actual
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentWeek(getMonday(new Date(e.target.value)));
                }
              }}
            />
          </div>

          <button 
            onClick={() => setCurrentWeek(getMonday(new Date()))}
            className="px-5 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors">
            Hoy
          </button>

          <button 
            onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors flex items-center gap-1">
            Sig <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
        
      {/* Mobile Header Native Date Picker (Injected into DashboardSidebar Portal) */}
      {mobileTopbarPortal && createPortal(
        <div className="flex items-center gap-2">
          <div className="relative pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-800 rounded-xl px-4 py-2.5 font-bold shadow-sm flex items-center justify-between gap-3 min-w-[130px] max-w-[160px]">
              <Calendar size={18} className="text-[#d9777f] shrink-0" />
              <span className="capitalize text-sm text-center flex-1 truncate">{mobileSelectedDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')}</span>
              <ChevronDown size={18} className="text-stone-400 shrink-0" />
            </div>
            <input 
              type="date"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-10"
              style={{ display: 'block' }}
              value={`${mobileSelectedDate.getFullYear()}-${(mobileSelectedDate.getMonth()+1).toString().padStart(2, '0')}-${mobileSelectedDate.getDate().toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  // Parsear exactamente a la hora local para evitar saltos por UTC
                  const [y, m, d] = e.target.value.split('-');
                  const newLocal = new Date(Number(y), Number(m)-1, Number(d), 12, 0, 0);
                  setMobileSelectedDate(newLocal);
                }
              }}
            />
          </div>
          <button 
            onClick={() => {
              const hoy = new Date();
              if (hoy.getHours() > 19 || (hoy.getHours() === 19 && hoy.getMinutes() >= 15)) {
                hoy.setDate(hoy.getDate() + 1);
              }
              setMobileSelectedDate(new Date(hoy));
              setCarouselAnchor(new Date(hoy));
              setCurrentWeek(getMonday(hoy));
            }}
            className="pointer-events-auto bg-white/80 backdrop-blur-md border border-stone-200/50 text-stone-600 rounded-xl px-4 py-2.5 font-bold shadow-sm active:scale-95 transition-transform text-sm"
          >
            Hoy
          </button>
        </div>,
        mobileTopbarPortal
      )}

      {loading ? (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium">Cargando calendario...</p>
        </div>
      ) : (
        <>
        {/* DESKTOP CALENDAR VIEW */}
        <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-stone-100/50 border border-stone-100 overflow-x-auto relative">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid grid-cols-6 border-b border-stone-100 bg-stone-50/80">
              <div className="p-4 border-r border-stone-100 text-stone-400 font-bold text-xs uppercase tracking-widest text-center flex items-end justify-center">
                Hora
              </div>
              {days.map((day, i) => (
                <div key={i} className="p-4 border-r border-stone-100 text-center last:border-r-0">
                  <div className="text-[10px] uppercase tracking-widest text-[#d9777f] font-extrabold mb-1">
                    {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                  <div className="text-3xl font-extrabold text-stone-800 tracking-tighter">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid body */}
            <div className="relative bg-white" style={{ height: `${hours.length * 80}px` }}>
              {/* Horizontal line markers */}
              {hours.map((h, i) => (
                <div key={`hl-${h}`} className="absolute w-full border-t border-stone-300" style={{ top: `${i * 80}px`, height: '80px', pointerEvents: 'none' }}></div>
              ))}

              <div className="grid grid-cols-6 absolute top-0 w-full h-full">
                {/* Time Scale Column */}
                <div className="border-r border-stone-200 bg-stone-50/20 relative z-10 pointer-events-none">
                  {hours.map((h, i) => (
                    <div key={`h-${h}`} className="text-center text-[10px] font-bold text-stone-400" style={{ height: '80px', position: 'absolute', top: `${i * 80 - 6}px`, width: '100%' }}>
                      {h.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {days.map((day, dIdx) => {
                  const dayAppts = getAppointmentsForDay(day);
                  const dayBlocks = getBlocksForDay(day);
                  const closed = isDayClosed(day);
                  const closedReason = getDayClosedReason(day);
                  
                  return (
                    <div key={`col-${dIdx}`} className="border-r border-stone-200 relative last:border-r-0 group">
                      
                      {closed && (
                          <div className="absolute inset-0 z-[60] bg-stone-100/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center cursor-not-allowed border-[3px] border-stone-300 pointer-events-auto">
                             <Lock size={24} className="text-stone-400 mb-2" strokeWidth={1.5} />
                             <span className="text-stone-600 font-extrabold uppercase tracking-widest text-xs">{closedReason || 'CERRADO'}</span>
                          </div>
                      )}

                      {/* Clickable Empty Slots for Creation (15min Precision) */}
                      <div className="absolute inset-0 z-0">
                        {hours.map((h, i) => (
                           <div key={`h-container-${dIdx}-${h}`} className="absolute w-full" style={{ top: `${i * 80}px`, height: '80px' }}>
                              {[0, 15, 30, 45].map(m => {
                                const disabled = closed || isTimeDisabled(h, m);
                                const isLunch = isLunchTime(h, m);
                                return (
                                  <div
                                    key={`slot-${dIdx}-${h}-${m}`}
                                    onClick={() => {
                                      if (disabled) return;
                                      setSelectedSlot({ date: day, hour: h });
                                      setSelectedMinutes(m);
                                      setModalType('appointment');
                                      setShowModal(true);
                                    }}
                                    className={`w-full h-1/4 transition-all relative
                                      ${m !== 45 ? 'border-b border-dashed border-stone-200' : ''}
                                      ${disabled 
                                        ? 'bg-stone-50/60 cursor-not-allowed' 
                                        : 'hover:bg-[#fdf2f3]/50 cursor-pointer'
                                      }
                                    `}
                                    style={{
                                      backgroundImage: isLunch ? 'repeating-linear-gradient(45deg, #fafaf9, #fafaf9 5px, #f5f5f4 5px, #f5f5f4 10px)' : 'none'
                                    }}
                                  >
                                    {!disabled && (
                                      <span className="opacity-0 hover:opacity-100 text-[#d9777f] font-black text-[9px] absolute top-0.5 left-1 transition-opacity">+</span>
                                    )}
                                    {isLunch && m === 0 && (
                                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest leading-none">Descanso</span>
                                       </div>
                                    )}
                                  </div>
                                );
                              })}
                           </div>
                        ))}
                      </div>

                      {/* Render Time Blocks (Grey Striped) */}
                      {!closed && dayBlocks.map(block => {
                        let tS = block.start_time;
                        let tE = block.end_time;
                        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
                        if (tE.endsWith('Z')) tE = tE.slice(0, -1);
                        const start = new Date(tS);
                        const end = new Date(tE);
                        const top = ((start.getHours() - startHour) * 80) + (start.getMinutes() / 60) * 80;
                        const duration = (end.getTime() - start.getTime()) / 60000;
                        const height = (duration / 60) * 80;
                        const isFullDay = duration >= 600;

                        return (
                          <div 
                            key={block.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); setShowBlockDeleteModal(true); }}
                            className={`absolute w-[94%] left-[3%] rounded-lg border-2 z-10 cursor-pointer hover:border-stone-400 transition-all flex items-center justify-center overflow-hidden ${isFullDay ? 'border-stone-800 border-[3px]' : 'border-stone-200'}`}
                            style={{ 
                              top: `${top}px`, 
                              height: `${height}px`,
                              backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4, #f5f5f4 10px, #eeeeee 10px, #eeeeee 20px)'
                            }}
                          >
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter opacity-60 text-center px-1">
                              {block.reason || 'HORARIO BLOQUEADO'}
                            </span>
                          </div>
                        );
                      })}

                      {/* Render Booked Appointments */}
                      {!closed && dayAppts.map(appt => {
                        let tStringStart = appt.start_time;
                        let tStringEnd = appt.end_time;
                        if (tStringStart.endsWith('Z')) tStringStart = tStringStart.slice(0, -1);
                        if (tStringEnd.endsWith('Z')) tStringEnd = tStringEnd.slice(0, -1);

                        const start = new Date(tStringStart);
                        const end = new Date(tStringEnd);
                        
                        const apptStartHour = start.getHours();
                        const apptStartMin = start.getMinutes();
                        
                        const durationMs = end.getTime() - start.getTime();
                        let durationMin = durationMs / 60000;
                        if (durationMin < 5 || isNaN(durationMin)) durationMin = 30; // Min height safeguard

                        // Safeguard clamp for top boundary
                        let topOffset = ((apptStartHour - startHour) * 80) + (apptStartMin / 60) * 80;
                        if (topOffset < 0) topOffset = 0; 
                        
                        const heightPx = Math.max((durationMin / 60) * 80, 30); // at least 30px so text is visibly readable
                        
                        const client = clientMap.get(appt.client_id) || { name: 'Cliente Desconocido' };
                        const service = serviceMap.get(appt.service_id) || { name: 'Servicio Borrado...', duration_minutes: durationMin };
                        const colors = getStatusColors(appt.status);

                        return (
                          <div 
                            key={appt.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); setShowEditModal(true); setConfirmDelete(false); }}
                            onMouseEnter={(e) => {
                              setHoveredAppt(appt);
                              setTooltipPos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseMove={(e) => {
                              setTooltipPos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseLeave={() => setHoveredAppt(null)}
                            className={`absolute w-[92%] left-[4%] ml-auto mr-auto border-l-[4px] rounded-r-lg shadow-sm px-2 py-1 z-20 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-start ${colors}`}
                            style={{ top: `${topOffset}px`, height: `${heightPx}px` }}
                          >
                            <div className={`font-extrabold text-[10px] sm:text-xs truncate leading-tight mb-0.5 ${appt.status === 'cancelled' || appt.status === 'no_show' ? 'text-current line-through' : 'text-stone-800'}`}>
                              {appt.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
                              {client.name}
                            </div>
                            {heightPx >= 36 && (
                              <div className={`text-[9px] font-semibold truncate leading-tight ${appt.status === 'completed' ? 'text-emerald-700' : (appt.status === 'pending' ? 'text-[#b35e65]' : 'text-current opacity-80')}`}>{service.name}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE CALENDAR VIEW (Booksy Style) - Extended to reach footer exactly */}
        <div className="block md:hidden border-x border-t border-stone-100 rounded-t-[2.5rem] overflow-hidden bg-white shadow-xl shadow-stone-100/50 flex flex-col -mx-4 -mb-28" style={{ height: 'calc(100dvh - 6rem)', minHeight: '550px' }}>
          {/* Sticky Header with Horizontal scroll for Days */}
          <div className="bg-white z-20 border-b border-stone-100 shadow-sm shrink-0">
            <div ref={mobileDaysContainerRef} className="flex items-center overflow-x-auto p-4 gap-4 custom-scrollbar snap-x relative scroll-smooth">
              {mobileDays.map((md, idx) => {
                const isSelected = md.getDate() === mobileSelectedDate.getDate() && md.getMonth() === mobileSelectedDate.getMonth();
                const isToday = md.getDate() === (new Date()).getDate() && md.getMonth() === (new Date()).getMonth();
                return (
                  <button 
                    key={`md-${idx}`}
                    ref={isSelected ? activeDayRef : null}
                    onClick={() => setMobileSelectedDate(md)}
                    className="flex flex-col items-center justify-center shrink-0 snap-center min-w-[3rem]"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isSelected ? 'text-[#d9777f]' : 'text-stone-400'}`}>
                      {md.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold transition-all border
                      ${isSelected ? 'bg-[#fdf2f3] text-[#d9777f] border-[#f3c7cb] scale-110 shadow-sm relative' : 'bg-transparent text-stone-600 border-transparent hover:bg-stone-50'}
                      ${isToday && !isSelected ? 'border-stone-200 bg-stone-50' : ''}
                    `}>
                      {md.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Hours & Appointments Column (Internal Scroll Enabled, Exact limits) */}
          <div className="flex-1 overflow-y-auto relative bg-white custom-scrollbar pb-10">
            <div className="relative w-full" style={{ height: `${hours.length * 72 + 36}px` }}>
              {/* Horizontal line markers */}
              {hours.map((h, i) => (
                <div key={`mhl-${h}`} className="absolute w-full border-t border-stone-300" style={{ top: `${i * 72}px`, height: '72px', pointerEvents: 'none' }}></div>
              ))}
              
              <div className="flex flex-row absolute top-0 w-full h-full">
                {/* Scale column */}
                <div className="w-[50px] shrink-0 border-r border-stone-200 bg-white relative pointer-events-none">
                  {hours.map((h, i) => (
                    <div key={`mh-${h}`} className="text-right pr-2 text-[10px] font-bold text-stone-400 z-30" style={{ height: '72px', position: 'absolute', top: `${i * 72 - 6}px`, width: '100%' }}>
                      {h.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Day Area */}
                <div className="flex-1 relative group">
                  {(() => {
                    const closed = isDayClosed(mobileSelectedDate);
                    const closedReason = getDayClosedReason(mobileSelectedDate);
                    
                    return (
                      <>
                        {closed && (
                          <div className="absolute inset-0 z-[60] bg-stone-100/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center cursor-not-allowed border-[3px] border-stone-300 pointer-events-auto">
                            <Lock size={32} className="text-stone-400 mb-3" strokeWidth={1.5} />
                            <span className="text-stone-600 font-extrabold uppercase tracking-widest text-sm">{closedReason || 'CERRADO'}</span>
                          </div>
                        )}
                        
                        {/* Empty Clickable Slots (15min Precision) */}
                        <div className="absolute inset-0 z-0">
                          {hours.map((h, i) => (
                             <div key={`mh-container-${h}`} className="absolute w-full" style={{ top: `${i * 72}px`, height: '72px' }}>
                               {[0, 15, 30, 45].map(m => {
                                  const disabled = closed || isTimeDisabled(h, m);
                                  const isLunch = isLunchTime(h, m);
                                  return (
                                    <div
                                      key={`mslot-${h}-${m}`}
                                      onClick={() => {
                                        if (disabled) return;
                                        setSelectedSlot({ date: mobileSelectedDate, hour: h });
                                        setSelectedMinutes(m);
                                        setModalType('appointment');
                                        setShowModal(true);
                                      }}
                                      className={`w-full h-1/4 transition-all relative
                                        ${m !== 45 ? 'border-b border-dashed border-stone-200' : ''}
                                        ${disabled 
                                          ? 'bg-stone-50/60 cursor-not-allowed' 
                                          : 'active:bg-[#fdf2f3] cursor-pointer'
                                        }
                                      `}
                                      style={{
                                        backgroundImage: isLunch ? 'repeating-linear-gradient(45deg, #fafaf9, #fafaf9 5px, #f5f5f4 5px, #f5f5f4 10px)' : 'none'
                                      }}
                                    >
                                      {isLunch && m === 15 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <span className="text-[8px] uppercase tracking-widest font-extrabold text-stone-300 leading-none">Cerrado / Lunch</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                               })}
                             </div>
                          ))}
                        </div>

                        {/* Blocks */}
                        {!closed && getBlocksForDay(mobileSelectedDate).map((block) => {
                          const start = new Date(block.start_time.endsWith('Z') ? block.start_time.slice(0, -1) : block.start_time);
                    const end = new Date(block.end_time.endsWith('Z') ? block.end_time.slice(0, -1) : block.end_time);
                    
                          const apptStartHour = start.getHours();
                          const apptStartMin = start.getMinutes();
                          
                          let durationMin = (end.getTime() - start.getTime()) / 60000;
                          if (durationMin < 5 || isNaN(durationMin)) durationMin = 60;

                          let topOffsetPx = ((apptStartHour - startHour) * 72) + (apptStartMin / 60) * 72;
                          if (topOffsetPx < 0) topOffsetPx = 0; 
                          
                          const heightPx = Math.max((durationMin / 60) * 72, 20);

                          return (
                            <div 
                              key={block.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); setShowBlockDeleteModal(true); }}
                              className="absolute w-[95%] left-[2.5%] ml-auto mr-auto bg-stone-100 rounded-xl border border-stone-200 border-dashed opacity-80 flex items-center justify-center z-10 hover:bg-stone-200 transition-colors cursor-pointer block-content overflow-hidden"
                              style={{ 
                                top: `${topOffsetPx}px`, 
                                height: `${heightPx}px`,
                                backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4, #f5f5f4 10px, #eeeeee 10px, #eeeeee 20px)'
                              }}
                            >
                              <div className="flex items-center gap-1.5 text-stone-500">
                                <Lock size={12} strokeWidth={2.5} />
                                {heightPx >= 30 && <span className="text-[10px] font-bold uppercase tracking-wider text-center">{block.reason || 'Bloqueo'}</span>}
                              </div>
                            </div>
                          );
                        })}

                        {/* Appointments */}
                        {!closed && getAppointmentsForDay(mobileSelectedDate).map((appt) => {
                          const start = new Date(appt.start_time.endsWith('Z') ? appt.start_time.slice(0,-1) : appt.start_time);
                          const end = new Date(appt.end_time.endsWith('Z') ? appt.end_time.slice(0,-1) : appt.end_time);
                          
                          const apptStartHour = start.getHours();
                          const apptStartMin = start.getMinutes();
                          
                          let durationMin = (end.getTime() - start.getTime()) / 60000;
                          if (durationMin < 5 || isNaN(durationMin)) durationMin = 30; // Min height safeguard

                          let topOffsetPx = ((apptStartHour - startHour) * 72) + (apptStartMin / 60) * 72;
                          if (topOffsetPx < 0) topOffsetPx = 0; 
                          
                          const heightPx = Math.max((durationMin / 60) * 72, 35);
                          
                          const client = clientMap.get(appt.client_id) || { name: 'Desconocido' };
                          const service = serviceMap.get(appt.service_id) || { name: '...' };
                          const colors = getStatusColors(appt.status);

                    return (
                      <div 
                        key={appt.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); setShowEditModal(true); setConfirmDelete(false); }}
                        className={`absolute w-[95%] left-[2.5%] ml-auto mr-auto border-[1.5px] rounded-xl shadow-sm px-3 py-2 z-20 overflow-hidden active:scale-[0.98] transition-all flex flex-col justify-start ${colors}`}
                        style={{ top: `${topOffsetPx}px`, height: `${heightPx}px` }}
                      >
                        <div className={`font-extrabold text-[11px] sm:text-xs tracking-tight leading-none mb-[2px] ${appt.status === 'cancelled' || appt.status === 'no_show' ? 'text-current line-through opacity-70' : 'text-stone-800'}`}>
                          {appt.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
                          {client.name}
                        </div>
                        {heightPx >= 45 && (
                          <div className={`text-[9px] font-semibold truncate leading-tight opacity-90`}>{service.name}</div>
                        )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* STEP 2: TOOLTIP HOVER (Conditional Render) */}
      {hoveredAppt && (
        <div 
          className="fixed z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: tooltipPos.x + 15 > (typeof window !== 'undefined' ? window.innerWidth : 1200) - 280 ? tooltipPos.x - 295 : tooltipPos.x + 15, 
            top: tooltipPos.y + 200 > (typeof window !== 'undefined' ? window.innerHeight : 800) ? tooltipPos.y - 210 : tooltipPos.y + 15
          }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-stone-100 shadow-2xl rounded-2xl p-5 w-[280px] ring-1 ring-black/5 relative">
            {/* Hora en la esquina superior derecha */}
            <div className="absolute top-4 right-5 bg-[#fdf2f3] text-[#d9777f] px-2 py-0.5 rounded-md text-[11px] font-black tracking-tighter">
              {new Date(hoveredAppt.start_time.endsWith('Z') ? hoveredAppt.start_time.slice(0, -1) : hoveredAppt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Cliente</p>
                <p className="font-extrabold text-stone-800 text-[15px] truncate pr-16">{clientMap.get(hoveredAppt.client_id)?.name || 'Desconocido'}</p>
              </div>
              
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Servicio / Tratamiento</p>
                <p className="font-bold text-[#d9777f] text-[12px] leading-tight">{serviceMap.get(hoveredAppt.service_id)?.name || 'Borrador...'}</p>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-100 mt-1">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Estado</p>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight
                  ${hoveredAppt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    hoveredAppt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                    hoveredAppt.status === 'web_pending' ? 'bg-orange-100 text-orange-700' :
                    hoveredAppt.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f]' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {hoveredAppt.status === 'completed' ? 'Realizada' : 
                   hoveredAppt.status === 'cancelled' ? 'Cancelada' : 
                   hoveredAppt.status === 'web_pending' ? 'Pte. Confirmar' :
                   hoveredAppt.status === 'confirmed' ? 'Confirmada' :
                   hoveredAppt.status === 'no_show' ? 'No Asisti├│' :
                   'Pendiente'}
                </span>
              </div>

              <div className="mt-1">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Notas</p>
                <p className="text-[11px] text-stone-500 italic leading-snug line-clamp-3">
                  {hoveredAppt.notes || 'Sin observaciones...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="p-0 border-none w-[95vw] sm:max-w-lg h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
          <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <div className="flex gap-4 mb-4 p-1 bg-stone-100 rounded-2xl w-fit">
              <button 
                onClick={() => setModalType('appointment')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'appointment' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Nueva Cita
              </button>
              <button 
                onClick={() => setModalType('block')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'block' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Bloqueo
              </button>
            </div>
            <DialogTitle className="text-2xl font-extrabold text-stone-800">
              {modalType === 'appointment' ? 'Asignar Cita' : 'Bloquear Horario'}
            </DialogTitle>
            <DialogDescription className="text-[#d9777f] font-bold flex items-center gap-2 mt-1">
              <Calendar size={16} strokeWidth={1.5} /> {selectedSlot && `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')} h`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {modalType === 'appointment' ? (
              <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-2 mb-2 p-1 bg-stone-50 border border-stone-100 rounded-xl w-fit mx-auto sm:mx-0">
                   {(selectedSlot?.hour === startHour ? [30, 45] : [0, 15, 30, 45]).map(m => (
                      <button 
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinutes(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMinutes === m ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                         :{m.toString().padStart(2, '0')}
                      </button>
                   ))}
                </div>

                {(() => {
                  if (!selectedSlot) return null;
                  const start_time = new Date(selectedSlot.date);
                  start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
                  const closingTime = new Date(selectedSlot.date);
                  closingTime.setHours(endHour, settings?.close_time ? parseInt(settings.close_time.split(':')[1]) : 30, 0, 0); // Ej: 19:30
                  
                  // Filter lunch blocks logically out of available gaps to stop weird calculations
                  let lunchStart = closingTime;
                  if (settings?.lunch_start) {
                    lunchStart = new Date(selectedSlot.date);
                    lunchStart.setHours(parseInt(settings.lunch_start.split(':')[0]), parseInt(settings.lunch_start.split(':')[1]), 0, 0);
                  }

                  const dayAppts = getAppointmentsForDay(selectedSlot.date);
                  const dayBlocks = getBlocksForDay(selectedSlot.date);
                  
                  const futureEvents = [...dayAppts, ...dayBlocks]
                    .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                    .filter(e => e.start > start_time)
                    .sort((a, b) => a.start.getTime() - b.start.getTime());
                  
                  let nextEventStart = futureEvents.length > 0 ? futureEvents[0].start : closingTime;
                  // Si cae en horario de ma├▒ana y el pr├│ximo bloque es despu├®s de lunch, lunch limita la duraci├│n.
                  if (start_time < lunchStart && nextEventStart > lunchStart) {
                    nextEventStart = lunchStart;
                  }

                  const limitDate = nextEventStart < closingTime ? nextEventStart : closingTime;
                  const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);
                  
                  return (
                    <div className="mb-4">
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Hueco Disponible</p>
                       <p className="text-xs font-bold text-stone-600 flex items-center gap-1">
                          <Clock size={14} strokeWidth={1.5} /> {gapMinutes} minutos libres
                       </p>
                    </div>
                  );
                })()}
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Cliente *</label>
                    <Select required value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Elige un cliente --" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients
                          .filter(c => c.email !== 'contado@clinica-mercedes.com')
                          .map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Tratamiento *</label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- Selecciona el servicio --" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          if (!selectedSlot) return null;
                          const start_time = new Date(selectedSlot.date);
                          start_time.setHours(selectedSlot.hour, selectedMinutes, 0, 0);
                          const closingTime = new Date(selectedSlot.date);
                          closingTime.setHours(19, 0, 0, 0);
                          const nextEvent = [...getAppointmentsForDay(selectedSlot.date), ...getBlocksForDay(selectedSlot.date)]
                            .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                            .filter(e => e.start > start_time)
                            .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                          const limitDate = nextEvent ? (nextEvent.start < closingTime ? nextEvent.start : closingTime) : closingTime;
                          const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);
                          return services.map(s => (
                            <SelectItem key={s.id} value={s.id} disabled={s.duration_minutes > gapMinutes}>
                              {s.name} ({s.duration_minutes} min) {s.duration_minutes > gapMinutes ? 'ÔÜá´©Å EXCEDIDO' : ''}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Notas</label>
                    <textarea 
                      value={appointmentNotes} 
                      onChange={e => setAppointmentNotes(e.target.value)} 
                      placeholder="Observaciones de la cita..."
                       className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[100px] resize-none text-sm"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <form id="block-form" onSubmit={handleBlockSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Motivo</label>
                  <input 
                    type="text" 
                    value={blockReason} 
                    onChange={e => setBlockReason(e.target.value)} 
                    placeholder="Ej: Descanso, Formaci├│n..."
                    className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none bg-stone-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Duraci├│n</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 120, 240, -1].map(mins => (
                      <button 
                        key={mins}
                        type="button"
                        onClick={() => setBlockDuration(mins)}
                        className={`py-3 rounded-xl font-bold text-[10px] transition-all border-2 ${blockDuration === mins ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'}`}
                      >
                        {mins === -1 ? 'D├¡a Completo' : (mins >= 60 ? `${mins/60}h` : `${mins}min`)}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-row gap-3 rounded-b-xl z-20 pointer-events-none">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 shadow-sm transition-all pointer-events-auto">
              Cancelar
            </button>
            <button 
              form={modalType === 'appointment' ? 'appointment-form' : 'block-form'}
              disabled={saving} 
              type="submit" 
              className={`flex-1 ${modalType === 'appointment' ? 'bg-stone-900 border-stone-900' : 'bg-stone-800 border-stone-800'} text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10 border pointer-events-auto`}
            >
              {saving ? 'Guardando...' : (modalType === 'appointment' ? 'Agendar' : 'Bloquear')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STEP 4: BLOCK DELETE MODAL */}
      <Dialog open={showBlockDeleteModal} onOpenChange={setShowBlockDeleteModal}>
        <DialogContent className="flex flex-col w-[95vw] sm:max-w-xs max-h-[85dvh] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-xl">
          <div className="flex-1 overflow-y-auto p-8 text-center">
             <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4"><Unlock size={32} strokeWidth={1.5} /></div>
             <h3 className="text-xl font-extrabold text-stone-800 mb-2">Liberar Horario</h3>
             <p className="text-stone-500 text-sm">┬┐Deseas eliminar este bloqueo y permitir nuevas citas en este hueco?</p>
          </div>
          <DialogFooter className="shrink-0 p-6 pt-2 flex flex-col gap-2 sm:flex-col border-t-0">
            <button 
              onClick={handleDeleteBlock}
              disabled={updatingStatus}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
            >
              {updatingStatus ? 'Liberando...' : 'S├¡, Eliminar Bloqueo'}
            </button>
            <button 
              onClick={() => setShowBlockDeleteModal(false)}
              className="w-full bg-stone-50 text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="p-0 border-none w-[95vw] sm:max-w-md h-fit max-h-[100dvh] sm:max-h-[calc(100vh-2rem)] rounded-xl">
          <DialogHeader className="sticky top-0 z-30 shrink-0 p-8 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Cita Confirmada</p>
                <DialogTitle className="text-2xl font-serif italic font-black text-stone-800">
                  {selectedAppt ? clientMap.get(selectedAppt.client_id)?.name : 'Detalle Cita'}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Tratamiento</p>
              <div className="flex items-center gap-3 p-4 bg-[#fdf2f3] rounded-2xl border border-[#f3c7cb] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <Sparkles size={20} strokeWidth={1.5} className="text-[#d9777f] relative z-10" />
                <p className="text-lg font-bold text-stone-800 relative z-10">
                  {selectedAppt ? serviceMap.get(selectedAppt.service_id)?.name : '...'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Notas del Tratamiento</label>
              <textarea 
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
                className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[100px] resize-none text-sm placeholder:italic shadow-inner"
                placeholder="A├▒adir notas del tratamiento..."
              />
              {selectedAppt && editNotes !== (selectedAppt.notes || '') && (
                <button 
                  onClick={() => handleUpdateNotes()}
                  disabled={updatingStatus}
                  className="mt-3 w-full bg-stone-800 text-white text-xs font-bold uppercase py-3 rounded-xl hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} /> Guardar Cambios en Nota
                </button>
              )}
            </div>

            {selectedAppt?.status === 'web_pending' && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                  <AlertTriangle size={12} /> Reserva pendiente de confirmar
                </p>
                <button 
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={updatingStatus}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirmar Ahora
                </button>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Acciones R├ípidas</p>
              
              <button 
                onClick={() => {
                  if (selectedAppt) {
                    const client = clientMap.get(selectedAppt.client_id);
                    const service = serviceMap.get(selectedAppt.service_id);
                    if (client && service) openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
                  }
                }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 outline-none"
              >
                <Phone size={18} strokeWidth={1.5} /> WhatsApp Cliente
              </button>

              <div className="space-y-3 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Cambiar Estado</p>
                <Select
                  value={selectedAppt?.status}
                  onValueChange={(val) => handleStatusChange(val)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className={`w-full h-14 rounded-2xl font-bold border-2 transition-all
                    ${selectedAppt?.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' :
                      selectedAppt?.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-500' :
                      selectedAppt?.status === 'no_show' ? 'bg-stone-100 text-stone-600 border-stone-400' :
                      selectedAppt?.status === 'web_pending' ? 'bg-orange-50 text-orange-700 border-orange-400' :
                      selectedAppt?.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f] border-[#d9777f]' :
                      'bg-stone-50 text-stone-600 border-transparent'}
                  `}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="pending">ÔÅ│ Pendiente</SelectItem>
                    <SelectItem value="confirmed">Ô£¿ Confirmada</SelectItem>
                    <SelectItem value="completed">Ô£à Realizada</SelectItem>
                    <SelectItem value="no_show">No Asisti├│</SelectItem>
                    <SelectItem value="cancelled">ÔØî Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-xl z-20 pointer-events-none">
            <button 
              onClick={handleDeleteAppointment} 
              disabled={updatingStatus} 
              className="text-[10px] font-black text-stone-300 hover:text-rose-500 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group p-2 mx-auto pointer-events-auto"
            >
              <Trash2 size={14} strokeWidth={2} className="group-hover:scale-110 transition-transform" /> 
              Eliminar Permanentemente
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="text-center py-32"><div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div><p className="text-stone-500 font-medium">Cargando calendario...</p></div>}>
      <CalendarContent />
    </Suspense>
  );
}
