"use client";
import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Clock, Tag, Phone } from 'lucide-react';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';

interface FeaturedServicesConfig {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  service_ids?: string[];
  layout_style?: 'bento' | 'grid' | 'slider';
  show_price?: boolean;
  show_duration?: boolean;
}

interface FeaturedServicesSectionProps {
  config?: FeaturedServicesConfig | null;
  services: any[];
  categories?: any[];
  settings?: any;
  isDark?: boolean;
}

export default function FeaturedServicesSection({
  config,
  services = [],
  categories = [],
  settings,
  isDark = false
}: FeaturedServicesSectionProps) {
  if (!config || config.enabled === false) return null;

  // Filtrar servicios seleccionados por id
  const targetIds = Array.isArray(config.service_ids) ? config.service_ids : [];
  
  // Si no hay ids configurados pero el bloque está activo, tomar los primeros 4 servicios
  let featuredServices = targetIds.length > 0
    ? targetIds.map(id => services.find((s: any) => String(s.id) === String(id))).filter(Boolean)
    : services.slice(0, 4);

  if (featuredServices.length === 0) return null;

  const title = config.title || 'Tratamientos Estrella';
  const subtitle = config.subtitle || 'Nuestra selección más demandada para una experiencia de cuidado y bienestar excepcional.';
  const layout = config.layout_style || 'bento';
  const showPrice = config.show_price !== false;
  const showDuration = config.show_duration !== false;

  const isOnlineBookingAllowed = settings?.allow_online_booking !== false;
  const clinicPhone = settings?.clinic_phone || settings?.phone || '';

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const getCategorySlug = (svc: any) => {
    if (svc.category_slug) return svc.category_slug;
    const cat = categories.find((c: any) => c.id === svc.category_id);
    return cat?.slug || 'general';
  };

  return (
    <section className={`w-full py-16 md:py-24 ${isDark ? 'bg-stone-950 text-white' : 'bg-[#FAF9F6] text-stone-900'} relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Cabecera del Bloque */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#b08e23] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Selección Exclusiva</span>
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
            <span>Ver toda la carta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ─── FORMATO: BENTO LUXURY ─── */}
        {layout === 'bento' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {featuredServices.map((svc: any, idx: number) => {
              // El primer servicio toma 7 columnas (protagonista), el segundo 5 columnas, los siguientes 4 o 6 columnas
              const isLead = idx === 0;
              const isSecond = idx === 1;
              const colSpan = isLead ? 'md:col-span-7' : isSecond ? 'md:col-span-5' : 'md:col-span-4';
              const heightClass = isLead || isSecond ? 'h-[440px] md:h-[500px]' : 'h-[360px] md:h-[400px]';
              const catSlug = getCategorySlug(svc);

              return (
                <div
                  key={svc.id}
                  className={`${colSpan} ${heightClass} group relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 dark:border-stone-800 flex flex-col justify-end p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#d4af37]/50`}
                >
                  {/* Imagen de fondo */}
                  <div className="absolute inset-0 bg-stone-200 dark:bg-stone-900 z-0 overflow-hidden">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={svc.name} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 z-10" />
                  </div>

                  {/* Contenido en Overlay */}
                  <div className="relative z-20 text-white">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] bg-black/40 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        {isLead ? 'Tratamiento Estrella' : 'Destacado'}
                      </span>
                      {showDuration && svc.duration_minutes && (
                        <span className="text-white/80 text-xs flex items-center gap-1 font-medium bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-[#d4af37]" />
                          {svc.duration_minutes} min
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-2 leading-snug drop-shadow-sm">
                      {svc.name}
                    </h3>

                    {svc.description && (
                      <p className="text-white/80 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed mb-4 max-w-lg">
                        {svc.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/15">
                      {showPrice && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/60 block">Precio</span>
                          <span className="text-lg md:text-xl font-bold text-white">
                            {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tratamientos/${catSlug}/${svc.slug || svc.id}`}
                          className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
                        >
                          Ver Detalle
                        </Link>
                        {isOnlineBookingAllowed ? (
                          <Link
                            href={`/reservar?servicio=${svc.id}&nombre=${encodeURIComponent(svc.name)}`}
                            className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b08e23] text-stone-950 text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            Reservar
                          </Link>
                        ) : (
                          <a
                            href={clinicPhone ? `tel:${clinicPhone.replace(/\s+/g, '')}` : '/contacto'}
                            className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#b08e23] text-stone-950 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FORMATO: GRID TRADICIONAL ─── */}
        {layout === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredServices.map((svc: any) => {
              const catSlug = getCategorySlug(svc);
              return (
                <div
                  key={svc.id}
                  className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm border border-stone-200/70 dark:border-stone-800 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#d4af37]/40 group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-800">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
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

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-[#b08e23] transition-colors">
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed font-light mb-4">
                          {svc.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      {showPrice ? (
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">Precio</span>
                          <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                          </span>
                        </div>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tratamientos/${catSlug}/${svc.slug || svc.id}`}
                          className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 text-xs font-semibold"
                        >
                          Ficha
                        </Link>
                        {isOnlineBookingAllowed ? (
                          <Link
                            href={`/reservar?servicio=${svc.id}&nombre=${encodeURIComponent(svc.name)}`}
                            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-semibold transition-all shadow-sm"
                          >
                            Reservar
                          </Link>
                        ) : (
                          <a
                            href={clinicPhone ? `tel:${clinicPhone.replace(/\s+/g, '')}` : '/contacto'}
                            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Llamar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FORMATO: SLIDER / CARRUSEL ─── */}
        {layout === 'slider' && (
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scroll snap-x snap-mandatory">
            {featuredServices.map((svc: any) => {
              const catSlug = getCategorySlug(svc);
              return (
                <div
                  key={svc.id}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 dark:border-stone-800 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#d4af37]/40 group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={svc.name} />
                    )}
                    {showDuration && svc.duration_minutes && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-md">
                        {svc.duration_minutes} min
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-1.5 group-hover:text-[#b08e23] transition-colors">
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed font-light mb-3">
                          {svc.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      {showPrice ? (
                        <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {svc.price ? `${parseFloat(svc.price).toFixed(2)} €` : 'Consultar'}
                        </span>
                      ) : <div />}

                      <Link
                        href={`/tratamientos/${catSlug}/${svc.slug || svc.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-semibold transition-all"
                      >
                        Ver Ficha
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
