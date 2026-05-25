"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Camera, Share2, MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/app/contexts/LanguageContext';

const DAYS_MAP: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
};

const footerTranslations: Record<string, Record<string, string>> = {
  es: {
    'footer.about_text': 'Especialistas en medicina estética avanzada y bienestar. Un refugio de lujo diseñado para resaltar tu belleza natural con la tecnología más innovadora.',
    'footer.follow_us': 'Síguenos en redes',
    'footer.contact': 'Contacto',
    'footer.schedule': 'Horarios',
    'footer.lunch_close': 'Cierre mediodía',
    'footer.sat_sun': 'Sábados y Domingos',
    'footer.sun': 'Domingos',
    'footer.navigation': 'Navegación',
    'footer.nav_home': 'Inicio',
    'footer.nav_treatments': 'Tratamientos',
    'footer.nav_contact': 'Contacto',
    'footer.nav_portal': 'Acceso Personal',
    'footer.rights_reserved': 'Todos los derechos reservados.',
    'footer.privacy': 'Privacidad',
    'footer.cookies': 'Cookies',
    'footer.legal': 'Aviso Legal',
    'footer.booking_conditions': 'Condiciones de Reserva',
    'common.closed': 'Cerrado',
    'common.days.1': 'Lunes',
    'common.days.2': 'Martes',
    'common.days.3': 'Miércoles',
    'common.days.4': 'Jueves',
    'common.days.5': 'Viernes',
    'common.days.6': 'Sábado',
    'common.days.7': 'Domingo'
  },
  en: {
    'footer.about_text': 'Specialists in advanced medical aesthetics and well-being. A luxury sanctuary designed to enhance your natural beauty with the most innovative technology.',
    'footer.follow_us': 'Follow us on social media',
    'footer.contact': 'Contact',
    'footer.schedule': 'Opening Hours',
    'footer.lunch_close': 'Lunch break',
    'footer.sat_sun': 'Saturdays and Sundays',
    'footer.sun': 'Sundays',
    'footer.navigation': 'Navigation',
    'footer.nav_home': 'Home',
    'footer.nav_treatments': 'Treatments',
    'footer.nav_contact': 'Contact',
    'footer.nav_portal': 'Staff Portal',
    'footer.rights_reserved': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.cookies': 'Cookies Policy',
    'footer.legal': 'Legal Notice',
    'footer.booking_conditions': 'Booking Conditions',
    'common.closed': 'Closed',
    'common.days.1': 'Monday',
    'common.days.2': 'Tuesday',
    'common.days.3': 'Wednesday',
    'common.days.4': 'Thursday',
    'common.days.5': 'Friday',
    'common.days.6': 'Saturday',
    'common.days.7': 'Sunday'
  },
  fr: {
    'footer.about_text': 'Spécialistes en esthétique médicale avancée et en bien-être. Un refuge de luxe conçu pour sublimer votre beauté naturelle avec la technologie la plus innovante.',
    'footer.follow_us': 'Suivez-nous sur les réseaux',
    'footer.contact': 'Contact',
    'footer.schedule': 'Horaires d\'Ouverture',
    'footer.lunch_close': 'Fermeture midi',
    'footer.sat_sun': 'Samedis et Dimanches',
    'footer.sun': 'Dimanches',
    'footer.navigation': 'Navigation',
    'footer.nav_home': 'Accueil',
    'footer.nav_treatments': 'Soins',
    'footer.nav_contact': 'Contact',
    'footer.nav_portal': 'Portail Personnel',
    'footer.rights_reserved': 'Tous droits réservés.',
    'footer.privacy': 'Confidentialité',
    'footer.cookies': 'Cookies',
    'footer.legal': 'Mentions Légales',
    'footer.booking_conditions': 'Conditions de Réservation',
    'common.closed': 'Fermé',
    'common.days.1': 'Lundi',
    'common.days.2': 'Mardi',
    'common.days.3': 'Mercredi',
    'common.days.4': 'Jeudi',
    'common.days.5': 'Vendredi',
    'common.days.6': 'Samedi',
    'common.days.7': 'Dimanche'
  }
};

