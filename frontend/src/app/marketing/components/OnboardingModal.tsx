"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  Check, 
  Sparkles, 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  selectedInterval?: 'monthly' | 'yearly';
  apiUrl: string;
}

const PLANS_DATA: Record<string, {
  name: string;
  badge: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyEquiv: string;
  savings: number;
  highlight: string;
}> = {
  individual: {
    name: 'Plan Individual',
    badge: 'Autónomos & Gabinetes',
    monthlyPrice: 39,
    yearlyPrice: 390,
    monthlyEquiv: '32,50€',
    savings: 78,
    highlight: '1 especialista, agenda, firma LOPD y bonos.',
  },
  pro: {
    name: 'Plan Pro Todo-en-Uno',
    badge: 'Clínicas con Equipo • Más Elegido',
    monthlyPrice: 69,
    yearlyPrice: 690,
    monthlyEquiv: '57,50€',
    savings: 138,
    highlight: 'Hasta 4 miembros, 2 sedes, facturación oficial e IVA y web CMS.',
  },
  elite: {
    name: 'Plan Elite',
    badge: 'Multisede & Rendimiento Máximo',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    monthlyEquiv: '107,50€',
    savings: 258,
    highlight: 'Hasta 10 miembros, 5 sedes, IA Webmaster e IA Concierge 24/7.',
  },
};

const normalizePlan = (p: string): 'individual' | 'pro' | 'elite' => {
  const lower = (p || 'pro').toLowerCase().trim();
  if (lower === 'basic' || lower === 'individual') return 'individual';
  if (lower === 'gold' || lower === 'elite') return 'elite';
  return 'pro';
};

