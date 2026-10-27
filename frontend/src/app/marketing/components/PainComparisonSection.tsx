'use client';

import { XCircle, CheckCircle2, Check, ChevronRight } from 'lucide-react';

interface PainComparisonSectionProps {
  onSelectPlan: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export default function PainComparisonSection({
  onSelectPlan,
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37'
}: PainComparisonSectionProps) {
  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  return (
    <section className="py-24 bg-white border-y border-stone-200/60 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span 
            style={{ color: accentColor }}
            className="text-[10px] font-black uppercase tracking-[0.25em] block mb-2"
          >
            El Dolor del Mercado
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            ¿Por qué pagar 5 programas si puedes tenerlo todo en uno?
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
            La mayoría de clínicas sufren un caos de contraseñas, datos desincronizados y sobrecostes mensuales. ProBookia unifica todo el ecosistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Tarjeta Izquierda: El Caos Actual */}
          <div className="bg-stone-50/70 rounded-3xl border border-stone-200/80 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-stone-400 mb-6">
                <XCircle size={20} className="text-red-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  El Modelo Antiguo y Fragmentado
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Herramientas Dispersas
              </h3>

              <ul className="space-y-4 text-xs font-medium text-stone-600">
                <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <span>Web + Hosting + Mantenimiento (WordPress)</span>
                  <span className="font-mono font-bold text-stone-800">~40€/mes</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <span>Motor de reservas online (Fresha / Treatwell)</span>
                  <span className="font-mono font-bold text-stone-800">~50€/mes + comisiones</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <span>Software médico LOPD & Consentimientos en papel</span>
                  <span className="font-mono font-bold text-stone-800">~70€/mes</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <span>TPV de mostrador y facturación separada</span>
                  <span className="font-mono font-bold text-stone-800">~30€/mes</span>
                </li>
                <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                  <span>Copiloto de IA o redacción externa</span>
                  <span className="font-mono font-bold text-stone-800">~30€/mes</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Gasto Medio Mensual
                </span>
                <span className="text-2xl font-serif font-bold text-red-500">220€/mes</span>
              </div>
              <span className="text-xs text-stone-500 font-medium max-w-[200px] text-right">
                + Pérdida de tiempo en 5 inicios de sesión distintos.
              </span>
            </div>
          </div>

          {/* Tarjeta Derecha: La Solución ProBookia (100% ligada al branding del CMS) */}
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
              Suite Todo-en-Uno
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-6" style={{ color: accentColor }}>
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  La Solución Unificada
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-6">
                ProBookia Suite
              </h3>

              <ul className="space-y-4 text-xs font-medium text-stone-300">
                <li className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                  <span><strong>Web de Lujo con CMS:</strong> Edita fotos, vídeos y catálogo en minutos.</span>
                </li>
                <li className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                  <span><strong>Reservas 24/7 sin comisiones:</strong> Fianza anti-plantones Stripe Connect.</span>
                </li>
                <li className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                  <span><strong>Fichas LOPD & Consentimientos:</strong> Firma manuscrita en tablet/móvil.</span>
                </li>
                <li className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                  <span><strong>Caja TPV & Facturas PDF:</strong> Cobro express por Bizum, tarjeta y bonos.</span>
                </li>
                <li className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <Check size={16} className="shrink-0" style={{ color: accentColor }} />
                  <span><strong>Copiloto IA Integrado:</strong> Asistente en tu base de datos para redactar y gestionar.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span 
                  style={{ color: accentColor }}
                  className="text-[10px] uppercase font-bold tracking-wider block"
                >
                  Todo Incluido Desde
                </span>
                <span className="text-3xl font-serif font-bold text-white">39€/mes</span>
              </div>
              <button
                onClick={() => onSelectPlan('pro')}
                style={{ backgroundColor: accentColor }}
                className="hover:opacity-90 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>Probar Gratis</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