export default function Footer() {
  const { language } = useLanguage();
  
  const translateStatic = (key: string, defaultValue: string) => {
    const lang = language || 'es';
    return footerTranslations[lang]?.[key] || defaultValue;
  };

  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isDashboard) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => { });
  }, [isDashboard]);

  if (isDashboard) return null;

  // Función para formatear los días laborables de forma inteligente
  const getWorkingDaysDisplay = () => {
    const days = settings?.working_days || [1, 2, 3, 4, 5];
    if (!days || days.length === 0) return translateStatic('common.closed', 'Cerrado');

    const minDay = Math.min(...days);
    const maxDay = Math.max(...days);

    // Si son días consecutivos (ej: 1 al 5)
    if (days.length === (maxDay - minDay + 1)) {
      return `${translateStatic(`common.days.${minDay}`, DAYS_MAP[minDay])} — ${translateStatic(`common.days.${maxDay}`, DAYS_MAP[maxDay])}`;
    }

    // Si no son consecutivos, los listamos
    return days.map((d: number) => translateStatic(`common.days.${d}`, DAYS_MAP[d]).substring(0, 3)).join(', ');
  };

  const isOpenOnSaturday = settings?.working_days?.includes(6);
  const isOpenOnSunday = settings?.working_days?.includes(7);

  return (
    <footer className="bg-[#1c1917] text-stone-400 py-24 print:hidden border-t border-stone-800/50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* Columna 1: Identidad */}
          <div className="space-y-6">
              <Link href="/" className="inline-block text-2xl font-serif font-black text-white tracking-tighter hover:text-primary transition-colors">
                 {settings?.clinic_name ? settings.clinic_name.toUpperCase() : 'ESTÉTICA MERCE'}
              </Link>
            <p className="text-sm font-medium leading-relaxed opacity-70 max-w-xs">
              {translateStatic('footer.about_text', "Especialistas en medicina estética avanzada y bienestar. Un refugio de lujo diseñado para resaltar tu belleza natural con la tecnología más innovadora.")}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href={settings?.instagram_url || "https://instagram.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-luxury-btn bg-stone-900 border border-stone-800 flex items-center justify-center text-white hover:text-primary hover:border-primary transition-all duration-300"
              >
                <Camera size={18} />
              </a>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                {translateStatic('footer.follow_us', "Siguenos en redes")}
              </span>
            </div>
          </div>

          {/* Columna 2: Contacto */}
          <div className="space-y-6">
            <h4 className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
              {translateStatic('footer.contact', "Contacto")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium leading-snug">
                  {settings?.clinic_address || 'Calle Favareta, 46, Alzira, Valencia'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <a href={`tel:${settings?.clinic_phone || '+34605407128'}`} className="text-sm font-bold text-white hover:text-primary transition-colors">
                  {settings?.clinic_phone || '+34 605 40 71 28'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <a href={`mailto:${settings?.clinic_email || 'hola@clinicamerce.com'}`} className="text-sm font-medium hover:text-primary transition-colors">
                  {settings?.clinic_email || 'hola@clinicamerce.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios Dinámicos */}
          <div className="space-y-6">
            <h4 className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
              {translateStatic('footer.schedule', "Horarios")}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{getWorkingDaysDisplay()}</p>
                  <p className="text-xs opacity-70">
                    {settings?.open_time || '10:00'} — {settings?.close_time || '20:00'}
                  </p>
                  {settings?.lunch_start && settings?.lunch_end && (
                    <p className="text-[10px] opacity-40 italic font-medium">
                      {translateStatic('footer.lunch_close', "Cierre mediodía")}: {settings.lunch_start} - {settings.lunch_end}
                    </p>
                  )}
                </div>
              </li>

              {/* Mensaje dinámico para fin de semana */}
              {!isOpenOnSaturday && !isOpenOnSunday && (
                <li className="flex items-start gap-3 pl-7">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-500">
                      {translateStatic('footer.sat_sun', "Sábados y Domingos")}
                    </p>
                    <p className="text-xs opacity-40 italic text-stone-500">
                      {translateStatic('common.closed', "Cerrado")}
                    </p>
                  </div>
                </li>
              )}

              {isOpenOnSaturday && !isOpenOnSunday && (
                <li className="flex items-start gap-3 pl-7">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-500">
                      {translateStatic('footer.sun', "Domingos")}
                    </p>
                    <p className="text-xs opacity-40 italic text-stone-500">
                      {translateStatic('common.closed', "Cerrado")}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Columna 4: Navegación */}
          <div className="space-y-6">
            <h4 className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
              {translateStatic('footer.navigation', "Navegación")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  {translateStatic('footer.nav_home', "Inicio")}
                </Link>
              </li>
              <li>
                <Link href="/tratamientos" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  {translateStatic('footer.nav_treatments', "Tratamientos")}
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  {translateStatic('footer.nav_contact', "Contacto")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                  <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                  {translateStatic('footer.nav_portal', "Acceso Personal")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              © {new Date().getFullYear()} {settings?.clinic_name || 'Estética Merce'}. {translateStatic('footer.rights_reserved', "Todos los derechos reservados.")}
            </div>
            <LanguageSelector upward={true} />
          </div>

          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-4">
            <Link href="/privacidad" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">
              {translateStatic('footer.privacy', "Privacidad")}
            </Link>
            <Link href="/cookies" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">
              {translateStatic('footer.cookies', "Cookies")}
            </Link>
            <Link href="/aviso-legal" className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">
              {translateStatic('footer.legal', "Aviso Legal")}
            </Link>
            {settings?.stripe_charges_enabled && (
              <Link href="/condiciones-reserva" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">
                {translateStatic('footer.booking_conditions', "Condiciones de Reserva")}
              </Link>
            )}
          </nav>
        </div>

      </div>
    </footer>
  );
}
