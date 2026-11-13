"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { StepIdentity } from '@/components/onboarding/StepIdentity';
import { StepOperations, ExtraLocationItem } from '@/components/onboarding/StepOperations';
import { StepResources, ResourceItem } from '@/components/onboarding/StepResources';
import { StepTeam, TeamMemberItem } from '@/components/onboarding/StepTeam';
import { StepScheduling } from '@/components/onboarding/StepScheduling';
import { StepProvisioning } from '@/components/onboarding/StepProvisioning';
import { CinematicProvisioning } from '@/components/onboarding/CinematicProvisioning';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Core state
  const [loading, setLoading] = useState(true);
  const [validatingText, setValidatingText] = useState('Verificando tu suscripción en Stripe...');
  const [error, setError] = useState('');
  const [tenantData, setTenantData] = useState<any>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form states - Step 1
  const [clinicName, setClinicName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Estética y Bienestar');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Form states - Step 2 (Operations & Locations)
  const [workModality, setWorkModality] = useState('clinic_only'); // 'clinic_only', 'home_only', 'both'
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [operationsCenterAddress, setOperationsCenterAddress] = useState('');
  const [maxCoverageRadiusKm, setMaxCoverageRadiusKm] = useState(10);
  const [extraLocations, setExtraLocations] = useState<ExtraLocationItem[]>([]);

  // Form states - Step 3 (Resources / Cabinas)
  const [resources, setResources] = useState<ResourceItem[]>([]);

  // Form states - Step 4 (Team / Especialistas)
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);

  // Form states - Step 5 (Schedules)
  const [openTime, setOpenTime] = useState('09:30');
  const [closeTime, setCloseTime] = useState('20:30');
  const [lunchStart, setLunchStart] = useState('13:30');
  const [lunchEnd, setLunchEnd] = useState('16:30');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [loadDemoData, setLoadDemoData] = useState(true);
  const [isCinematicRunning, setIsCinematicRunning] = useState(false);

  // Plan awareness: Basic has 4 steps, Pro and Gold have 6 steps
  const planType = (tenantData?.plan_type || 'pro').toLowerCase();
  const isMultiEntityPlan = planType === 'pro' || planType === 'gold';
  const totalSteps = isMultiEntityPlan ? 6 : 4;

  // 1. Verify Stripe Checkout Session and Sync Tenant
  useEffect(() => {
    // Si viene de fallback manual o bizum
    const freeSuccess = searchParams.get('free_success');
    const bizumSuccess = searchParams.get('bizum_success');
    
    if (freeSuccess === 'true') {
      const data = {
        tenant_id: searchParams.get('tenant_id'),
        tenant_slug: searchParams.get('tenant_slug'),
        tenant_name: searchParams.get('tenant_name'),
        admin_email: searchParams.get('admin_email'),
        admin_name: searchParams.get('admin_name'),
        plan_type: searchParams.get('plan_type') || 'pro',
      };
      setTenantData(data);
      setClinicName(data.tenant_name || '');
      setValidatingText('Inicializando tu entorno de prueba ProBookia...');
      setTimeout(() => {
        setLoading(false);
      }, 800);
      return;
    }

    if (bizumSuccess === 'true') {
      const data = {
        tenant_id: searchParams.get('tenant_id'),
        tenant_slug: searchParams.get('tenant_slug'),
        tenant_name: searchParams.get('tenant_name'),
        admin_email: searchParams.get('admin_email'),
        admin_name: searchParams.get('admin_name'),
        plan_type: searchParams.get('plan_type') || 'pro',
        reference_code: searchParams.get('reference_code'),
        amount: searchParams.get('amount'),
        bizum_success: true,
      };
      setTenantData(data);
      setClinicName(data.tenant_name || '');
      setValidatingText('Inicializando tu entorno ProBookia...');
      setTimeout(() => {
        setLoading(false);
      }, 800);
      return;
    }

    if (!sessionId) {
      setError('No se ha proporcionado un identificador de sesión de Stripe válido.');
      setLoading(false);
      return;
    }

    const verifyPaymentAndFetchTenant = async () => {
      try {
        setValidatingText('Validando tu suscripción y tarjeta con Stripe...');
        const response = await fetch(`${API_URL}/stripe/onboarding-session-status/${sessionId}`);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'No se pudo verificar el estado de la suscripción en Stripe.');
        }

        const data = await response.json();
        setTenantData(data);
        setClinicName(data.tenant_name || '');
        
        setValidatingText('¡Tarjeta verificada con éxito! Preparando tu asistente de inicio...');
        setTimeout(() => {
          setLoading(false);
        }, 1000);
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
    // Validación Paso 1: Identidad
    if (step === 1) {
      if (!clinicName.trim()) {
        toast.error('Por favor, introduce el nombre de tu clínica o negocio.');
        return;
      }
    } 
    // Validación Paso 2: Operaciones y Sedes
    else if (step === 2) {
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
      setStep(prev => Math.min(totalSteps, prev + 1));
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => Math.max(1, prev - 1));
      setIsTransitioning(false);
    }, 200);
  };

  // Final Setup Submission
  const handleCompleteSetup = async () => {
    if (!clinicName.trim()) {
      toast.error('Por favor, indica el nombre de tu centro o negocio.');
      return;
    }

    setSubmitting(true);
    const setupToast = toast.loading('Guardando configuración y estructurando tu entorno de trabajo...');

    try {
      const payload = {
        clinic_name: clinicName,
        logo_app_b64: logoBase64,
        industry: selectedSector,
        open_time: openTime,
        close_time: closeTime,
        lunch_start: lunchStart || null,
        lunch_end: lunchEnd || null,
        working_days: workingDays,
        load_demo_data: loadDemoData,
        work_modality: workModality,
        location_name: workModality !== 'home_only' ? (locationName || clinicName) : null,
        location_address: workModality !== 'home_only' ? locationAddress : null,
        location_phone: workModality !== 'home_only' ? locationPhone : null,
        operations_center_address: workModality !== 'clinic_only' ? operationsCenterAddress : null,
        max_coverage_radius_km: workModality !== 'clinic_only' ? maxCoverageRadiusKm : null,
        extra_locations: extraLocations.map(l => ({
          name: l.name,
          address: l.address,
          phone: l.phone || null
        })),
        initial_resources: resources.map(r => ({
          name: r.name,
          quantity: r.quantity,
          location_index: r.locationIndex
        })),
        initial_team_members: teamMembers.map(m => ({
          full_name: m.full_name,
          email: m.email || null,
          role: m.role
        }))
      };

      // Prime localStorage con datos de administrador para acceso instantáneo
      if (tenantData?.admin_email) {
        try {
          const primePayload = {
            email: tenantData.admin_email,
            id: tenantData.tenant_id,
            full_name: tenantData.admin_name || clinicName || 'Administrador',
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(primePayload));
        } catch (e) {
          console.warn("No se pudo pre-guardar sesión en localStorage:", e);
        }
      }

      // Activar la pantalla cinemática de aprovisionamiento
      setIsCinematicRunning(true);

      const response = await fetch(`${API_URL}/onboarding/setup?tenant_id=${tenantData.tenant_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantData.tenant_id
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al guardar los datos de configuración inicial.');
      }

    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error inesperado al completar el alta.');
      setSubmitting(false);
      setIsCinematicRunning(false);
    }
  };

  const handleCinematicRedirect = () => {
    try {
      sessionStorage.setItem('probookia_just_onboarded', 'true');
    } catch {}
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    let redirectUrl = '/login';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      redirectUrl = `${protocol}//${tenantData.tenant_slug}.localhost:3000/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    } else if (hostname.endsWith('.probookia.com') || hostname === 'probookia.com') {
      redirectUrl = `${protocol}//${tenantData.tenant_slug}.probookia.com/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    } else {
      redirectUrl = `/login?email=${encodeURIComponent(tenantData.admin_email)}&welcome=true`;
    }
    window.location.href = redirectUrl;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-900/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_rgba(28,25,23,0.04)] border border-stone-200/60">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#d4af37] mb-6 shadow-inner relative overflow-hidden border border-[#d4af37]/20">
            <Loader2 className="w-9 h-9 animate-spin relative z-10" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight mb-2">
            Verificando Período de Prueba
          </h2>
          <p className="text-stone-500 text-xs leading-relaxed max-w-xs mb-6">
            {validatingText}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" /> Stripe 3D Secure & TLS 256-Bit
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-luxury border border-red-100 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-6 text-2xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Verificación Requerida</h2>
          <p className="text-stone-500 text-xs leading-relaxed mb-6">{error}</p>
          <button 
            onClick={() => router.push('/#precios')}
            className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm"
          >
            Volver a la Selección de Planes
          </button>
        </div>
      </div>
    );
  }

  // List of location names for resources assignment
  const allLocationNames = [
    locationName || 'Sede Principal',
    ...extraLocations.map(l => l.name)
  ];

  if (isCinematicRunning) {
    return (
      <CinematicProvisioning 
        clinicName={clinicName || tenantData?.tenant_name || 'Tu Clínica'}
        selectedSector={selectedSector}
        onComplete={handleCinematicRedirect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8 md:py-14 px-4 md:px-8 font-sans relative overflow-hidden select-none selection:bg-[#d4af37]/20 flex items-center justify-center">
      
      {/* Background ambient luxury lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#d4af37]/10 via-amber-200/5 to-transparent rounded-bl-[20rem] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-stone-200/40 to-transparent rounded-tr-[20rem] pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-7 md:p-10 shadow-[0_20px_60px_rgba(28,25,23,0.04)] border border-stone-200/70 flex flex-col justify-between min-h-[660px] relative overflow-hidden transition-all duration-500 z-10">
        
        {/* Subtle Gold / Anthracite Luxury Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-stone-950 via-[#d4af37] to-stone-950" />
        
        {/* Header - Dynamic Stepper */}
        <OnboardingHeader 
          step={step} 
          totalSteps={totalSteps} 
          planType={planType} 
        />

        {/* Dynamic Step Content */}
        <div className={`flex-1 mb-8 transition-all duration-300 transform ${
          isTransitioning ? 'opacity-0 scale-[0.99] translate-y-1' : 'opacity-100 scale-100 translate-y-0'
        }`}>
          
          {/* STEP 1: Identidad Corporativa (Todos los planes) */}
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

          {/* STEP 2: Modalidad Operativa y Sedes (Todos los planes, con multi-sede para Pro/Gold) */}
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
              planType={planType}
              extraLocations={extraLocations}
              setExtraLocations={setExtraLocations}
            />
          )}

          {/* PLAN PRO / GOLD FLOW (6 Steps) */}
          {isMultiEntityPlan && step === 3 && (
            <StepResources 
              resources={resources}
              setResources={setResources}
              locationNames={allLocationNames}
            />
          )}

          {isMultiEntityPlan && step === 4 && (
            <StepTeam 
              teamMembers={teamMembers}
              setTeamMembers={setTeamMembers}
              planType={planType}
            />
          )}

          {/* STEP HORARIOS: Step 3 (Basic) o Step 5 (Pro/Gold) */}
          {((!isMultiEntityPlan && step === 3) || (isMultiEntityPlan && step === 5)) && (
            <StepScheduling 
              workingDays={workingDays}
              toggleWorkingDay={toggleWorkingDay}
              openTime={openTime}
              setOpenTime={setOpenTime}
              closeTime={closeTime}
              setCloseTime={setCloseTime}
              lunchStart={lunchStart}
              setLunchStart={setLunchStart}
              lunchEnd={lunchEnd}
              setLunchEnd={setLunchEnd}
            />
          )}

          {/* STEP CATÁLOGO & PROVISIONAMIENTO: Step 4 (Basic) o Step 6 (Pro/Gold) */}
          {((!isMultiEntityPlan && step === 4) || (isMultiEntityPlan && step === 6)) && (
            <StepProvisioning 
              selectedSector={selectedSector}
              loadDemoData={loadDemoData}
              setLoadDemoData={setLoadDemoData}
            />
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <OnboardingFooter 
          step={step}
          totalSteps={totalSteps}
          submitting={submitting}
          handlePrevStep={handlePrevStep}
          handleNextStep={handleNextStep}
          handleCompleteSetup={handleCompleteSetup}
        />

      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative flex flex-col items-center max-w-md bg-white rounded-[2.5rem] p-12 shadow-luxury border border-stone-200">
          <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
          <h2 className="text-xl font-serif font-bold text-stone-900">Cargando sesión...</h2>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
