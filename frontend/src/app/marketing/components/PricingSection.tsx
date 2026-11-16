"use client";

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from './pricing/pricingData';
import { PricingCard } from './pricing/PricingCard';
import { PricingComparisonTable } from './pricing/PricingComparisonTable';

interface PricingSectionProps {
  onSelectPlan: (plan: 'individual' | 'pro' | 'elite' | 'basic' | 'gold' | 'free', interval?: 'monthly' | 'yearly') => void;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export default function PricingSection({
  onSelectPlan,
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37'
}: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showMatrix, setShowMatrix] = useState(false);

  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  return (
    <section id="precios" className="scroll-mt-20 py-28 bg-[#FAF9F6] border-t border-stone-200/60 relative overflow-hidden">
      <span id="pricing" className="scroll-mt-20 sr-only" />
      
      {/* Halo ambiental dinámico de fondo */}
      <div 
        style={{ backgroundColor: `${accentColor}12` }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[160px] pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cabecera Editorial */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div 
            style={{ 
              backgroundColor: `${accentColor}18`, 
              borderColor: `${accentColor}40`,
              color: accentColor 
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] mb-4"
          >
            <Sparkles size={11} style={{ color: accentColor }} />
            <span>Inversión Transparente • Sin Comisiones</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            Planes Diseñados para Crecer con tu Centro
          </h2>
          
          <p className="text-stone-500 text-sm md:text-base mt-4 font-medium leading-relaxed">
            Sin costes ocultos ni comisiones por paciente nuevo. Elige la escala perfecta para proyectar la elegancia de tu clínica.
          </p>

          {/* Banner de Reverse Trial */}
          <div 
            style={{ borderColor: `${accentColor}40` }}
            className="mt-8 inline-flex items-center gap-2.5 bg-white border px-5 py-2.5 rounded-2xl shadow-sm text-xs font-semibold text-stone-800"
          >
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full animate-pulse" 
            />
            <span><strong>Prueba Gratuita de 14 Días</strong> • 0,00 € a pagar hoy • Sin permanencia</span>
          </div>

          {/* Selector Mensual / Anual */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-stone-950' : 'text-stone-400'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-8 bg-stone-200 p-1 rounded-full relative transition-colors focus:outline-none cursor-pointer"
              aria-label="Alternar ciclo de facturación"
            >
              <div 
                style={billingCycle === 'yearly' ? { backgroundColor: accentColor } : undefined}
                className={`w-6 h-6 rounded-full transition-transform duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0 bg-stone-950'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold transition-colors ${billingCycle === 'yearly' ? 'text-stone-950' : 'text-stone-400'}`}>
                Anual
              </span>
              <span 
                style={{ 
                  backgroundColor: `${accentColor}20`, 
                  borderColor: `${accentColor}40`,
                  color: accentColor 
                }}
                className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
              >
                2 Meses Gratis
              </span>
            </div>
          </div>
        </div>

        {/* Las 3 Tarjetas Oficiales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              accentColor={accentColor}
              darkColor={darkColor}
              onSelectPlan={onSelectPlan}
            />
          ))}
        </div>

        {/* Botón para Desplegar Matriz Comparativa */}
        <div className="text-center mt-14">
          <button
            onClick={() => setShowMatrix(prev => !prev)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-bold text-stone-900 bg-white border border-stone-200/90 shadow-sm hover:border-[#D4AF37]/60 hover:shadow-md hover:bg-stone-50/50 transition-all active:scale-95 cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{showMatrix ? 'Ocultar comparativa detallada' : 'Ver comparativa completa módulo a módulo'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-300 ${showMatrix ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Tabla Comparativa de Módulos */}
        {showMatrix && (
          <PricingComparisonTable
            billingCycle={billingCycle}
            accentColor={accentColor}
            darkColor={darkColor}
            onSelectPlan={onSelectPlan}
          />
        )}

        {/* Garantías y Trust bar */}
        <div className="mt-16 pt-8 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Sin permanencia obligatoria</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Migración asistida de citas y pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              style={{ backgroundColor: accentColor }}
              className="w-2 h-2 rounded-full" 
            />
            <span>Aislamiento de base de datos RLS (RGPD/LOPD)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
