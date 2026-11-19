import React from 'react';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import BentoGridServices from '@/components/blocks/BentoGridServices';

interface PublicCategoryBlockProps {
  data: Record<string, any>;
  dbCategories: any[];
  dbServices: any[];
}

export function PublicCategoryBlock({ data, dbCategories, dbServices }: PublicCategoryBlockProps) {
  let catId = data.category_id;
  if (!catId && dbCategories.length > 0) {
    catId = dbCategories[0]?.id;
  }
  const category = dbCategories.find((c) => c.id === catId);
  let filteredServices = catId
    ? dbServices.filter((svc) => svc.category_id === catId && svc.is_active)
    : dbServices.filter((svc) => svc.is_active);

  if (data.selected_treatment_ids && data.selected_treatment_ids.length > 0) {
    const selected = filteredServices.filter((svc) => data.selected_treatment_ids.includes(svc.id));
    if (selected.length > 0) filteredServices = selected;
  }

  if (data.max_items) {
    filteredServices = filteredServices.slice(0, data.max_items);
  }

  if (filteredServices.length === 0 && dbServices.length > 0) {
    filteredServices = dbServices.filter((svc) => svc.is_active).slice(0, 6);
  }

  if (filteredServices.length === 0) {
    return (
      <div className="w-full py-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Catálogo de Servicios · Sin tratamientos activos
        </p>
      </div>
    );
  }

  const rawLayout = data.layout || 'cards_slider';
  const layoutStyle =
    rawLayout === 'slider' ? 'cards_slider' :
    rawLayout === 'bento' ? 'bento_grid' :
    rawLayout === 'grid' ? 'traditional_grid' :
    rawLayout === 'list' ? 'minimalist_list' :
    rawLayout;

  return (
    <div className="w-full py-6">
      {layoutStyle === 'cards_slider' && (
        <div className="w-full flex flex-col justify-center pb-4">
          {/* Cabecera de categoría idéntica a la Home */}
          <div className="w-full max-w-7xl mx-auto px-6 mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-3">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-serif font-extrabold text-stone-900 leading-tight">
                {category?.name || 'Nuestros Tratamientos'}
              </h2>
              {category?.description && (
                <p className="text-sm md:text-base text-stone-500 mt-1 font-sans">
                  {category.description}
                </p>
              )}
            </div>
            <Link
              href={`/tratamientos/${category?.slug || category?.id || ''}`}
              className="self-start md:self-auto inline-flex items-center gap-1.5 font-black text-primary hover:text-stone-900 transition-colors uppercase tracking-widest text-xs"
            >
              <span>{data.link_text || 'Ver Catálogo'}</span>
              <span className="text-base">→</span>
            </Link>
          </div>

          {/* DESKTOP VIEW CON FLECHAS Y CARRUSEL OFICIAL EDGE-TO-EDGE */}
          <div className="hidden md:block w-full">
            {filteredServices.length === 1 && (
              <div className="max-w-7xl mx-auto px-6">
                <div className="w-full aspect-[16/9] md:h-[500px]">
                  <ServiceCard service={filteredServices[0]} className="w-full h-full" />
                </div>
              </div>
            )}
            {filteredServices.length === 2 && (
              <div className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
                <div className="w-[372px] h-[662px]">
                  <ServiceCard service={filteredServices[0]} className="w-full h-full" />
                </div>
                <div className="w-[372px] h-[662px]">
                  <ServiceCard service={filteredServices[1]} className="w-full h-full" />
                </div>
              </div>
            )}
            {filteredServices.length >= 3 && (
              <TreatmentCarousel servicios={filteredServices} loop={true} />
            )}
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-stretch w-full pb-4">
            {filteredServices.map((svc: any) => (
              <ServiceCard key={svc.id} service={svc} className="snap-stop-always shrink-0 w-[85vw]" />
            ))}
          </div>
        </div>
      )}

      {layoutStyle === 'bento_grid' && (
        <div className="-mx-6 md:-mx-12">
          <BentoGridServices
            data={{
              title: category?.name || 'Nuestros Tratamientos',
              subtitle: category?.description || 'Nuestros tratamientos insignia.',
              max_services: data.max_items || 6,
            }}
            services={filteredServices}
          />
        </div>
      )}

      {layoutStyle === 'traditional_grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service: any) => {
            const preparedSvc = {
              ...service,
              video_url:
                service.video_url ||
                (service.image_url?.includes('.mp4') ||
                service.image_url?.includes('.webm') ||
                service.image_url?.includes('video_')
                  ? service.image_url
                  : ''),
            };
            return (
              <ServiceCard
                key={service.id}
                service={preparedSvc}
                className="w-full aspect-square h-auto md:h-auto"
              />
            );
          })}
        </div>
      )}

      {layoutStyle === 'minimalist_list' && (
        <div className="flex flex-col divide-y divide-stone-200/60 border-t border-b border-stone-200/50">
          {filteredServices.map((service: any, idx: number) => {
            const hrefPath = `/tratamientos/${service.category_slug || 'general'}/${service.slug || service.id}`;
            return (
              <div key={service.id} className="flex items-center justify-between py-6 group">
                <div className="pr-4">
                  <span className="text-primary text-[10px] font-bold uppercase tracking-wider block mb-1">
                    0{idx + 1} · {service.duration_minutes} min
                  </span>
                  <Link href={hrefPath} className="inline-block">
                    <h4 className="text-base font-serif font-bold text-stone-800 hover:text-primary transition-colors leading-tight">
                      {service.name}
                    </h4>
                  </Link>
                  <p className="text-xs text-stone-400 mt-1.5 max-w-2xl leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-stone-700 text-sm font-black">{service.price} €</span>
                  <Link
                    href={hrefPath}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-stone-900 border-b border-transparent hover:border-stone-950/40 pb-0.5 transition-all"
                  >
                    {data.link_text || 'Ver'} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
