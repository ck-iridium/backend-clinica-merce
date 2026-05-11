"use client"
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function MegaMenuServiceCard({ svc, getFullUrl, onClick, isLarge }: { svc: any, getFullUrl: (url: string) => string, onClick: () => void, isLarge?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <Link 
      href={`/tratamientos/${svc.slug || svc.id}`} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-3xl overflow-hidden border border-stone-100 block bg-stone-50 transition-all duration-500 ${isLarge ? 'h-full' : 'aspect-video shadow-sm hover:shadow-xl hover:scale-[1.02]'}`}
    >
      {/* Imagen Principal */}
      {svc.image_url ? (
        <img 
          src={getFullUrl(svc.image_url)} 
          alt={svc.name} 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered && svc.video_url ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`} 
        />
      ) : (
        <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
          <span className="font-serif text-stone-300 text-xs italic">Merce</span>
        </div>
      )}

      {/* Vídeo Hover */}
      {svc.video_url && (
        <video
          ref={videoRef}
          src={getFullUrl(svc.video_url)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
        />
      )}

      {/* Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-end p-6">
        <div className="text-white w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h5 className="font-serif font-bold leading-tight line-clamp-2 text-xl">{svc.name}</h5>
            <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em]">{svc.duration_minutes} min</p>
        </div>
      </div>
    </Link>
  );
}

export default function PublicNavbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [btnText, setBtnText] = useState('Reservar Cita');
  const [btnLink, setBtnLink] = useState('#contacto');
  
  // States for Phase 1
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
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
      .catch(() => {});
      
    // Fetch site content just for button link
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/site-content/`)
      .then(res => res.json())
      .then(data => {
         if(data.hero_button_text) setBtnText(data.hero_button_text);
         if(data.hero_button_link) setBtnLink(data.hero_button_link);
      })
      .catch(() => {});
      
    // Fetch categories and services for Mega Menu
    if (!isDashboard) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`)
        .then(res => res.json())
        .then(data => {
           setCategories(data);
           if(data.length > 0) setActiveCategory(data[0].id);
        }).catch(() => {});
        
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`)
        .then(res => res.json())
        .then(data => setServices(data))
        .catch(() => {});
    }
  }, [isDashboard]);

  // Scroll logic for Glassmorphism & Smart Header
  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Capturamos el scroll ya sea del window o del contenedor principal en móvil
      const target = e.target as HTMLElement | Document;
      
      // Ignorar eventos de scroll que provengan de los carruseles horizontales
      if (target !== document && (target as HTMLElement).id !== 'main-scroll-container') {
        return;
      }

      const scrollY = target === document ? window.scrollY : (target as HTMLElement).scrollTop;
      
      if (scrollY !== undefined) {
        setScrolled(scrollY > 50);
        lastScrollY.current = scrollY;
      }
    };
    
    // Usamos capture: true para interceptar eventos de scroll de elementos hijos (como el main con overflow-y-auto)
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, pathname]);

  // Bloqueo de scroll cuando el menú móvil está abierto para aislar la experiencia
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

  return (
    <>
      <nav className={`fixed w-full top-0 z-[100] transition-all duration-500 ease-in-out translate-y-0 ${(scrolled || !isHome) ? 'bg-white/90 backdrop-blur-xl border-b border-stone-200/50 shadow-sm py-0' : 'bg-transparent border-transparent py-2'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* LOGO - z-index alto para estar sobre el overlay si es necesario */}
        <div className="flex items-center gap-4 z-[110] relative">
           {settings?.logo_app_b64 ? (
             <Link href="/" onClick={() => setIsOpen(false)}>
               <img src={settings.logo_app_b64} alt="Logo" className="h-10" />
             </Link>
           ) : (
             <Link href="/" onClick={() => setIsOpen(false)} className={`font-extrabold text-2xl tracking-tighter transition-colors ${(scrolled || !isHome) ? 'text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>
               {settings?.clinic_name || "Merce"}
             </Link>
           )}
        </div>

        {/* DESKTOP MENU & MEGA MENU WRAPPER */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="/" className={`transition-colors ${pathname === '/' ? ((scrolled || !isHome) ? 'text-[#d4af37]' : 'text-[#d4af37]') : ((scrolled || !isHome) ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]')}`}>Inicio</Link>
          
          {/* Tratamientos Wrapper */}
          <div 
             className="h-20 flex items-center"
             onMouseEnter={() => setShowMegaMenu(true)}
             onMouseLeave={() => setShowMegaMenu(false)}
          >
             <Link href="/tratamientos" className={`transition-colors flex items-center gap-1 ${pathname === '/tratamientos' ? 'text-[#d4af37]' : (scrolled || !isHome) ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>
               Tratamientos
             </Link>
          </div>
          
          <Link href="/contacto" className={`transition-colors ${pathname === '/contacto' ? 'text-[#d4af37]' : (scrolled || !isHome) ? 'text-stone-800 hover:text-[#d4af37]' : 'text-white hover:text-[#d4af37]'}`}>Contacto</Link>
          <a href={btnLink} className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-[#d4af37] transition-all shadow-md active:scale-95">
            {btnText}
          </a>
        </div>

        {/* MEGA MENU (Full width relative to container) */}
        <div 
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
            className={`absolute top-full left-6 right-6 bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-stone-100 overflow-hidden transition-all duration-300 origin-top ${showMegaMenu ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
        >
          <div className="flex h-[380px]">
              {/* Left Panel: Categories */}
              <div className="w-[300px] shrink-0 bg-[#F7F7F5] py-6 px-8 border-r border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6">Categorías</h4>
                <ul className="space-y-1">
                  {categories.filter(c => c.name.toUpperCase() !== 'GENERAL').map(cat => (
                    <li key={cat.id}>
                      <button 
                          onMouseEnter={() => setActiveCategory(cat.id)}
                          onClick={() => { setShowMegaMenu(false); window.location.href = `/tratamientos#${cat.id}` }}
                          className={`w-full text-left px-4 py-3 rounded-2xl transition-all font-serif text-xl whitespace-nowrap ${activeCategory === cat.id ? 'bg-white shadow-sm text-[#d4af37] font-semibold' : 'text-stone-500 hover:bg-stone-100'}`}
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
          className={`md:hidden z-[110] relative p-2 focus:outline-none transition-colors ${(scrolled || !isHome || isOpen) ? 'text-stone-800' : 'text-white'}`}
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
        className={`fixed inset-0 bg-white z-[120] transition-all duration-500 ease-in-out md:hidden ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
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
                  <Link key={cat.id} href={`/tratamientos#${cat.id}`} onClick={() => setIsOpen(false)} className="text-xl font-serif font-normal text-stone-500 hover:text-stone-800 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/contacto" onClick={() => setIsOpen(false)} className={`transition-all duration-300 active:scale-95 ${pathname === '/contacto' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Contacto</Link>
            
            <div className="w-full h-px bg-stone-100 my-2 max-w-[150px] mx-auto"></div>
            
            <a href={btnLink} onClick={() => setIsOpen(false)} className="bg-[#d4af37] text-white px-10 py-5 rounded-full hover:bg-stone-900 transition-all shadow-2xl text-2xl w-full max-w-xs mx-auto active:scale-95">
              {btnText}
            </a>

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
