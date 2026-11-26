"use client";
import React from 'react';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';
import { cleanTitle, getPreviewImageUrl } from './previewUtils';

interface PreviewFeaturedSectionProps {
  config: any;
  services: any[];
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  translations?: any;
}

export const PreviewFeaturedSection = React.memo(function PreviewFeaturedSection({
  config,
  services = [],
  viewportDevice = 'desktop',
  translations
}: PreviewFeaturedSectionProps) {
  const { translate } = useLanguage();

  if (!config || config.enabled === false) return null;

  const title = cleanTitle(translate(config.title || 'Tratamientos Estrella', translations, 'featured_title'));
  const subtitle = translate(config.subtitle || 'Nuestra selección más demandada para una experiencia de cuidado y bienestar excepcional.', translations, 'featured_subtitle');
  const layout = (config.layout_style === 'grid' || config.layout_style === 'slider') ? config.layout_style : 'bento';
  const showPrice = config.show_price !== false;
  const showDuration = config.show_duration !== false;

  // Obtener IDs seleccionados con trim y casing seguro
  const rawIds = Array.isArray(config.service_ids) && config.service_ids.length > 0
    ? config.service_ids
    : (Array.isArray(config.selected_services_ids) ? config.selected_services_ids : []);
  const targetIds = rawIds.map((id: any) => String(id).trim().toLowerCase());

  let featured = targetIds.length > 0
    ? targetIds
        .map((id: string) => services.find((s: any) => String(s?.id || '').trim().toLowerCase() === id))
        .filter(Boolean)
    : services.slice(0, 4);

  if (featured.length === 0 && services.length > 0) {
    featured = services.slice(0, 4);
  }

  // Fallback garantizado para la vista previa
  if (featured.length === 0) {
    featured = [
      {
        id: 'mock-1',
        name: 'Corte de Autor & Peinado',
        description: 'Diagnóstico capilar personalizado y estilismo de vanguardia adaptado a tus facciones.',
        price: '35.00',
        duration_minutes: 45,
        image_url: null,
        is_active: true
      },
      {
        id: 'mock-2',
        name: 'Tratamiento Hidratación Profunda',
        description: 'Nutrición intensa con activos botánicos para devolver el brillo y sedosidad natural.',
        price: '55.00',
        duration_minutes: 60,
        image_url: null,
        is_active: true
      },
      {
        id: 'mock-3',
        name: 'Coloración & Balayage Sublime',
        description: 'Técnica artesanal de iluminación natural con reflejos dorados y matices cálidos.',
        price: '85.00',
        duration_minutes: 90,
        image_url: null,
        is_active: true
      }
    ];
  }

  return (
    <section className="w-full py-12 md:py-16 bg-[#FAF9F6] border-b border-stone-100 select-none">
      {/* Cabecera del Bloque */}
      <div className="px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-[10px] font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>Selección Exclusiva</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-extrabold text-stone-900 tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-500 text-xs md:text-sm mt-2 font-light leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-stone-600 shrink-0">
          <span>Ver toda la carta</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
        </div>
      </div>

      {/* ─── DISEÑO 1: BENTO LUXURY ─── */}
      {layout === 'bento' && (
        <div className={
          viewportDevice === 'mobile'
            ? 'px-6 flex gap-4 overflow-x-auto pb-4 hide-scroll pointer-events-none opacity-95 snap-x snap-mandatory'
            : 'px-8 grid grid-cols-12 gap-5 pointer-events-none opacity-95'
        }>
          {featured.map((svc: any, idx: number) => {
            const isLead = idx === 0;
            const isSecond = idx === 1;
            let colSpan = 'col-span-12 md:col-span-4';
            if (featured.length === 1) {
              colSpan = 'col-span-12';
            } else if (featured.length === 2) {
              colSpan = 'col-span-12 md:col-span-6';
            } else if (isLead) {
              colSpan = 'col-span-12 md:col-span-7';
            } else if (isSecond) {
              colSpan = 'col-span-12 md:col-span-5';
            }

            const heightClass = viewportDevice === 'mobile'
              ? 'w-[280px] h-[340px] shrink-0 snap-start'
              : (isLead || isSecond) && featured.length > 2
              ? `${colSpan} h-[380px] md:h-[440px]`
              : `${colSpan} h-[340px] md:h-[380px]`;

            return (
              <div
                key={svc.id}
                className={`${heightClass} group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-end p-6 md:p-8 transition-all`}
              >
                {/* Imagen de fondo con LuxuryTreatmentPlaceholder */}
                <div className="absolute inset-0 bg-stone-900 z-0 overflow-hidden">
                  {svc.image_url ? (
                    <img
                      src={getPreviewImageUrl(svc.image_url)}
                      alt={cleanTitle(translate(svc.name, svc.translations, 'name'))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LuxuryTreatmentPlaceholder 
                      mode="auto" 
                      className="w-full h-full object-cover" 
                      alt={cleanTitle(translate(svc.name, svc.translations, 'name'))} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 z-10" />
                </div>

                {/* Contenido en Overlay */}
                <div className="relative z-20 text-white">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#d4af37] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {isLead ? 'Tratamiento Estrella' : 'Destacado'}
                    </span>
                    {showDuration && svc.duration_minutes && (
                      <span className="text-white/80 text-[11px] flex items-center gap-1 font-medium bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <Clock className="w-3 h-3 text-[#d4af37]" />
                        {svc.duration_minutes} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-1.5 leading-snug drop-shadow-sm truncate">
                    {cleanTitle(translate(svc.name, svc.translations, 'name'))}
                  </h3>

                  {svc.description && (
                    <p className="text-white/80 text-xs line-clamp-2 font-light leading-relaxed mb-3">
                      {translate(svc.description, svc.translations, 'description')}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/15">
                    {showPrice ? (
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block leading-tight">Precio</span>
                        <span className="text-base md:text-lg font-bold text-white">
                          {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                        </span>
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
                        Ver Detalle
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37] text-stone-950 text-xs font-bold shadow-sm">
                        Reservar
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── DISEÑO 2: GRID LIMPIO ─── */}
      {layout === 'grid' && (
        <div className={
          viewportDevice === 'mobile'
            ? 'px-6 flex gap-4 overflow-x-auto pb-4 hide-scroll pointer-events-none opacity-95 snap-x snap-mandatory'
            : 'px-8 grid grid-cols-2 md:grid-cols-3 gap-5 pointer-events-none opacity-95'
        }>
          {featured.map((svc: any) => (
            <div
              key={svc.id}
              className={
                viewportDevice === 'mobile'
                  ? 'w-[280px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-between'
                  : 'bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-between'
              }
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                {svc.image_url ? (
                  <img src={getPreviewImageUrl(svc.image_url)} alt={svc.name} className="w-full h-full object-cover" />
                ) : (
                  <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={svc.name} />
                )}
                {showDuration && svc.duration_minutes && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d4af37]" />
                    <span>{svc.duration_minutes} min</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 mb-1.5 truncate">
                    {cleanTitle(translate(svc.name, svc.translations, 'name'))}
                  </h3>
                  {svc.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light mb-3">
                      {translate(svc.description, svc.translations, 'description')}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {showPrice ? (
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase">Precio</span>
                      <span className="text-base font-bold text-stone-900">
                        {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                      </span>
                    </div>
                  ) : <div />}

                  <span className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold">
                    Reservar
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── DISEÑO 3: CARRUSEL / SLIDER ─── */}
      {layout === 'slider' && (
        <div className="px-8 flex gap-4 overflow-x-auto pb-4 hide-scroll pointer-events-none opacity-95 snap-x snap-mandatory">
          {featured.map((svc: any) => (
            <div
              key={svc.id}
              className="w-[280px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
                {svc.image_url ? (
                  <img src={getPreviewImageUrl(svc.image_url)} alt={svc.name} className="w-full h-full object-cover" />
                ) : (
                  <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={svc.name} />
                )}
                {showDuration && svc.duration_minutes && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-md">
                    {svc.duration_minutes} min
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-base font-serif font-bold text-stone-900 mb-1 truncate">
                  {cleanTitle(translate(svc.name, svc.translations, 'name'))}
                </h3>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  {showPrice ? (
                    <span className="text-sm font-bold text-stone-900">
                      {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                    </span>
                  ) : <div />}
                  <span className="px-3 py-1 rounded-xl bg-stone-900 text-white text-[11px] font-semibold">
                    Ver Ficha
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

PreviewFeaturedSection.displayName = 'PreviewFeaturedSection';

