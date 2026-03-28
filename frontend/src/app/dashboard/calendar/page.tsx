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
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 border-emerald-400';
      case 'cancelled': return 'bg-red-50 border-red-500 opacity-70';
      case 'no_show': return 'bg-stone-100 border-stone-400 grayscale opacity-60';
      case 'pending':
      default: return 'bg-[#fdf2f3] border-[#d9777f]';
    }
  };

  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, clientRes, srvRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
      if (srvRes.ok) {
        const servs = await srvRes.json();
        setServices(servs.filter((s:any) => s.is_active));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedSlot({ date, hour });
    setShowModal(true);
  };

  // Safe manual formatting for LOCAL TIME to naive ISO backend
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedServiceId || !selectedSlot) return;

    setSaving(true);
    const service = services.find(s => s.id === selectedServiceId);
    
    const start_time = new Date(selectedSlot.date);
    start_time.setHours(selectedSlot.hour, 0, 0, 0);
    
    const end_time = new Date(start_time.getTime() + service.duration_minutes * 60000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          service_id: selectedServiceId,
          start_time: formatLocalISO(start_time),
          end_time: formatLocalISO(end_time),
          status: 'pending'
        })
      });

      if (res.ok) {
        await fetchData();
        setShowModal(false);
        setSelectedClientId('');
        setSelectedServiceId('');
      } else {
        alert("Error reservando la cita");
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
        await fetchData();
        setShowEditModal(false);
      } else {
        alert("Error actualizando estado.");
      }
    } catch (e) {
      console.error(e);
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

  const days = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 12 }).map((_, i) => i + 9); // 09:00 to 20:00

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
            <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50/80">
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

              <div className="grid grid-cols-7 absolute top-0 w-full h-full">
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
                  
                  return (
                    <div key={`col-${dIdx}`} className="border-r border-stone-100 relative last:border-r-0 group">
                      
                      {/* Clickable Empty Slots for Creation */}
                      {hours.map((h, i) => (
                        <div 
                          key={`slot-${dIdx}-${h}`} 
                          onClick={() => handleSlotClick(day, h)}
                          className="absolute w-full hover:bg-gradient-to-b hover:from-white hover:to-[#fdf2f3] cursor-pointer transition-all z-0 border-b border-transparent hover:border-stone-100"
                          style={{ top: `${i * 80}px`, height: '80px' }}>
                          <span className="opacity-0 group-hover:opacity-100 text-[#d9777f] font-bold text-xs absolute top-2 left-2 transition-opacity">+</span>
                        </div>
                      ))}

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
                        
                        const client = clientMap.get(appt.client_id) || { name: 'Paciente Desconocido' };
                        const service = serviceMap.get(appt.service_id) || { name: 'Servicio Borrado...', duration_minutes: durationMin };
                        const colors = getStatusColors(appt.status);

                        return (
                          <div 
                            key={appt.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); setShowEditModal(true); setConfirmDelete(false); }}
                            className={`absolute w-[92%] left-[4%] ml-auto mr-auto border-l-[4px] rounded-r-lg shadow-sm px-2 py-1 z-20 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-start ${colors}`}
                            style={{ top: `${topOffset}px`, height: `${heightPx}px` }}
                          >
                            <div className={`font-extrabold text-[10px] sm:text-xs truncate leading-tight mb-0.5 ${appt.status === 'cancelled' || appt.status === 'no_show' ? 'text-current line-through' : 'text-stone-800'}`}>{client.name}</div>
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

      {/* Book Appointment Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors">✕</button>
            <h2 className="text-2xl font-extrabold text-stone-800 mb-2">Bloquear Hueco</h2>
            <p className="text-[#d9777f] font-bold mb-6 flex items-center gap-2">
              📅 {selectedSlot && `${selectedSlot.date.toLocaleDateString('es-ES')} a las ${selectedSlot.hour.toString().padStart(2, '0')}:00 h`}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Paciente *</label>
                <select required value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 shadow-inner appearance-none">
                  <option value="">-- Elige un paciente --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Tratamiento a realizar *</label>
                <select required value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#d9777f] outline-none bg-stone-50 shadow-inner appearance-none">
                  <option value="">-- Selecciona el servicio --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>)}
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

              <div className="flex gap-3 mt-6 pt-4 border-t border-stone-100">
                <button disabled={saving} type="submit" className="flex-1 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-stone-900/10">
                  {saving ? 'Registrando...' : 'Confirmar Reserva'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all active:scale-95">
                  Cancelar
                </button>
              </div>
            </form>
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
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Paciente</p>
              <h3 className="text-xl font-extrabold text-stone-800">{clientMap.get(selectedAppt.client_id)?.name || 'Desconocido'}</h3>
            </div>
            
            <div className="mb-8">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Tratamiento</p>
              <p className="text-lg font-bold text-[#d9777f] flex items-center gap-2">✨ {serviceMap.get(selectedAppt.service_id)?.name || 'Borrador...'}</p>
            </div>

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
