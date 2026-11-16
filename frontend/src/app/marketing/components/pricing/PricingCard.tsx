"use client";

import { Check, Sparkles, Star, ChevronRight } from 'lucide-react';
import { PricingPlan } from './pricingData';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: 'monthly' | 'yearly';
  accentColor: string;
  darkColor: string;
  onSelectPlan: (plan: 'individual' | 'pro' | 'elite', interval: 'monthly' | 'yearly') => void;
}

export function PricingCard({
  plan,
  billingCycle,
  accentColor,
  darkColor,
  onSelectPlan,
}: PricingCardProps) {
  const isMonthly = billingCycle === 'monthly';
  const priceDisplay = isMonthly ? `${plan.monthlyPrice}€` : `${plan.yearlyPrice.toLocaleString('es-ES')}€`;
  const periodDisplay = isMonthly ? '/ mes (+IVA)' : `/ año (${plan.monthlyEquiv})`;

  // Estilo Plan Pro (Destacado)
  if (plan.popular) {
    return (
      <div 
        style={{ 
          borderColor: accentColor, 
          boxShadow: `0 25px 65px -15px ${accentColor}35` 
        }}
        className="bg-white rounded-3xl shadow-xl border-2 p-8 relative flex flex-col justify-between lg:-translate-y-3 transition-all duration-300"
      >
        <div 
          style={{ backgroundColor: accentColor }}
          className="absolute -top-3.5 right-6 text-stone-950 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"
        >
          <Star size={10} className="fill-stone-950 text-stone-950" />
          <span>Más Elegido • Recomendado</span>
        </div>

        <div>
          <div className="mb-6 pb-6 border-b border-stone-100">
            <span 
              style={{ color: accentColor }}
              className="font-bold uppercase text-[9px] tracking-widest block mb-1"
            >
              {plan.tagline}
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-950">{plan.name}</h3>
            <div className="flex items-baseline mt-3">
              <span className="text-4xl font-serif font-bold text-stone-950">
                {priceDisplay}
              </span>
              <span className="text-stone-400 text-xs font-medium ml-1.5">
                {periodDisplay}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-2 font-medium">
              {plan.description}
            </p>
          </div>

          <div className="space-y-3.5 mb-8">
            {plan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {feat.isSpecial ? (
                  <div 
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                <span 
                  style={feat.isSpecial ? { color: accentColor } : undefined}
                  className={`text-xs ${
                    feat.isSpecial
                      ? 'font-bold'
                      : feat.isBold
                        ? 'font-bold text-stone-950'
                        : 'font-semibold text-stone-800'
                  }`}
                >
                  {feat.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSelectPlan(plan.id, billingCycle)}
          style={{ backgroundColor: darkColor }}
          className="w-full hover:opacity-90 text-white py-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-md group border border-white/20 cursor-pointer"
        >
          <span>{plan.buttonText}</span>
          <ChevronRight size={13} style={{ color: accentColor }} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  // Estilo Plan Elite (Dark Luxury)
  if (plan.isDark) {
    return (
      <div 
        style={{ backgroundColor: darkColor }}
        className="text-white rounded-3xl shadow-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
      >
        <div>
          <div className="mb-6 pb-6 border-b border-white/10">
            <span 
              style={{ color: accentColor }}
              className="font-bold uppercase text-[9px] tracking-widest block mb-1"
            >
              {plan.tagline}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline mt-3">
              <span className="text-4xl font-serif font-bold text-white">
                {priceDisplay}
              </span>
              <span className="text-stone-400 text-xs font-medium ml-1.5">
                {periodDisplay}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-2 font-medium">
              {plan.description}
            </p>
          </div>

          <div className="space-y-3.5 mb-8">
            {plan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div 
                  style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                >
                  {feat.isSpecial ? <Sparkles className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                </div>
                <span 
                  style={feat.isSpecial ? { color: accentColor } : undefined}
                  className={`text-xs ${
                    feat.isSpecial
                      ? 'font-bold'
                      : feat.isBold
                        ? 'font-bold text-white'
                        : 'font-semibold text-stone-200'
                  }`}
                >
                  {feat.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSelectPlan(plan.id, billingCycle)}
          className="w-full bg-white hover:bg-stone-100 text-stone-950 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 shadow-md cursor-pointer"
        >
          <span>{plan.buttonText}</span>
          <ChevronRight size={13} />
        </button>
      </div>
    );
  }

  // Estilo Plan Individual (Light Luxury)
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-stone-200/80 p-8 flex flex-col justify-between hover:shadow-md hover:border-stone-300 transition-all duration-300">
      <div>
        <div className="mb-6 pb-6 border-b border-stone-100">
          <span className="text-stone-400 font-bold uppercase text-[9px] tracking-widest block mb-1">
            {plan.tagline}
          </span>
          <h3 className="text-2xl font-serif font-bold text-stone-900">{plan.name}</h3>
          <div className="flex items-baseline mt-3">
            <span className="text-4xl font-serif font-bold text-stone-950">
              {priceDisplay}
            </span>
            <span className="text-stone-400 text-xs font-medium ml-1.5">
              {periodDisplay}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-medium">
            {plan.description}
          </p>
        </div>

        <div className="space-y-3.5 mb-8">
          {plan.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {feat.isSpecial ? (
                <div 
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <span 
                style={feat.isSpecial ? { color: accentColor } : undefined}
                className={`text-xs ${
                  feat.isSpecial
                    ? 'font-bold'
                    : feat.isBold
                      ? 'font-bold text-stone-800'
                      : 'font-semibold text-stone-700'
                }`}
              >
                {feat.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelectPlan(plan.id, billingCycle)}
        className="w-full bg-stone-50 hover:bg-stone-100 text-stone-900 py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 active:scale-95 border border-stone-200/80 cursor-pointer"
      >
        <span>{plan.buttonText}</span>
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
