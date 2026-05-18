import Link from 'next/link';
import { Calendar, Shield, FileText, CreditCard, Sparkles, ChevronRight, Check } from 'lucide-react';

export const metadata = {
  title: 'Clínica Mercè SaaS - Software de Gestión para Clínicas de Estética Premium',
  description: 'Eleva la experiencia de tu clínica estética. Gestión de agenda, expedientes médicos, consentimientos digitales y facturación con diseño Quiet Luxury.',
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937] font-sans selection:bg-[#d4af37]/30 overflow-x-hidden">
      
      {/* 1. STICKY GLASSMORPHISM HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-[#1F2937]/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif tracking-widest text-[#1F2937]">
              CLÍNICA MERCÈ <span className="text-[#d4af37] font-sans text-xs font-black tracking-widest uppercase ml-1">SaaS</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#1F2937]/80">
            <a href="#features" className="hover:text-[#d4af37] transition-colors">Características</a>
            <a href="#bento" className="hover:text-[#d4af37] transition-colors">Filosofía</a>
            <a href="#pricing" className="hover:text-[#d4af37] transition-colors">Planes Premium</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#1F2937]/80 hover:text-[#d4af37] transition-colors"
            >
              Iniciar Sesión
            </Link>
            <a 
              href="#pricing" 
              className="bg-[#1F2937] hover:bg-[#d4af37] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-300 hover:scale-105"
            >
              Comenzar Ahora
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white to-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 bg-[#fcf8e5] text-[#b08e23] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-sm border border-yellow-100/50">
            <Sparkles className="w-3.5 h-3.5" /> El Nuevo Estándar de Gestión para Clínicas Médicas
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-extrabold text-[#1F2937] tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8">
            La elegancia de la alta estética <br className="hidden md:block"/> traducida en un <span className="text-[#d4af37]">SaaS de Lujo</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Diseñado exclusivamente para clínicas estéticas independientes y centros de bienestar de alto nivel. Agendas fluidas, expedientes médicos seguros, consentimiento digital inteligente y facturación integrada en una experiencia borderless sublime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#pricing" 
              className="w-full sm:w-auto bg-[#d4af37] hover:bg-[#1F2937] text-white px-8 py-4 rounded-xl text-base font-bold shadow-luxury transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Iniciar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
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

            <Link
              href="/reservar" // Se conectará a Stripe Checkout en la Fase 3
              className="w-full bg-[#d4af37] hover:bg-[#1F2937] text-white py-4 rounded-xl text-base font-bold shadow-luxury transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Comenzar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#1F2937] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12 mb-12">
          <div>
            <span className="text-xl font-serif tracking-widest text-white block mb-2">CLÍNICA MERCÈ SaaS</span>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              La plataforma definitiva para elevar la gestión operativa y estética de las clínicas más selectas del mundo.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-stone-400">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-white transition-colors">Soporte VIP</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-500 font-semibold">
          &copy; {new Date().getFullYear()} Clínica Mercè. Todos los derechos reservados. Estándares SaaS Quiet Luxury 2026.
        </div>
      </footer>

    </div>
  );
}
