"use client";
import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Clock, Phone } from 'lucide-react';
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
  className?: string;
}

export default function FeaturedServicesSection({
  config,
  services = [],
  categories = [],
  settings,
  isDark = false,
  className = ''
}: FeaturedServicesSectionProps) {
  if (!config || config.enabled === false) return null;

  // Filtrar servicios seleccionados por id con trim y casing seguro
  const rawIds = (Array.isArray(config.service_ids) && config.service_ids.length > 0)
    ? config.service_ids
    : (Array.isArray((config as any).selected_services_ids) ? (config as any).selected_services_ids : []);
  const targetIds: string[] = rawIds.map((id: any) => String(id));
  
  let featuredServices = targetIds.length > 0
    ? targetIds
        .map((id: string) => services.find((s: any) => String(s?.id || '').trim().toLowerCase() === id.trim().toLowerCase()))
        .filter(Boolean)
    : services.slice(0, 4);

  // Fallback de seguridad: si se indicaron IDs pero no hubo coincidencia (ej: importación parcial o estado inicial),
  // mostrar los primeros servicios del centro para que el bloque nunca quede vacío
  if (featuredServices.length === 0 && services.length > 0) {
    featuredServices = services.slice(0, 4);
  }

  // Si aún no hay servicios (porque el centro no ha creado tratamientos o están cargando),
  // mostrar tratamientos de muestra para que la vista previa NUNCA quede vacía
  if (featuredServices.length === 0) {
    featuredServices = [
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
    const cat = categories.find((c: any) => String(c?.id || '').trim() === String(svc?.category_id || '').trim());
    return cat?.slug || 'general';
  };

  return (
    <section className={`w-full py-16 md:py-24 ${isDark ? 'bg-stone-950 text-white' : 'bg-[#FAF9F6] text-stone-900'} relative overflow-hidden ${className}`}>
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
                  {/* Imagen de fondo o Degradado Quiet Luxury 2026 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 z-0 overflow-hidden">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 backdrop-blur-sm group-hover:scale-105 group-hover:border-[#d4af37]/40 transition-all duration-500">
                          <Sparkles className="w-8 h-8 text-[#d4af37]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]/90">Tratamiento Exclusivo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 z-10" />
                  </div>

                  {/* Contenido en Overlay */}
                  <div className="relative z-20 text-white">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] bg-black/40 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        {isLead ? 'Tratamiento Estrella' : 'Destacado'}
                      </span>
                      {showDuration && svc.duration_minutes && (
                        <span className="text-white/80 text-xs flex items-center gap-1 font-medium bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
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
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 backdrop-blur-sm group-hover:scale-105 group-hover:border-[#d4af37]/40 transition-all duration-500">
                          <Sparkles className="w-7 h-7 text-[#d4af37]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]/90">Tratamiento Exclusivo</span>
                      </div>
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
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950">
                    {svc.image_url ? (
                      <img
                        src={getFullUrl(svc.image_url)}
                        alt={svc.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 backdrop-blur-sm group-hover:scale-105 group-hover:border-[#d4af37]/40 transition-all duration-500">
                          <Sparkles className="w-7 h-7 text-[#d4af37]" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]/90">Tratamiento Exclusivo</span>
                      </div>
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
