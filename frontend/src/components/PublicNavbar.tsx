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

  if (isDashboard) return null;

  return (
    <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md border-b border-stone-200 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-4 z-50 relative">
           {settings?.logo_app_b64 ? (
             <Link href="/"><img src={settings.logo_app_b64} alt="Logo" className="h-10" /></Link>
           ) : (
             <Link href="/" className="font-extrabold text-2xl tracking-tighter text-[#d4af37]">{settings?.clinic_name || "Merce"}</Link>
           )}
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">Inicio</Link>
          <Link href="/tratamientos" className="hover:text-[#d4af37] transition-colors">Tratamientos</Link>
          <Link href="/contacto" className="hover:text-[#d4af37] transition-colors">Contacto</Link>
          <a href={btnLink} className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-[#d4af37] transition-all shadow-md active:scale-95">
            {btnText}
          </a>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button 
          className="md:hidden z-50 relative text-stone-800 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
             <span className={`block w-full h-[2px] bg-current transition-all ${isOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
             <span className={`block w-full h-[2px] bg-current transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
             <span className={`block w-full h-[2px] bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
          </div>
        </button>

        {/* MOBILE MENU OVERLAY */}
        <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 flex items-center justify-center ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
           <div className="flex flex-col items-center gap-8 font-extrabold text-2xl">
              <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#d4af37] transition-colors">Inicio</Link>
              <Link href="/tratamientos" onClick={() => setIsOpen(false)} className="hover:text-[#d4af37] transition-colors">Tratamientos</Link>
              <Link href="/contacto" onClick={() => setIsOpen(false)} className="hover:text-[#d4af37] transition-colors">Contacto</Link>
              <a href={btnLink} onClick={() => setIsOpen(false)} className="mt-8 bg-[#d4af37] text-white px-10 py-5 rounded-full hover:bg-stone-900 transition-all shadow-xl text-xl">
                {btnText}
              </a>
           </div>
        </div>
      </div>
    </nav>
  );
}
