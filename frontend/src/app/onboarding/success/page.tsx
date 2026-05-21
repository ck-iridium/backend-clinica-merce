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

  // Step 1: Business info
  const [clinicName, setClinicName] = useState('');
  const [sector, setSector] = useState('estetica');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Step 2: Schedules
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:30');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

  // Step 3: Initial service
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState(50);
  const [serviceDuration, setServiceDuration] = useState(60);

  // 1. Verify Stripe Checkout Session and Sync Tenant
  useEffect(() => {
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
  }, [sessionId]);

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

  // Final Setup Submission
  const handleCompleteSetup = async () => {
    if (!clinicName.trim()) {
      toast.error('Por favor, indica el nombre de tu centro o negocio.');
      return;
    }

    if (!serviceName.trim()) {
      toast.error('Introduce el nombre de tu primer servicio.');
      return;
    }

    setSubmitting(true);
    const setupToast = toast.loading('Guardando configuración y estructurando tu portal...');

    try {
      // 1. Enviar configuración al backend (POST Masivo)
      const setupResponse = await fetch(`${API_URL}/stripe/onboarding-complete-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantData.tenant_id,
          clinic_name: clinicName,
          sector: sector,
          logo_app_b64: logoBase64,
          open_time: openTime,
          close_time: closeTime,
          working_days: JSON.stringify(workingDays),
          initial_service: {
            name: serviceName,
            price: Number(servicePrice),
            duration_minutes: Number(serviceDuration)
          }
        }),
      });

      if (!setupResponse.ok) {
        const errData = await setupResponse.json();
        throw new Error(errData.detail || 'Error al guardar los datos de configuración inicial.');
      }

      const setupResult = await setupResponse.json();

      // 2. Autenticar silenciosamente en Supabase para una UX de fricción cero
      toast.loading('Iniciando sesión en tu nuevo espacio...', { id: setupToast });
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: tenantData.admin_email,
        password: tenantData.admin_password
      });

      if (authError) {
        console.error('Error in silent auto-login:', authError);
        toast.success('¡Espacio creado! Por favor inicia sesión con tu correo.', { id: setupToast });
        router.push('/login');
        return;
      }

      // Guardar sesión en localStorage igual que en LoginPage
      const userPayload = {
        email: authData.user.email,
        id: authData.user.id,
        access_token: authData.session.access_token
      };
      localStorage.setItem('user', JSON.stringify(userPayload));

      // Determinar dominio de redirección
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      toast.success('¡Configuración completada con éxito! Bienvenido a ProBookia.', { id: setupToast });

      // Redirigir según subdominio
      setTimeout(() => {
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // Desarrollo local
          window.location.href = `${protocol}//${setupResult.tenant_slug}.localhost:3000/dashboard`;
        } else if (hostname.endsWith('.probookia.com')) {
          // Entorno staging/producción con subdominio activo
          window.location.href = `${protocol}//${setupResult.tenant_slug}.probookia.com/dashboard`;
        } else {
          // Fallback a ruta estándar
          router.push('/dashboard');
        }
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
    <div className="min-h-screen bg-[#F7F7F5] py-16 px-6 font-sans relative overflow-hidden select-none selection:bg-[#d4af37]/20">
      
      {/* Background lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-bl-[20rem] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-stone-200/20 to-transparent rounded-tr-[20rem] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header / Brand */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase block mb-3 font-sans">
            BIENVENIDO A LA EXPERIENCIA PREMIUM
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1F2937] leading-tight">
            Asistente de Configuración
          </h1>
          <p className="text-stone-400 font-medium text-sm mt-3">
            Completa estos rápidos pasos para personalizar tu portal de reservas y agenda.
          </p>
        </div>

        {/* PROGRESS INDICATOR BAR */}
        <div className="bg-white rounded-full p-2.5 shadow-sm border border-[#1F2937]/5 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 pl-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  step === num 
                    ? 'bg-[#d4af37] text-white ring-4 ring-[#d4af37]/15' 
                    : step > num 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-[#F7F7F5] text-stone-400 border border-stone-200'
                }`}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                <span className={`text-[11px] uppercase tracking-wider font-extrabold hidden md:inline transition-colors duration-300 ${
                  step === num ? 'text-[#1F2937]' : 'text-stone-400'
                }`}>
                  {num === 1 && 'Identidad'}
                  {num === 2 && 'Jornadas'}
                  {num === 3 && 'Tratamiento'}
                </span>
                {num < 3 && <ChevronRight className="w-3.5 h-3.5 text-stone-300 hidden md:block" />}
              </div>
            ))}
          </div>
          
          <div className="bg-[#fcf8e5] text-[#b08e23] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider font-sans border border-yellow-100/50">
            Paso {step} de 3
          </div>
        </div>

        {/* WIZARD CARD CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-luxury border border-[#1F2937]/5 p-8 md:p-12 relative overflow-hidden transition-all duration-500 min-h-[400px] flex flex-col justify-between">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-bl-full pointer-events-none"></div>

          {/* STEP CONTENT */}
          <div className="mb-10">
            {step === 1 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] flex items-center justify-center text-[#d4af37]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#1F2937]">Datos de Identidad de tu Negocio</h3>
                    <p className="text-stone-400 text-xs mt-1">Cómo te verán tus pacientes y clientes en el portal.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre del Centro / Clínica</label>
                    <input 
                      type="text" 
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Ej. Salón Jade, Barbería Luxury, Spazio Wellness"
                      className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Sector o Especialidad</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'estetica', label: 'Estética', icon: '✨' },
                        { id: 'barberia', label: 'Barbería', icon: '💈' },
                        { id: 'spas', label: 'Spa / Bienestar', icon: '💆' },
                        { id: 'salon', label: 'Salón Peluquería', icon: '✂️' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSector(item.id)}
                          className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-all active:scale-95 ${
                            sector === item.id 
                              ? 'border-[#d4af37] bg-[#fcf8e5]/20 text-[#b08e23] ring-1 ring-[#d4af37]' 
                              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-xs font-bold font-sans tracking-wide">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Logotipo de la Marca (Opcional)</label>
                    <div className="flex items-center gap-6 p-6 border border-dashed border-stone-200 rounded-2xl bg-[#F7F7F5]/50">
                      <div className="relative w-20 h-20 rounded-2xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden shadow-inner group">
                        {logoBase64 ? (
                          <img src={logoBase64} alt="Preview Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Upload className="w-6 h-6 text-stone-400 group-hover:text-[#d4af37] transition-colors" />
                        )}
                      </div>
                      <div>
                        <input 
                          type="file" 
                          accept="image/*"
                          id="logo-upload"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white hover:border-[#d4af37] text-xs font-bold text-stone-700 hover:text-[#d4af37] transition-colors shadow-sm cursor-pointer inline-block"
                        >
                          Elegir Imagen
                        </label>
                        <p className="text-stone-400 text-xxs mt-2 font-semibold">Formatos recomendados: PNG o JPG. Máx: 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] flex items-center justify-center text-[#d4af37]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#1F2937]">Jornada y Horarios Laborales</h3>
                    <p className="text-stone-400 text-xs mt-1">Configura las horas y los días en que tu centro permanece operativo.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3">Días Laborales de Citas</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { num: 1, name: 'Lunes' },
                        { num: 2, name: 'Martes' },
                        { num: 3, name: 'Miércoles' },
                        { num: 4, name: 'Jueves' },
                        { num: 5, name: 'Viernes' },
                        { num: 6, name: 'Sábado' },
                        { num: 7, name: 'Domingo' },
                      ].map((day) => {
                        const active = workingDays.includes(day.num);
                        return (
                          <button
                            key={day.num}
                            type="button"
                            onClick={() => toggleWorkingDay(day.num)}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-sans transition-all duration-300 active:scale-95 flex items-center gap-2 ${
                              active 
                                ? 'bg-[#d4af37] text-white border-transparent shadow-sm' 
                                : 'bg-[#F7F7F5] border-stone-200 text-stone-500 hover:border-stone-300'
                            }`}
                          >
                            {active && <Check className="w-3.5 h-3.5" />}
                            {day.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Hora de Apertura</label>
                      <input 
                        type="time" 
                        required
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Hora de Cierre</label>
                      <input 
                        type="time" 
                        required
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] flex items-center justify-center text-[#d4af37]">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#1F2937]">Da de alta tu primer Servicio</h3>
                    <p className="text-stone-400 text-xs mt-1">Crea tu servicio estrella para que los clientes puedan reservar desde hoy.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre del Servicio o Tratamiento</label>
                    <input 
                      type="text" 
                      required
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Ej. Tratamiento Facial Antiedad Deluxe, Corte & Afeitado Premium"
                      className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Precio del Servicio (€)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          required
                          min="1"
                          value={servicePrice}
                          onChange={(e) => setServicePrice(Number(e.target.value))}
                          placeholder="65"
                          className="w-full pl-5 pr-10 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans font-mono"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">Duración Estimada</label>
                      <div className="relative">
                        <select 
                          value={serviceDuration}
                          onChange={(e) => setServiceDuration(Number(e.target.value))}
                          className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans appearance-none"
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={45}>45 minutos</option>
                          <option value={60}>60 minutos (1 hora)</option>
                          <option value={90}>90 minutos (1.5 horas)</option>
                          <option value={120}>120 minutos (2 horas)</option>
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs">▼</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 rounded-2xl bg-[#F7F7F5] border border-stone-200/40 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-[#d4af37] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      💡
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-stone-700">Añadiremos una Categoría General</h4>
                      <p className="text-stone-400 text-xxs mt-1 font-semibold leading-relaxed">
                        Para simplificar el inicio de tu clínica, crearemos automáticamente una categoría inicial llamada "General" donde colgaremos este primer servicio. Podrás editarla e incorporar muchas más desde tu panel de control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM BUTTON BAR */}
          <div className="flex justify-between items-center pt-8 border-t border-stone-100 mt-auto">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                disabled={submitting}
                className="px-6 py-3.5 rounded-xl border border-stone-200 hover:border-stone-300 text-xs font-bold text-stone-600 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (step < 3) {
                  if (step === 1 && !clinicName.trim()) {
                    toast.error('Por favor, indica el nombre comercial de tu negocio.');
                    return;
                  }
                  setStep(prev => prev + 1);
                } else {
                  handleCompleteSetup();
                }
              }}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creando Portal...
                </>
              ) : step === 3 ? (
                <>
                  Completar Registro <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continuar <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

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
