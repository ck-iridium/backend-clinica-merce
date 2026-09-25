"use client";
import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X, Search, Sparkles, Calendar, BookOpen, Layers, Globe, ExternalLink, Check, ChevronRight } from 'lucide-react';

interface SmartLinkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, suggestedText?: string) => void;
  currentValue?: string;
  categories?: any[];
  services?: any[];
}

export default function SmartLinkPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  categories = [],
  services = [],
}: SmartLinkPickerModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pages' | 'services' | 'categories' | 'custom'>('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState(currentValue);

  // Listado de páginas predefinidas
  const predefinedPages = useMemo(() => [
    {
      id: 'booking',
      title: t('cms.link_picker.page_booking') || 'Reserva de Cita (Paso a paso)',
      description: t('cms.link_picker.page_booking_desc') || 'Abre el asistente de reserva de citas para clientes',
      url: '/reservar',
      suggestedText: t('cms.link_picker.suggest_booking') || 'Reservar Cita',
      icon: Calendar,
      badge: 'Recomendado'
    },
    {
      id: 'treatments_section',
      title: t('cms.link_picker.page_treatments') || 'Sección de Tratamientos',
      description: t('cms.link_picker.page_treatments_desc') || 'Desplaza la vista a las categorías y servicios de la portada',
      url: '#tratamientos',
      suggestedText: t('cms.link_picker.suggest_treatments') || 'Ver Tratamientos',
      icon: Sparkles
    },
    {
      id: 'about_section',
      title: t('cms.link_picker.page_about') || 'Sección Sobre Mí / Clínica',
      description: t('cms.link_picker.page_about_desc') || 'Desplaza la vista a la historia y filosofía de la clínica',
      url: '#sobre-mi',
      suggestedText: t('cms.link_picker.suggest_about') || 'Conócenos',
      icon: BookOpen
    },
    {
      id: 'contact_section',
      title: t('cms.link_picker.page_contact') || 'Sección de Contacto y Ubicación',
      description: t('cms.link_picker.page_contact_desc') || 'Desplaza la vista al pie de página con mapa y teléfono',
      url: '#contacto',
      suggestedText: t('cms.link_picker.suggest_contact') || 'Contactar',
      icon: Globe
    },
  ], [t]);

  // Filtrado de servicios
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter((s: any) => 
      s.name?.toLowerCase().includes(q) ||
      s.category?.name?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  // Filtrado de categorías
  const filteredCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c: any) => c.name?.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 border-b border-stone-200/70 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-900/60">
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles size={20} className="text-[#d4af37]" />
              {t('cms.link_picker.modal_title') || 'Selector Inteligente de Enlaces'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {t('cms.link_picker.modal_subtitle') || 'Vincula el botón a una página, tratamiento directo o sección con un solo clic.'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-stone-200/70 dark:border-stone-800 px-6 bg-white dark:bg-stone-900 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('pages'); setSearchQuery(''); }}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'pages'
                ? 'border-[#d4af37] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <BookOpen size={15} />
            {t('cms.link_picker.tab_pages') || 'Páginas Principales'}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('services'); setSearchQuery(''); }}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'services'
                ? 'border-[#d4af37] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Sparkles size={15} />
            {t('cms.link_picker.tab_services') || 'Tratamientos'} ({services.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('categories'); setSearchQuery(''); }}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'categories'
                ? 'border-[#d4af37] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Layers size={15} />
            {t('cms.link_picker.tab_categories') || 'Categorías'} ({categories.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'custom'
                ? 'border-[#d4af37] text-stone-900 dark:text-white'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <ExternalLink size={15} />
            {t('cms.link_picker.tab_custom') || 'Enlace Libre'}
          </button>
        </div>

        {/* Buscador para pestañas de servicios o categorías */}
        {(activeTab === 'services' || activeTab === 'categories') && (
          <div className="px-6 pt-4 pb-2 shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'services'
                    ? (t('cms.link_picker.search_services') || 'Buscar tratamiento por nombre o categoría...')
                    : (t('cms.link_picker.search_categories') || 'Buscar categoría...')
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30"
              />
            </div>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 min-h-[250px]">
          {/* TAB: PÁGINAS PRINCIPALES */}
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 gap-2.5">
              {predefinedPages.map(page => {
                const isSelected = currentValue === page.url;
                const IconComponent = page.icon;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      onSelect(page.url, page.suggestedText);
                      onClose();
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-[#d4af37] bg-[#d4af37]/5 dark:bg-[#d4af37]/10'
                        : 'border-stone-200/80 dark:border-stone-800 hover:border-[#d4af37]/60 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${
                        isSelected 
                          ? 'bg-[#d4af37] text-white' 
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-[#d4af37]/10 group-hover:text-[#d4af37]'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-800 dark:text-stone-200">
                            {page.title}
                          </span>
                          {page.badge && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#997a15] dark:text-[#f3d36b]">
                              {page.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {page.description}
                        </p>
                        <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 mt-1 block">
                          {page.url}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400 group-hover:text-[#d4af37] transition-colors">
                      {isSelected ? <Check size={18} className="text-[#d4af37]" /> : <ChevronRight size={18} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: TRATAMIENTOS / SERVICIOS */}
          {activeTab === 'services' && (
            <div className="space-y-2.5">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  {t('cms.link_picker.no_services_found') || 'No se encontraron tratamientos.'}
                </div>
              ) : (
                filteredServices.map((service: any) => {
                  const categorySlug = service.category_slug || service.category?.slug || categories?.find((c: any) => c.id === service.category_id)?.slug || 'general';
                  const detailUrl = `/tratamientos/${categorySlug}/${service.slug || service.id}`;
                  const bookingUrl = `/reservar?service=${service.id}`;
                  const isDetailSelected = currentValue === detailUrl;
                  const isBookingSelected = currentValue === bookingUrl;

                  return (
                    <div
                      key={service.id}
                      className={`w-full p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDetailSelected || isBookingSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/5 dark:bg-[#d4af37]/10'
                          : 'border-stone-200/80 dark:border-stone-800 hover:border-[#d4af37]/50 bg-white dark:bg-stone-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {service.image_url ? (
                          <img
                            src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${service.image_url}` : service.image_url}
                            alt={service.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 shrink-0">
                            <Sparkles size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs md:text-sm text-stone-800 dark:text-stone-200 truncate">
                              {service.name}
                            </span>
                            {service.price && (
                              <span className="text-[11px] font-bold text-[#d4af37]">
                                {service.price} €
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                            {service.duration_minutes ? `${service.duration_minutes} min` : ''} {service.category?.name ? `• ${service.category.name}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Botones de selección: Ver Ficha vs Reservar Directo */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(detailUrl, `Ver ${service.name}`);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isDetailSelected
                              ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#b8952b] dark:text-[#f3d36b]'
                              : 'border-stone-200 dark:border-stone-700 hover:border-[#d4af37] text-stone-700 dark:text-stone-300 hover:text-[#d4af37] bg-stone-50 dark:bg-stone-800/60'
                          }`}
                          title={detailUrl}
                        >
                          <BookOpen size={13} />
                          <span>{t('cms.link_picker.btn_view_service') || 'Ver Ficha'}</span>
                          {isDetailSelected && <Check size={13} className="text-[#d4af37]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelect(bookingUrl, `Reservar ${service.name}`);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isBookingSelected
                              ? 'bg-[#b8952b] text-white ring-2 ring-[#d4af37]/40'
                              : 'bg-[#d4af37] hover:bg-[#b8952b] text-white shadow-sm'
                          }`}
                          title={bookingUrl}
                        >
                          <Calendar size={13} />
                          <span>{t('cms.link_picker.btn_book_service') || 'Reservar Directo'}</span>
                          {isBookingSelected && <Check size={13} className="text-white" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: CATEGORÍAS */}
          {activeTab === 'categories' && (
            <div className="space-y-2.5">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  {t('cms.link_picker.no_categories_found') || 'No se encontraron categorías.'}
                </div>
              ) : (
                filteredCategories.map((category: any) => {
                  const catSlug = category.slug || category.id;
                  const catUrl = `/tratamientos/${catSlug}`;
                  const catBookingUrl = `/reservar?categoria=${catSlug}`;
                  const isCatSelected = currentValue === catUrl;
                  const isCatBookingSelected = currentValue === catBookingUrl;

                  return (
                    <div
                      key={category.id}
                      className={`w-full p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCatSelected || isCatBookingSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/5 dark:bg-[#d4af37]/10'
                          : 'border-stone-200/80 dark:border-stone-800 hover:border-[#d4af37]/50 bg-white dark:bg-stone-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-bold text-xs shrink-0">
                          <Layers size={18} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-stone-800 dark:text-stone-200 block truncate">
                            {category.name}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 mt-0.5 block truncate">
                            {catUrl}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción: Ver Catálogo vs Reservar en Categoría */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(catUrl, `Ver ${category.name}`);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isCatSelected
                              ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#b8952b] dark:text-[#f3d36b]'
                              : 'border-stone-200 dark:border-stone-700 hover:border-[#d4af37] text-stone-700 dark:text-stone-300 hover:text-[#d4af37] bg-stone-50 dark:bg-stone-800/60'
                          }`}
                          title={catUrl}
                        >
                          <Layers size={13} />
                          <span>{t('cms.link_picker.btn_view_category') || 'Ver Catálogo'}</span>
                          {isCatSelected && <Check size={13} className="text-[#d4af37]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelect(catBookingUrl, `Reservar ${category.name}`);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isCatBookingSelected
                              ? 'bg-[#b8952b] text-white ring-2 ring-[#d4af37]/40'
                              : 'bg-[#d4af37] hover:bg-[#b8952b] text-white shadow-sm'
                          }`}
                          title={catBookingUrl}
                        >
                          <Calendar size={13} />
                          <span>{t('cms.link_picker.btn_book_category') || 'Reservar en Categoría'}</span>
                          {isCatBookingSelected && <Check size={13} className="text-white" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ENLACE LIBRE */}
          {activeTab === 'custom' && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  {t('cms.link_picker.custom_url_label') || 'Escribe la URL de destino o ancla interna'}
                </label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://... o /pagina o #seccion"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  {t('cms.link_picker.custom_url_help') || 'Puedes introducir una ruta interna (ej: /contacto) o un enlace web externo completo.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (customUrl.trim()) {
                      onSelect(customUrl.trim());
                      onClose();
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  {t('cms.link_picker.apply_link') || 'Aplicar Enlace'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con URL actualmente seleccionada */}
        <div className="px-6 py-3.5 border-t border-stone-200/70 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 truncate max-w-md">
            <span className="font-bold text-stone-400 uppercase text-[10px]">
              {t('cms.link_picker.current_selection') || 'Seleccionado'}:
            </span>
            <span className="font-mono text-stone-700 dark:text-stone-300 truncate">
              {currentValue || 'Ninguno'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {t('cms.link_picker.close') || 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
