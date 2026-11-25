"use client";
import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';

interface CategoriesCatalogConfig {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  layout_style?: 'bento' | 'grid';
  show_services_count?: boolean;
  hide_individual_sections?: boolean;
}

interface CategoriesCatalogSectionProps {
  config?: CategoriesCatalogConfig | null;
  categories: any[];
  services?: any[];
  isDark?: boolean;
}

export default function CategoriesCatalogSection({
  config,
  categories = [],
  services = [],
  isDark = false
}: CategoriesCatalogSectionProps) {
  if (!config || config.enabled === false) return null;

  const activeCategories = categories
    .filter((c: any) => c.is_active !== false)
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

  if (activeCategories.length === 0) return null;

  const title = config.title || 'Nuestras Especialidades';
  const subtitle = config.subtitle || 'Explora todas las áreas de cuidado y tratamientos diseñados para tu bienestar integral.';
  const layout = config.layout_style || 'bento';
  const showCount = config.show_services_count !== false;

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const getServiceCount = (categoryId: string) => {
    return services.filter((s: any) => s.category_id === categoryId && s.is_active !== false).length;
  };

  return (
    <section className={`w-full py-16 md:py-24 ${isDark ? 'bg-stone-900 text-white' : 'bg-[#F7F7F5] text-stone-900'} relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-xs font-semibold uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Directorio de Servicios</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base mt-3 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href="/tratamientos"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-700 dark:text-stone-300 hover:text-[#d4af37] transition-colors shrink-0 group"
          >
            <span>Ver menú completo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ─── FORMATO: BENTO GRID DE CATEGORÍAS ─── */}
        {layout === 'bento' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {activeCategories.map((cat: any, idx: number) => {
              // Distribución asimétrica tipo Bento:
              // Primer elemento 8 columnas, segundo 4; o bien si son pares: 6 y 6
              let colSpan = 'md:col-span-4';
              if (idx === 0) {
                colSpan = activeCategories.length > 2 ? 'md:col-span-8' : 'md:col-span-6';
              } else if (idx === 1 && activeCategories.length === 2) {
                colSpan = 'md:col-span-6';
              } else if (idx === 1 && activeCategories.length > 2) {
                colSpan = 'md:col-span-4';
              } else if (idx === 2 && activeCategories.length === 3) {
                colSpan = 'md:col-span-12';
              } else if (idx % 5 === 2 || idx % 5 === 3) {
                colSpan = 'md:col-span-6';
              }

              const count = getServiceCount(cat.id);
              const targetUrl = `/tratamientos/${cat.slug || cat.id}`;

              return (
                <Link
                  key={cat.id}
                  href={targetUrl}
                  className={`${colSpan} h-[320px] sm:h-[380px] md:h-[420px] group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 dark:border-stone-800 flex flex-col justify-end p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:border-[#d4af37]/60 active:scale-[0.99]`}
                >
                  {/* Imagen de fondo con zoom fluido */}
                  <div className="absolute inset-0 bg-stone-200 dark:bg-stone-900 z-0 overflow-hidden">
                    {cat.image_url ? (
                      <img
                        src={getFullUrl(cat.image_url)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={cat.name} />
                    )}
                    {/* Gradiente oscuro para legibilidad impecable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10" />
                  </div>

                  {/* Contenido */}
                  <div className="relative z-20 text-white">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        Especialidad
                      </span>
                      {showCount && count > 0 && (
                        <span className="text-white/80 text-xs font-medium bg-black/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                          {count} {count === 1 ? 'tratamiento' : 'tratamientos'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 leading-tight group-hover:text-[#d4af37] transition-colors drop-shadow-sm">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="text-white/80 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed mb-4 max-w-xl">
                        {cat.description}
                      </p>
                    )}

                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37] pt-2 border-t border-white/15 w-full">
                      <span>Explorar categoría</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ─── FORMATO: GRID UNIFORME DE CATEGORÍAS ─── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeCategories.map((cat: any) => {
              const count = getServiceCount(cat.id);
              const targetUrl = `/tratamientos/${cat.slug || cat.id}`;

              return (
                <Link
                  key={cat.id}
                  href={targetUrl}
                  className="h-[360px] group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 dark:border-stone-800 flex flex-col justify-end p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#d4af37]/60 active:scale-[0.99]"
                >
                  <div className="absolute inset-0 bg-stone-200 dark:bg-stone-900 z-0 overflow-hidden">
                    {cat.image_url ? (
                      <img
                        src={getFullUrl(cat.image_url)}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={cat.name} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-10" />
                  </div>

                  <div className="relative z-20 text-white">
                    {showCount && count > 0 && (
                      <span className="inline-block text-white/80 text-[11px] font-medium bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs mb-2">
                        {count} tratamientos
                      </span>
                    )}

                    <h3 className="text-2xl font-serif font-bold text-white mb-2 leading-tight group-hover:text-[#d4af37] transition-colors">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="text-white/80 text-xs line-clamp-2 font-light leading-relaxed mb-3">
                        {cat.description}
                      </p>
                    )}

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] pt-2 border-t border-white/15 w-full">
                      <span>Ver tratamientos</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
