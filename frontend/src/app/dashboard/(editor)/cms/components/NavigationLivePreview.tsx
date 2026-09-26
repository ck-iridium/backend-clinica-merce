"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface NavigationLivePreviewProps {
  navTab: 'links' | 'megamenu';
  navigationItems: any[];
  categories: any[];
  services: any[];
  megamenuLayout: 'bento' | 'directory';
  megamenuCategories: string[] | null;
  previewActiveCategory: string | null;
  setPreviewActiveCategory: (id: string | null) => void;
  settings?: any;
  siteContent?: any;
}

export default function NavigationLivePreview({
  navTab,
  navigationItems,
  categories,
  services,
  megamenuLayout,
  megamenuCategories,
  previewActiveCategory,
  setPreviewActiveCategory,
  settings,
  siteContent
}: NavigationLivePreviewProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(true);

  // Asegurar que en la pestaña de Megamenú siempre esté desplegado
  useEffect(() => {
    if (navTab === 'megamenu') {
      setIsMegaMenuOpen(true);
    }
  }, [navTab]);

  // URL del API para resolver imágenes relativas
  const getFullUrl = (url: string | null | undefined) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  // Filtrar categorías activas excluyendo GENERAL
  const activeCats = (Array.isArray(categories) ? categories : []).filter(c => 
    c.is_active && c.name?.trim().toUpperCase() !== 'GENERAL'
  );

  const previewFilteredCats = activeCats.filter(c => {
    if (megamenuCategories === null || megamenuCategories === undefined) return true;
    if (Array.isArray(megamenuCategories) && megamenuCategories.length === 0) return false;
    return megamenuCategories.includes(c.id);
  });

  // Ordenar según el orden guardado en megamenuCategories
  if (Array.isArray(megamenuCategories) && megamenuCategories.length > 0) {
    previewFilteredCats.sort((a, b) => {
      const idxA = megamenuCategories.indexOf(a.id);
      const idxB = megamenuCategories.indexOf(b.id);
      return idxA - idxB;
    });
  }

  // Resolver categoría activa
  const activePreviewCatId = previewActiveCategory && previewFilteredCats.some(c => c.id === previewActiveCategory)
    ? previewActiveCategory
    : (previewFilteredCats[0]?.id || null);

  const allServicesList = Array.isArray(services) ? services : [];
  const previewServices = allServicesList.filter(s => s.is_active && s.category_id === activePreviewCatId);

  // Máximo 6 servicios en el Bento Grid (exactamente 2 filas de 3 columnas)
  const activeBentoServices = previewServices.slice(0, 6);
  const isFew = activeBentoServices.length <= 3;

  // Resolver logo real de la clínica
  const clinicName = settings?.clinic_name || siteContent?.clinic_name || 'Estética Merce';
  const logoSrc = settings?.logo_app_b64 || settings?.logo_mobile_b64 || settings?.clinic_logo || settings?.logo_url || siteContent?.logo_url;
  const logoHeight = Math.min(Math.max(settings?.header_logo_height ?? 42, 28), 52);

  // Lista de items de navegación dinámica
  const visibleNavItems = Array.isArray(navigationItems) && navigationItems.length > 0
    ? navigationItems.filter(item => item.is_visible !== false)
    : [
        { id: '1', label: 'Inicio', path: '/' },
        { id: '2', label: 'Tratamientos', path: '/tratamientos' },
        { id: '3', label: 'Contacto', path: '/contacto' }
      ];

  const showDropdown = navTab === 'megamenu' || isMegaMenuOpen;

  return (
    <div className="hidden md:flex flex-1 h-full overflow-y-auto bg-stone-100/60 p-6 lg:p-10 flex-col items-center justify-start select-none">
      
      {/* ── Contenedor del Navbar + Megamenú idéntico al Frontend Público ── */}
      <div className="w-full max-w-6xl flex flex-col relative transition-all duration-300">
        
        {/* ── BARRA SUPERIOR (HEADER) ── */}
        <header className="w-full bg-white rounded-t-3xl border-t border-x border-stone-200/70 shadow-sm px-8 lg:px-10 h-20 flex items-center justify-between relative z-40">
          
          {/* Logo */}
          <div 
            className="flex items-center shrink-0 cursor-default"
            style={{
              marginRight: `${settings?.header_logo_margin_right ?? 24}px`,
              marginLeft: `${settings?.header_logo_margin_left ?? 0}px`,
              transform: `translateY(${settings?.header_logo_padding_y ?? 0}px)`,
            }}
          >
            {logoSrc ? (
              <img
                src={getFullUrl(logoSrc)}
                alt={clinicName}
                style={{
                  height: `${logoHeight}px`,
                  maxHeight: '52px',
                }}
                className="w-auto object-contain transition-all duration-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallbackEl = document.getElementById('preview-front-logo-fallback');
                  if (fallbackEl) fallbackEl.style.display = 'block';
                }}
              />
            ) : null}

            <span 
              id="preview-front-logo-fallback" 
              className={`font-serif font-extrabold text-2xl tracking-tight text-stone-900 ${logoSrc ? 'hidden' : 'block'}`}
            >
              {clinicName}
            </span>
          </div>

          {/* Enlaces de Navegación + Selector Idioma + Botón Reservar */}
          <div className="flex items-center gap-7 lg:gap-8">
            <nav className="flex items-center gap-6 lg:gap-8">
              {visibleNavItems.map((item, idx) => {
                const isTreatments = item.path === '/services' || item.path === '/tratamientos' || 
                                     item.label.toLowerCase().includes('tratamiento') || 
                                     item.label.toLowerCase().includes('servicio');
                const isItemActive = isTreatments ? showDropdown : idx === 0;

                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => {
                      if (isTreatments) setIsMegaMenuOpen(!isMegaMenuOpen);
                    }}
                    className={`text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer relative py-2 ${
                      isItemActive
                        ? 'text-[#d4af37]'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    {item.label}
                    {isItemActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Selector de idioma mock */}
            <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100/80 px-2.5 py-1.5 rounded-full border border-stone-200/50">
              <span>ES</span>
              <ChevronDown size={12} className="text-stone-400" />
            </div>

            {/* Botón de Reserva (CTA de Lujo) */}
            <button
              type="button"
              className="bg-[#d4af37] hover:bg-[#b38f2b] text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm transition-all duration-300 cursor-default shrink-0"
            >
              {settings?.booking_button_text || 'Reservar Cita'}
            </button>
          </div>
        </header>

        {/* ── MEGAMENÚ DESPLEGABLE (IDÉNTICO A PUBLICNAVBAR) ── */}
        {showDropdown && (
          <div className="w-full bg-white rounded-b-3xl border-b border-x border-stone-200/70 shadow-2xl overflow-hidden relative z-30 transition-all duration-300">
            {previewFilteredCats.length === 0 ? (
              /* Sin categorías seleccionadas */
              <div className="p-16 text-center bg-stone-50/40">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
                  Megamenú Oculto
                </p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  No hay categorías seleccionadas para el megamenú.
                </p>
              </div>
            ) : megamenuLayout === 'bento' ? (
              /* ── DISEÑO A: BENTO GRID (EXACTAMENTE COMO EL FRONTEND) ── */
              <div className="flex h-[380px] bg-white">
                
                {/* Columna Izquierda: CATEGORÍAS (Fondo Negro/Oscuro con Pestaña Activa Blanca) */}
                <div className="w-[280px] shrink-0 bg-stone-900 py-6 pl-8 pr-0 border-r border-stone-800 relative flex flex-col justify-between">
                  <div>
                    <h4 className="text-[13px] font-black uppercase tracking-[0.3em] text-stone-300 mb-6 shrink-0">
                      CATEGORÍAS
                    </h4>

                    <div className="flex flex-col space-y-1">
                      {previewFilteredCats.map((cat) => {
                        const isActive = activePreviewCatId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setPreviewActiveCategory(cat.id)}
                            className={`w-full text-left px-6 py-2.5 transition-all font-serif text-lg leading-tight whitespace-normal relative ${
                              isActive
                                ? 'bg-white text-[#d4af37] font-semibold rounded-l-2xl -mr-[1px] z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.02)]'
                                : 'text-stone-300 hover:text-white rounded-xl mr-4 hover:bg-white/5'
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: BENTO GRID (Máximo 2 Filas x 3 Columnas) */}
                <div className="flex-1 py-6 px-8 bg-white overflow-hidden">
                  {activeBentoServices.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-400 text-sm font-medium">
                      No hay tratamientos destacados en esta categoría.
                    </div>
                  ) : (
                    <div className={`grid grid-cols-3 gap-5 h-full ${
                      isFew ? 'items-center' : 'grid-rows-2'
                    }`}>
                      {activeBentoServices.map((svc) => {
                        const svcImage = svc.image_url ? getFullUrl(svc.image_url) : null;

                        return (
                          <div
                            key={svc.id}
                            className={`group relative rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 transition-all duration-300 shadow-sm hover:shadow-xl ${
                              isFew ? 'h-[200px]' : 'h-full'
                            }`}
                          >
                            {/* Imagen de Fondo de Tratamiento */}
                            {svcImage ? (
                              <img
                                src={svcImage}
                                alt={svc.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                                <span className="font-serif text-stone-300 text-xs italic">{clinicName}</span>
                              </div>
                            )}

                            {/* Gradiente Oscuro en la parte inferior para legibilidad del título */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-20 flex items-end p-5 transition-all duration-300">
                              <h5 className="text-white font-serif font-bold leading-tight line-clamp-2 text-base md:text-lg [text-shadow:_0_1px_4px_rgba(0,0,0,0.7)]">
                                {svc.name}
                              </h5>
                            </div>

                            {/* Duración (hover badge como en el front) */}
                            {svc.duration_minutes && (
                              <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                                  <span className="text-[#d4af37] text-[11px] font-bold">
                                    {svc.duration_minutes} min
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── DISEÑO B: DIRECTORIO (3 COLUMNAS) ── */
              <div className="h-[380px] p-8 bg-white flex items-center">
                <div className="w-full grid grid-cols-3 gap-8 h-full">
                  {previewFilteredCats.slice(0, 3).map((cat) => {
                    const catServices = allServicesList.filter(s => s.is_active && s.category_id === cat.id);
                    return (
                      <div
                        key={cat.id}
                        className="flex flex-col h-full bg-stone-50/50 p-6 rounded-3xl border border-stone-100/70"
                      >
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#d4af37] border-b border-stone-200/50 pb-3 mb-4 truncate shrink-0">
                          {cat.name}
                        </span>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                          {catServices.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">No hay tratamientos en esta categoría.</p>
                          ) : (
                            catServices.slice(0, 6).map((svc) => (
                              <div key={svc.id} className="block group shrink-0">
                                <div className="text-sm font-bold text-stone-800 truncate group-hover:text-[#d4af37] transition-colors">
                                  {svc.name}
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-0.5">
                                  <span>{svc.duration_minutes ? `${svc.duration_minutes} min` : ''}</span>
                                  {svc.price && <span className="font-semibold text-stone-600">{svc.price}€</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
