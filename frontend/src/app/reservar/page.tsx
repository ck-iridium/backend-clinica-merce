"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeedback } from '@/app/contexts/FeedbackContext';

// Helper for local ISO to prevent Server/Client boundary timezone rendering errors on Backend
const formatLocalISO = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export default function BookingPage() {
  const { showFeedback } = useFeedback();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [selectedService, setSelectedService] = useState<any>(null);

  // Initialize to TODAY (with Spanish timezone correction fallback)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Parse check for rebooking query params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const qName = query.get('name');
      const qEmail = query.get('email');
      const qPhone = query.get('phone');
      if (qName || qEmail || qPhone) {
        setFormData({
          name: qName || '',
          email: qEmail || '',
          phone: qPhone || ''
        });
      }
    }
  }, []);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [srvRes, apptRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`)
        ]);
        if (srvRes.ok) {
          const data = await srvRes.json();
          const activeSrvs = data.filter((s: any) => s.is_active);
          setServices(activeSrvs);

          // Check if we came from a rebook link with srvId
          if (typeof window !== 'undefined') {
            const qs = new URLSearchParams(window.location.search);
            const srvId = qs.get('srvId');
            if (srvId) {
              const targetSrv = activeSrvs.find((s: any) => s.id === srvId);
              if (targetSrv) {
                setSelectedService(targetSrv);
                setStep(2);
              }
            }
          }
        }
        if (apptRes.ok) setAppointments(await apptRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, []);

  // Días laborables desde localStorage (sincronizados con Ajustes del panel)
  // getDay(): 0=Dom, 1=Lun...6=Sab → nuestro esquema: 1=Lun...7=Dom
  const getWorkingDays = (): number[] => {
    if (typeof window === 'undefined') return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem('mercestetica_working_days');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    } catch { return [1, 2, 3, 4, 5]; }
  };
  const toWeekDayIndex = (jsDay: number) => jsDay === 0 ? 7 : jsDay; // Convertir de getDay() a esquema 1-7

  // Fetch availability from backend whenever date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    const workingDays = getWorkingDays();
    const dayIndex = toWeekDayIndex(selectedDate.getDay());
    if (!workingDays.includes(dayIndex)) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    setSelectedTime('');
    const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/availability?date=${dateStr}&service_id=${selectedService.id}`)
      .then(r => r.json())
      .then(data => setAvailableSlots(data.available_slots ?? []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService]);
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBookingError('');
    try {
      const [hourStr, minStr] = selectedTime.split(':');
      const startD = new Date(selectedDate);
      startD.setHours(parseInt(hourStr), parseInt(minStr), 0, 0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          service_id: selectedService.id,
          start_time: formatLocalISO(startD),
        })
      });

      if (res.status === 429) {
        setBookingError("Has realizado demasiados intentos de reserva. Por seguridad, espera unos minutos antes de volver a intentarlo o contacta con nosotros.");
        return;
      }

      if (!res.ok) throw new Error("Error al confirmar la reserva");
      setStep(4);
    } catch (err) {
      setBookingError("Oops, ha ocurrido un error. Inténtalo de nuevo o llama a la clínica.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] font-sans selection:bg-[#f3c7cb] selection:text-stone-900 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#d9777f]"></div>

        <div className="p-8 md:p-12">
          <Link href="/" className="text-stone-400 hover:text-[#d9777f] font-semibold text-sm inline-flex items-center gap-2 mb-8 transition-colors">
            ← Volver a la web principal
          </Link>

          {/* Progress Bar Header */}
          {step < 4 && (
            <div className="flex justify-between items-center mb-12 relative max-w-2xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10 -translate-y-1/2 rounded-full"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-[#d9777f] -z-10 -translate-y-1/2 rounded-full transition-all duration-700 ease-out" style={{ width: step === 1 ? '10%' : step === 2 ? '50%' : '100%' }}></div>

              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-4 transition-colors duration-500 shadow-sm ${step >= 1 ? 'bg-white border-[#d9777f] text-[#d9777f]' : 'bg-stone-50 border-stone-200 text-stone-300'}`}>1</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-4 transition-colors duration-500 shadow-sm ${step >= 2 ? 'bg-white border-[#d9777f] text-[#d9777f]' : 'bg-stone-50 border-stone-200 text-stone-300'}`}>2</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-4 transition-colors duration-500 shadow-sm ${step >= 3 ? 'bg-white border-[#d9777f] text-[#d9777f]' : 'bg-stone-50 border-stone-200 text-stone-300'}`}>3</div>
            </div>
          )}

          {loading ? (
            <div className="py-32 text-center">
              <div className="inline-block w-12 h-12 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
              <p className="text-stone-400 font-bold tracking-widest uppercase text-sm">Cargando la agenda de la clínica...</p>
            </div>
          ) : (
            <>
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-stone-800 mb-3 tracking-tight">¿Qué tratamiento deseas?</h1>
                  <p className="text-stone-500 mb-10 font-medium text-lg">Selecciona uno de nuestros servicios de clínica estética para consultar disponibilidad.</p>

                  {services.length === 0 ? (
                    <div className="p-8 bg-stone-50 border border-stone-100 rounded-2xl text-center text-stone-500 font-medium">Actualmente no hay servicios disponibles para reserva online.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map(srv => (
                        <button
                          key={srv.id}
                          onClick={() => { setSelectedService(srv); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-left p-6 md:p-8 rounded-[2rem] border-2 border-stone-100 hover:border-[#d9777f] hover:bg-[#fdf2f3] transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#f3c7cb] shadow-sm hover:shadow-md hover:-translate-y-1"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                          <h3 className="text-2xl font-extrabold text-stone-800 group-hover:text-[#b35e65] transition-colors relative z-10">{srv.name}</h3>
                          {srv.description && <p className="text-stone-500 text-sm mt-2 line-clamp-2 relative z-10">{srv.description}</p>}
                          <div className="mt-8 flex justify-between items-center text-sm font-semibold text-stone-400 relative z-10">
                            <span className="bg-stone-50 group-hover:bg-white px-3 py-1.5 rounded-lg border border-stone-100 border-dashed transition-colors flex items-center gap-1">
                              <span className="text-lg text-[#d4af37]">⏱</span> {srv.duration_minutes} min
                            </span>
                            <span className="bg-[#fcf8e5] text-[#b08e23] border border-yellow-100 px-3 py-1.5 rounded-lg font-extrabold text-lg">{srv.price}€</span>
                          </div>

                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: DATETIME */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-stone-800 mb-3 tracking-tight">Busca tu hueco libre</h1>
                  <p className="text-stone-500 mb-10 font-medium text-lg">Has seleccionado <strong className="text-stone-800 px-2 py-1 bg-stone-100 rounded-lg">{selectedService?.name}</strong>. ¿Cuándo te viene mejor?</p>

                  <div className="flex flex-col md:flex-row gap-10">
                    {/* Date Picker Simple */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-stone-50 p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-inner">
                        <label className="block text-sm font-extrabold uppercase tracking-widest text-[#d9777f] mb-4 flex items-center gap-2">
                          <span>📅</span> Día de la cita
                        </label>
                        <input
                          type="date"
                          min={new Date().toLocaleDateString('en-CA')} // Prevents past dates in local TZ
                          value={selectedDate.toLocaleDateString('en-CA')}
                          onChange={(e) => {
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            const nd = new Date(y, m - 1, d); // Local time parsing
                            const workingDays = getWorkingDays();
                            const dayIndex = toWeekDayIndex(nd.getDay());
                            
                            if (!workingDays.includes(dayIndex)) {
                              showFeedback({ type: 'info', title: 'Día No Laborable', message: "La clínica no abre ese día. Por favor, elige uno de los días disponibles." });
                              return;
                            }
                            if (!isNaN(nd.getTime())) {
                              setSelectedDate(nd);
                              setSelectedTime(''); // reset time block
                            }
                          }}
                          className="w-full px-5 py-5 rounded-2xl border border-stone-200 bg-white text-stone-800 font-extrabold text-lg focus:ring-4 focus:ring-[#f3c7cb] focus:border-[#d9777f] focus:outline-none transition-all shadow-sm cursor-pointer"
                        />
                        <p className="text-xs text-stone-400 font-medium mt-4 bg-white p-4 rounded-xl border border-stone-100 flex items-center gap-2">
                          <span className="text-base text-[#d4af37]">ℹ️</span>
                          Solo se muestran horas disponibles dentro del horario de apertura de la clínica.
                        </p>
                      </div>

                      <button onClick={() => setStep(1)} className="mt-8 text-stone-400 font-bold hover:text-stone-600 transition-colors inline-flex items-center gap-2">
                        ← Cambiar Tratamiento
                      </button>
                    </div>

                    {/* Time Slots Math Calculated */}
                    <div className="w-full md:w-1/2">
                      <label className="block text-sm font-extrabold uppercase tracking-widest text-stone-400 mb-4 px-2">Horas Disponibles</label>
                      {!getWorkingDays().includes(toWeekDayIndex(selectedDate.getDay())) ? (
                        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] font-medium text-center border border-red-100 shadow-inner">
                          <div className="text-4xl mb-4">🚪</div>
                          La clínica no está disponible este día. Por favor, elige un día laborable del calendario.
                        </div>
                      ) : loadingSlots ? (
                        <div className="p-8 text-center text-stone-400 font-bold">
                          <div className="inline-block w-8 h-8 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-3"></div>
                          <p className="text-sm tracking-widest uppercase">Consultando agenda...</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="p-8 bg-stone-50 text-stone-500 rounded-[2rem] text-center font-medium border border-stone-100 shadow-inner">
                          <div className="text-3xl mb-4 grayscale opacity-50">🗓</div>
                          {selectedDate.toDateString() === new Date().toDateString() ? (
                            <span>La agenda está cerrada por hoy o no hay margen suficiente de antelación para nuevas reservas en el mismo día. Por favor, selecciona un día futuro.</span>
                          ) : (
                            <span>Lamentablemente no quedan huecos libres para este día con la duración requerida. Prueba otro día.</span>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                          {availableSlots.map((slot, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedTime(slot)}
                              className={`py-4 rounded-xl font-bold text-sm transition-all border-2 block w-full text-center
                                ${selectedTime === slot
                                  ? 'bg-[#d9777f] border-[#d9777f] text-white shadow-lg scale-105'
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-[#d9777f] hover:text-[#d9777f] hover:shadow-md'
                                }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}


                      {/* Floating next button when time is selected */}
                      {selectedTime && (
                        <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in">
                          <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full bg-stone-900 text-white font-extrabold text-lg py-5 rounded-2xl hover:bg-[#d9777f] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2">
                            Continuar <span className="opacity-70">({selectedTime}h)</span> →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PERSONAL DATA & CONFIRMATION */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-stone-800 mb-3 tracking-tight text-center">Tus Datos</h1>
                  <p className="text-stone-500 mb-10 font-medium text-lg text-center leading-relaxed">
                    Casi terminamos. Estás reservando <strong className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">{selectedService?.name}</strong> para el <strong className="text-stone-700">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> a las <strong className="text-stone-700 bg-[#fdf2f3] text-[#d9777f] px-2 py-0.5 rounded-md">{selectedTime} h</strong>.
                  </p>

                  <form onSubmit={handleBooking} className="space-y-6 bg-white p-8 md:p-10 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#fdf2f3] to-white rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#d9777f] mb-2">Nombre Completo *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-4 focus:ring-[#f3c7cb] focus:border-[#d9777f] outline-none bg-stone-50 transition-all text-stone-800 font-bold" placeholder="Ej: Ana García" />
                    </div>
                    <div className="relative z-10">
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#d9777f] mb-2">Email *</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-4 focus:ring-[#f3c7cb] focus:border-[#d9777f] outline-none bg-stone-50 transition-all text-stone-800 font-bold" placeholder="ana@ejemplo.com" />
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-2 ml-1">Para enviarte la confirmación del bloque reservado</p>
                    </div>

                    {bookingError && (
                      <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in-95 flex items-start gap-3 shadow-inner">
                        <span className="text-lg">⚠️</span>
                        <span>{bookingError}</span>
                      </div>
                    )}
                    <div className="relative z-10">
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#d9777f] mb-2">Teléfono Móvil *</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:ring-4 focus:ring-[#f3c7cb] focus:border-[#d9777f] outline-none bg-stone-50 transition-all text-stone-800 font-bold" placeholder="600 000 000" />
                    </div>

                    <div className="relative z-10 py-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={privacyAccepted} 
                          onChange={e => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-stone-300 text-[#d9777f] focus:ring-[#f3c7cb] transition-all cursor-pointer" 
                        />
                        <span className="text-sm text-stone-500 font-medium leading-relaxed group-hover:text-stone-700 transition-colors">
                          He leído y acepto la <Link href="/privacidad" target="_blank" className="text-[#d9777f] font-bold underline decoration-2 underline-offset-4 hover:text-[#b35e65]">Política de Privacidad</Link> de la clínica. *
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 pt-8 border-t border-stone-100 relative z-10">
                      <button type="button" onClick={() => setStep(2)} className="text-stone-400 font-bold text-sm hover:text-stone-600 transition-colors order-2 sm:order-1 px-4 py-2 hover:bg-stone-50 rounded-lg">
                        ← Cambiar día/hora
                      </button>
                      <button disabled={saving || !privacyAccepted} type="submit" className="w-full sm:w-auto bg-[#d9777f] text-white px-10 py-5 rounded-2xl font-extrabold hover:bg-[#b35e65] transition-all shadow-xl shadow-[#d9777f]/20 disabled:opacity-30 disabled:grayscale active:scale-95 order-1 sm:order-2 text-lg">
                        {saving ? 'Procesando...' : 'Confirmar Reserva'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="text-center animate-in zoom-in-95 duration-700 py-16 px-4 md:px-12 bg-white rounded-[2.5rem] shadow-2xl max-w-2xl mx-auto border border-stone-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl shadow-green-500/20 ring-8 ring-green-50">
                      ✓
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-6 tracking-tight">¡Casi listo!</h1>
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mb-10 max-w-md mx-auto text-left shadow-sm">
                      <p className="text-stone-500 font-medium mb-3">Tu cita ha sido agendada con éxito:</p>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">👤</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Cliente</p>
                            <p className="font-extrabold text-stone-800">{formData.name}</p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">✨</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Tratamiento</p>
                            <p className="font-extrabold text-stone-800">{selectedService?.name}</p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg text-[#d9777f]">📅</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#d9777f]">Fecha y Hora</p>
                            <p className="font-extrabold text-[#b35e65]">{selectedDate.toLocaleDateString('es-ES')} a las {selectedTime}h</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <p className="text-stone-500 font-medium mb-8 leading-relaxed max-w-md mx-auto">
                      Hemos bloqueado tu hueco temporalmente. Por favor, <strong>revisa tu email</strong> y pulsa el botón de confirmación para validar tu cita.
                      <span className="block mt-2 text-sm text-[#d9777f]">⚠️ Tienes 30 minutos para hacerlo antes de que el hueco quede libre de nuevo.</span>
                    </p>

                    <Link href="/" className="inline-block bg-stone-900 text-white font-extrabold px-10 py-5 rounded-2xl shadow-xl hover:bg-stone-800 hover:shadow-2xl transition-all active:scale-95 text-lg">
                      Volver a Inicio
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Custom styles for the scrollbar inside slots */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e7e5e4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d6d3d1;
        }
      `}} />
    </div>
  );
}
