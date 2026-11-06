'use client';

import React from 'react';
import { 
  Globe, 
  Calendar, 
  Receipt, 
  Bot, 
  ShieldCheck, 
  Users, 
  Sparkles 
} from 'lucide-react';
import type { PillarsSectionData, PillarItem } from '@/app/super-admin/components/SaaSCMSPillarsForm';

interface PillarsSectionProps {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  data?: PillarsSectionData;
}

const ICON_MAP: Record<string, React.ElementType> = {
  globe: Globe,
  calendar: Calendar,
  receipt: Receipt,
  bot: Bot,
  shield: ShieldCheck,
  users: Users,
  sparkles: Sparkles,
};

const DEFAULT_PILLARS_ITEMS: PillarItem[] = [
  {
    id: 'p-1',
    number_badge: 'Pilar 01',
    title: 'Presencia Web de Lujo',
    description: 'CMS visual modular sin tocar código. Catálogo de tratamientos con fotos y tiempos de cabina, vídeos de alta definición, páginas personalizadas y SEO automático.',
    footer_highlight: 'Tu marca propia en el centro',
    icon: 'globe'
  },
  {
    id: 'p-2',
    number_badge: 'Pilar 02',
    title: 'Motor de Reservas 24/7',
    description: 'El paciente reserva desde su smartphone a cualquier hora en 3 pasos. Depósito o fianza anti-plantones obligatoria con Stripe Connect para erradicar las incomparecencias.',
    footer_highlight: 'Cero ausencias no avisadas',
    icon: 'calendar'
  },
  {
    id: 'p-3',
    number_badge: 'Pilar 03',
    title: 'ERP, Legalidad & Caja',
    description: 'Fichas médicas con firma manuscrita LOPD sin papel, TPV express de mostrador para cobros por Bizum/tarjeta, facturación correlativa y emisión de bonos multisesión.',
    footer_highlight: '100% Blindaje legal y fiscal',
    icon: 'receipt'
  },
  {
    id: 'p-4',
    number_badge: 'Pilar 04',
    title: 'AI Webmaster Copilot',
    description: 'Tu asistente con inteligencia artificial integrado en tu base de datos. Redacta descripciones de tratamientos, traduce contenidos y ayuda a tu equipo en la operativa diaria.',
    footer_highlight: 'Inteligencia sin esfuerzo',
    icon: 'bot'
  }
];

export default function PillarsSection({
  primaryColor = '#1c1917',
  secondaryColor = '#FAF9F6',
  tertiaryColor = '#D4AF37',
  data
}: PillarsSectionProps) {
  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1c1917';

  const badge = data?.badge || 'Arquitectura de Producto';
  const title = data?.title || 'Los 4 Pilares del Ecosistema';
  const subtitle = data?.subtitle || 'Todo lo que una clínica de alta gama necesita para operar con la máxima sofisticación y cero fricción técnica.';
  const pillarsList = data?.items && data.items.length > 0 ? data.items : DEFAULT_PILLARS_ITEMS;

  return (
    <section id="pilares" className="scroll-mt-20 py-28 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
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

        <div className={`grid grid-cols-1 md:grid-cols-2 ${pillarsList.length >= 4 ? 'lg:grid-cols-4' : pillarsList.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-7`}>
          {pillarsList.map((pillar, idx) => {
            const IconComponent = ICON_MAP[pillar.icon] || Sparkles;
            const isDarkCard = idx === pillarsList.length - 1 && pillarsList.length >= 4;

            return (
              <div 
                key={pillar.id || idx}
                className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <div 
                    style={isDarkCard ? {
                      backgroundColor: darkColor,
                      borderColor: `${accentColor}40`,
                      color: accentColor
                    } : { 
                      backgroundColor: `${accentColor}18`, 
                      borderColor: `${accentColor}35`, 
                      color: accentColor 
                    }}
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 shadow-2xs group-hover:scale-105 transition-transform"
                  >
                    <IconComponent size={22} strokeWidth={1.75} />
                  </div>
                  <span 
                    style={{ color: accentColor }}
                    className="text-[10px] font-bold uppercase tracking-widest block mb-1"
                  >
                    {pillar.number_badge || `Pilar 0${idx + 1}`}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">
                    {pillar.description}
                  </p>
                </div>
                {pillar.footer_highlight && (
                  <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                    {pillar.footer_highlight}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
