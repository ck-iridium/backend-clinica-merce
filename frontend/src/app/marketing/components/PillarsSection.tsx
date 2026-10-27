'use client';

import { Globe, Calendar, Receipt, Bot } from 'lucide-react';

interface PillarsSectionProps {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export default function PillarsSection({
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37'
}: PillarsSectionProps) {
  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  return (
    <section id="pilares" className="py-28 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span 
            style={{ color: accentColor }}
            className="text-[10px] font-black uppercase tracking-[0.25em] block mb-2"
          >
            Arquitectura de Producto
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
            Los 4 Pilares del Ecosistema
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
            Todo lo que una clínica de alta gama necesita para operar con la máxima sofisticación y cero fricción técnica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {/* Pilar 1 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div 
                style={{ 
                  backgroundColor: `${accentColor}18`, 
                  borderColor: `${accentColor}35`, 
                  color: accentColor 
                }}
                className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 shadow-2xs"
              >
                <Globe size={22} strokeWidth={1.75} />
              </div>
              <span 
                style={{ color: accentColor }}
                className="text-[10px] font-bold uppercase tracking-widest block mb-1"
              >
                Pilar 01
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">
                Presencia Web de Lujo
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                CMS visual modular sin tocar código. Catálogo de tratamientos con fotos y tiempos de cabina, vídeos de alta definición, páginas personalizadas y SEO automático.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
              Tu marca propia en el centro
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-6 shadow-2xs">
                <Calendar size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block mb-1">
                Pilar 02
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">
                Motor de Reservas 24/7
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                El paciente reserva desde su smartphone a cualquier hora en 3 pasos. Depósito o fianza anti-plantones obligatoria con Stripe Connect para erradicar las incomparecencias.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
              Cero ausencias no avisadas
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-6 shadow-2xs">
                <Receipt size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">
                Pilar 03
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">
                ERP, Legalidad & Caja
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Fichas médicas con firma manuscrita LOPD sin papel, TPV express de mostrador para cobros por Bizum/tarjeta, facturación correlativa y emisión de bonos multisesión.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
              100% Blindaje legal y fiscal
            </div>
          </div>

          {/* Pilar 4 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div 
                style={{ 
                  backgroundColor: darkColor,
                  borderColor: `${accentColor}40`,
                  color: accentColor 
                }}
                className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 shadow-2xs"
              >
                <Bot size={22} strokeWidth={1.75} />
              </div>
              <span 
                style={{ color: accentColor }}
                className="text-[10px] font-bold uppercase tracking-widest block mb-1"
              >
                Pilar 04
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">
                AI Webmaster Copilot
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Tu asistente con inteligencia artificial integrado en tu base de datos. Redacta descripciones de tratamientos, traduce contenidos y ayuda a tu equipo en la operativa diaria.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
              Inteligencia sin esfuerzo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
