"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { StepIdentity } from '@/components/onboarding/StepIdentity';
import { StepOperations, ExtraLocationItem } from '@/components/onboarding/StepOperations';
import { StepResources, ResourceItem } from '@/components/onboarding/StepResources';
import { StepTeam, TeamMemberItem } from '@/components/onboarding/StepTeam';
import { StepScheduling } from '@/components/onboarding/StepScheduling';
import { StepProvisioning } from '@/components/onboarding/StepProvisioning';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardOnboardingPage() {
  const router = useRouter();

  // Core state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [planType, setPlanType] = useState('pro');

  // Form states - Step 1
  const [clinicName, setClinicName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Estética y Bienestar');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [themePalette, setThemePalette] = useState('dorado-antracita');
  const [accentColorPrimary, setAccentColorPrimary] = useState('#D4AF37');
  const [accentColorSecondary, setAccentColorSecondary] = useState('#1C1917');

  // Form states - Step 2 (Operations & Locations)
  const [workModality, setWorkModality] = useState('clinic_only');
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
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loadDemoData, setLoadDemoData] = useState(true);

  // Fetch tenant info and limits
  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const [settingsRes, limitsRes] = await Promise.all([
          fetch(`${API_URL}/settings/`, { cache: 'no-store' }),
          fetch(`${API_URL}/settings/limits`, { cache: 'no-store' })
        ]);

        if (settingsRes.ok) {
          const s = await settingsRes.json();
          if (s.clinic_name) setClinicName(s.clinic_name);
        }

        if (limitsRes.ok) {
          const l = await limitsRes.json();
          if (l.plan) setPlanType(l.plan.toLowerCase());
        }
      } catch (err) {
        console.warn('DashboardOnboardingPage: No se pudo precargar settings:', err);
      }
    };

    fetchTenantDetails();
  }, []);

  const isMultiEntityPlan = planType === 'pro' || planType === 'gold';
  const totalSteps = isMultiEntityPlan ? 6 : 4;

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

  const toggleWorkingDay = (day: number) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!clinicName.trim()) {
        toast.error('Por favor, introduce el nombre de tu clínica o negocio.');
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

  const handleCompleteSetup = async () => {
    if (!clinicName.trim()) {
      toast.error('Por favor, indica el nombre de tu centro o negocio.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Guardando configuración inicial...');

    try {
      const payload = {
        clinic_name: clinicName,
        logo_app_b64: logoBase64,
        industry: selectedSector,
        theme_palette: themePalette,
        accent_color_primary: accentColorPrimary,
        accent_color_secondary: accentColorSecondary,
        open_time: openTime,
        close_time: closeTime,
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

      const res = await fetch(`${API_URL}/onboarding/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Error al guardar la configuración');
      }

      toast.success('¡Configuración completada con éxito! Redirigiendo a tu agenda...', { id: toastId });
      setTimeout(() => {
        router.replace('/dashboard/calendar');
      }, 1200);

    } catch (err: any) {
      toast.error(err.message || 'Error al completar el alta inicial', { id: toastId });
      setSubmitting(false);
    }
  };

  const allLocationNames = [
    locationName || 'Sede Principal',
    ...extraLocations.map(l => l.name)
  ];

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
              themePalette={themePalette}
              setThemePalette={setThemePalette}
              accentColorPrimary={accentColorPrimary}
              setAccentColorPrimary={setAccentColorPrimary}
              accentColorSecondary={accentColorSecondary}
              setAccentColorSecondary={setAccentColorSecondary}
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
              planType={planType}
              extraLocations={extraLocations}
              setExtraLocations={setExtraLocations}
            />
          )}

          {/* PLAN PRO / GOLD FLOW */}
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

          {/* STEP HORARIOS */}
          {((!isMultiEntityPlan && step === 3) || (isMultiEntityPlan && step === 5)) && (
            <StepScheduling 
              workingDays={workingDays}
              toggleWorkingDay={toggleWorkingDay}
              openTime={openTime}
              setOpenTime={setOpenTime}
              closeTime={closeTime}
              setCloseTime={setCloseTime}
            />
          )}

          {/* STEP CATÁLOGO & PROVISIONAMIENTO */}
          {((!isMultiEntityPlan && step === 4) || (isMultiEntityPlan && step === 6)) && (
            <StepProvisioning 
              selectedSector={selectedSector}
              clinicName={clinicName}
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
