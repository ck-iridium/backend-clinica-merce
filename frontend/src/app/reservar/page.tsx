"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import Step1Treatments from './components/Step1Treatments';
import Step1Specialists from './components/Step1Specialists';
import Step2DateTime from './components/Step2DateTime';
import Step3Details from './components/Step3Details';
import Step4Success from './components/Step4Success';
import Step0Locations from './components/Step0Locations';

// Helper for local ISO to prevent Server/Client boundary timezone rendering errors on Backend
const formatLocalISO = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

// Helper for reading tenant cookies in client side
const getTenantId = () => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; tenant_id=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

export default function BookingPage() {
  const { showFeedback } = useFeedback();
  const { t, language } = useLanguage();
  
  // Días laborables desde backend/settings (con localStorage y fallback seguro)
  const getWorkingDays = (): number[] => {
    if (settings?.working_days && Array.isArray(settings.working_days)) {
      return settings.working_days;
    }
    if (typeof window === 'undefined') return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem('mercestetica_working_days');
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5]; 
    } catch { return [1, 2, 3, 4, 5]; }
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
    }
    return new Date();
  };

  const getServiceDepositInfo = (srv: any) => {
    if (!srv) return { required: false, amount: 0 };
    if (srv.requires_deposit && srv.deposit_amount && srv.deposit_amount > 0) {
      return { required: true, amount: srv.deposit_amount };
    }
    if (settings?.global_deposit_required && settings?.global_deposit_amount && settings?.global_deposit_amount > 0) {
      const isExempt = srv.deposit_amount !== null && srv.deposit_amount !== undefined && parseFloat(srv.deposit_amount) === 0.0;
      if (!isExempt) {
        return { required: true, amount: settings.global_deposit_amount };
      }
    }
    return { required: false, amount: 0 };
  };

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>({ id: 'any', full_name: 'Cualquiera (Recomendado)' });

  const [selectedService, setSelectedService] = useState<any>(null);

  // Initialize to NEXT WORKING DAY
  const [selectedDate, setSelectedDate] = useState<Date>(getNextWorkingDay());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dateTimePhase, setDateTimePhase] = useState<1 | 2>(1);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_modality: 'clinic', // 'clinic' o 'home'
    client_address: '',
    client_latitude: null as number | null,
    client_longitude: null as number | null,
    client_postal_code: '',
    client_city: '',
    save_address_to_crm: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bulkAvailability, setBulkAvailability] = useState<Record<string, boolean>>({});
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Dynamic step indicators
  const hasLocs = locations.length > 1;
  const hasStaff = staff.length > 1;
  const totalSteps = 3 + (hasLocs ? 1 : 0) + (hasStaff ? 1 : 0);

  const currentStepIndex = hasLocs && !selectedLocation
    ? 1
    : step === 1
      ? (hasLocs ? 2 : 1)
      : step === 2
        ? (hasLocs ? 2 : 1) + 1
        : step === 3
          ? (hasLocs ? 2 : 1) + (hasStaff ? 1 : 0) + 1
          : step === 4
            ? (hasLocs ? 2 : 1) + (hasStaff ? 1 : 0) + 2
            : totalSteps + 1;

  const showHeader = currentStepIndex <= totalSteps;
  const showFooter = currentStepIndex <= totalSteps && selectedLocation !== null;

  // Parse check for rebooking query params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const qName = query.get('name');
      const qEmail = query.get('email');
      const qPhone = query.get('phone');
      if (qName || qEmail || qPhone) {
        setFormData(prev => ({
          ...prev,
          name: qName || '',
          email: qEmail || '',
          phone: qPhone || ''
        }));
      }
    }
  }, []);

  // Inicializar modalidad del servicio al seleccionarlo
  useEffect(() => {
    if (selectedService) {
      const allowed = selectedService.allowed_modality || 'clinic';
      const isHomeOnly = settings?.work_modality === 'home_only' || allowed === 'home';
      setFormData(prev => ({
        ...prev,
        service_modality: isHomeOnly ? 'home' : 'clinic'
      }));
    }
  }, [selectedService, settings]);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const tenantId = getTenantId();
        if (!tenantId) {
          console.error("No tenant_id resolved in cookies.");
          setBookingError("No se pudo resolver el identificador de la clínica.");
          setLoading(false);
          return;
        }
        const [catRes, srvRes, apptRes, settingsRes, locRes, staffRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`, { headers: { 'X-Tenant-ID': tenantId } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`, { headers: { 'X-Tenant-ID': tenantId } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`, { headers: { 'X-Tenant-ID': tenantId } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, { headers: { 'X-Tenant-ID': tenantId } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/`, { headers: { 'X-Tenant-ID': tenantId } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/specialists`, { headers: { 'X-Tenant-ID': tenantId } })
        ]);

        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }

        let hasLocsLocal = false;
        if (locRes.ok) {
          const locs = await locRes.json();
          const activeLocs = locs.filter((l: any) => l.is_active);
          setLocations(activeLocs);
          hasLocsLocal = activeLocs.length > 1;
          if (activeLocs.length === 1) {
            setSelectedLocation(activeLocs[0]);
          }
        }

        let staffData: any[] = [];
        if (staffRes.ok) {
          staffData = await staffRes.json();
          setStaff(staffData);
          if (staffData.length === 1) {
            setSelectedStaff(staffData[0]);
          }
        }

        if (catRes.ok) {
          const cats = await catRes.json();
          const hasOtherCategories = cats.some((c: any) => c.name.toUpperCase() !== 'GENERAL');
          const validCats = hasOtherCategories 
            ? cats.filter((c: any) => c.name.toUpperCase() !== 'GENERAL')
            : cats;
          setCategories(validCats);

          if (validCats.length === 1) {
            setActiveCategory(validCats[0]);
          }
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
                if (staffData.length > 1) {
                  setStep(2);
                } else {
                  setStep(3);
                }
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

  // Fetch availability from backend whenever date, service, location or preferred specialist changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    const tenantId = getTenantId();
    if (!tenantId) return;
    const workingDays = getWorkingDays();
    const dayIndex = toWeekDayIndex(selectedDate.getDay());
    if (!workingDays.includes(dayIndex)) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    setSelectedTime('');
    const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz
    
    let url = `${process.env.NEXT_PUBLIC_API_URL}/appointments/availability?date=${dateStr}&service_id=${selectedService.id}`;
    if (selectedLocation) {
      url += `&location_id=${selectedLocation.id}`;
    }
    if (selectedStaff && selectedStaff.id !== 'any') {
      url += `&staff_id=${selectedStaff.id}`;
    }

    fetch(url, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(r => r.json())
      .then(data => setAvailableSlots(data.available_slots ?? []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, selectedLocation, selectedStaff, settings]);

  // Fetch bulk availability (90 days) when service, location or preferred specialist changes
  useEffect(() => {
    if (!selectedService) return;
    const tenantId = getTenantId();
    if (!tenantId) return;

    setLoadingBulk(true);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 90);

    const startStr = startDate.toLocaleDateString('en-CA');
    const endStr = endDate.toLocaleDateString('en-CA');

    let url = `${process.env.NEXT_PUBLIC_API_URL}/appointments/availability/bulk?start_date=${startStr}&end_date=${endStr}&service_id=${selectedService.id}`;
    if (selectedLocation) {
      url += `&location_id=${selectedLocation.id}`;
    }
    if (selectedStaff && selectedStaff.id !== 'any') {
      url += `&staff_id=${selectedStaff.id}`;
    }

    fetch(url, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(r => r.json())
      .then(data => setBulkAvailability(data || {}))
      .catch(() => setBulkAvailability({}))
      .finally(() => setLoadingBulk(false));
  }, [selectedService, selectedLocation, selectedStaff, settings]);

  const handleBooking = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const tenantId = getTenantId();
    if (!tenantId) {
      setBookingError("No se pudo resolver el identificador de la clínica.");
      return;
    }
    setSaving(true);
    setBookingError('');
    try {
      const [hourStr, minStr] = selectedTime.split(':');
      const startD = new Date(selectedDate);
      startD.setHours(parseInt(hourStr), parseInt(minStr), 0, 0);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/public`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          service_id: selectedService.id,
          location_id: selectedLocation ? selectedLocation.id : null,
          staff_id: selectedStaff && selectedStaff.id !== 'any' ? selectedStaff.id : 'any',
          start_time: formatLocalISO(startD),
          service_modality: formData.service_modality,
          client_address: formData.service_modality === 'home' ? formData.client_address : null,
          client_latitude: formData.service_modality === 'home' ? formData.client_latitude : null,
          client_longitude: formData.service_modality === 'home' ? formData.client_longitude : null,
          client_postal_code: formData.service_modality === 'home' ? formData.client_postal_code : null,
          client_city: formData.service_modality === 'home' ? formData.client_city : null,
          save_address_to_crm: formData.service_modality === 'home' ? formData.save_address_to_crm : false
        })
      });

      if (res.status === 429) {
        setBookingError("Has realizado demasiados intentos de reserva. Por seguridad, espera unos minutos antes de volver a intentarlo o contacta con nosotros.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al confirmar la reserva");
      }
      
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setStep(5); // Step 5 is Success screen
      }
    } catch (err: any) {
      showFeedback({
        type: 'error',
        title: 'Reserva no disponible',
        message: err.message || "Oops, ha ocurrido un error. Inténtalo de nuevo o llama a la clínica."
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Helper to dynamically calculate step indicator label
  const getStepIndicatorText = () => {
    let base = t('common.step_indicator') || t('wizard.step_indicator') || 'Paso {step} de 3';
    base = base.replace('3', totalSteps.toString());
    return base.replace('{step}', currentStepIndex.toString());
  };

  return (
    <div className="h-[100dvh] bg-background font-sans selection:bg-primary/30 selection:text-stone-900 flex flex-col overflow-hidden text-foreground">
      
      {/* APP HEADER (FIXED) */}
      {showHeader && (
        <header className="shrink-0 bg-card border-b border-border z-50">
          <div className="max-w-2xl mx-auto w-full px-8 py-4 md:py-5 flex items-center justify-between">
            {!(step === 1 && !activeCategory && (locations.length <= 1 || !selectedLocation)) ? (
              <button 
                onClick={() => {
                  if (step === 1) {
                    if (activeCategory) {
                      setActiveCategory(null);
                    } else if (locations.length > 1 && selectedLocation) {
                      setSelectedLocation(null);
                    }
                  } else if (step === 2) {
                    setStep(1);
                  } else if (step === 3) {
                    if (dateTimePhase === 2) {
                      setDateTimePhase(1);
                    } else {
                      if (staff.length > 1) {
                        setStep(2);
                      } else {
                        setStep(1);
                      }
                    }
                  } else if (step === 4) {
                    setStep(3);
                  }
                }} 
                className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm font-bold uppercase tracking-widest w-20 text-left font-bold"
              >
                {t('common.back')}
              </button>
            ) : (
              <div className="w-20" />
            )}
            
            <div className="flex-grow max-w-[180px] md:max-w-[200px]">
               <div className="h-2 bg-muted rounded-luxury-btn overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-700 ease-out" 
                    style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }} 
                  />
               </div>
               <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-bold mt-1.5 text-center">
                 {getStepIndicatorText()}
               </p>
            </div>

            <div className="flex items-center gap-3.5 w-24 justify-end shrink-0">
               <Link 
                 href="/" 
                 className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm font-bold uppercase tracking-widest text-right"
               >
                 {t('common.exit')}
               </Link>
            </div>
          </div>
        </header>
      )}

      {/* CONTENT AREA (FULL HEIGHT EDGE-TO-EDGE) */}
      <main className="flex-grow overflow-hidden relative flex flex-col">
        <div className="flex-grow max-w-2xl mx-auto w-full flex flex-col min-h-0">
          {loading ? (
            <div className="m-auto text-center">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-primary rounded-full animate-spin mb-3 mx-auto"></div>
              <p className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              {locations.length > 1 && !selectedLocation ? (
                <Step0Locations
                  locations={locations}
                  onSelectLocation={(loc) => setSelectedLocation(loc)}
                />
              ) : (
                <>
                  {step === 1 && (
                    <Step1Treatments 
                      categories={categories}
                      services={services}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      bookingLayout={settings?.booking_layout || 'grid'}
                      settings={settings}
                      onSelectService={(srv) => { 
                        setSelectedService(srv); 
                        if (staff.length > 1) {
                          setStep(2);
                        } else {
                          setStep(3);
                        }
                      }}
                    />
                  )}

                  {step === 2 && (
                    <Step1Specialists
                      staffList={staff}
                      selectedStaff={selectedStaff}
                      onSelectStaff={(st) => {
                        setSelectedStaff(st);
                        setStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {step === 3 && (
                    <Step2DateTime
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedTime={selectedTime}
                      setSelectedTime={(time) => {
                        setSelectedTime(time);
                        if (time) {
                          setTimeout(() => {
                            setStep(4);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 300);
                        }
                      }}
                      availableSlots={availableSlots}
                      loadingSlots={loadingSlots}
                      bulkAvailability={bulkAvailability}
                      loadingBulk={loadingBulk}
                      selectedService={selectedService}
                      settings={settings}
                      onShowFeedback={showFeedback}
                      dateTimePhase={dateTimePhase}
                      setDateTimePhase={setDateTimePhase}
                      currentMonthOffset={currentMonthOffset}
                      setCurrentMonthOffset={setCurrentMonthOffset}
                      staffList={staff}
                      selectedStaff={selectedStaff}
                      setSelectedStaff={setSelectedStaff}
                    />
                  )}

                  {step === 4 && (
                    <Step3Details 
                      formData={formData}
                      setFormData={setFormData}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      selectedService={selectedService}
                      privacyAccepted={privacyAccepted}
                      setPrivacyAccepted={setPrivacyAccepted}
                      settings={settings}
                    />
                  )}

                  {step === 5 && (
                    <Step4Success 
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      selectedService={selectedService}
                      formData={formData}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* ACTION FOOTER (FIXED) */}
      {showFooter && (
        <footer className="shrink-0 bg-card border-t border-border p-4 md:py-6 md:px-8 z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
            {selectedService && (
               <div className="flex-grow flex flex-col justify-center overflow-hidden">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {t('common.treatment') || 'Tratamiento'}
                  </p>
                  <p className="text-xs md:text-base font-bold text-foreground truncate mt-0.5">
                    {selectedService.name}
                  </p>
               </div>
            )}
            {!selectedService && activeCategory && (
               <div className="flex-grow flex flex-col justify-center overflow-hidden">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {t('common.zone') || 'Zona'}
                  </p>
                  <p className="text-xs md:text-base font-bold text-foreground truncate mt-0.5">
                    {activeCategory.name}
                  </p>
               </div>
            )}
            {step === 3 && dateTimePhase === 1 ? (
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
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-border bg-card shadow-sm active:scale-90 transition-all
                    ${currentMonthOffset === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'}`}
                >
                  <ChevronLeft size={18} className="text-foreground md:scale-125" />
                </button>
                
                <span className="text-sm md:text-lg font-serif font-bold text-foreground tracking-wide capitalize select-none">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + currentMonthOffset, 1).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' })}
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
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-border bg-card shadow-sm active:scale-90 transition-all
                    ${currentMonthOffset === 3 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted'}`}
                >
                  <ChevronRight size={18} className="text-foreground md:scale-125" />
                </button>
              </div>
            ) : (
              (step === 3 || step === 4) && (
                <button
                  disabled={
                    step === 3 ? !selectedTime :
                    step === 4 ? (!privacyAccepted || !formData.name || !formData.email || !formData.phone || saving) :
                    false
                  }
                  onClick={() => {
                    if (step === 4) handleBooking();
                    else { setStep(4); window.scrollTo({ top: 0 }); }
                  }}
                  className="flex-grow bg-primary text-primary-foreground py-4 md:py-5 rounded-luxury-btn font-bold text-xs md:text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {saving ? t('common.processing') : step === 4 ? (() => {
                    const dep = getServiceDepositInfo(selectedService);
                    return dep.required 
                      ? t('wizard.pay_deposit_amount').replace('{amount}', dep.amount.toString())
                      : t('wizard.confirm_booking');
                  })() : t('common.next')}
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
