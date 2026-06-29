"use client";

import { useState } from 'react';
import { X, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'free' | 'basic' | 'pro' | 'gold';
  apiUrl: string;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  selectedPlan,
  apiUrl
}: OnboardingModalProps) {
  const [loading, setLoading] = useState(false);
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

    if (!formData.tenant_name) {
      newErrors.tenant_name = 'El nombre de la organización es obligatorio.';
      hasLocalErrors = true;
    }
    if (!formData.tenant_slug) {
      newErrors.tenant_slug = 'El subdominio es obligatorio.';
      hasLocalErrors = true;
    } else if (formData.tenant_slug.length < 2) {
      newErrors.tenant_slug = 'El subdominio debe tener al menos 2 caracteres.';
      hasLocalErrors = true;
    }
    if (!formData.admin_name) {
      newErrors.admin_name = 'El nombre del director es obligatorio.';
      hasLocalErrors = true;
    }
    if (!formData.admin_email) {
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
    const isFree = selectedPlan === 'free';
    const loadingMessage = isFree 
      ? 'Creando tu base de datos aislada y cuenta gratuita...'
      : 'Creando base de datos segura y conectando pasarela...';
    
    const loadingToast = toast.loading(loadingMessage);

    try {
      const response = await fetch(`${apiUrl}/stripe/create-onboarding-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plan_type: selectedPlan
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
      
      const successMessage = isFree
        ? '¡Entorno ProBookia inicializado con éxito!'
        : '¡Aprovisionamiento listo! Redirigiendo a Stripe...';
        
      toast.success(successMessage, { id: loadingToast });
      
      setTimeout(() => {
        window.location.href = data.url;
      }, 1000);

    } catch (err: any) {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200/50 p-8 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors shadow-sm active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block mb-2">
            {selectedPlan === 'free' ? 'Plan Inicial' : 'Registro de Cliente B2B'}
          </span>
          <h2 className="text-2.5xl font-serif font-semibold text-stone-900 leading-tight">
            {selectedPlan === 'free' && 'Configura tu Entorno de Citas'}
            {selectedPlan === 'basic' && 'Inicializa tu Plan Básico'}
            {selectedPlan === 'pro' && 'Inicializa tu Plan Pro'}
            {selectedPlan === 'gold' && 'Inicializa tu Plan Gold'}
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-2 leading-relaxed font-medium">
            {selectedPlan === 'free' 
              ? 'Aprovisiona tu base de datos dedicada y comienza con el Plan Inicial (1 especialista, 3 servicios) sin compromisos.'
              : `Aprovisiona tu entorno de seguridad dedicado. Incluye una prueba gratuita de 14 días en el Plan ${selectedPlan.toUpperCase()}.`
            }
          </p>
        </div>

        <form onSubmit={handleOnboardingSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-100">Datos de la Organización</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre de la Clínica o Centro</label>
              <input 
                type="text" 
                name="tenant_name"
                required
                placeholder="Ej. Clínica Mercè, Spazio Estético, Barbería Jade"
                value={formData.tenant_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs font-semibold text-stone-700 ${
                  errors.tenant_name
                    ? 'border-red-300 focus:ring-red-600/10 focus:border-red-600'
                    : 'border-stone-200 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {errors.tenant_name && (
                <span className="block text-[10px] text-red-600 mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errors.tenant_name}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Subdominio Dedicado</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="tenant_slug"
                  required
                  placeholder="clinica-merce"
                  value={formData.tenant_slug}
                  onChange={handleInputChange}
                  className={`w-full pl-4 pr-32 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs font-mono text-stone-700 font-semibold ${
                    errors.tenant_slug
                      ? 'border-red-300 focus:ring-red-600/10 focus:border-red-600'
                      : 'border-stone-200 focus:ring-blue-600/20 focus:border-blue-600'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 font-sans pointer-events-none">
                  .probookia.com
                </span>
              </div>
              {errors.tenant_slug ? (
                <span className="block text-[10px] text-red-600 mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errors.tenant_slug}
                </span>
              ) : (
                formData.tenant_slug && (
                  <span className="block text-[9px] text-blue-600 mt-2 font-black tracking-wide">
                    Dirección única: <span className="font-mono text-stone-600 font-bold">https://{formData.tenant_slug}.probookia.com</span>
                  </span>
                )
              )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-100">Cuenta de Administrador Principal</h3>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Nombre del Director</label>
              <input 
                type="text" 
                name="admin_name"
                required
                placeholder="Ej. Sofía Valenzuela"
                value={formData.admin_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs font-semibold text-stone-700 ${
                  errors.admin_name
                    ? 'border-red-300 focus:ring-red-600/10 focus:border-red-600'
                    : 'border-stone-200 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {errors.admin_name && (
                <span className="block text-[10px] text-red-600 mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errors.admin_name}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Email Corporativo</label>
              <input 
                type="email" 
                name="admin_email"
                required
                placeholder="directiva@clinicamerce.com"
                value={formData.admin_email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs font-semibold text-stone-700 ${
                  errors.admin_email
                    ? 'border-red-300 focus:ring-red-600/10 focus:border-red-600'
                    : 'border-stone-200 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {errors.admin_email && (
                <span className="block text-[10px] text-red-600 mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errors.admin_email}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Contraseña del Sistema</label>
              <input 
                type="password" 
                name="admin_password"
                required
                placeholder="Mínimo 6 caracteres"
                value={formData.admin_password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs font-semibold text-stone-700 ${
                  errors.admin_password
                    ? 'border-red-300 focus:ring-red-600/10 focus:border-red-600'
                    : 'border-stone-200 focus:ring-blue-600/20 focus:border-blue-600'
                }`}
              />
              {errors.admin_password && (
                <span className="block text-[10px] text-red-600 mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errors.admin_password}
                </span>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xxs font-bold text-red-600 tracking-wide flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 leading-normal">
              <span className="mt-0.5">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {selectedPlan === 'free' ? 'Configurando base de datos...' : 'Redirigiendo a pasarela...'}
              </>
            ) : (
              <>
                <span>{selectedPlan === 'free' ? 'Inicializar Cuenta Gratis' : 'Aprovisionar Entorno y Pagar'}</span> 
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
