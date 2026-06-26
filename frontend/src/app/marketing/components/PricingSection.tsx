"use client";

import { Check, ChevronRight, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 bg-stone-50/50 border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Suscripciones</span>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
            Planes de Suscripción Flexibles
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
            Elige el nivel perfecto para elevar la gestión y las reservas de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Card 0: Gratuito */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200/50 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="mb-6">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Para Autónomos</span>
                <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Inicial</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-serif font-semibold text-stone-950">0€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ siempre (sin tarjeta)</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">1 especialista único</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Hasta 3 servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('free')}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto border border-stone-200/50"
            >
              <span>Comenzar Gratis</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Card 1: Básico */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200/50 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="mb-6">
                <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Centros Emergentes</span>
                <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Básico</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-serif font-semibold text-stone-950">29€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Hasta 2 especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Hasta 10 servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">TPV POS & Facturación</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center text-[#d4af37]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Copiloto IA (5 acciones/día)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('basic')}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto border border-stone-200/50"
            >
              <span>Comenzar Ahora</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Card 2: Pro */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-600/30 p-8 relative flex flex-col justify-between hover:shadow-xl transition-all duration-300 lg:-translate-y-1">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest">
              Recomendado
            </div>
            <div>
              <div className="mb-6">
                <span className="text-blue-600 font-bold uppercase text-[9px] tracking-widest block mb-1.5">Clínicas en Crecimiento</span>
                <h3 className="text-xl font-serif font-semibold text-stone-900">Plan Pro</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-serif font-semibold text-stone-950">59€</span>
                  <span className="text-stone-400 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Hasta 5 especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Hasta 25 servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Agenda interactiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Expedientes con firma</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">TPV POS & Facturación</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500/10 flex items-center justify-center text-[#d4af37]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">Copiloto IA (15 acciones/día)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('pro')}
              className="w-full bg-stone-950 hover:bg-stone-900 text-white py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto shadow-md"
            >
              <span>Comenzar Prueba</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Card 3: Gold */}
          <div className="bg-stone-950 text-white rounded-2xl shadow-sm overflow-hidden border border-stone-800 p-8 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div>
              <div className="mb-6">
                <span className="text-[#d4af37] font-bold uppercase text-[9px] tracking-widest block mb-1.5">Rendimiento Máximo & IA</span>
                <h3 className="text-xl font-serif font-semibold">Plan Gold</h3>
                <div className="flex items-baseline mt-3">
                  <span className="text-3xl font-serif font-semibold">99€</span>
                  <span className="text-stone-500 text-xs font-medium ml-1.5">/ mes (excl. IVA)</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Especialistas ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Servicios ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Agenda interactiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Expedientes con firma</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[#d4af37]">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">POS & Facturación Deluxe</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500/10 rounded-full flex items-center justify-center text-[#d4af37]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">Copiloto IA (Ilimitado)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500/10 rounded-full flex items-center justify-center text-[#d4af37]">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold text-[#d4af37]">Acceso Co-piloto Voz IA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('gold')}
              className="w-full bg-white hover:bg-stone-100 text-stone-950 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 mt-auto shadow-md"
            >
              <span>Comenzar Ahora</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
