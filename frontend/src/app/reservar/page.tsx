"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import Step1Treatments from './components/Step1Treatments';
import Step2DateTime from './components/Step2DateTime';
import Step3Details from './components/Step3Details';
import Step4Success from './components/Step4Success';

// Helper for local ISO to prevent Server/Client boundary timezone rendering errors on Backend
const formatLocalISO = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export default function BookingPage() {
  const { showFeedback } = useFeedback();
  
  // Días laborables desde localStorage (sincronizados con Ajustes del panel)
  const getWorkingDays = (): number[] => {
    if (typeof window === 'undefined') return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem('mercestetica_working_days');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5, 6]; 
    } catch { return [1, 2, 3, 4, 5, 6]; }
  };
  const toWeekDayIndex = (jsDay: number) => jsDay === 0 ? 7 : jsDay;

  const getNextWorkingDay = () => {
    const workingDays = getWorkingDays();
    let d = new Date();
    d.setHours(0, 0, 0, 0);
    // Buscar el primer día hábil (máximo 7 días de búsqueda)
    for (let i = 0; i < 7; i++) {
      if (workingDays.includes(toWeekDayIndex(d.getDay()))) return d;
      d = new Date(d);
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
    }
    return new Date();
  };

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [selectedService, setSelectedService] = useState<any>(null);

  // Initialize to NEXT WORKING DAY
  const [selectedDate, setSelectedDate] = useState<Date>(getNextWorkingDay());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dateTimePhase, setDateTimePhase] = useState<1 | 2>(1);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

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
        const [catRes, srvRes, apptRes, settingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`)
        ]);

        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }

        if (catRes.ok) {
          const cats = await catRes.json();
          const validCats = cats.filter((c: any) => c.name.toUpperCase() !== 'GENERAL');
          setCategories(validCats);
        }

        if (srvRes.ok) {
          const data = await srvRes.json();
          const activeSrvs = data.filter((s: any) => s.is_active);
          setServices(activeSrvs);

          // Check if we came from a rebook link or treatment page with service ID
          if (typeof window !== 'undefined') {
            const qs = new URLSearchParams(window.location.search);
            const srvId = qs.get('servicio') || qs.get('srvId') || qs.get('serviceId');
            
            if (srvId) {
              const targetSrv = activeSrvs.find((s: any) => String(s.id) === String(srvId));
              if (targetSrv) {
                setSelectedService(targetSrv);
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const handleBooking = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      
      const data = await res.json();
      
      // Si el backend devuelve una URL de checkout (fianza requerida), redirigir
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        // Reserva normal sin fianza
        setStep(4);
      }
    } catch (err) {
      setBookingError("Oops, ha ocurrido un error. Inténtalo de nuevo o llama a la clínica.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#F7F7F5] font-sans selection:bg-[#d4af37]/30 selection:text-stone-900 flex flex-col overflow-hidden">
      
      {/* APP HEADER (FIXED) */}
      {step < 4 && (
        <header className="shrink-0 bg-white border-b border-stone-200/60 z-50">
          <div className="max-w-2xl mx-auto w-full px-8 py-4 md:py-5 flex items-center justify-between">
            {!(step === 1 && !activeCategory) ? (
              <button 
                onClick={() => {
                  if (step === 1 && activeCategory) setActiveCategory(null);
                  else if (step === 2 && dateTimePhase === 2) setDateTimePhase(1);
                  else if (step > 1) setStep(step - 1);
                }} 
                className="text-stone-400 hover:text-stone-800 transition-colors text-xs md:text-sm font-bold uppercase tracking-widest w-20 text-left"
              >
                ATRAS
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <div className="flex-grow max-w-[180px] md:max-w-[200px]">
               <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#d4af37] transition-all duration-700 ease-out" 
                    style={{ width: step === 1 ? '25%' : step === 2 ? '50%' : '75%' }} 
                  />
               </div>
               <p className="text-[10px] md:text-xs uppercase tracking-widest text-stone-400 font-bold mt-1.5 text-center">
                 Paso {step} de 3
               </p>
            </div>

            <Link 
              href="/" 
              className="text-stone-400 hover:text-stone-800 transition-colors text-xs md:text-sm font-bold uppercase tracking-widest w-20 text-right"
            >
              SALIR
            </Link>
          </div>
        </header>
      )}

      {/* CONTENT AREA (FULL HEIGHT EDGE-TO-EDGE) */}
      <main className="flex-grow overflow-hidden relative flex flex-col">
        <div className="flex-grow max-w-2xl mx-auto w-full flex flex-col min-h-0">
          {loading ? (
            <div className="m-auto text-center">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-[#d4af37] rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">Cargando...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <Step1Treatments 
                  categories={categories}
                  services={services}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  bookingLayout={settings?.booking_layout || 'grid'}
                  onSelectService={(srv) => { 
                    setSelectedService(srv); 
                    setStep(2); 
                  }}
                />
              )}

              {step === 2 && (
                <Step2DateTime
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  availableSlots={availableSlots}
                  loadingSlots={loadingSlots}
                  selectedService={selectedService}
                  settings={settings}
                  onShowFeedback={showFeedback}
                  dateTimePhase={dateTimePhase}
                  setDateTimePhase={setDateTimePhase}
                  currentMonthOffset={currentMonthOffset}
                  setCurrentMonthOffset={setCurrentMonthOffset}
                />
              )}

              {step === 3 && (
                <Step3Details 
                  formData={formData}
                  setFormData={setFormData}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedService={selectedService}
                  privacyAccepted={privacyAccepted}
                  setPrivacyAccepted={setPrivacyAccepted}
                />
              )}

              {step === 4 && (
                <Step4Success 
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedService={selectedService}
                  formData={formData}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* ACTION FOOTER (FIXED) */}
      {step < 4 && (
        <footer className="shrink-0 bg-white border-t border-stone-200/60 p-4 md:py-6 md:px-8 z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step === 1 && (activeCategory?.name || selectedService) && (
               <div className="flex-grow flex flex-col justify-center overflow-hidden">
                  <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-wider truncate">
                    {selectedService ? 'Tratamiento' : 'Zona'}
                  </p>
                  <p className="text-xs md:text-base font-bold text-stone-800 truncate mt-0.5">
                    {selectedService ? selectedService.name : activeCategory?.name}
                  </p>
               </div>
            )}
            {step === 2 && dateTimePhase === 1 ? (
              <div className="flex-grow flex items-center justify-between py-1 px-2 select-none">
                <button
                  disabled={currentMonthOffset === 0}
                  onClick={() => {
                    const nextOffset = currentMonthOffset - 1;
                    setCurrentMonthOffset(nextOffset);
                    const now = new Date();
                    const targetMonth = new Date(now.getFullYear(), now.getMonth() + nextOffset, 1).getMonth();
                    const element = document.getElementById(`month-header-${targetMonth}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm active:scale-90 transition-all
                    ${currentMonthOffset === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
                >
                  <ChevronLeft size={18} className="text-stone-600 md:scale-125" />
                </button>
                
                <span className="text-sm md:text-lg font-serif font-bold text-stone-800 tracking-wide capitalize select-none">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + currentMonthOffset, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                
                <button
                  disabled={currentMonthOffset === 3}
                  onClick={() => {
                    const nextOffset = currentMonthOffset + 1;
                    setCurrentMonthOffset(nextOffset);
                    const now = new Date();
                    const targetMonth = new Date(now.getFullYear(), now.getMonth() + nextOffset, 1).getMonth();
                    const element = document.getElementById(`month-header-${targetMonth}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm active:scale-90 transition-all
                    ${currentMonthOffset === 3 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
                >
                  <ChevronRight size={18} className="text-stone-600 md:scale-125" />
                </button>
              </div>
            ) : (
              step !== 1 && (
                <button
                  disabled={
                    step === 2 ? !selectedTime :
                    step === 3 ? (!privacyAccepted || !formData.name || !formData.email || !formData.phone || saving) :
                    false
                  }
                  onClick={() => {
                    if (step === 3) handleBooking();
                    else { setStep(step + 1); window.scrollTo({ top: 0 }); }
                  }}
                  className="flex-grow bg-stone-900 text-[#d4af37] py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {saving ? 'Procesando...' : step === 3 ? 'Confirmar Reserva' : 'Siguiente'}
                </button>
              )
            )}
          </div>
        </footer>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
      `}} />
    </div>
  );
}
