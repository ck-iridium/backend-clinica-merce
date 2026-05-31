"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Check, 
  Sparkles, 
  Building2, 
  Clock, 
  Scissors, 
  Smile, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Upload, 
  CheckCircle2, 
  CalendarRange
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SECTORS = [
  { id: 'Medicina Estética', label: 'Medicina Estética', desc: 'Clínicas médicas, botox, rellenos y láser advanced.', icon: '💉' },
  { id: 'Estética y Bienestar', label: 'Estética y Bienestar', desc: 'Tratamientos faciales, masajes, spa y mimos.', icon: '✨' },
  { id: 'Clínicas de Salud', label: 'Clínicas de Salud', desc: 'Fisioterapia, nutrición, dermatología y salud integral.', icon: '🏥' },
  { id: 'Salones y Barberías', label: 'Salones y Barberías', desc: 'Peluquería de lujo, estilismo de barba y color.', icon: '💈' }
];

const DAYS = [
  { label: 'Lun', val: 1 },
  { label: 'Mar', val: 2 },
  { label: 'Mié', val: 3 },
  { label: 'Jue', val: 4 },
  { label: 'Vie', val: 5 },
  { label: 'Sáb', val: 6 },
  { label: 'Dom', val: 7 }
];

const SECTOR_PREVIEWS: Record<string, Array<{ name: string; duration: number; price: number; desc: string }>> = {
  "Medicina Estética": [
    { name: "Toxina Botulínica (Bótox)", duration: 30, price: 150.00, desc: "Atenuación elegante de arrugas y líneas de expresión mediante microinyecciones localizadas." },
    { name: "Relleno con Ácido Hialurónico", duration: 45, price: 290.00, desc: "Relleno e hidratación de labios o pómulos con acabado natural y armónico." },
    { name: "Peeling Químico de Alta Gama", duration: 40, price: 95.00, desc: "Renovación celular profunda para aportar luminosidad extrema y homogeneizar el tono." }
  ],
  "Estética y Bienestar": [
    { name: "Higiene Facial Ultrasónica", duration: 45, price: 65.00, desc: "Purificación celular profunda con exfoliación y mascarilla calmante." },
    { name: "Masaje Relajante Sensorial", duration: 50, price: 70.00, desc: "Terapia relajante corporal con aceites esenciales calientes para calma absoluta." },
    { name: "Tratamiento Reafirmante de Radiofrecuencia", duration: 45, price: 85.00, desc: "Estímulo de colágeno mediante calor intradérmico para atenuar la flacidez." }
  ],
  "Clínicas de Salud": [
    { name: "Consulta Nutricional y Bioimpedancia", duration: 45, price: 60.00, desc: "Estudio corporal completo y plan nutricional personalizado." },
    { name: "Sesión de Fisioterapia Personalizada", duration: 55, price: 50.00, desc: "Tratamiento manual de dolencias y estiramientos dirigidos." },
    { name: "Drenaje Linfático Manual", duration: 60, price: 75.00, desc: "Terapia suave orientada a estimular la reducción activa de retención de líquidos." }
  ],
  "Salones y Barberías": [
    { name: "Corte de Cabello Signature & Estilismo", duration: 40, price: 35.00, desc: "Diseño personalizado de corte adaptado a tus rasgos y peinado profesional." },
    { name: "Ritual de Afeitado a Navaja Tradicional", duration: 30, price: 25.00, desc: "Afeitado clásico con toallas calientes aromáticas y espuma de brocha." },
    { name: "Tratamiento de Hidratación Capilar Profunda", duration: 45, price: 45.00, desc: "Nutrición capilar intensiva con keratina para devolver el brillo." }
  ]
};

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Core state
  const [loading, setLoading] = useState(true);
  const [validatingText, setValidatingText] = useState('Verificando tu pago en Stripe...');
  const [error, setError] = useState('');
  const [tenantData, setTenantData] = useState<any>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form states
  const [clinicName, setClinicName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Estética y Bienestar');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Schedules
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [loadDemoData, setLoadDemoData] = useState(true);

  // Modality & Locations
  const [workModality, setWorkModality] = useState('clinic_only'); // 'clinic_only', 'home_only', 'both'
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [operationsCenterAddress, setOperationsCenterAddress] = useState('');
  const [maxCoverageRadiusKm, setMaxCoverageRadiusKm] = useState(10);

  // 1. Verify Stripe Checkout Session and Sync Tenant
  useEffect(() => {
    const freeSuccess = searchParams.get('free_success');
    
    if (freeSuccess === 'true') {
      const data = {
        tenant_id: searchParams.get('tenant_id'),
        tenant_slug: searchParams.get('tenant_slug'),
        tenant_name: searchParams.get('tenant_name'),
        admin_email: searchParams.get('admin_email'),
        admin_name: searchParams.get('admin_name'),
        admin_password: searchParams.get('admin_password'),
      };
      setTenantData(data);
      setClinicName(data.tenant_name || '');
      setValidatingText('Inicializando tu base de datos gratuita...');
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return;
    }

    if (!sessionId) {
      setError('No se ha proporcionado un identificador de sesión válido.');
      setLoading(false);
      return;
    }

    const verifyPaymentAndFetchTenant = async () => {
      try {
        setValidatingText('Validando la transacción de forma segura...');
        const response = await fetch(`${API_URL}/stripe/onboarding-session-status/${sessionId}`);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'No se pudo verificar el estado de la suscripción.');
        }

        const data = await response.json();
        setTenantData(data);
        setClinicName(data.tenant_name || '');
        
        setValidatingText('¡Transacción verificada! Inicializando tu base de datos...');
        // Simulamos un pequeño retardo premium para dar feedback visual fluido
        setTimeout(() => {
          setLoading(false);
        }, 1200);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con la pasarela de pagos.');
        setLoading(false);
      }
    };

    verifyPaymentAndFetchTenant();
  }, [sessionId, searchParams]);

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El logotipo no puede superar los 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
        toast.success('Logotipo cargado con éxito');
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle working day
  const toggleWorkingDay = (day: number) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!clinicName.trim()) {
        toast.error('Por favor, introduce el nombre de tu clínica.');
        return;
      }
    } else if (step === 2) {
      if (workModality === 'clinic_only' || workModality === 'both') {
        if (!locationName.trim() || !locationAddress.trim()) {
          toast.error('Por favor, introduce el nombre y la dirección física de tu sede principal.');
          return;
        }
      }
      if (workModality === 'home_only' || workModality === 'both') {
        if (!operationsCenterAddress.trim()) {
          toast.error('Por favor, introduce la dirección base para el servicio a domicilio.');
          return;
        }
      }
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 250);
  };

  const handlePrevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 250);
  };

  // Final Setup Submission
  const handleCompleteSetup = async () => {
    if (!clinicName.trim()) {
      toast.error('Por favor, indica el nombre de tu centro o negocio.');
      return;
    }

    if (workModality === 'clinic_only' || workModality === 'both') {
      if (!locationName.trim() || !locationAddress.trim()) {
        toast.error('Por favor, introduce el nombre y la dirección física de tu sede principal.');
        return;
      }
    }

    if (workModality === 'home_only' || workModality === 'both') {
      if (!operationsCenterAddress.trim()) {
        toast.error('Por favor, introduce la dirección base para el servicio a domicilio.');
        return;
      }
    }

    setSubmitting(true);
    const setupToast = toast.loading('Guardando configuración y estructurando tu portal...');

    try {
      const response = await fetch(`${API_URL}/onboarding/setup?tenant_id=${tenantData.tenant_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantData.tenant_id
        },
        body: JSON.stringify({
          clinic_name: clinicName,
          logo_app_b64: logoBase64,
          industry: selectedSector,
          open_time: openTime,
          close_time: closeTime,
          working_days: workingDays,
          load_demo_data: loadDemoData,
          work_modality: workModality,
          location_name: workModality !== 'home_only' ? (locationName || clinicName) : null,
          location_address: workModality !== 'home_only' ? locationAddress : null,
          location_phone: workModality !== 'home_only' ? locationPhone : null,
          operations_center_address: workModality !== 'clinic_only' ? operationsCenterAddress : null,
          max_coverage_radius_km: workModality !== 'clinic_only' ? maxCoverageRadiusKm : null
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al guardar los datos de configuración inicial.');
      }

      toast.success('¡Configuración completada con éxito! Bienvenido a ProBookia.', { id: setupToast });

      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      setTimeout(() => {
        let redirectUrl = '/login';
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          redirectUrl = `${protocol}//${tenantData.tenant_slug}.localhost:3000/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
        } else if (hostname.endsWith('.probookia.com')) {
          redirectUrl = `${protocol}//${tenantData.tenant_slug}.probookia.com/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
        } else {
          redirectUrl = `/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
        }
        window.location.href = redirectUrl;
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error inesperado al completar el alta.', { id: setupToast });
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-900/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center max-w-md bg-white rounded-[2.5rem] p-12 shadow-luxury border border-[#1F2937]/5">
          <div className="w-20 h-20 rounded-2xl bg-[#fcf8e5] flex items-center justify-center text-[#d4af37] mb-8 shadow-inner relative overflow-hidden">
            <Loader2 className="w-10 h-10 animate-spin relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent"></div>
          </div>
          
          <h2 className="text-2xl font-serif font-extrabold text-[#1F2937] tracking-tight mb-4">
            Aprovisionando tu Suscripción
          </h2>
          <p className="text-stone-500 font-medium text-sm leading-relaxed mb-2">
            {validatingText}
          </p>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mt-6">
            ProBookia SaaS Secure Provisioner
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-luxury border border-red-100 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-[#1F2937] mb-4">Error de Autenticación</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">{error}</p>
          <button 
            onClick={() => router.push('/marketing')}
            className="w-full bg-[#1F2937] hover:bg-[#d4af37] text-white font-bold py-4 rounded-xl shadow-sm transition-all duration-300 active:scale-95"
          >
            Volver a la Página Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 md:px-8 font-sans relative overflow-hidden select-none selection:bg-[#d4af37]/20 flex items-center justify-center">
      
      {/* Background elegant gradient lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-bl-[20rem] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-stone-200/20 to-transparent rounded-tr-[20rem] pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(28,25,23,0.03)] border border-stone-200/50 flex flex-col justify-between min-h-[640px] relative overflow-hidden transition-all duration-500 z-10">
        
        {/* Subtle Gold/Anthracite Top Bar Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-stone-900 via-[#d4af37] to-stone-900" />
        
        {/* Header - Stepper Progress Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
              Onboarding ProBookia
            </span>
            <h1 className="font-serif italic text-2xl text-stone-850 transition-all duration-300">
              {step === 1 && "Comienza tu viaje premium"}
              {step === 2 && "Estructura operativa"}
              {step === 3 && "Horarios & Agenda"}
              {step === 4 && "Últimos retoques de marca"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-xs font-semibold font-sans">
              Paso {step} de 4
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    s === step 
                      ? 'w-6 bg-[#d4af37]' 
                      : s < step 
                      ? 'w-2.5 bg-stone-900' 
                      : 'w-2 bg-stone-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Transition Wrapper */}
        <div className={`flex-1 mb-8 transition-all duration-300 transform ${
          isTransitioning ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
        }`}>
          
          {/* STEP 1: Identidad Corporativa */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Nombre de tu Negocio
                </label>
                <input 
                  type="text" 
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ej. Clínica Mercè"
                  className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-850 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Sector o Especialidad Principal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SECTORS.map((sec) => {
                    const isSelected = selectedSector === sec.id;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSector(sec.id)}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 select-none group relative ${
                          isSelected 
                            ? 'bg-[#FAF9F5] border-[#d4af37] shadow-sm' 
                            : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110">{sec.icon}</span>
                        <div>
                          <h4 className="font-bold text-stone-850 text-xs leading-none mb-1.5 flex items-center gap-1.5">
                            {sec.label}
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                          </h4>
                          <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                            {sec.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Logotipo de la Marca (Opcional)
                </label>
                <div className="flex items-center gap-6 p-5 border border-dashed border-stone-200 rounded-2xl bg-[#FAF9F5]/30">
                  {logoBase64 ? (
                    <div className="relative group shrink-0">
                      <img src={logoBase64} alt="Preview Logo" className="h-16 w-16 object-contain rounded-xl border border-stone-200 bg-white shadow-sm" />
                      <button onClick={() => setLogoBase64(null)} className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow hover:bg-rose-500 transition-colors">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-stone-300 shrink-0">
                      <Upload className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      id="logo-upload"
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="inline-block bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm uppercase tracking-wider active:scale-95 duration-300"
                    >
                      Elegir Imagen
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium block mt-1.5">
                      Formatos admitidos: PNG, JPEG o SVG. Máx. 2MB.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Modalidad Operativa y Sedes */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Modelo de Negocio / Modalidad de Trabajo
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tarjeta Sede */}
                  <div 
                    onClick={() => setWorkModality('clinic_only')}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
                      workModality === 'clinic_only'
                        ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      workModality === 'clinic_only' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-850 text-xs mb-1">Solo en Clínica</h4>
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                        Los clientes agendan y asisten a tu centro físico.
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta Domicilio */}
                  <div 
                    onClick={() => setWorkModality('home_only')}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
                      workModality === 'home_only'
                        ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      workModality === 'home_only' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/>
                        <circle cx="7" cy="17" r="2"/>
                        <circle cx="17" cy="17" r="2"/>
                        <path d="M13 17H9"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-850 text-xs mb-1">A Domicilio</h4>
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                        Te desplazas a casa u oficina del cliente.
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta Híbrida */}
                  <div 
                    onClick={() => setWorkModality('both')}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
                      workModality === 'both'
                        ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      workModality === 'both' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-850 text-xs mb-1">Modelo Híbrido</h4>
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                        Ofreces cabina física y atención móvil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Subforms */}
              <div className="space-y-4 pt-2 border-t border-stone-100 animate-in fade-in duration-500">
                {(workModality === 'clinic_only' || workModality === 'both') && (
                  <div className="space-y-4">
                    <h3 className="font-serif italic text-stone-700 text-sm">Información de Sede Principal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Nombre de la Sede</label>
                        <input 
                          type="text" 
                          value={locationName} 
                          onChange={(e) => setLocationName(e.target.value)} 
                          placeholder="Ej. Sede Central Mercè" 
                          className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Teléfono de Sede</label>
                        <input 
                          type="text" 
                          value={locationPhone} 
                          onChange={(e) => setLocationPhone(e.target.value)} 
                          placeholder="Ej. +34 931 234 567" 
                          className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Física de Sede</label>
                      <input 
                        type="text" 
                        value={locationAddress} 
                        onChange={(e) => setLocationAddress(e.target.value)} 
                        placeholder="Calle, número, piso, código postal y ciudad de tu cabina" 
                        className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {(workModality === 'home_only' || workModality === 'both') && (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-serif italic text-stone-700 text-sm">Configuración de Servicios a Domicilio</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Base / Centro de Operaciones</label>
                      <input 
                        type="text" 
                        value={operationsCenterAddress} 
                        onChange={(e) => setOperationsCenterAddress(e.target.value)} 
                        placeholder="Dirección desde donde se calculan las rutas a domicilio" 
                        className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2 p-5 rounded-2xl bg-[#FAF9F5]/50 border border-stone-200/50">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Radio Máximo de Cobertura</label>
                        <span className="text-xs font-bold text-[#bf9b30] bg-[#d4af37]/10 px-2.5 py-1 rounded-full">{maxCoverageRadiusKm} km</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="2" 
                        max="50" 
                        step="1"
                        value={maxCoverageRadiusKm} 
                        onChange={(e) => setMaxCoverageRadiusKm(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37] focus:outline-none focus:ring-0"
                      />
                      
                      <div className="flex justify-between text-[8px] text-stone-400 font-bold uppercase tracking-wider">
                        <span>2 km</span>
                        <span>25 km</span>
                        <span>50 km</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Horarios y Calendario */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Días Operativos de Atención
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {DAYS.map((day) => {
                    const isSelected = workingDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => toggleWorkingDay(day.val)}
                        className={`h-12 flex-1 min-w-[50px] rounded-xl font-bold text-xs transition-all border flex items-center justify-center select-none active:scale-95 duration-200 ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-[#d4af37] shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100 hover:border-stone-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Hora de Apertura
                  </label>
                  <input 
                    type="time" 
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-850 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Hora de Cierre
                  </label>
                  <input 
                    type="time" 
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-855 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/10 border border-[#d4af37]/20 flex gap-3 text-stone-600">
                <span className="text-lg shrink-0">💡</span>
                <p className="text-[10px] md:text-xs leading-relaxed font-medium">
                  <strong>Ajustes de Agenda:</strong> Estos horarios serán la base de tu calendario. Podrás añadir descansos, festivos o turnos para especialistas individualmente en la sección de Ajustes del panel administrativo.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Aprovisionamiento con IA */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  loadDemoData 
                    ? 'bg-[#FAF9F5] border-[#d4af37] shadow-sm' 
                    : 'bg-stone-50/50 border-stone-200'
                }`}>
                  <div className="pt-1 shrink-0">
                    <input 
                      type="checkbox" 
                      id="demo-data"
                      checked={loadDemoData}
                      onChange={(e) => setLoadDemoData(e.target.checked)}
                      className="h-5 w-5 border-stone-300 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-data" className="font-bold text-stone-850 text-sm cursor-pointer block select-none mb-1">
                      Generar catálogo inicial de {selectedSector}
                    </label>
                    <p className="text-xs text-stone-400 font-medium leading-relaxed">
                      ProBookia configurará automáticamente **3 servicios premium** específicos para el sector de **{selectedSector}**, listos para que tu portal de reservas esté online y funcional desde el primer segundo.
                    </p>
                  </div>
                </div>

                {/* DYNAMIC SERVICE CATALOG PREVIEW (WOW FACTOR) */}
                {loadDemoData && (
                  <div className="border border-stone-200/70 rounded-2xl p-5 space-y-3 bg-white shadow-sm transition-all duration-500 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="text-[9px] font-black tracking-widest text-[#d4af37] uppercase">
                        Catálogo Inicial Previsualizado
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 font-serif italic">
                        Servicios sugeridos
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(SECTOR_PREVIEWS[selectedSector] || SECTOR_PREVIEWS["Estética y Bienestar"]).map((svc, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 p-2.5 rounded-xl hover:bg-stone-50 transition-colors border border-stone-50">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-2">
                              {svc.name}
                              <span className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono font-medium">{svc.duration} min</span>
                            </h4>
                            <p className="text-[9px] text-stone-400 mt-1 leading-relaxed max-w-[400px]">
                              {svc.desc}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-stone-900 font-mono shrink-0">{svc.price.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#FAF9F5]/40 border border-stone-200/50 rounded-2xl p-5 space-y-2 flex gap-3 text-stone-600">
                  <span className="text-lg shrink-0">✨</span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-stone-700">Diseño "Quiet Luxury" Aplicado</h4>
                    <p className="text-[10px] leading-relaxed text-stone-400 font-medium">
                      Hemos inyectado una paleta tipográfica y estilística de lujo que coordina perfectamente con tu sector. Tu web de reservas tendrá fuentes de Serif elegantes y espaciados armoniosos que proyectan la máxima sofisticación frente a tus clientes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="border-t border-stone-100 pt-6 flex items-center justify-between shrink-0 mt-auto">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1 || submitting}
            className={`text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-850 transition-colors select-none active:scale-95 disabled:opacity-30 ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            Anterior
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-widest active:scale-95 duration-300 flex items-center gap-2"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSetup}
              disabled={submitting}
              className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 duration-300 flex items-center gap-2"
            >
              {submitting ? 'Creando Portal...' : 'Finalizar Registro'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative flex flex-col items-center max-w-md bg-white rounded-[2.5rem] p-12 shadow-luxury border border-[#1F2937]/5">
          <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
          <h2 className="text-xl font-serif font-bold text-[#1F2937]">Cargando sesión...</h2>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
