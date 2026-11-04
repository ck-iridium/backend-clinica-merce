'use client';

import { XCircle, CheckCircle2, Check, ChevronRight } from 'lucide-react';
import type { PainComparisonData } from '@/app/super-admin/components/SaaSCMSPainForm';

interface PainComparisonSectionProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  data?: PainComparisonData;
}

const DEFAULT_OLD_ITEMS = [
  { id: '1', concept: 'Web + Hosting + Mantenimiento (WordPress)', cost: '~40€/mes' },
  { id: '2', concept: 'Motor de reservas online (Fresha / Treatwell)', cost: '~50€/mes + comisiones' },
  { id: '3', concept: 'Software médico LOPD & Consentimientos en papel', cost: '~70€/mes' },
  { id: '4', concept: 'TPV de mostrador y facturación separada', cost: '~30€/mes' },
  { id: '5', concept: 'Copiloto de IA o redacción externa', cost: '~30€/mes' },
];

const DEFAULT_SUITE_FEATURES = [
  { id: '1', title: 'Web de Lujo con CMS:', description: 'Edita fotos, vídeos y catálogo en minutos.' },
  { id: '2', title: 'Reservas 24/7 sin comisiones:', description: 'Fianza anti-plantones Stripe Connect.' },
  { id: '3', title: 'Fichas LOPD & Consentimientos:', description: 'Firma manuscrita en tablet/móvil.' },
  { id: '4', title: 'Caja TPV & Facturas PDF:', description: 'Cobro express por Bizum, tarjeta y bonos.' },
  { id: '5', title: 'Copiloto IA Integrado:', description: 'Asistente en tu base de datos para redactar y gestionar.' },
];

export default function PainComparisonSection({
  onSelectPlan,
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37',
  data
}: PainComparisonSectionProps) {
  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  // Resoluciones de datos dinámicos con fallback
  const badge = data?.badge || 'El Dolor del Mercado';
  const title = data?.title || '¿Por qué pagar 5 programas si puedes tenerlo todo en uno?';
  const subtitle = data?.subtitle || 'La mayoría de clínicas sufren un caos de contraseñas, datos desincronizados y sobrecostes mensuales. ProBookia unifica todo el ecosistema.';

  // Modelo antiguo (Contras)
  const oldBadge = data?.old_model?.badge || 'El Modelo Antiguo y Fragmentado';
  const oldTitle = data?.old_model?.title || 'Herramientas Dispersas';
  const oldItems = data?.old_model?.items && data.old_model.items.length > 0 
    ? data.old_model.items 
    : DEFAULT_OLD_ITEMS;
  const oldTotalLabel = data?.old_model?.total_label || 'Gasto Medio Mensual';
  const oldTotalAmount = data?.old_model?.total_amount || '220€/mes';
  const oldFootnote = data?.old_model?.footnote || '+ Pérdida de tiempo en 5 inicios de sesión distintos.';

  // Suite ProBookia (Pros)
  const suiteCornerBadge = data?.suite_model?.corner_badge || 'Suite Todo-en-Uno';
  const suiteBadge = data?.suite_model?.badge || 'La Solución Unificada';
  const suiteTitle = data?.suite_model?.title || 'ProBookia Suite';
  const suiteFeatures = data?.suite_model?.features && data.suite_model.features.length > 0
    ? data.suite_model.features
    : DEFAULT_SUITE_FEATURES;
  const suitePricingLabel = data?.suite_model?.pricing_label || 'Todo Incluido Desde';
  const suitePricingAmount = data?.suite_model?.pricing_amount || '39€/mes';
  const suiteCtaText = data?.suite_model?.cta_text || 'Probar Gratis';

  return (
    <section className="py-24 bg-white border-y border-stone-200/60 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span 
            style={{ color: accentColor }}
            className="text-[10px] font-black uppercase tracking-[0.25em] block mb-2"
          >
            {badge}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            {title}
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Tarjeta Izquierda: El Caos Actual (Contras) */}
          <div className="bg-stone-50/70 rounded-3xl border border-stone-200/80 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-stone-400 mb-6">
                <XCircle size={20} className="text-red-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {oldBadge}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                {oldTitle}
              </h3>

              <ul className="space-y-4 text-xs font-medium text-stone-600">
                {oldItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>{item.concept}</span>
                    <span className="font-mono font-bold text-stone-800">{item.cost}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  {oldTotalLabel}
                </span>
                <span className="text-2xl font-serif font-bold text-red-500">{oldTotalAmount}</span>
              </div>
              <span className="text-xs text-stone-500 font-medium max-w-[200px] text-right">
                {oldFootnote}
              </span>
            </div>
          </div>

          {/* Tarjeta Derecha: La Solución ProBookia (Pros) */}
          <div 
            style={{ 
              backgroundColor: darkColor,
              borderColor: accentColor,
              boxShadow: `0 25px 60px -15px ${accentColor}35`
            }}
            className="text-white rounded-3xl border-2 p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300"
          >
            <div 
              style={{ backgroundColor: accentColor }}
              className="absolute top-0 right-0 text-stone-950 font-black px-3.5 py-1 rounded-bl-2xl text-[9px] uppercase tracking-widest shadow-sm"
            >
              {suiteCornerBadge}
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-6" style={{ color: accentColor }}>
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {suiteBadge}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-6">
                {suiteTitle}
              </h3>

              <ul className="space-y-4 text-xs font-medium text-stone-300">
                {suiteFeatures.map((feat) => (
                  <li key={feat.id} className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                    <span><strong>{feat.title}</strong> {feat.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span 
                  style={{ color: accentColor }}
                  className="text-[10px] uppercase font-bold tracking-wider block"
                >
                  {suitePricingLabel}
                </span>
                <span className="text-3xl font-serif font-bold text-white">{suitePricingAmount}</span>
              </div>
              <button
                onClick={() => onSelectPlan('pro')}
                style={{ backgroundColor: accentColor }}
                className="hover:opacity-90 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>{suiteCtaText}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
