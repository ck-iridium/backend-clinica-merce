"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isDashboard) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, [isDashboard]);

  if (isDashboard) return null;

  return (
    <footer className="bg-stone-950 text-stone-400 py-16 print:hidden border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
           <div>
              <Link href="/" className="inline-block text-xl font-black text-white tracking-tighter hover:text-[#d4af37] transition-colors mb-4">
                 {settings?.clinic_name ? settings.clinic_name.toUpperCase() : 'CLÍNICA MERCÈ'}
              </Link>
              <p className="text-sm font-medium leading-relaxed opacity-80 max-w-xs">
                {settings?.clinic_address || 'Tu centro de estética avanzada.'}
              </p>
           </div>
           
           <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contacto</h4>
              <ul className="space-y-3 text-sm font-medium opacity-80">
                 {settings?.clinic_phone && <li>Tel: {settings.clinic_phone}</li>}
                 {settings?.whatsapp_number && <li><a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g,'')}`} className="hover:text-[#d4af37]">WhatsApp Directo</a></li>}
                 {settings?.clinic_email && <li><a href={`mailto:${settings.clinic_email}`} className="hover:text-[#d4af37]">{settings.clinic_email}</a></li>}
              </ul>
           </div>
           
           <div>
               <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Enlaces Rápidos</h4>
               <ul className="space-y-3 text-sm font-medium opacity-80">
                  <li><Link href="/" className="hover:text-[#d4af37]">Inicio</Link></li>
                  <li><Link href="/tratamientos" className="hover:text-[#d4af37]">Tratamientos</Link></li>
                  <li><Link href="/contacto" className="hover:text-[#d4af37]">Contacto</Link></li>
               </ul>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-stone-800/50">
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
            <Link href="/aviso-legal" className="hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Aviso Legal
            </Link>
            <Link href="/privacidad" className="hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              Política de Cookies
            </Link>
          </nav>

          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            © {new Date().getFullYear()} {settings?.legal_name || settings?.clinic_name || 'Todos los derechos reservados'}
          </div>
        </div>
      </div>
    </footer>
  );
}
