import React from 'react';
import BentoGridServices from '@/components/blocks/BentoGridServices';
import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';

interface CategoryBlockViewProps {
  data: Record<string, any>;
  dbCategories: any[];
  dbServices: any[];
  contentWidth?: 'boxed' | 'fullwidth' | 'fullwidth_boxed';
}

export function CategoryBlockView({ data, dbCategories, dbServices, contentWidth }: CategoryBlockViewProps) {
  let catId = data.category_id;
  if (!catId && dbCategories.length > 0) {
    catId = dbCategories[0]?.id;
  }
  const category = dbCategories.find(c => c.id === catId);
  let services = catId 
    ? dbServices.filter(s => s.category_id === catId && s.is_active)
    : dbServices.filter(s => s.is_active);

  if (data.selected_treatment_ids?.length) {
    const selected = services.filter(s => data.selected_treatment_ids.includes(s.id));
    if (selected.length > 0) services = selected;
  }
  if (data.max_items) {
    services = services.slice(0, data.max_items);
  }
  if (services.length === 0 && dbServices.length > 0) {
    services = dbServices.filter(s => s.is_active).slice(0, data.max_items || 6);
  }

  if (!category && services.length === 0) return (
    <div className="w-full h-full min-h-[160px] border-2 border-dashed border-stone-200 hover:border-[#d4af37]/40 rounded-[2rem] flex flex-col items-center justify-center bg-transparent hover:bg-stone-50 transition-all duration-300 py-10 px-4 text-center select-none">
      <span className="text-2xl mb-1.5">⚙️</span>
      <span className="text-xs text-stone-500 font-black uppercase tracking-wider">Selecciona una categoría en las opciones</span>
      <span className="text-[10px] text-stone-400 font-sans mt-1">Vincular una categoría para visualizar los tratamientos en tiempo real</span>
    </div>
  );

  const rawLayout = data.layout || 'cards_slider';
  const layoutStyle = 
    rawLayout === 'slider' ? 'cards_slider' :
    rawLayout === 'bento' ? 'bento_grid' :
    rawLayout === 'grid' ? 'traditional_grid' :
    rawLayout === 'list' ? 'minimalist_list' :
    rawLayout;

  const handlePreventNavigation = (e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="w-full py-6 select-none [&_a]:cursor-default"
      onClickCapture={handlePreventNavigation}
    >
      {layoutStyle === 'cards_slider' && (
        <div className="w-full flex flex-col justify-center pb-4">
          {/* Cabecera de categoría idéntica a la Home / Public */}
          <div className="w-full max-w-7xl mx-auto px-6 mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-3">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-serif font-extrabold leading-tight">
                {category?.name || 'Nuestros Tratamientos'}
              </h2>
              {category?.description && (
                <p className="text-sm md:text-base opacity-75 mt-1 font-sans">
                  {category.description}
                </p>
              )}
            </div>
            <span className="self-start md:self-auto inline-flex items-center gap-1.5 font-black text-[#d4af37] transition-colors uppercase tracking-widest text-xs cursor-default">
              <span>{data.link_text || 'Ver Catálogo'}</span>
              <span className="text-base">→</span>
            </span>
          </div>

          {/* Carrusel oficial con flechas de navegación y edge-to-edge */}
          <div className="w-full">
            {services.length >= 3 ? (
              <TreatmentCarousel servicios={services} loop={true} />
            ) : (
              <div className="flex gap-6 justify-center px-6">
                {services.map((svc: any) => (
                  <div key={svc.id} className="w-[372px] h-[662px]">
                    <ServiceCard service={svc} className="w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {layoutStyle === 'bento_grid' && (
        <BentoGridServices
          data={{
            title: category?.name || 'Tratamientos',
            subtitle: category?.description || '',
            max_services: data.max_items || 6
          }}
          services={services}
          isFullWidth={contentWidth === 'fullwidth'}
        />
      )}

      {layoutStyle === 'traditional_grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 select-none pointer-events-none">
          {services.map((service: any) => {
            const preparedSvc = {
              ...service,
              video_url: service.video_url || (service.image_url?.includes('.mp4') || service.image_url?.includes('.webm') || service.image_url?.includes('video_') ? service.image_url : '')
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
        <div className="flex flex-col divide-y divide-stone-200/60 border-t border-b border-stone-200/50 select-none pointer-events-none">
          {services.map((service: any, idx: number) => {
            return (
              <div key={service.id} className="flex items-center justify-between py-6 group">
                <div className="pr-4">
                  <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-wider block mb-1">
                    0{idx + 1} · {service.duration_minutes} min
                  </span>
                  <h4 className="text-base font-serif font-bold text-stone-850 leading-tight">
                    {service.name}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1.5 max-w-2xl leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-stone-700 text-sm font-black">{service.price} €</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] pb-0.5">
                    {data.link_text || 'Ver'} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