export default function OnboardingModal({
  isOpen,
  onClose,
  selectedPlan,
  selectedInterval = 'monthly',
  apiUrl
}: OnboardingModalProps) {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<'individual' | 'pro' | 'elite'>('pro');
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [showPassword, setShowPassword] = useState(false);

  // Sincronizar plan e intervalo cuando el modal se abre desde el exterior
  useEffect(() => {
    if (selectedPlan) {
      setActivePlan(normalizePlan(selectedPlan));
    }
  }, [selectedPlan, isOpen]);

  useEffect(() => {
    if (selectedInterval) {
      setInterval(selectedInterval);
    }
  }, [selectedInterval, isOpen]);

  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_slug: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [errors, setErrors] = useState({
    tenant_name: '',
    tenant_slug: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    general: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limpiar errores reactivamente al empezar a escribir
    setErrors(prev => ({ ...prev, [name]: '', general: '' }));

    if (name === 'tenant_slug') {
      const cleanSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, [name]: cleanSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({
      tenant_name: '',
      tenant_slug: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      general: ''
    });

    let hasLocalErrors = false;
    const newErrors = {
      tenant_name: '',
      tenant_slug: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      general: ''
    };

    if (!formData.tenant_name.trim()) {
      newErrors.tenant_name = 'El nombre de la clínica o centro es obligatorio.';
      hasLocalErrors = true;
    }
    if (!formData.tenant_slug.trim()) {
      newErrors.tenant_slug = 'El subdominio web es obligatorio.';
      hasLocalErrors = true;
    } else if (formData.tenant_slug.length < 2) {
      newErrors.tenant_slug = 'El subdominio debe tener al menos 2 caracteres.';
      hasLocalErrors = true;
    }
    if (!formData.admin_name.trim()) {
      newErrors.admin_name = 'El nombre del director o responsable es obligatorio.';
      hasLocalErrors = true;
    }
    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'El email corporativo es obligatorio.';
      hasLocalErrors = true;
    }
    if (!formData.admin_password) {
      newErrors.admin_password = 'La contraseña es obligatoria.';
      hasLocalErrors = true;
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'La contraseña debe tener al menos 6 caracteres.';
      hasLocalErrors = true;
    }

    if (hasLocalErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creando base de datos segura y conectando con Stripe...');

    try {
      const emailValue = formData.admin_email.trim();
      const response = await fetch(`${apiUrl}/stripe/create-onboarding-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          admin_email: emailValue,
          email: emailValue,
          plan: activePlan,
          plan_type: activePlan,
          interval: interval || 'monthly',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorDetail = errData.detail || 'Error al iniciar la sesión de onboarding.';
        const errLower = errorDetail.toLowerCase();

        // Asignar el error al input correspondiente
        if (errLower.includes('subdominio') || errLower.includes('subdomain') || errLower.includes('slug')) {
          setErrors(prev => ({ ...prev, tenant_slug: errorDetail }));
        } else if (errLower.includes('correo') || errLower.includes('email') || errLower.includes('usuario') || errLower.includes('user')) {
          setErrors(prev => ({ ...prev, admin_email: errorDetail }));
        } else {
          setErrors(prev => ({ ...prev, general: errorDetail }));
        }

        throw new Error(errorDetail);
      }

      const data = await response.json();
      toast.success('¡Entorno reservado! Redirigiendo a la pasarela segura...', { id: loadingToast });
      
      setTimeout(() => {
        window.location.href = data.url;
      }, 700);

    } catch (err: any) {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentPlanData = PLANS_DATA[activePlan] || PLANS_DATA.pro;

  // Fecha estimada en 14 días para el mensaje de tranquilidad
  const trialEndString = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#FAF9F6] w-full max-w-2xl rounded-2xl md:rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-stone-200/90 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[96vh] flex flex-col">
        
        {/* Halo ambiental dorado sutil */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-stone-200/80 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-all shadow-2xs active:scale-95 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenido con Scroll si fuera necesario en pantallas ultrabajas */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto relative z-10 space-y-3 md:space-y-3.5">
          
          {/* 1. Cabecera Editorial Compacta */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#916f19] text-[9.5px] font-black uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
              <span>Prueba Gratuita de 14 Días • 0€ Hoy</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-950 tracking-tight">
              Activa tu Entorno en {currentPlanData.name}
            </h2>
            <p className="text-stone-500 text-xs mt-0.5 leading-snug font-sans">
              Base de datos aislada con cifrado de grado médico. 14 días para probar sin coste y con cancelación en 1 clic.
            </p>
          </div>

          {/* 2. Selector de Plan (Individual / Pro / Elite) en 1 fila compacta */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/70 rounded-xl border border-stone-300/60">
            {[
              { id: 'individual', label: 'Individual', price: '39€' },
              { id: 'pro', label: 'Plan Pro', price: '69€', popular: true },
              { id: 'elite', label: 'Plan Elite', price: '129€' },
            ].map((p) => {
              const isSelected = activePlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePlan(p.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-stone-950 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-white/40'
                  }`}
                >
                  <span>{p.label}</span>
                  {p.popular && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  )}
                  <span className={`text-[10px] hidden sm:inline ${isSelected ? 'text-[#916f19] font-bold' : 'text-stone-400'}`}>
                    ({p.price})
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Conmutador de Ciclo: Botones Cuadrados con Precio en Medio */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Botón 1: Mensual */}
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`p-3 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer group ${
                interval === 'monthly'
                  ? 'bg-white border-[#d4af37] shadow-sm ring-1 ring-[#d4af37]'
                  : 'bg-white/70 border-stone-200/90 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Mensual
                </span>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  interval === 'monthly'
                    ? 'border-[#d4af37] bg-[#d4af37] text-stone-950'
                    : 'border-stone-300'
                }`}>
                  {interval === 'monthly' && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
              </div>

              <div className="my-1 text-center py-1 bg-stone-50/90 rounded-lg border border-stone-100">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-serif font-black text-stone-950 tracking-tight">
                    {currentPlanData.monthlyPrice}€
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">/ mes</span>
                </div>
                <span className="text-[9px] text-stone-400 font-semibold block">
                  (+IVA) • Sin permanencia
                </span>
              </div>

              <p className="text-[10px] text-stone-500 font-medium leading-tight">
                Facturación mes a mes. Cancela cuando quieras.
              </p>
            </button>

            {/* Botón 2: Anual (DESTACADO / LLAMATIVO) */}
            <button
              type="button"
              onClick={() => setInterval('yearly')}
              className={`p-3 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer group ${
                interval === 'yearly'
                  ? 'bg-gradient-to-b from-[#d4af37]/10 via-white to-white border-[#d4af37] shadow-md ring-1 ring-[#d4af37]'
                  : 'bg-white/70 border-stone-200/90 hover:border-[#d4af37]/60 hover:bg-white'
              }`}
            >
              {/* Badge Flotante de Ahorro */}
              <div className="absolute -top-2 right-2 bg-[#d4af37] text-stone-950 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <Sparkles className="w-2 h-2" />
                <span>2 Meses Gratis</span>
              </div>

              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#916f19]">
                  Anual • Ahorro
                </span>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  interval === 'yearly'
                    ? 'border-[#d4af37] bg-[#d4af37] text-stone-950'
                    : 'border-stone-300'
                }`}>
                  {interval === 'yearly' && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
              </div>

              <div className="my-1 text-center py-1 bg-[#d4af37]/10 rounded-lg border border-[#d4af37]/25">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-serif font-black text-stone-950 tracking-tight">
                    {currentPlanData.yearlyPrice}€
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">/ año</span>
                </div>
                <span className="text-[9.5px] text-[#8c6b12] font-black block">
                  Equivale a solo {currentPlanData.monthlyEquiv}/mes
                </span>
              </div>

              <p className="text-[10px] text-stone-600 font-medium leading-tight">
                Ahorras <strong className="text-stone-950 font-bold">{currentPlanData.savings}€</strong> en tu cuota anual.
              </p>
            </button>

          </div>

          {/* 4. Formulario de Datos: Cuadrícula Compacta de 2 Columnas */}
          <form onSubmit={handleOnboardingSubmit} className="space-y-2.5 pt-0.5">
            
            <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs space-y-2.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Nombre de la Clínica */}
                <div>
                  <label className="block text-[10.5px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#d4af37]" />
                    <span>Nombre del Centro</span>
                  </label>
                  <input 
                    type="text" 
                    name="tenant_name"
                    required
                    placeholder="Ej. Clínica Mercè"
                    value={formData.tenant_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 bg-stone-50/70 rounded-xl border text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all ${
                      errors.tenant_name ? 'border-red-400' : 'border-stone-200/90'
                    }`}
                  />
                  {errors.tenant_name && (
                    <span className="block text-[9.5px] text-red-600 mt-0.5 font-bold">
                      ⚠️ {errors.tenant_name}
                    </span>
                  )}
                </div>

                {/* Subdominio Web */}
                <div>
                  <label className="block text-[10.5px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#d4af37]" />
                    <span>Subdominio Web</span>
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      name="tenant_slug"
                      required
                      placeholder="clinica-merce"
                      value={formData.tenant_slug}
                      onChange={handleInputChange}
                      className={`w-full pl-3 pr-24 py-1.5 bg-stone-50/70 rounded-xl border text-xs font-mono font-bold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all ${
                        errors.tenant_slug ? 'border-red-400' : 'border-stone-200/90'
                      }`}
                    />
                    <span className="absolute right-2.5 text-[10px] font-bold text-stone-400 pointer-events-none font-sans">
                      .probookia.com
                    </span>
                  </div>
                  {errors.tenant_slug && (
                    <span className="block text-[9.5px] text-red-600 mt-0.5 font-bold">
                      ⚠️ {errors.tenant_slug}
                    </span>
                  )}
                </div>

                {/* Nombre del Director */}
                <div>
                  <label className="block text-[10.5px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#d4af37]" />
                    <span>Director / Responsable</span>
                  </label>
                  <input 
                    type="text" 
                    name="admin_name"
                    required
                    placeholder="Ej. Dra. Sofía Valenzuela"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 bg-stone-50/70 rounded-xl border text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all ${
                      errors.admin_name ? 'border-red-400' : 'border-stone-200/90'
                    }`}
                  />
                  {errors.admin_name && (
                    <span className="block text-[9.5px] text-red-600 mt-0.5 font-bold">
                      ⚠️ {errors.admin_name}
                    </span>
                  )}
                </div>

                {/* Email Corporativo */}
                <div>
                  <label className="block text-[10.5px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#d4af37]" />
                    <span>Email Corporativo</span>
                  </label>
                  <input 
                    type="email" 
                    name="admin_email"
                    required
                    placeholder="directiva@clinicamerce.com"
                    value={formData.admin_email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 bg-stone-50/70 rounded-xl border text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all ${
                      errors.admin_email ? 'border-red-400' : 'border-stone-200/90'
                    }`}
                  />
                  {errors.admin_email && (
                    <span className="block text-[9.5px] text-red-600 mt-0.5 font-bold">
                      ⚠️ {errors.admin_email}
                    </span>
                  )}
                </div>

              </div>

              {/* Contraseña Maestra (Fila completa integrada) */}
              <div>
                <label className="block text-[10.5px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#d4af37]" />
                  <span>Contraseña Maestra</span>
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="admin_password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.admin_password}
                    onChange={handleInputChange}
                    className={`w-full pl-3 pr-10 py-1.5 bg-stone-50/70 rounded-xl border text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all ${
                      errors.admin_password ? 'border-red-400' : 'border-stone-200/90'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.admin_password && (
                  <span className="block text-[9.5px] text-red-600 mt-0.5 font-bold">
                    ⚠️ {errors.admin_password}
                  </span>
                )}
              </div>

            </div>

            {/* Error General */}
            {errors.general && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-start gap-2 animate-in fade-in">
                <span className="shrink-0">⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}

            {/* Micro-Garantía de Confianza Compacta */}
            <div className="px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200/70 flex items-center justify-between text-[10.5px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span className="font-semibold text-stone-800">14 días de prueba • Cero cargos hoy</span>
              </div>
              <div className="flex items-center gap-1 text-stone-400 font-medium">
                <Lock className="w-3 h-3" />
                <span>Stripe SSL 256-bit</span>
              </div>
            </div>

            {/* Botón Principal CTA */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1C1917] hover:bg-[#2c2724] text-white py-3 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer group border border-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" /> 
                  <span>Conectando con pasarela segura...</span>
                </>
              ) : (
                <>
                  <span>Comenzar Prueba Gratuita (14 Días)</span> 
                  <ArrowRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Mensaje de tranquilidad bajo el botón */}
            <p className="text-[9.5px] text-center text-stone-500 font-medium px-2 leading-tight">
              <strong>0,00 € a pagar hoy.</strong> Primer cobro de{' '}
              <strong className="text-stone-900">
                {interval === 'yearly' ? `${currentPlanData.yearlyPrice}€/año` : `${currentPlanData.monthlyPrice}€/mes`}
              </strong>{' '}
              el {trialEndString} solo si decides continuar. Cancela con 1 clic.
            </p>

          </form>

        </div>
      </div>
    </div>
  );
}