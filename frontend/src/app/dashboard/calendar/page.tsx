"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

function CalendarContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('client_id');
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, clientRes, srvRes, blockRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/`)
      ]);
      
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
      if (srvRes.ok) {
        const servs = await srvRes.json();
        setServices(servs.filter((s:any) => s.is_active));
      }
      if (blockRes.ok) setTimeBlocks(await blockRes.json());
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
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const message = `Hola ${clientName}, soy Merce de Merce Estética. Te confirmo tu cita de ${serviceName} para el día ${dateStr} a las ${timeStr}. ¡Te espero!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${encoded}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent, shouldNotify: boolean = false) => {
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
        const newAppt = await res.json();
        await fetchData();
        setShowModal(false);
        
        if (shouldNotify) {
          const client = clients.find(c => c.id === selectedClientId);
          if (client && client.phone) {
            openWhatsApp(client.name, client.phone, service.name, startISO);
          }
        }

        setSelectedClientId('');
        setSelectedServiceId('');
        setAppointmentNotes('');
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Error reservando la cita");
      }
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
        const updatedAppt = await res.json();
        await fetchData();
        setShowEditModal(false);

        // If it was confirmed from web_pending, open WhatsApp
        if (selectedAppt.status === 'web_pending' && newStatus === 'confirmed') {
          const client = clientMap.get(selectedAppt.client_id);
          const service = serviceMap.get(selectedAppt.service_id);
          if (client && client.phone && service) {
            openWhatsApp(client.name, client.phone, service.name, selectedAppt.start_time);
          }
        }
      } else {
        alert("Error actualizando estado.");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        alert("Error guardando nota.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSaving(true);
    const start_time = new Date(selectedSlot.date);
    
    // Si es día completo (sentinel value -1), forzamos 09:00 a 19:00
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
      }
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
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppt) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/${selectedAppt.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        setShowEditModal(false);
        setConfirmDelete(false);
      } else {
        alert("Error eliminando cita.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 09:00 to 19:00 (19:00 is the end line)

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
      return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Agenda Activa</h1>
          <p className="text-stone-500 mt-1 font-medium">Gestión de reservas y tiempos semanales</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }}
            className="px-5 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors">
            &larr; Ant
          </button>
          <button 
            onClick={() => setCurrentWeek(getMonday(new Date()))}
            className="px-5 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors">
            Hoy
          </button>
          <button 
            onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
            className="px-5 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold shadow-sm hover:bg-[#fdf2f3] hover:text-[#d9777f] hover:border-[#f3c7cb] transition-colors">
            Sig &rarr;
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-32">
          <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
          <p className="text-stone-500 font-medium">Cargando calendario...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-100/50 border border-stone-100 overflow-x-auto relative">
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
                <div key={`hl-${h}`} className="absolute w-full border-t border-stone-50" style={{ top: `${i * 80}px`, height: '80px', pointerEvents: 'none' }}></div>
              ))}

              <div className="grid grid-cols-6 absolute top-0 w-full h-full">
                {/* Time Scale Column */}
                <div className="border-r border-stone-100 bg-stone-50/20 relative z-10 pointer-events-none">
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
                  
                  return (
                    <div key={`col-${dIdx}`} className="border-r border-stone-100 relative last:border-r-0 group">
                      
                      {/* Clickable Empty Slots for Creation */}
                      {hours.map((h, i) => {
                        const isLunch = h === 14 || h === 15;
                        return (
                          <div 
                            key={`slot-${dIdx}-${h}`} 
                            onClick={() => { 
                              if (isLunch) return;
                              setSelectedSlot({ date: day, hour: h }); 
                              setSelectedMinutes(h === 9 ? 30 : 0); 
                              setModalType('appointment'); 
                              setShowModal(true); 
                            }}
                            className={`absolute w-full border-b border-transparent transition-all z-0 ${
                              isLunch 
                              ? 'bg-stone-50 cursor-not-allowed flex items-center justify-center' 
                              : 'hover:bg-gradient-to-b hover:from-white hover:to-[#fdf2f3] cursor-pointer hover:border-stone-100'
                            }`}
                            style={{ 
                              top: `${i * 80}px`, 
                              height: '80px',
                              backgroundImage: isLunch ? 'repeating-linear-gradient(45deg, #fafaf9, #fafaf9 10px, #f5f5f4 10px, #f5f5f4 20px)' : 'none'
                            }}>
                            {isLunch ? (
                              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest text-center select-none">
                                CERRADO
                              </span>
                            ) : (
                              <span className="opacity-0 group-hover:opacity-100 text-[#d9777f] font-bold text-xs absolute top-2 left-2 transition-opacity">+</span>
                            )}
                            
                            {/* Visual Block for Morning Start (09:00-09:30) */}
                            {h === 9 && (
                               <div 
                                 className="absolute top-0 w-full h-[40px] pointer-events-none"
                                 style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fafaf9, #fafaf9 10px, #f5f5f4 10px, #f5f5f4 20px)' }}
                               >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[9px] font-bold text-stone-300 uppercase tracking-tighter opacity-50">CERRADO</span>
                                  </div>
                               </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Render Time Blocks (Grey Striped) */}
                      {dayBlocks.map(block => {
                        let tS = block.start_time;
                        let tE = block.end_time;
                        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
                        if (tE.endsWith('Z')) tE = tE.slice(0, -1);
                        const start = new Date(tS);
                        const end = new Date(tE);
                        const top = ((start.getHours() - 9) * 80) + (start.getMinutes() / 60) * 80;
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
                      {dayAppts.map(appt => {
                        let tStringStart = appt.start_time;
                        let tStringEnd = appt.end_time;
                        if (tStringStart.endsWith('Z')) tStringStart = tStringStart.slice(0, -1);
                        if (tStringEnd.endsWith('Z')) tStringEnd = tStringEnd.slice(0, -1);

                        const start = new Date(tStringStart);
                        const end = new Date(tStringEnd);
                        
                        const startHour = start.getHours();
                        const startMin = start.getMinutes();
                        
                        const durationMs = end.getTime() - start.getTime();
                        let durationMin = durationMs / 60000;
                        if (durationMin < 5 || isNaN(durationMin)) durationMin = 30; // Min height safeguard

                        // Safeguard clamp for top boundary
                        let topOffset = ((startHour - 9) * 80) + (startMin / 60) * 80;
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
      )}

      {/* STEP 2: TOOLTIP HOVER (Conditional Render) */}
      {hoveredAppt && (
        <div 
          className="fixed z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: tooltipPos.x + 15 > window.innerWidth - 220 ? tooltipPos.x - 220 : tooltipPos.x + 15, 
            top: tooltipPos.y + 15
          }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-stone-100 shadow-2xl rounded-2xl p-4 w-[220px] ring-1 ring-black/5">
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Cliente</p>
                <p className="font-extrabold text-stone-800 text-sm truncate">{clientMap.get(hoveredAppt.client_id)?.name || 'Desconocido'}</p>
              </div>
              
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Servicio</p>
                <p className="font-bold text-[#d9777f] text-[11px] truncate">{serviceMap.get(hoveredAppt.service_id)?.name || 'Borrador...'}</p>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100 mt-1">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Estado</p>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase
                  ${hoveredAppt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                    hoveredAppt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                    hoveredAppt.status === 'web_pending' ? 'bg-orange-100 text-orange-700' :
                    hoveredAppt.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f]' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {hoveredAppt.status === 'completed' ? 'Realizada' : 
                   hoveredAppt.status === 'cancelled' ? 'Cancelada' : 
                   hoveredAppt.status === 'web_pending' ? 'Pendiente Confirmación' :
                   hoveredAppt.status === 'confirmed' ? 'Confirmada' :
                   hoveredAppt.status === 'no_show' ? 'No Asistió' :
                   'Pendiente'}
                </span>
              </div>

              <div className="mt-1">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Notas</p>
                <p className="text-[10px] text-stone-500 italic leading-snug line-clamp-2">
                  {hoveredAppt.notes || 'Sin observaciones...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors">✕</button>
            <div className="flex gap-4 mb-6 p-1 bg-stone-100 rounded-2xl w-fit">
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

            {modalType === 'appointment' ? (
              <>
                <h2 className="text-2xl font-extrabold text-stone-800 mb-2">Asignar Cita</h2>
                <p className="text-[#d9777f] font-bold mb-3 flex items-center gap-2">
                  📅 {selectedSlot && `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')} h`}
                </p>
                
                {/* Selector de Minutos Manual para precisión */}
                <div className="flex gap-2 mb-6 p-1 bg-stone-50 border border-stone-100 rounded-xl w-fit">
                   {(selectedSlot?.hour === 9 ? [30, 45] : [0, 15, 30, 45]).map(m => (
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
                  
                  // Calculate Gap: Close at 19:00 or next appointment
                  const closingTime = new Date(selectedSlot.date);
                  closingTime.setHours(19, 0, 0, 0);

                  const dayAppts = getAppointmentsForDay(selectedSlot.date);
                  const dayBlocks = getBlocksForDay(selectedSlot.date);

                  const nextEvent = [...dayAppts, ...dayBlocks]
                    .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                    .filter(e => e.start > start_time)
                    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

                  const limitDate = nextEvent ? (nextEvent.start < closingTime ? nextEvent.start : closingTime) : closingTime;
                  const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);

                  const availableServices = services.filter(s => s.duration_minutes <= gapMinutes);

                  return (
                    <div className="mb-4">
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Hueco Disponible</p>
                       <p className="text-xs font-bold text-stone-600 flex items-center gap-1">
                          ⏱ {gapMinutes} minutos libres {nextEvent && `(hasta la siguiente cita)`}
                       </p>
                       {availableServices.length === 0 && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-bold">
                             ⚠️ No hay tratamientos que quepan en este hueco. Libera espacio o elige otra hora.
                          </div>
                       )}
                    </div>
                  );
                })()}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Cliente *</label>
                    <select required value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 shadow-inner appearance-none">
                      <option value="">-- Elige un cliente --</option>
                      {clients
                        .filter(c => c.email !== 'contado@clinica-mercedes.com')
                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Tratamiento a realizar *</label>
                    <select required value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 shadow-inner appearance-none">
                      <option value="">-- Selecciona el servicio --</option>
                      {(() => {
                        const start_time = new Date(selectedSlot!.date);
                        start_time.setHours(selectedSlot!.hour, selectedMinutes, 0, 0);
                        const closingTime = new Date(selectedSlot!.date);
                        closingTime.setHours(19, 0, 0, 0);
                        const dayAppts = getAppointmentsForDay(selectedSlot!.date);
                        const dayBlocks = getBlocksForDay(selectedSlot!.date);
                        const nextEvent = [...dayAppts, ...dayBlocks]
                          .map(e => ({ ...e, start: new Date(e.start_time.endsWith('Z') ? e.start_time.slice(0, -1) : e.start_time) }))
                          .filter(e => e.start > start_time)
                          .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                        const limitDate = nextEvent ? (nextEvent.start < closingTime ? nextEvent.start : closingTime) : closingTime;
                        const gapMinutes = Math.floor((limitDate.getTime() - start_time.getTime()) / 60000);
                        
                        return services.map(s => (
                          <option key={s.id} value={s.id} disabled={s.duration_minutes > gapMinutes}>
                            {s.name} ({s.duration_minutes} min) {s.duration_minutes > gapMinutes ? '⚠️ EXCEDIDO' : ''}
                          </option>
                        ));
                      })()}
                    </select>
                    {selectedServiceId && (
                      <div className="mt-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
                          <span className="text-yellow-600 font-bold text-lg leading-none">⏱</span> 
                          La agenda se bloqueará automáticamente durante {serviceMap.get(selectedServiceId)?.duration_minutes} minutos.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Notas / Observaciones</label>
                    <textarea 
                      value={appointmentNotes} 
                      onChange={e => setAppointmentNotes(e.target.value)} 
                      placeholder="Ej: El cliente prefiere zona tranquila, alergia a X..."
                      className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 shadow-inner min-h-[100px] resize-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-stone-100">
                    <div className="flex gap-3">
                      <button 
                        disabled={saving} 
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
                      >
                        {saving ? 'Registrando...' : '✓ Guardar y Notificar'}
                      </button>
                      <button 
                        disabled={saving} 
                        type="submit" 
                        className="flex-1 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10"
                      >
                        {saving ? 'Registrando...' : 'Solo Guardar'}
                      </button>
                    </div>
                    <button type="button" onClick={() => setShowModal(false)} className="w-full py-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all active:scale-95">
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-stone-800 mb-2">Bloquear Horario</h2>
                <p className="text-stone-500 font-bold mb-6 flex items-center gap-2">
                  🔒 {selectedSlot && `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:00 h`}
                </p>

                <form onSubmit={handleBlockSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Motivo del Bloqueo</label>
                    <input 
                      type="text" 
                      value={blockReason} 
                      onChange={e => setBlockReason(e.target.value)} 
                      placeholder="Ej: Formación personal, Descanso, Cita externa..."
                      className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none bg-stone-50 shadow-inner"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Duración del Bloqueo (minutos)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[30, 60, 120, 240, -1].map(mins => (
                        <button 
                          key={mins}
                          type="button"
                          onClick={() => setBlockDuration(mins)}
                          className={`py-3 rounded-xl font-bold text-[10px] transition-all border-2 ${blockDuration === mins ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-300'}`}
                        >
                          {mins === -1 ? 'Día Completo' : (mins >= 60 ? `${mins/60}h` : `${mins}min`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-4 border-t border-stone-100">
                    <button disabled={saving} type="submit" className="flex-1 bg-stone-800 hover:bg-black text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10">
                      {saving ? 'Bloqueando...' : 'Establecer Bloqueo'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all active:scale-95">
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: BLOCK DELETE MODAL */}
      {showBlockDeleteModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowBlockDeleteModal(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔓</div>
             <h3 className="text-xl font-extrabold text-stone-800 mb-2">Liberar Horario</h3>
             <p className="text-stone-500 text-sm mb-8">¿Deseas eliminar este bloqueo y permitir nuevas citas en este hueco?</p>
             <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDeleteBlock}
                  disabled={updatingStatus}
                  className="bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
                >
                  {updatingStatus ? 'Liberando...' : 'Sí, Eliminar Bloqueo'}
                </button>
                <button 
                  onClick={() => setShowBlockDeleteModal(false)}
                  className="bg-stone-50 text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all"
                >
                  Cancelar
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors">✕</button>
            
            <div className="mb-6">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Cliente</p>
              <h3 className="text-xl font-extrabold text-stone-800">{clientMap.get(selectedAppt.client_id)?.name || 'Desconocido'}</h3>
            </div>
            
            <div className="mb-8">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Tratamiento</p>
              <p className="text-lg font-bold text-[#d9777f] flex items-center gap-2">✨ {serviceMap.get(selectedAppt.service_id)?.name || 'Borrador...'}</p>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Notas / Observaciones</label>
              <textarea 
                value={editNotes} 
                onChange={e => setEditNotes(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-stone-100 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 min-h-[80px] resize-none text-sm placeholder:italic"
                placeholder="Añadir notas del tratamiento..."
              />
              {editNotes !== (selectedAppt.notes || '') && (
                <button 
                  onClick={() => handleUpdateNotes()}
                  disabled={updatingStatus}
                  className="mt-2 w-full bg-stone-800 text-white text-[10px] font-bold uppercase py-2 rounded-lg hover:bg-stone-900 transition-all"
                >
                  Guardar Nota 💾
                </button>
              )}
            </div>

            {selectedAppt.status === 'web_pending' && (
              <div className="mb-6">
                <button 
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={updatingStatus}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirmar Cita Web ✨
                </button>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-2 text-center">Nueva reserva desde internet</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 border-b border-stone-100 pb-2">Estado de la Cita</p>
              
              <button onClick={() => handleStatusChange('pending')} disabled={updatingStatus || selectedAppt.status === 'pending'} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between transition-all ${selectedAppt.status === 'pending' ? 'bg-[#fdf2f3] text-[#d9777f] border-2 border-[#d9777f]' : 'bg-stone-50 text-stone-600 border-2 border-transparent hover:bg-stone-100'}`}>
                <span>⏳ Pendiente</span>
                {selectedAppt.status === 'pending' && <span>✓</span>}
              </button>

              <button onClick={() => handleStatusChange('completed')} disabled={updatingStatus || selectedAppt.status === 'completed'} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between transition-all ${selectedAppt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-400' : 'bg-stone-50 text-stone-600 border-2 border-transparent hover:bg-emerald-50 hover:text-emerald-700'}`}>
                <span>✅ Realizada</span>
                {selectedAppt.status === 'completed' && <span>✓</span>}
              </button>

              <button onClick={() => handleStatusChange('no_show')} disabled={updatingStatus || selectedAppt.status === 'no_show'} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between transition-all ${selectedAppt.status === 'no_show' ? 'bg-stone-100 text-stone-600 border-2 border-stone-400' : 'bg-stone-50 text-stone-600 border-2 border-transparent hover:bg-stone-200'}`}>
                <span>👻 No Asistió</span>
                {selectedAppt.status === 'no_show' && <span>✓</span>}
              </button>

              <button onClick={() => handleStatusChange('cancelled')} disabled={updatingStatus || selectedAppt.status === 'cancelled'} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between transition-all ${selectedAppt.status === 'cancelled' ? 'bg-red-50 text-red-600 border-2 border-red-500' : 'bg-stone-50 text-stone-600 border-2 border-transparent hover:bg-red-50 hover:text-red-600'}`}>
                <span>❌ Cancelada</span>
                {selectedAppt.status === 'cancelled' && <span>✓</span>}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex justify-center flex-col items-center">
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} disabled={updatingStatus} className="text-xs font-bold text-stone-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                  🗑 Eliminar Cita del Sistema
                </button>
              ) : (
                <div className="flex gap-3 mt-2">
                  <button onClick={handleDeleteAppointment} disabled={updatingStatus} className="text-xs font-bold bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 uppercase tracking-widest transition-colors">
                    ⚠️ Sí, Borrar definitivamente
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={updatingStatus} className="text-xs font-bold bg-stone-100 text-stone-500 px-4 py-2 rounded-lg hover:bg-stone-200 uppercase tracking-widest transition-colors">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
