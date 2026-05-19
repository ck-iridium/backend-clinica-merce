"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Shield, FileText, CreditCard, Sparkles, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_slug: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tenant_slug') {
      // Limpiar el slug para que solo admita minúsculas, números y guiones
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
    
    // Validaciones básicas
    if (!formData.tenant_name || !formData.tenant_slug || !formData.admin_name || !formData.admin_email || !formData.admin_password) {
      toast.error('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    if (formData.tenant_slug.length < 2) {
      toast.error('El subdominio debe tener al menos 2 caracteres.');
      return;
    }

    if (formData.admin_password.length < 6) {
      toast.error('La contraseña del administrador debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Verificando disponibilidad e iniciando pasarela...');

    try {
      const response = await fetch(`${API_URL}/stripe/create-onboarding-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al iniciar la sesión de onboarding.');
      }

      const data = await response.json();
      toast.success('¡Todo listo! Redirigiendo a la pasarela de pago seguro...', { id: loadingToast });
      
      // Redirigir a la pasarela de Stripe Checkout
      setTimeout(() => {
        window.location.href = data.url;
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor. Inténtalo de nuevo.', { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937] font-sans selection:bg-[#d4af37]/30 overflow-x-hidden relative">
      
      {/* 1. STICKY GLASSMORPHISM HEADER (CORPO EXCLUSIVO) */}
      <header className="sticky top-0 z-40 w-full bg-[#F7F7F5]/80 backdrop-blur-md border-b border-[#1F2937]/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl font-serif tracking-widest text-[#1F2937] font-bold">
              PROBOOKIA <span className="text-[#d4af37] font-sans text-xs font-black tracking-widest uppercase ml-1">SaaS</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-white text-[#1F2937] border border-stone-200 shadow-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 active:scale-95"
            >
              Acceso Centros
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F2937] hover:bg-[#d4af37] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-28 bg-gradient-to-b from-white to-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 bg-[#fcf8e5] text-[#b08e23] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-sm border border-yellow-100/50 font-sans">
            <Sparkles className="w-3.5 h-3.5" /> El Nuevo Estándar de Gestión para Centros y Negocios de Lujo
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-extrabold text-[#1F2937] tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8">
            La elegancia de tu negocio <br className="hidden md:block"/> traducida en un <span className="text-[#d4af37]">SaaS de Lujo</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed font-sans">
            Diseñado exclusivamente para centros de estética, spas, salones de belleza y barberías premium independientes. Agendas fluidas, expedientes personalizados seguros, consentimiento digital inteligente y facturación integrada en una experiencia borderless sublime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-[#d4af37] hover:bg-[#1F2937] text-white px-8 py-4 rounded-xl text-base font-bold shadow-luxury transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
            >
              Comenzar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-white border border-[#1F2937]/10 hover:border-[#d4af37] hover:text-[#d4af37] text-[#1F2937] px-8 py-4 rounded-xl text-base font-bold shadow-sm transition-all duration-300 flex items-center justify-center"
            >
              Explorar Características
            </a>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID - MULTI-TENANT FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1F2937] tracking-tight">
              Diseño Borderless. Ingeniería Robusta.
            </h2>
            <p className="text-[#1F2937]/60 text-lg mt-4 max-w-2xl mx-auto font-medium">
              Estructura asimétrica diseñada para optimizar los procesos críticos de tu negocio con máxima simplicidad visual.
            </p>
          </div>

          {/* ASYMMETRIC BENTO GRID */}
          <div id="bento" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Bento Card 1: Agenda */}
            <div className="md:col-span-2 bg-[#F7F7F5] rounded-3xl p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative group min-h-[350px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#d4af37]/10 to-transparent rounded-bl-[16rem] group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#d4af37] mb-8 relative z-10">
                <Calendar className="w-6 h-6" />
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1F2937] mb-3">
                  Agenda Inteligente de Alta Ocupación
                </h3>
                <p className="text-stone-500 font-medium leading-relaxed max-w-xl">
                  Optimiza los turnos de especialistas y salas en tiempo real. Visualización en columnas dinámicas con transiciones fluidas y sincronización de citas instantánea para evitar tiempos muertos.
                </p>
              </div>
            </div>

            {/* Bento Card 2: Security (RBAC) */}
            <div className="bg-[#1F2937] text-white rounded-3xl p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative group min-h-[350px] flex flex-col justify-between">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#d4af37]/20 to-transparent rounded-tl-[12rem] pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#d4af37] mb-8 relative z-10">
                <Shield className="w-6 h-6" />
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  Seguridad Médica & RBAC
                </h3>
                <p className="text-stone-300 font-medium leading-relaxed">
                  Control de Acceso basado en Roles (RBAC). El personal médico accede a historiales, administración vende bonos y especialistas registran observaciones en estricta confidencialidad bajo estándares RGPD.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Invoicing / POS */}
            <div className="bg-[#1F2937] text-white rounded-3xl p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative group min-h-[350px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[12rem] pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#d4af37] mb-8 relative z-10">
                <CreditCard className="w-6 h-6" />
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  Facturación Express & POS
                </h3>
                <p className="text-stone-300 font-medium leading-relaxed">
                  Pasarela de cobro rápida integrada. Generación de presupuestos deluxe en PDF, conversión instantánea a factura y cobro de bonos/vouchers de manera simplificada en recepción.
                </p>
              </div>
            </div>

            {/* Bento Card 4: Fichas Clínicas */}
            <div className="md:col-span-2 bg-[#F7F7F5] rounded-3xl p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative group min-h-[350px] flex flex-col justify-between">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#d4af37]/5 to-transparent rounded-tr-[16rem] group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#d4af37] mb-8 relative z-10">
                <FileText className="w-6 h-6" />
              </div>
              
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1F2937] mb-3">
                  Expediente Clínico & Consentimientos
                </h3>
                <p className="text-stone-500 font-medium leading-relaxed max-w-xl">
                  Firma digital de consentimientos informados integrada en tablet o móvil. Registro cronológico de tratamientos, galería fotográfica evolutiva (antes/después) y alarmas médicas inteligentes.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION - STRIPE INTEGRATION */}
      <section id="pricing" className="py-24 bg-[#F7F7F5] border-t border-[#1F2937]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-[#1F2937] tracking-tight">
              Suscripción Platinum Todo Incluido
            </h2>
            <p className="text-stone-500 text-lg mt-4 max-w-2xl mx-auto font-medium">
              Accede a la plataforma líder de gestión estética sin sorpresas ni costes ocultos.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-luxury overflow-hidden border border-[#d4af37]/20 p-8 md:p-12 relative animate-in zoom-in duration-500">
            <div className="absolute top-0 right-0 bg-[#d4af37] text-white px-5 py-1.5 rounded-bl-2xl text-xs font-black uppercase tracking-widest">
              Recomendado
            </div>
            
            <div className="mb-8">
              <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest block mb-2">Plan Clínico Total</span>
              <h3 className="text-3xl font-serif font-bold text-[#1F2937]">Plan Platinum</h3>
              <div className="flex items-baseline mt-4">
                <span className="text-5xl font-serif font-extrabold text-[#1F2937]">99€</span>
                <span className="text-stone-400 text-sm font-semibold ml-2">/ mes (IVA excl.)</span>
              </div>
              <p className="text-stone-400 text-sm mt-2 font-medium">Prueba gratuita de 14 días. Cancela cuando quieras.</p>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-stone-600">Pacientes ilimitados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-stone-600">Agenda médica interactiva</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-stone-600">Módulo POS y Presupuestos Deluxe</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-stone-600">Consentimiento informado digital</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-stone-600">Multi-usuario (RBAC ilimitado)</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#d4af37] hover:bg-[#1F2937] text-white py-4 rounded-xl text-base font-bold shadow-luxury transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
            >
              Comenzar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#1F2937] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12 mb-12">
          <div>
            <span className="text-xl font-serif tracking-widest text-white block mb-2">PROBOOKIA SaaS</span>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              La plataforma definitiva para elevar la gestión de citas, reservas y clientes de los centros y negocios más selectos.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-stone-400">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-white transition-colors">Soporte VIP</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-500 font-semibold">
          &copy; {new Date().getFullYear()} Probookia. Todos los derechos reservados. Estándares SaaS Quiet Luxury 2026.
        </div>
      </footer>

      {/* 6. ONBOARDING REGISTRATION MODAL (QUIET LUXURY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#F7F7F5] w-full max-w-lg rounded-[2rem] shadow-luxury border border-stone-200/50 p-8 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            
            {/* Botón de cerrar */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-950 transition-colors shadow-sm active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] block mb-2">Registro Premium</span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 leading-tight">Configura tu Negocio</h2>
              <p className="text-stone-500 text-sm mt-2 leading-relaxed">
                Rellena la información inicial para crear tu base de datos y comenzar tu prueba gratuita de 14 días.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              
              {/* Sección Clínica */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-200/40">Datos del Centro / Negocio</h3>
                
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Nombre Comercial</label>
                  <input 
                    type="text" 
                    name="tenant_name"
                    required
                    placeholder="Ej. Salón Jade, Barbería Luxury, Spazio Wellness"
                    value={formData.tenant_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Subdominio deseado</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="tenant_slug"
                      required
                      placeholder="ej-salon-jade"
                      value={formData.tenant_slug}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-32 py-3.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 font-sans pointer-events-none">
                      .probookia.com
                    </span>
                  </div>
                  {formData.tenant_slug && (
                    <span className="block text-xxs text-[#d4af37] mt-2 font-semibold tracking-wide">
                      Dirección de acceso: <span className="font-mono text-stone-600 font-bold">https://{formData.tenant_slug}.probookia.com</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Sección Administrador */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400 pb-1 border-b border-stone-200/40">Cuenta del Administrador</h3>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    name="admin_name"
                    required
                    placeholder="Ej. Dra. Sofía Valenzuela o Juan Pérez"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="admin_email"
                    required
                    placeholder="contacto@salonjade.com"
                    value={formData.admin_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">Contraseña de acceso</label>
                  <input 
                    type="password" 
                    name="admin_password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.admin_password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-white font-bold py-4 rounded-xl shadow-luxury hover:bg-[#1F2937] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando con Stripe...
                  </>
                ) : (
                  <>
                    Ir al Pago Seguro <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
