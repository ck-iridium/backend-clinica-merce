"use client";
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';
import { cleanTitle, getPreviewImageUrl } from './previewUtils';

interface PreviewCategorySectionProps {
  category: any;
  index: number;
  services: any[];
}

export const PreviewCategorySection = React.memo(function PreviewCategorySection({
  category,
  index,
  services = []
}: PreviewCategorySectionProps) {
  const { translate, t } = useLanguage();

  const isEven = index % 2 === 0;
  const layoutStyle = category.layout_preferences?.layout_style || 'cards_slider';
  const categoryServices = services.filter(
    (s: any) => String(s?.category_id || '').trim() === String(category.id || '').trim()
  );

  return (
    <section key={category.id} className={`w-full py-12 ${isEven ? 'bg-white' : 'bg-[#F7F7F5]'} select-none`}>
      <div className="px-8 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 mb-2">
            {cleanTitle(translate(category.name, category.translations, 'name'))}
          </h2>
          <p className="text-xs md:text-sm text-stone-500">
            {translate(category.description || 'Descubre nuestros tratamientos.', category.translations, 'description')}
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* ─── 1. CARDS SLIDER ─── */}
        {layoutStyle === 'cards_slider' && (
          <div className="px-8 flex gap-4 overflow-x-auto pb-4 pointer-events-none opacity-90 hide-scroll">
            {categoryServices.map((service: any) => (
              <div key={service.id} className="w-[180px] shrink-0 aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                {service.image_url ? (
                  <img 
                    src={getPreviewImageUrl(service.image_url)} 
                    alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                    {cleanTitle(translate(service.name, service.translations, 'name'))}
                  </p>
                  <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                </div>
              </div>
            ))}

            {categoryServices.length === 0 && (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-[180px] shrink-0 aspect-[3/4] bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">
                      {t('cms.treatment').replace('{i}', i.toString())}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ─── 2. BENTO GRID ─── */}
        {layoutStyle === 'bento_grid' && (
          <div className={`px-8 grid w-full gap-3 pointer-events-none opacity-90 ${
            categoryServices.length === 4 ? 'grid-cols-2 auto-rows-[120px]' :
            categoryServices.length === 2 ? 'grid-cols-2 auto-rows-[150px]' :
            categoryServices.length === 1 ? 'grid-cols-1 auto-rows-[200px]' :
            'grid-cols-2 md:grid-cols-3 auto-rows-[100px]'
          }`}>
            {categoryServices.map((service: any, idx: number) => {
              const totalCount = categoryServices.length;
              let gridClass = 'col-span-1 row-span-1 h-full';
              if (totalCount === 3) {
                if (idx === 0) gridClass = 'col-span-2 row-span-2 h-full';
              } else if (totalCount >= 5 && idx === 0) {
                gridClass = 'col-span-2 row-span-2 h-full';
              }

              return (
                <div key={service.id} className={`${gridClass} bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group`}>
                  {service.image_url ? (
                    <img 
                      src={getPreviewImageUrl(service.image_url)} 
                      alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                      {cleanTitle(translate(service.name, service.translations, 'name'))}
                    </p>
                    <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                  </div>
                </div>
              );
            })}

            {categoryServices.length === 0 && (
              <div className="col-span-full h-24 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                <span className="text-xs text-stone-400 font-medium font-sans">Sin tratamientos disponibles</span>
              </div>
            )}
          </div>
        )}

        {/* ─── 3. TRADITIONAL GRID ─── */}
        {layoutStyle === 'traditional_grid' && (
          <div className="px-8 grid grid-cols-2 md:grid-cols-3 gap-4 pointer-events-none opacity-90">
            {categoryServices.map((service: any) => (
              <div key={service.id} className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                {service.image_url ? (
                  <img 
                    src={getPreviewImageUrl(service.image_url)} 
                    alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                    {cleanTitle(translate(service.name, service.translations, 'name'))}
                  </p>
                  <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                </div>
              </div>
            ))}

            {categoryServices.length === 0 && (
              <>
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-[3/4] bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">
                      {t('cms.treatment').replace('{i}', i.toString())}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ─── 4. MINIMALIST LIST ─── */}
        {layoutStyle === 'minimalist_list' && (
          <div className="px-8 flex flex-col divide-y divide-stone-100 pointer-events-none opacity-90">
            {categoryServices.map((service: any, idx: number) => (
              <div key={service.id} className="flex items-center justify-between py-4">
                <div>
                  <span className="text-[#d4af37] text-[9px] font-bold uppercase tracking-wider block mb-1">
                    0{idx + 1} · {service.duration_minutes} min
                  </span>
                  <h4 className="text-sm font-serif font-bold text-stone-800">
                    {cleanTitle(translate(service.name, service.translations, 'name'))}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-xl truncate leading-normal">
                    {service.description}
                  </p>
                </div>
                <span className="text-stone-600 text-xs font-bold shrink-0">{service.price} €</span>
              </div>
            ))}

            {categoryServices.length === 0 && (
              <div className="py-4 text-center">
                <span className="text-xs text-stone-400 font-medium font-sans">Sin tratamientos disponibles</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

PreviewCategorySection.displayName = 'PreviewCategorySection';

