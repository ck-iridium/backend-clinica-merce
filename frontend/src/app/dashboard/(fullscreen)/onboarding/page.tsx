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
  { label: 'L', val: 1 },
  { label: 'M', val: 2 },
  { label: 'X', val: 3 },
  { label: 'J', val: 4 },
  { label: 'V', val: 5 },
  { label: 'S', val: 6 },
  { label: 'D', val: 7 }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [clinicName, setClinicName] = useState('');
  const [selectedSector, setSelectedSector] = useState('Estética y Bienestar');
  const [logoB64, setLogoB64] = useState<string | null>(null);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loadDemoData, setLoadDemoData] = useState(true);

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

  const handleComplete = async () => {
    if (!clinicName.trim()) {
      showFeedback({
        type: 'error',
        title: 'Falta información',
        message: 'Por favor, introduce el nombre comercial de tu clínica.'
      });
      return;
    }

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
          load_demo_data: loadDemoData
        })
      });

      if (res.ok) {
        showFeedback({
          type: 'success',
          title: '¡Registro Completado!',
          message: 'Tu clínica ha sido configurada con éxito. Redirigiendo a tu agenda...'
        });
        
        // Esperar brevemente y redirigir
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
        title: 'Error',
        message: 'Ocurrió un problema al configurar tu cuenta. Inténtalo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F7F5] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
      
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-stone-100 flex flex-col justify-between min-h-[500px]">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">
              Configuración Inicial
            </span>
            <span className="text-stone-300 text-xs">•</span>
            <span className="text-stone-400 text-xs font-bold font-sans">
              Paso {step} de 3
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step 
                    ? 'w-6 bg-[#d4af37]' 
                    : s < step 
                    ? 'w-2 bg-stone-800' 
                    : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 mb-8">
          
          {/* STEP 1: Identidad */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight leading-none mb-2">
                  Identidad Corporativa
                </h2>
                <p className="text-stone-400 font-sans text-xs">
                  Define el nombre público y sector principal de tu centro.
                </p>
              </div>

              {/* Nombre comercial */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                  Nombre del Centro
                </label>
                <input 
                  type="text" 
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ej. Clínica Mercè"
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-sm font-bold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Selector de sector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                  Sector / Categoría
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SECTORS.map((sector) => {
                    const isSelected = selectedSector === sector.id;
                    return (
                      <div
                        key={sector.id}
                        onClick={() => setSelectedSector(sector.id)}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3 select-none ${
                          isSelected 
                            ? 'bg-amber-50/50 border-[#d4af37] shadow-sm' 
                            : 'bg-stone-50/30 border-stone-100 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{sector.icon}</span>
                        <div>
                          <h4 className="font-bold text-stone-800 text-xs leading-none mb-1">
                            {sector.label}
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

              {/* Logo Picker (opcional) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                  Logotipo Comercial (Opcional)
                </label>
                <div className="flex items-center gap-4">
                  {logoB64 ? (
                    <img src={logoB64} alt="Previsualización" className="h-14 w-14 object-cover rounded-2xl border border-stone-200" />
                  ) : (
                    <div className="h-14 w-14 bg-stone-50 rounded-2xl border border-dashed border-stone-200 flex items-center justify-center text-lg text-stone-300">
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
                      className="inline-block bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border border-stone-200/50 shadow-sm"
                    >
                      Seleccionar Archivo
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium block mt-1">
                      Soporta PNG, JPEG o SVG. Máximo 2MB.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Horarios */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight leading-none mb-2">
                  Horarios y Calendario
                </h2>
                <p className="text-stone-400 font-sans text-xs">
                  Establece los días de atención al público y el rango horario operativo.
                </p>
              </div>

              {/* Días laborales */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                  Días Operativos
                </label>
                <div className="flex items-center justify-between max-w-md">
                  {DAYS.map((day) => {
                    const isSelected = workingDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        onClick={() => toggleDay(day.val)}
                        className={`h-11 w-11 rounded-2xl font-bold text-xs transition-all border flex items-center justify-center select-none ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-[#d4af37] shadow-sm'
                            : 'bg-stone-50 border-stone-100 text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rango de Horas */}
              <div className="grid grid-cols-2 gap-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                    Hora de Apertura
                  </label>
                  <input 
                    type="time" 
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-sm font-bold text-stone-800 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                    Hora de Cierre
                  </label>
                  <input 
                    type="time" 
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-sm font-bold text-stone-800 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Catálogo demo inteligente */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight leading-none mb-2">
                  Aprovisionamiento con IA
                </h2>
                <p className="text-stone-400 font-sans text-xs">
                  Carga servicios inteligentes acordes a tu sector para comenzar con catálogo de muestra.
                </p>
              </div>

              {/* Toggle Inteligente */}
              <div className={`p-6 rounded-3xl border transition-all duration-300 flex items-start gap-4 ${
                loadDemoData 
                  ? 'bg-amber-50/50 border-[#d4af37] shadow-sm' 
                  : 'bg-stone-50/50 border-stone-100'
              }`}>
                <div className="pt-1.5">
                  <input 
                    type="checkbox" 
                    id="demo-data"
                    checked={loadDemoData}
                    onChange={(e) => setLoadDemoData(e.target.checked)}
                    className="h-5 w-5 border-stone-200 rounded text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="demo-data" className="font-bold text-stone-800 text-sm cursor-pointer block select-none">
                    Generar catálogo inicial de {selectedSector}
                  </label>
                  <p className="text-xs text-stone-400 font-medium leading-relaxed mt-2">
                    Si dejas activada esta opción, ProBookia aprovisionará de forma automática 3 servicios premium específicos para el sector de **{selectedSector}** (incluyendo duraciones, precios estándar e imágenes descriptivas) para que puedas comenzar a gestionar citas y previsualizar tu Home sin escribir nada.
                  </p>
                </div>
              </div>

              {/* Info Adicional Premium */}
              <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 flex items-center gap-3">
                <span className="text-xl">✨</span>
                <span className="text-[10px] md:text-xs text-stone-500 font-medium leading-relaxed">
                  <strong>Plan Gold AI Webmaster activo:</strong> Tras completar este registro, podrás interactuar con nuestro Agente IA para rediseñar bloques del CMS o crear tratamientos conversacionalmente.
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="border-t border-stone-100 pt-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1 || loading}
            className={`text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors select-none ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            Anterior
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !clinicName.trim()) {
                  showFeedback({
                    type: 'error',
                    title: 'Nombre requerido',
                    message: 'Introduce el nombre de la clínica para continuar.'
                  });
                  return;
                }
                setStep(prev => prev + 1);
              }}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm uppercase tracking-widest"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Configurando...' : 'Finalizar Registro'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
