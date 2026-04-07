"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicNavbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [btnText, setBtnText] = useState('Reservar Cita');
  const [btnLink, setBtnLink] = useState('#contacto');

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
  }, [isDashboard]);

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

  return (
    <>
      <nav className="fixed w-full top-0 bg-white/95 backdrop-blur-md border-b border-stone-200 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* LOGO - z-index alto para estar sobre el overlay si es necesario */}
        <div className="flex items-center gap-4 z-[110] relative">
           {settings?.logo_app_b64 ? (
             <Link href="/" onClick={() => setIsOpen(false)}>
               <img src={settings.logo_app_b64} alt="Logo" className="h-10" />
             </Link>
           ) : (
             <Link href="/" onClick={() => setIsOpen(false)} className="font-extrabold text-2xl tracking-tighter text-[#d4af37]">
               {settings?.clinic_name || "Merce"}
             </Link>
           )}
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="/" className={`transition-colors ${pathname === '/' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Inicio</Link>
          <Link href="/tratamientos" className={`transition-colors ${pathname === '/tratamientos' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Tratamientos</Link>
          <Link href="/contacto" className={`transition-colors ${pathname === '/contacto' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Contacto</Link>
          <a href={btnLink} className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-[#d4af37] transition-all shadow-md active:scale-95">
            {btnText}
          </a>
        </div>

        {/* MOBILE MENU BUTTON - z-index máximo para control total */}
        <button 
          className="md:hidden z-[110] relative text-stone-800 p-2 focus:outline-none"
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
            <Link href="/tratamientos" onClick={() => setIsOpen(false)} className={`transition-all duration-300 active:scale-95 ${pathname === '/tratamientos' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'}`}>Tratamientos</Link>
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
