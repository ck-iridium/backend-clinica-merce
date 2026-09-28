"use client";

import { Check, ChevronRight, Sparkles, Star } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-28 bg-[#FAF9F6] border-t border-stone-200/60 relative overflow-hidden">
      {/* Halo ambiental dorado de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#b08e23] text-[10px] font-black uppercase tracking-[0.25em] mb-4">
            <Sparkles size={11} className="text-[#D4AF37]" />
            <span>Inversión Transparente</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            Planes de Suscripción Todo-en-Uno
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-4 font-medium leading-relaxed">
            Sin costes ocultos ni comisiones por paciente nuevo. Elige la escala perfecta para proyectar la elegancia de tu clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 max-w-7xl mx-auto items-stretch">
          
          {/* Card 0: Gratuito */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-stone-200/80 p-7 flex flex-col justify-between hover:shadow-md hover:border-stone-300 transition-all duration-300">
            <div>
              <div className="mb-6 pb-6 border-b border-stone-100">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1">Para Comenzar</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">Plan Inicial</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-stone-950">0€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ siempre (sin tarjeta)</span>
                </div>
                <p className="text-xs text-stone-400 mt-2 font-medium">Ideal para autónomos que dan sus primeros pasos.</p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">1 especialista único</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Hasta 3 servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Agenda interactiva básica</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Directorio de pacientes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('free')}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 border border-stone-200/80"
            >
              <span>Comenzar Gratis</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Card 1: Básico */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-stone-200/80 p-7 flex flex-col justify-between hover:shadow-md hover:border-stone-300 transition-all duration-300">
            <div>
              <div className="mb-6 pb-6 border-b border-stone-100">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1">Centros Emergentes</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">Plan Básico</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-stone-950">29€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (+IVA)</span>
                </div>
                <p className="text-xs text-stone-400 mt-2 font-medium">Operativa ágil para gabinetes y pequeños centros.</p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Hasta 2 especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Hasta 10 servicios en catálogo</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Agenda interactiva & turnos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Caja rápida & Facturación</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/15 text-[#bf9b30] flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Copiloto IA (5 consultas/día)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('basic')}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 border border-stone-200/80"
            >
              <span>Comenzar Ahora</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Card 2: Pro (RECOMENDADO / LUXURY HIGHLIGHT) */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-[#D4AF37] p-7 relative flex flex-col justify-between lg:-translate-y-2 ring-4 ring-[#D4AF37]/10 transition-all duration-300">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#D4AF37] to-[#bf9b30] text-stone-950 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
              <Star size={10} className="fill-stone-950 text-stone-950" />
              <span>Más Elegido</span>
            </div>

            <div>
              <div className="mb-6 pb-6 border-b border-stone-100">
                <span className="text-[#bf9b30] font-bold uppercase text-[9px] tracking-widest block mb-1">Clínicas Selectas</span>
                <h3 className="text-2xl font-serif font-bold text-stone-950">Plan Pro Todo-en-Uno</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-stone-950">69€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (+IVA)</span>
                </div>
                <p className="text-xs text-stone-500 mt-2 font-medium">Reemplaza 5 herramientas. Ahorra más de 180€ al mes.</p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">Especialistas ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">Motor de reservas 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#b08e23] flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-[#997715]">Fianza anti-plantones Stripe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Expedientes con firma digital LOPD</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">Dominio propio o subdominio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">TPV POS, Facturación & Bonos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#b08e23] flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800">Copiloto IA (15 consultas/día)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('pro')}
              className="w-full bg-stone-900 hover:bg-stone-950 text-white py-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-md group border border-[#D4AF37]/40"
            >
              <span>Comenzar Prueba Gratuita</span>
              <ChevronRight size={13} className="text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 3: Gold (DARK LUXURY ELITE) */}
          <div className="bg-[#1C1917] text-white rounded-3xl shadow-xl border border-stone-800 p-7 flex flex-col justify-between hover:border-stone-700 transition-all duration-300">
            <div>
              <div className="mb-6 pb-6 border-b border-stone-800/80">
                <span className="text-[#D4AF37] font-bold uppercase text-[9px] tracking-widest block mb-1">Rendimiento Máximo</span>
                <h3 className="text-xl font-serif font-bold text-white">Plan Gold Elite</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-4xl font-serif font-bold text-white">149€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (+IVA)</span>
                </div>
                <p className="text-xs text-stone-400 mt-2 font-medium">Para franquicias, grupos y clínicas multisede de prestigio.</p>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Multisede incluida</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Especialistas & Servicios ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Motor de reservas + Fianza Stripe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Marca blanca total 100% invisible</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37]">Copiloto IA Ilimitado (Texto + Voz)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Soporte prioritario VIP 24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('gold')}
              className="w-full bg-white hover:bg-stone-100 text-stone-950 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-md"
            >
              <span>Solicitar Plan Elite</span>
              <ChevronRight size={13} />
            </button>
          </div>

        </div>

        {/* Garantías y Trust bar */}
        <div className="mt-16 pt-8 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>Sin permanencia obligatoria</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>Migración gratuita de tus datos y citas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>Aislamiento de datos con RLS bancario (RGPD)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
