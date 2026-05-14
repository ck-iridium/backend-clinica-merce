"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Camera, Share2, MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';

const DAYS_MAP: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
};

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

  // Función para formatear los días laborables de forma inteligente
  const getWorkingDaysDisplay = () => {
    const days = settings?.working_days || [1, 2, 3, 4, 5];
    if (!days || days.length === 0) return 'Cerrado';

    const minDay = Math.min(...days);
    const maxDay = Math.max(...days);

    // Si son días consecutivos (ej: 1 al 5)
    if (days.length === (maxDay - minDay + 1)) {
      return `${DAYS_MAP[minDay]} — ${DAYS_MAP[maxDay]}`;
    }

    // Si no son consecutivos, los listamos
    return days.map((d: number) => DAYS_MAP[d].substring(0, 3)).join(', ');
  };

  const isOpenOnSaturday = settings?.working_days?.includes(6);
  const isOpenOnSunday = settings?.working_days?.includes(7);

  return (
    <footer className="bg-[#1c1917] text-stone-400 py-24 print:hidden border-t border-stone-800/50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
           
           {/* Columna 1: Identidad */}
           <div className="space-y-6">
              <Link href="/" className="inline-block text-2xl font-serif font-black text-white tracking-tighter hover:text-[#d4af37] transition-colors">
                 {settings?.clinic_name ? settings.clinic_name.toUpperCase() : 'CLÍNICA MERCÈ'}
              </Link>
              <p className="text-sm font-medium leading-relaxed opacity-70 max-w-xs">
                Especialistas en medicina estética avanzada y bienestar. Un refugio de lujo diseñado para resaltar tu belleza natural con la tecnología más innovadora.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-white hover:text-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                  <Camera size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-white hover:text-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                  <Share2 size={18} />
                </a>
              </div>
           </div>
           
           {/* Columna 2: Contacto */}
           <div className="space-y-6">
              <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em]">Contacto</h4>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <MapPin size={18} className="text-[#d4af37] shrink-0 mt-0.5" />
                   <span className="text-sm font-medium leading-snug">
                     {settings?.clinic_address || 'Calle Favareta, 46, Alzira, Valencia'}
                   </span>
                 </li>
                 <li className="flex items-center gap-3">
                   <Phone size={18} className="text-[#d4af37] shrink-0" />
                   <a href={`tel:${settings?.clinic_phone || '+34605407128'}`} className="text-sm font-bold text-white hover:text-[#d4af37] transition-colors">
                     {settings?.clinic_phone || '+34 605 40 71 28'}
                   </a>
                 </li>
                 <li className="flex items-center gap-3">
                   <Mail size={18} className="text-[#d4af37] shrink-0" />
                   <a href={`mailto:${settings?.clinic_email || 'hola@clinicamerce.com'}`} className="text-sm font-medium hover:text-[#d4af37] transition-colors">
                     {settings?.clinic_email || 'hola@clinicamerce.com'}
                   </a>
                 </li>
              </ul>
           </div>
           
           {/* Columna 3: Horarios Dinámicos */}
           <div className="space-y-6">
              <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em]">Horarios</h4>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <Clock size={18} className="text-[#d4af37] shrink-0 mt-0.5" />
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-white">{getWorkingDaysDisplay()}</p>
                     <p className="text-xs opacity-70">
                        {settings?.open_time || '10:00'} — {settings?.close_time || '20:00'}
                     </p>
                     {settings?.lunch_start && settings?.lunch_end && (
                       <p className="text-[10px] opacity-40 italic font-medium">
                         Cierre mediodía: {settings.lunch_start} - {settings.lunch_end}
                       </p>
                     )}
                   </div>
                 </li>
                 
                 {/* Mensaje dinámico para fin de semana */}
                 {!isOpenOnSaturday && !isOpenOnSunday && (
                   <li className="flex items-start gap-3 pl-7">
                     <div className="space-y-1">
                       <p className="text-sm font-bold text-stone-500">Sábados y Domingos</p>
                       <p className="text-xs opacity-40 italic text-stone-500">Cerrado</p>
                     </div>
                   </li>
                 )}

                 {isOpenOnSaturday && !isOpenOnSunday && (
                   <li className="flex items-start gap-3 pl-7">
                     <div className="space-y-1">
                       <p className="text-sm font-bold text-stone-500">Domingos</p>
                       <p className="text-xs opacity-40 italic text-stone-500">Cerrado</p>
                     </div>
                   </li>
                 )}
              </ul>
           </div>
           
           {/* Columna 4: Navegación */}
           <div className="space-y-6">
              <h4 className="text-[#d4af37] font-bold text-xs uppercase tracking-[0.2em]">Navegación</h4>
              <ul className="space-y-3">
                 <li>
                   <Link href="/" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                     <ChevronRight size={14} className="text-[#d4af37] opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                     Inicio
                   </Link>
                 </li>
                 <li>
                   <Link href="/tratamientos" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                     <ChevronRight size={14} className="text-[#d4af37] opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                     Tratamientos
                   </Link>
                 </li>
                 <li>
                   <Link href="/contacto" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                     <ChevronRight size={14} className="text-[#d4af37] opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                     Contacto
                   </Link>
                 </li>
                 <li>
                   <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                     <ChevronRight size={14} className="text-[#d4af37] opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                     Acceso Personal
                   </Link>
                 </li>
              </ul>
           </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-10 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            © {new Date().getFullYear()} {settings?.clinic_name || 'Clínica Mercè'}. Todos los derechos reservados.
          </div>
          
          <nav className="flex items-center gap-8">
            <Link href="/cookies" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">
              Política de Cookies
            </Link>
            <Link href="/aviso-legal" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">
              Aviso Legal
            </Link>
          </nav>
        </div>
        
      </div>
    </footer>
  );
}
