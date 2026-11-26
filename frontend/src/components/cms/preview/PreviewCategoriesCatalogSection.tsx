"use client";
import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';
import { cleanTitle, getPreviewImageUrl } from './previewUtils';

interface PreviewCategoriesCatalogSectionProps {
  config: any;
  categories: any[];
  services: any[];
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  translations?: any;
}

export const PreviewCategoriesCatalogSection = React.memo(function PreviewCategoriesCatalogSection({
  config,
  categories = [],
  services = [],
  viewportDevice = 'desktop',
  translations
}: PreviewCategoriesCatalogSectionProps) {
  const { translate } = useLanguage();

  if (!config || config.enabled === false) return null;

  const title = cleanTitle(translate(config.title || 'Nuestras Especialidades', translations, 'catalog_title'));
  const subtitle = translate(config.subtitle || 'Explora todas las áreas de cuidado y tratamientos diseñados para tu bienestar.', translations, 'catalog_subtitle');
  const layout = config.layout_style === 'grid' ? 'grid' : 'bento';
  const showCount = config.show_services_count !== false;

  let activeCats = categories
    .filter((c: any) => c.is_active !== false)
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

  if (activeCats.length === 0 && categories.length > 0) {
    activeCats = categories.slice(0, 4);
  }

  // Fallback garantizado para vista previa
  if (activeCats.length === 0) {
    activeCats = [
      {
        id: 'mock-cat-1',
        name: 'Peluquería & Estilismo',
        description: 'Cortes vanguardistas, peinados de autor y estilismo profesional de máxima precisión.',
        image_url: null,
        slug: 'peluqueria-estilismo'
      },
      {
        id: 'mock-cat-2',
        name: 'Tratamientos Capilares',
        description: 'Nutrición botánica y reconstrucción para un cabello sublime.',
        image_url: null,
        slug: 'tratamientos-capilares'
      },
      {
        id: 'mock-cat-3',
        name: 'Coloración & Mechas',
        description: 'Técnicas de balayage, iluminación natural y matices cálidos de máxima fijación.',
        image_url: null,
        slug: 'coloracion-mechas'
      }
    ];
  }

  const getCount = (catId: string) => {
    return services.filter((s: any) => String(s?.category_id || '').trim() === String(catId || '').trim() && s.is_active !== false).length;
  };

  return (
    <section className="w-full py-12 md:py-16 bg-[#F7F7F5] border-b border-stone-200/60 select-none">
      {/* Cabecera del Bloque */}
      <div className="px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-[10px] font-semibold uppercase tracking-wider mb-2.5">
            <Layers className="w-3 h-3 text-[#d4af37]" />
            <span>Directorio de Servicios</span>
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
          <span>Ver menú completo</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
        </div>
      </div>

      {/* ─── DISEÑO 1: BENTO LUXURY ─── */}
      {layout === 'bento' ? (
        <div className={
          viewportDevice === 'mobile'
            ? 'px-6 flex gap-4 overflow-x-auto pb-4 hide-scroll pointer-events-none opacity-95 snap-x snap-mandatory'
            : 'px-8 grid grid-cols-12 gap-5 pointer-events-none opacity-95'
        }>
          {activeCats.map((cat: any, idx: number) => {
            let colSpan = 'col-span-12 md:col-span-4';
            if (activeCats.length === 1) {
              colSpan = 'col-span-12';
            } else if (activeCats.length === 2) {
              colSpan = 'col-span-12 md:col-span-6';
            } else if (idx === 0) {
              colSpan = activeCats.length > 2 ? 'col-span-12 md:col-span-8' : 'col-span-12 md:col-span-6';
            } else if (idx === 1 && activeCats.length === 2) {
              colSpan = 'col-span-12 md:col-span-6';
            } else if (idx === 1 && activeCats.length > 2) {
              colSpan = 'col-span-12 md:col-span-4';
            } else if (idx === 2 && activeCats.length === 3) {
              colSpan = 'col-span-12';
            } else if (idx % 5 === 2 || idx % 5 === 3) {
              colSpan = 'col-span-12 md:col-span-6';
            }

            const heightClass = viewportDevice === 'mobile'
              ? 'w-[280px] h-[340px] shrink-0 snap-start'
              : 'h-[340px] md:h-[400px]';

            const count = getCount(cat.id);

            return (
              <div
                key={cat.id}
                className={`${colSpan} ${heightClass} group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-end p-6 md:p-8 transition-all`}
              >
                {/* Fondo con LuxuryTreatmentPlaceholder */}
                <div className="absolute inset-0 bg-stone-900 z-0 overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={getPreviewImageUrl(cat.image_url)}
                      alt={cleanTitle(translate(cat.name, cat.translations, 'name'))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LuxuryTreatmentPlaceholder 
                      mode="auto" 
                      className="w-full h-full object-cover" 
                      alt={cleanTitle(translate(cat.name, cat.translations, 'name'))} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 z-10" />
                </div>

                {/* Contenido */}
                <div className="relative z-20 text-white">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#d4af37] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                      Especialidad
                    </span>
                    {showCount && count > 0 && (
                      <span className="text-white/80 text-xs font-medium bg-black/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {count} {count === 1 ? 'tratamiento' : 'tratamientos'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-1.5 leading-tight drop-shadow-sm truncate">
                    {cleanTitle(translate(cat.name, cat.translations, 'name'))}
                  </h3>

                  {cat.description && (
                    <p className="text-white/80 text-xs line-clamp-2 font-light leading-relaxed mb-3 max-w-xl">
                      {translate(cat.description, cat.translations, 'description')}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] pt-2 border-t border-white/15 w-full">
                    <span>Explorar categoría</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── DISEÑO 2: GRID UNIFORME ─── */
        <div className={
          viewportDevice === 'mobile'
            ? 'px-6 flex gap-4 overflow-x-auto pb-4 hide-scroll pointer-events-none opacity-95 snap-x snap-mandatory'
            : 'px-8 grid grid-cols-2 md:grid-cols-3 gap-5 pointer-events-none opacity-95'
        }>
          {activeCats.map((cat: any) => {
            const count = getCount(cat.id);
            return (
              <div
                key={cat.id}
                className={
                  viewportDevice === 'mobile'
                    ? 'w-[280px] h-[320px] shrink-0 snap-start group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-end p-6'
                    : 'h-[340px] md:h-[360px] group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 flex flex-col justify-end p-6 md:p-8'
                }
              >
                <div className="absolute inset-0 bg-stone-900 z-0 overflow-hidden">
                  {cat.image_url ? (
                    <img
                      src={getPreviewImageUrl(cat.image_url)}
                      alt={cleanTitle(translate(cat.name, cat.translations, 'name'))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LuxuryTreatmentPlaceholder 
                      mode="auto" 
                      className="w-full h-full object-cover" 
                      alt={cleanTitle(translate(cat.name, cat.translations, 'name'))} 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 z-10" />
                </div>

                <div className="relative z-20 text-white">
                  {showCount && count > 0 && (
                    <span className="inline-block text-white/80 text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm mb-1.5">
                      {count} tratamientos
                    </span>
                  )}

                  <h3 className="text-xl font-serif font-bold text-white mb-1.5 leading-tight truncate">
                    {cleanTitle(translate(cat.name, cat.translations, 'name'))}
                  </h3>

                  {cat.description && (
                    <p className="text-white/80 text-xs line-clamp-2 font-light leading-relaxed mb-3">
                      {translate(cat.description, cat.translations, 'description')}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] pt-2 border-t border-white/15 w-full">
                    <span>Ver tratamientos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

PreviewCategoriesCatalogSection.displayName = 'PreviewCategoriesCatalogSection';

