"use client"
import { motion } from 'framer-motion';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight,
  Mail,
  Camera,
  Share2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import BotonReservaPro from '@/components/BotonReservaPro';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS_MAP_LOCAL: Record<string, Record<number, string>> = {
  es: { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' },
  en: { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' },
  fr: { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi', 7: 'Dimanche' }
};

export default function ContactoPage() {
  const { t, language } = useLanguage();
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [settings, setSettings] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'clinics' | 'home'>('clinics');
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const circleRef = useRef<any | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.work_modality === 'home_only') {
          setActiveTab('home');
        }
      })
      .catch(() => { });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/locations/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLocations(data.filter((l: any) => l.is_active));
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (activeTab === 'home' && settings?.operations_center_latitude) {
      const linkId = 'leaflet-css-cdn-public';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        const script = document.createElement('script');
        script.id = 'leaflet-js-cdn-public';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initLeafletMap();
        };
        document.body.appendChild(script);
      } else {
        setTimeout(() => {
          initLeafletMap();
        }, 100);
      }
    }
  }, [activeTab, settings]);

  const initLeafletMap = () => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const lat = settings.operations_center_latitude || 40.416775;
    const lon = settings.operations_center_longitude || -3.703790;
    const radiusMeters = (settings.max_coverage_radius_km || 10) * 1000;

    const map = L.map(mapContainerRef.current).setView([lat, lon], 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const goldIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lon], { icon: goldIcon }).addTo(map);
    markerRef.current = marker;

    const circle = L.circle([lat, lon], {
      color: '#d4af37',
      fillColor: '#d4af37',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: radiusMeters
    }).addTo(map);
    circleRef.current = circle;

    const bounds = circle.getBounds();
    map.fitBounds(bounds, { padding: [15, 15] });
  };

  const getWhitelistZones = () => {
    if (!settings?.whitelist_zones) return [];
    try {
      const parsed = JSON.parse(settings.whitelist_zones);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('sent'), 1500);
  };

  const getWorkingDaysDisplay = () => {
    const days = settings?.working_days || [1, 2, 3, 4, 5];
    if (!days || days.length === 0) return language === 'fr' ? 'Fermé' : language === 'en' ? 'Closed' : 'Cerrado';
    const minDay = Math.min(...days);
    const maxDay = Math.max(...days);
    const map = DAYS_MAP_LOCAL[language] || DAYS_MAP_LOCAL['es'];
    if (days.length === (maxDay - minDay + 1)) {
      return `${map[minDay]} — ${map[maxDay]}`;
    }
    return days.map((d: number) => map[d].substring(0, 3)).join(', ');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  } as const;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden relative">
      
      {/* Elementos decorativos de fondo para impacto visual */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[120px] -mr-[400px] -mt-[400px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-200/20 rounded-full blur-[100px] -ml-[300px] -mb-[300px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-start"
        >
          
          {/* LADO IZQUIERDO: CONTENIDO (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-20">
            
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] block">
                  Concierge & Care
                </span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-serif font-medium text-stone-900 leading-[0.85] tracking-tighter">
                {t('contact.title')} <br /> 
                <span className="italic font-light text-stone-300 ml-[0.1em]">{t('contact.title_italic')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-stone-500 max-w-xl leading-relaxed font-light font-sans">
                {t('contact.subtitle')}
              </p>
            </motion.div>

            {/* GRID DE INFORMACIÓN DINÁMICA */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {!settings ? (
                <>
                  <div className="space-y-6 col-span-1">
                    <Skeleton className="w-12 h-12 rounded-luxury-card bg-stone-200/50" />
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-16 bg-stone-200/40" />
                      <Skeleton className="h-6 w-36 bg-stone-200/60" />
                      <Skeleton className="h-4 w-full bg-stone-200/30" />
                    </div>
                  </div>
                  <div className="space-y-6 col-span-1">
                    <Skeleton className="w-12 h-12 rounded-luxury-card bg-stone-200/50" />
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-16 bg-stone-200/40" />
                      <Skeleton className="h-6 w-36 bg-stone-200/60" />
                      <Skeleton className="h-4 w-full bg-stone-200/30" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Ubicación / Sedes */}
                  {activeTab === 'clinics' ? (
                    <div className="space-y-6 group col-span-1">
                      <div className="w-12 h-12 rounded-luxury-card bg-white shadow-luxury flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <MapPin size={22} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('contact.find_us')}</h3>
                        {locations.length > 0 ? (
                          <div className="space-y-3">
                            {locations.map((loc, idx) => (
                              <div 
                                key={loc.id} 
                                onClick={() => setSelectedLocationIndex(idx)}
                                className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
                                  selectedLocationIndex === idx 
                                    ? 'bg-white border-[#D4AF37] shadow-[0_8px_30px_rgb(0,0,0,0.04)]' 
                                    : 'bg-transparent border-stone-200/60 hover:bg-white/50'
                                }`}
                              >
                                <p className="font-bold text-stone-900 text-sm font-sans">{loc.name}</p>
                                <p className="text-xs text-stone-500 mt-1 font-sans">{loc.address}</p>
                                {loc.phone && <p className="text-[10px] text-stone-400 mt-1.5 font-bold font-sans">Tel: {loc.phone}</p>}
                              </div>
                            ))}
                          </div>
                        ) : settings?.clinic_address ? (
                          <p className="text-xl text-stone-900 font-medium leading-tight font-sans">
                            {settings.clinic_address}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    /* Domicilio Cobertura */
                    <div className="space-y-6 group col-span-1">
                      <div className="w-12 h-12 rounded-luxury-card bg-white shadow-luxury flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <MapPin size={22} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('contact.mobile_service')}</h3>
                        <p className="text-xl text-stone-900 font-medium leading-tight font-serif italic">
                          {t('contact.home_care')}
                        </p>
                        <p className="text-sm text-stone-500 leading-relaxed font-sans">
                          {t('contact.home_care_desc', { radius: settings?.max_coverage_radius_km || 10 })}
                        </p>
                        {getWhitelistZones().length > 0 && (
                          <div className="pt-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-2">{t('contact.preferred_zones')}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {getWhitelistZones().map((zone: string, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 bg-stone-100 border border-stone-200/50 rounded-lg text-[10px] font-bold text-stone-600 font-sans">
                                  {zone}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Horarios Dinámicos (Lógica Footer) */}
                  <div className="space-y-6 group">
                    <div className="w-12 h-12 rounded-luxury-card bg-white shadow-luxury flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <Clock size={22} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t('contact.availability')}</h3>
                      <p className="text-xl text-stone-900 font-medium leading-tight font-sans">
                        {getWorkingDaysDisplay()}
                      </p>
                      <p className="text-sm text-stone-500 font-bold font-sans">
                        {settings?.open_time || '10:00'} — {settings?.close_time || '20:00'}
                      </p>
                      {settings?.lunch_start && (
                        <p className="text-[10px] text-stone-400 italic font-sans">
                          {language === 'fr' ? 'Pause :' : language === 'en' ? 'Break:' : 'Descanso:'} {settings.lunch_start} - {settings.lunch_end}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* ACCIONES DE CONTACTO DIRECTO */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-8">
              {!settings ? (
                <>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-luxury-btn bg-stone-200/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-2.5 w-12 bg-stone-200/40" />
                      <Skeleton className="h-4 w-28 bg-stone-200/60" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-luxury-btn bg-stone-200/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-2.5 w-12 bg-stone-200/40" />
                      <Skeleton className="h-4 w-28 bg-stone-200/60" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {settings?.whatsapp_number && (
                    <a 
                      href={`https://wa.me/${settings.whatsapp_number.replace('+', '').replace(/\s+/g, '')}`}
                      className="flex items-center gap-4 text-stone-900 hover:text-primary transition-all group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-14 h-14 rounded-luxury-btn border border-stone-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all duration-500">
                        <Share2 size={24} strokeWidth={1.2} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{t('contact.write_us')}</p>
                        <p className="text-sm font-bold tracking-tight font-sans">WhatsApp Business</p>
                      </div>
                    </a>
                  )}
                  {settings?.clinic_phone && (
                    <a 
                      href={`tel:${settings.clinic_phone}`}
                      className="flex items-center gap-4 text-stone-900 hover:text-primary transition-all group"
                    >
                      <div className="w-14 h-14 rounded-luxury-btn border border-stone-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all duration-500">
                        <Phone size={24} strokeWidth={1.2} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{t('contact.call_us')}</p>
                        <p className="text-sm font-bold tracking-tight font-sans">{settings.clinic_phone}</p>
                      </div>
                    </a>
                  )}
                </>
              )}
            </motion.div>

            {/* FORMULARIO EDITORIAL REFORZADO */}
            <motion.div variants={itemVariants} className="pt-24 border-t border-stone-200/60">
              <h2 className="text-4xl font-serif font-medium text-stone-900 mb-16 italic tracking-tight">{t('contact.request_info')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="relative group">
                    <input required type="text" placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-primary transition-all text-xl" />
                    <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary">{t('contact.your_name')}</label>
                  </div>
                  <div className="relative group">
                    <input required type="email" placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-primary transition-all text-xl" />
                    <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary">{t('contact.your_email')}</label>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea required rows={1} placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-primary transition-all text-xl resize-none" />
                  <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary">{t('contact.help_placeholder')}</label>
                </div>

                <BotonReservaPro 
                  type="submit"
                  texto={formState === 'idle' ? t('contact.send_inquiry') : formState === 'sending' ? t('contact.sending') : t('contact.message_received')}
                  className="w-full md:w-auto"
                />
              </form>
            </motion.div>

          </div>

          {/* LADO DERECHO: MAPA CARD (Cols 8-12) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            {!settings ? (
              /* Mapa loading skeleton */
              <div className="relative aspect-[4/5] rounded-luxury-card overflow-hidden shadow-luxury border border-white bg-white p-8 flex flex-col justify-end space-y-4">
                <Skeleton className="w-full h-full absolute inset-0 bg-stone-100/50" />
                <div className="space-y-3 relative z-10">
                  <Skeleton className="h-3.5 w-24 bg-stone-200/40" />
                  <Skeleton className="h-6 w-48 bg-stone-200/60" />
                  <Skeleton className="h-4 w-full bg-stone-200/30" />
                  <Skeleton className="h-10 w-full bg-stone-200/80 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                {/* Selector de Modalidad (Solo si es mixto 'both') */}
                {settings?.work_modality === 'both' && (
                  <div className="flex border-b border-stone-200 gap-6 justify-center lg:justify-start">
                    <button
                      onClick={() => setActiveTab('clinics')}
                      className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === 'clinics'
                          ? 'text-[#D4AF37] border-[#D4AF37]'
                          : 'text-stone-400 border-transparent hover:text-stone-600'
                      }`}
                    >
                      {t('contact.our_locations')}
                    </button>
                    <button
                      onClick={() => setActiveTab('home')}
                      className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === 'home'
                          ? 'text-[#D4AF37] border-[#D4AF37]'
                          : 'text-stone-400 border-transparent hover:text-stone-600'
                      }`}
                    >
                      {t('contact.home_area')}
                    </button>
                  </div>
                )}

                {activeTab === 'clinics' ? (
                  /* VISTA DE SEDES: Google Maps */
                  <div className="space-y-4">
                    {/* Selector rápido de Sedes si hay varias */}
                    {locations.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                        {locations.map((loc, idx) => (
                          <button
                            key={loc.id}
                            onClick={() => setSelectedLocationIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                              selectedLocationIndex === idx
                                ? 'bg-stone-900 border-stone-900 text-white'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <motion.div 
                      variants={itemVariants}
                      className="relative aspect-[4/5] rounded-luxury-card overflow-hidden shadow-luxury border border-white group"
                    >
                      <iframe 
                        src={
                          locations[selectedLocationIndex] 
                            ? `https://maps.google.com/maps?q=${encodeURIComponent(locations[selectedLocationIndex].address)}&output=embed`
                            : (settings?.maps_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!2sCalle+Favareta+46+Alzira!2m2!1d-0.437!2d39.151!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd61ab5d9d9d9d9d%3A0xd61ab5d9d9d9d9d!2sCalle%20Favareta%2C%2046%2C%2046600%20Alzira%2C%20Valencia!5e0!3m2!1ses!2ses!4v1715685000000!5m2!1ses!2ses")
                        }
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        className="grayscale contrast-[1.1] brightness-[0.85] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 ease-in-out"
                      />
                      
                      {/* Float Glass Card */}
                      <div className="absolute inset-x-6 bottom-6 p-8 bg-white/70 backdrop-blur-2xl rounded-luxury-card border border-white/50 shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-700 z-20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">{t('contact.we_are_here')}</span>
                        </div>
                        <h4 className="font-serif font-bold text-stone-900 text-xl mb-2 italic leading-tight">
                          {locations[selectedLocationIndex]?.name || settings?.clinic_name}
                        </h4>
                        <p className="text-stone-500 text-xs leading-relaxed mb-6 font-medium font-sans">
                          {locations[selectedLocationIndex]?.address 
                            ? (language === 'fr' 
                                ? `Situé à ${locations[selectedLocationIndex].address}, un environnement de confiance.` 
                                : language === 'en'
                                  ? `Located at ${locations[selectedLocationIndex].address}, a trusted environment.`
                                  : `Ubicados en ${locations[selectedLocationIndex].address}, un entorno de confianza.`)
                            : settings?.clinic_address
                              ? (language === 'fr'
                                  ? `Situé à ${settings.clinic_address}, un environnement de confiance.`
                                  : language === 'en'
                                    ? `Located at ${settings.clinic_address}, a trusted environment.`
                                    : `Ubicados en ${settings.clinic_address}, un entorno de confianza.`)
                              : (language === 'fr'
                                  ? "Situé dans notre centre exclusif."
                                  : language === 'en'
                                    ? "Located in our exclusive center."
                                    : "Ubicados en nuestro centro exclusivo.")
                          }
                        </p>
                        <a 
                          href={
                            locations[selectedLocationIndex]
                              ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locations[selectedLocationIndex].address)}`
                              : settings?.maps_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings?.clinic_address || '')}`
                          }
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between group/link w-full bg-stone-900 text-white px-5 py-3.5 rounded-luxury-btn text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-all"
                        >
                          {t('contact.get_directions')} <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* VISTA DE DOMICILIO: Leaflet Map */
                  <motion.div 
                    variants={itemVariants}
                    className="relative aspect-[4/5] rounded-luxury-card overflow-hidden shadow-luxury border border-white group"
                  >
                    <div 
                      ref={mapContainerRef}
                      style={{ height: '100%', width: '100%', minHeight: '350px' }}
                      className="z-10"
                    />
                    
                    {/* Float Glass Card for Home */}
                    <div className="absolute inset-x-6 bottom-6 p-8 bg-white/70 backdrop-blur-2xl rounded-luxury-card border border-white/50 shadow-2xl z-20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">{t('contact.mobile_service')}</span>
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-xl mb-2 italic leading-tight">
                        {t('contact.coverage_area')}
                      </h4>
                      <p className="text-stone-500 text-xs leading-relaxed font-medium font-sans">
                        {t('contact.coverage_area_desc', { radius: settings?.max_coverage_radius_km || 10 })}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Redes Sociales con impacto */}
            <motion.div variants={itemVariants} className="mt-12 flex justify-center gap-10">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
                  <div className="w-14 h-14 rounded-luxury-btn bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:shadow-md transition-all">
                    <Camera size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Instagram</span>
                </a>
              )}
              {settings?.clinic_email && (
                <a href={`mailto:${settings.clinic_email}`} className="flex flex-col items-center gap-3 group">
                  <div className="w-14 h-14 rounded-luxury-btn bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:shadow-md transition-all">
                    <Mail size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Email</span>
                </a>
              )}
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
