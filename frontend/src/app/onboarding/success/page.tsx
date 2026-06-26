"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { StepIdentity } from '@/components/onboarding/StepIdentity';
import { StepOperations } from '@/components/onboarding/StepOperations';
import { StepScheduling } from '@/components/onboarding/StepScheduling';
import { StepProvisioning } from '@/components/onboarding/StepProvisioning';
import { StepBizumPayment } from '@/components/onboarding/StepBizumPayment';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';

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
    const bizumSuccess = searchParams.get('bizum_success');
    
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

    if (bizumSuccess === 'true') {
      const data = {
        tenant_id: searchParams.get('tenant_id'),
        tenant_slug: searchParams.get('tenant_slug'),
        tenant_name: searchParams.get('tenant_name'),
        admin_email: searchParams.get('admin_email'),
        admin_name: searchParams.get('admin_name'),
        admin_password: searchParams.get('admin_password'),
        reference_code: searchParams.get('reference_code'),
        amount: searchParams.get('amount'),
        bizum_success: true,
      };
      setTenantData(data);
      setClinicName(data.tenant_name || '');
      setValidatingText('Inicializando tu entorno ProBookia...');
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

  const handleGoToDashboard = () => {
    if (!tenantData) return;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    let redirectUrl = '/login';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      redirectUrl = `${protocol}//${tenantData.tenant_slug}.localhost:3000/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    } else if (hostname.endsWith('.probookia.com')) {
      redirectUrl = `${protocol}//${tenantData.tenant_slug}.probookia.com/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    } else {
      redirectUrl = `/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    }
    window.location.href = redirectUrl;
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

      if (tenantData?.bizum_success) {
        setSubmitting(false);
        setStep(5);
        return;
      }

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
        <OnboardingHeader step={step} totalSteps={tenantData?.bizum_success ? 5 : 4} />

        {/* Dynamic Transition Wrapper */}
        <div className={`flex-1 mb-8 transition-all duration-300 transform ${
          isTransitioning ? 'opacity-0 scale-[0.98] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
        }`}>
          
          {/* STEP 1: Identidad Corporativa */}
          {step === 1 && (
            <StepIdentity 
              clinicName={clinicName}
              setClinicName={setClinicName}
              selectedSector={selectedSector}
              setSelectedSector={setSelectedSector}
              logoBase64={logoBase64}
              setLogoBase64={setLogoBase64}
              handleLogoChange={handleLogoChange}
            />
          )}

          {/* STEP 2: Modalidad Operativa y Sedes */}
          {step === 2 && (
            <StepOperations 
              workModality={workModality}
              setWorkModality={setWorkModality}
              locationName={locationName}
              setLocationName={setLocationName}
              locationAddress={locationAddress}
              setLocationAddress={setLocationAddress}
              locationPhone={locationPhone}
              setLocationPhone={setLocationPhone}
              operationsCenterAddress={operationsCenterAddress}
              setOperationsCenterAddress={setOperationsCenterAddress}
              maxCoverageRadiusKm={maxCoverageRadiusKm}
              setMaxCoverageRadiusKm={setMaxCoverageRadiusKm}
            />
          )}

          {/* STEP 3: Horarios y Calendario */}
          {step === 3 && (
            <StepScheduling 
              workingDays={workingDays}
              toggleWorkingDay={toggleWorkingDay}
              openTime={openTime}
              setOpenTime={setOpenTime}
              closeTime={closeTime}
              setCloseTime={setCloseTime}
            />
          )}

          {/* STEP 4: Aprovisionamiento con IA */}
          {step === 4 && (
            <StepProvisioning 
              selectedSector={selectedSector}
              loadDemoData={loadDemoData}
              setLoadDemoData={setLoadDemoData}
            />
          )}

          {/* STEP 5: Activación y Pago Bizum */}
          {step === 5 && tenantData && (
            <StepBizumPayment 
              tenantData={tenantData}
              onAccessDashboard={handleGoToDashboard}
            />
          )}

        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <OnboardingFooter 
            step={step}
            submitting={submitting}
            handlePrevStep={handlePrevStep}
            handleNextStep={handleNextStep}
            handleCompleteSetup={handleCompleteSetup}
          />
        )}

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
