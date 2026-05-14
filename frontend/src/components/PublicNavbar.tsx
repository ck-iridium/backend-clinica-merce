"use client"
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BotonReservaPro from './BotonReservaPro';

function MegaMenuServiceCard({ svc, getFullUrl, onClick, isLarge, isParentOpen, categories }: { svc: any, getFullUrl: (url: string) => string, onClick: () => void, isLarge?: boolean, isParentOpen: boolean, categories: any[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Buscar el slug de la categoría para construir la URL Silo
  const category = categories.find(c => c.id === svc.category_id);
  const categorySlug = category?.slug || category?.id || 'general';
  const serviceLink = `/tratamientos/${categorySlug}/${svc.slug || svc.id}`;

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered && isParentOpen) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
    // Al quitar el hover, reseteamos el estado del vídeo inmediatamente
    if (!isHovered) {
      setVideoLoaded(false);
    }
  }, [isHovered, isParentOpen]);

  const shouldLoadVideo = isParentOpen && isHovered;

  return (
    <Link
      href={serviceLink}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-3xl overflow-hidden border border-stone-100 block bg-stone-50 transition-all duration-500 ${isLarge ? 'h-full' : 'aspect-video shadow-sm hover:shadow-xl'}`}
    >
      {/* Imagen Principal - Siempre visible en el fondo para evitar el flash */}
      {svc.image_url ? (
        <img
          src={getFullUrl(svc.image_url)}
          alt={svc.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
          <span className="font-serif text-stone-300 text-xs italic">Merce</span>
        </div>
      )}

      {/* Vídeo Hover - Carga bajo demanda */}
      {svc.video_url && shouldLoadVideo && (
        <video
          ref={videoRef}
          src={getFullUrl(svc.video_url)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
        />
      )}

      {/* Spinner minimalista para el menú - Esquina inferior derecha y Blanco */}
      {svc.video_url && shouldLoadVideo && !videoLoaded && (
        <div className="absolute bottom-4 right-4 z-30">
           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Info Overlay - Degradado suavizado para dejar ver la imagen */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 flex items-end p-6 transition-all duration-500`}>
        <div className="text-white w-full">
          <h5 className="font-serif font-bold leading-tight line-clamp-2 text-lg [text-shadow:_0_-1px_4px_rgba(0,0,0,0.6)]">
            {svc.name}
          </h5>
        </div>
      </div>

      {/* Floating Duration Badge - Top Right */}
      <div className={`absolute top-4 right-4 z-30 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
          <span className="text-[#d4af37] text-[12px] font-black uppercase tracking-[0.1em]">
            {svc.duration_minutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PublicNavbar({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [btnText, setBtnText] = useState('Reservar Cita');
  const [btnLink, setBtnLink] = useState('/contacto');

  // States for Phase 1
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  useEffect(() => {
    if (isDashboard) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => { });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/site-content/`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_button_text) setBtnText(data.hero_button_text);
        if (data.hero_button_link) setBtnLink(data.hero_button_link);
      })
      .catch(() => { });

    if (!isDashboard) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`)
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          if (data.length > 0) setActiveCategory(data[0].id);
        }).catch(() => { });

      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`)
        .then(res => res.json())
        .then(data => setServices(data))
        .catch(() => { });
    }
  }, [isDashboard]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (isDashboard) return null;

  const isHome = pathname === '/';
  const useTransparent = transparent || isHome;

  return (
    <>
      <nav className={`w-full z-[100] transition-all duration-500 ease-in-out ${!useTransparent ? 'bg-white/90 backdrop-blur-xl border-b border-stone-200/50 shadow-sm py-0 sticky top-0' : 'bg-transparent border-transparent py-2 absolute top-0 left-0'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">

          {/* LOGO */}
          <div className="flex items-center gap-4 z-[110] relative">
            {settings?.logo_app_b64 ? (
              <Link href="/" onClick={() => setIsOpen(false)}>
                <img src={settings.logo_app_b64} alt="Logo" className="h-10" />
              </Link>
            ) : (
              <Link href="/" onClick={() => setIsOpen(false)} className={`font-extrabold text-2xl tracking-tighter transition-colors ${!useTransparent ? 'text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>
                {settings?.clinic_name || "Estetica Merce"}
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-sm">
            <Link href="/" className={`transition-colors ${pathname === '/' ? 'text-[#d4af37]' : (!useTransparent ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]')}`}>Inicio</Link>

            <div
              className="h-20 flex items-center"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <Link href="/tratamientos" className={`transition-colors flex items-center gap-1 ${pathname === '/tratamientos' ? 'text-[#d4af37]' : !useTransparent ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>
                Tratamientos
              </Link>
            </div>

            <Link href="/contacto" className={`transition-colors ${pathname === '/contacto' ? 'text-[#d4af37]' : !useTransparent ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>Contacto</Link>
            <BotonReservaPro 
              texto={btnText} 
              href={btnLink}
              className="scale-90 origin-right"
            />
          </div>

          {/* MEGA MENU (Full width relative to container) */}
          <div
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
            className={`absolute top-[calc(100%-8px)] left-6 right-6 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 origin-top ${showMegaMenu ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
          >
            <div className="flex h-[380px]">
              {/* Left Panel: Categories */}
              <div className="w-[280px] shrink-0 bg-stone-900 py-6 pl-8 pr-0 border-r border-stone-800 relative">
                <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-stone-300 mb-8">Categorías</h4>
                <ul className="space-y-1">
                  {categories.filter(c => c.name.toUpperCase() !== 'GENERAL').map(cat => (
                    <li key={cat.id}>
                      <button
                        onMouseEnter={() => setActiveCategory(cat.id)}
                        onClick={() => { setShowMegaMenu(false); window.location.href = `/tratamientos/${cat.slug || cat.id}` }}
                        className={`w-full text-left px-6 py-3 transition-all font-serif text-xl whitespace-nowrap relative ${activeCategory === cat.id
                            ? 'bg-white text-[#d4af37] font-semibold rounded-l-2xl -mr-[1px] z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.02)] after:absolute after:top-0 after:-right-[1px] after:w-[2px] after:h-full after:bg-white after:z-20'
                            : 'text-stone-200 hover:text-white rounded-2xl mr-4 hover:bg-white/5'
                          }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Panel: Bento Grid Highlights */}
              <div className="flex-1 py-6 px-8 bg-white overflow-hidden">
                {(() => {
                  const activeServices = services.filter(s => s.category_id === activeCategory).slice(0, 6);
                  const isFew = activeServices.length <= 3;

                  return (
                    <div
                      key={activeCategory} // Clave para forzar re-render y disparar animación
                      className={`grid grid-cols-3 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`}
                    >
                      {activeServices.map(svc => (
                        <MegaMenuServiceCard
                          key={svc.id}
                          svc={svc}
                          isLarge={isFew}
                          getFullUrl={getFullUrl}
                          onClick={() => setShowMegaMenu(false)}
                          isParentOpen={showMegaMenu}
                          categories={categories}
                        />
                      ))}
                      {activeServices.length === 0 && (
                        <p className="text-stone-400 font-medium text-sm col-span-3 text-center py-20 animate-in fade-in duration-1000">No hay tratamientos destacados en esta categoría.</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* MOBILE MENU BUTTON - z-index máximo para control total */}
          <button
            className={`md:hidden z-[110] relative p-2 focus:outline-none transition-colors ${(!useTransparent || isOpen) ? 'text-stone-800' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`block w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
            </div>
          </button>

        </div>
      </nav>

      {/* MOBILE MENU OVERLAY - Aislamiento total movido fuera del <nav> (para escapar del backdrop-filter) */}
      <div
        className={`fixed inset-0 bg-white z-[120] transition-all duration-500 ease-in-out md:hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
      >
        <div className="flex flex-col items-center justify-start pt-32 gap-12 font-black text-3xl text-stone-800 h-full overflow-y-auto w-full px-8 text-center bg-white relative">

          {/* Botón Cerrar (necesario ya que el nav z-110 original quedó debajo del overlay z-120) */}
          <button
            className="absolute top-6 right-6 text-stone-800 p-2 focus:outline-none"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="block w-full h-[2px] bg-current rotate-45 translate-y-[9px]"></span>
              <span className="block w-full h-[2px] bg-current opacity-0"></span>
              <span className="block w-full h-[2px] bg-current -rotate-45 -translate-y-[9px]"></span>
            </div>
          </button>

          {/* Enlaces */}
          <Link href="/" onClick={() => setIsOpen(false)} className={`transition-all duration-300 active:scale-95 ${pathname === '/' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Inicio</Link>

          {/* Acordeón Móvil Tratamientos */}
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}>
              <span className={`transition-all duration-300 active:scale-95 ${pathname === '/tratamientos' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Tratamientos</span>
              <span className={`text-sm text-[#d4af37] transition-transform duration-300 ${mobileAccordionOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            <div className={`flex flex-col items-center gap-4 overflow-hidden transition-all duration-500 ease-in-out ${mobileAccordionOpen ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0 mt-0'}`}>
              <Link href="/tratamientos" onClick={() => setIsOpen(false)} className="text-xl font-serif text-[#d4af37] italic hover:text-stone-900 transition-colors">
                Ver Todos
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/tratamientos/${cat.slug || cat.id}`} onClick={() => setIsOpen(false)} className="text-xl font-serif font-normal text-stone-500 hover:text-stone-800 transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/contacto" onClick={() => setIsOpen(false)} className={`transition-all duration-300 active:scale-95 ${pathname === '/contacto' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Contacto</Link>

          <div className="w-full h-px bg-stone-100 my-2 max-w-[150px] mx-auto"></div>

          <BotonReservaPro 
            texto={btnText} 
            href={btnLink}
            onClick={() => setIsOpen(false)}
            className="w-full max-w-xs mx-auto"
          />

          {/* Información de contacto */}
          {settings?.clinic_phone && (
            <div className="mt-auto pb-12">
              <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-2">Reserva telefónica</p>
              <p className="text-xl font-bold text-stone-600">{settings.clinic_phone}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
