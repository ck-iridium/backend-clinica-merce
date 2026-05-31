"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

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

export default function OnboardingPage() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [clinicName, setClinicName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Estética y Bienestar');
  const [logoB64, setLogoB64] = useState<string | null>(null);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loadDemoData, setLoadDemoData] = useState(true);

  // New Modality & Locations states
  const [workModality, setWorkModality] = useState('clinic_only'); // 'clinic_only', 'home_only', 'both'
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [operationsCenterAddress, setOperationsCenterAddress] = useState('');
  const [maxCoverageRadiusKm, setMaxCoverageRadiusKm] = useState(10);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoB64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (dayVal: number) => {
    setWorkingDays(prev => 
      prev.includes(dayVal) ? prev.filter(d => d !== dayVal) : [...prev, dayVal]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!clinicName.trim()) {
        showFeedback({
          type: 'error',
          title: 'Falta información',
          message: 'Por favor, introduce el nombre de tu clínica.'
        });
        return;
      }
    } else if (step === 2) {
      if (workModality === 'clinic_only' || workModality === 'both') {
        if (!locationName.trim() || !locationAddress.trim()) {
          showFeedback({
            type: 'error',
            title: 'Sede Requerida',
            message: 'Por favor, introduce el nombre y la dirección física de tu sede principal.'
          });
          return;
        }
      }
      if (workModality === 'home_only' || workModality === 'both') {
        if (!operationsCenterAddress.trim()) {
          showFeedback({
            type: 'error',
            title: 'Base de Operaciones Requerida',
            message: 'Por favor, introduce la dirección base para el servicio a domicilio.'
          });
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

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/onboarding/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_name: clinicName,
          logo_app_b64: logoB64,
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

      if (res.ok) {
        showFeedback({
          type: 'success',
          title: '¡Onboarding Completado!',
          message: 'Tu clínica y sede han sido configuradas con éxito. Redirigiendo a tu agenda...'
        });
        
        setTimeout(() => {
          router.replace('/dashboard/calendar');
        }, 1500);
      } else {
        throw new Error("Failed to process onboarding");
      }
    } catch (err) {
      console.error(err);
      showFeedback({
        type: 'error',
        title: 'Error de Configuración',
        message: 'Ocurrió un problema al configurar tu cuenta. Inténtalo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4 md:p-8 selection:bg-[#d4af37]/20">
      
      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(28,25,23,0.03)] border border-stone-200/50 flex flex-col justify-between min-h-[640px] relative overflow-hidden transition-all duration-500">
        
        {/* Subtle Luxury Top Bar Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1c1917] via-[#d4af37] to-[#1c1917]" />
        
        {/* Header - Stepper Progress Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
              Onboarding ProBookia
            </span>
            <h1 className="font-serif italic text-2xl text-stone-800">
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
                      ? 'w-2.5 bg-stone-850 bg-stone-800' 
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
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Nombre de tu Negocio
                </label>
                <input 
                  type="text" 
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ej. Clínica Mercè"
                  className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Sector o Especialidad Principal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SECTORS.map((sector) => {
                    const isSelected = selectedSector === sector.id;
                    return (
                      <div
                        key={sector.id}
                        onClick={() => setSelectedSector(sector.id)}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 select-none group relative ${
                          isSelected 
                            ? 'bg-[#FAF9F5] border-[#d4af37] shadow-sm' 
                            : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110">{sector.icon}</span>
                        <div>
                          <h4 className="font-bold text-stone-850 text-xs leading-none mb-1.5 flex items-center gap-1.5">
                            {sector.label}
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                          </h4>
                          <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                            {sector.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Logotipo Corporativo (Opcional)
                </label>
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FAF9F5]/30 border border-stone-200/60">
                  {logoB64 ? (
                    <div className="relative group">
                      <img src={logoB64} alt="Previsualización" className="h-16 w-16 object-cover rounded-xl border border-stone-200 shadow-sm" />
                      <button onClick={() => setLogoB64(null)} className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow hover:bg-rose-500 transition-colors">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-stone-300">
                      📷
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      id="logo-upload"
                      className="hidden"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="inline-block bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm uppercase tracking-wider active:scale-95 duration-300"
                    >
                      Cargar Logo
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium block mt-1.5">
                      Formatos admitidos: PNG, JPEG o SVG. Máximo 2MB.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Modalidad y Sedes (REDiseño Completo WOW) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                  Modelo de Negocio
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="10" width="20" height="12" rx="2" ry="2"/>
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M6 22V10"/>
                        <path d="M18 22V10"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-850 text-xs mb-1">Solo en Clínica</h4>
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[150px] mx-auto">
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
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[150px] mx-auto">
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
                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-850 text-xs mb-1">Modelo Híbrido</h4>
                      <p className="text-[9px] text-stone-400 leading-relaxed max-w-[150px] mx-auto">
                        Ofreces cabina física y atención móvil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Sub-Forms with Fade In */}
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
                        placeholder="Calle, número, piso, código postal y ciudad" 
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
                        placeholder="Dirección desde donde arranca la logística de ruta" 
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
            <div className="space-y-6">
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
                        onClick={() => toggleDay(day.val)}
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
                    className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
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
                    className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/20 border border-[#d4af37]/20 flex gap-3 text-stone-600">
                <span className="text-lg">🛎️</span>
                <p className="text-[10px] md:text-xs leading-relaxed font-medium">
                  <strong>Consejo Profesional:</strong> Estos horarios servirán como límite global de tu agenda. Puedes modificarlos, así como añadir descansos o turnos específicos para cada especialista, desde tu panel de Ajustes en cualquier momento.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Aprovisionamiento con IA */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-5 ${
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
                      Si dejas activada esta opción, ProBookia aprovisionará de forma automática 3 servicios premium específicos para el sector de **{selectedSector}** (incluyendo duraciones, precios estándar y descripciones estilizadas) para que puedas comenzar a simular citas y ver tu web pública lista para agendar al instante.
                    </p>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] border border-stone-200/60 rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <h3 className="font-serif italic text-stone-800 text-sm">Tu espacio está casi listo</h3>
                  </div>
                  <p className="text-[10px] md:text-xs text-stone-500 font-medium leading-relaxed">
                    Hemos inyectado una paleta tipográfica y estilística de lujo que coordina perfectamente con tu sector. Tu web de reservas tendrá fuentes de Serif elegantes y espaciados armoniosos que proyectan la máxima sofisticación frente a tus pacientes.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="border-t border-stone-100 pt-6 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1 || loading}
            className={`text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors select-none active:scale-95 ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            Anterior
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-widest active:scale-95 duration-300"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 duration-300"
            >
              {loading ? 'Configurando...' : 'Finalizar Registro'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
