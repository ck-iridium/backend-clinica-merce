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
import { useState, useEffect } from 'react';
import BotonReservaPro from '@/components/BotonReservaPro';

const DAYS_MAP: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
};

export default function ContactoPage() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => { });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('sent'), 1500);
  };

  const getWorkingDaysDisplay = () => {
    const days = settings?.working_days || [1, 2, 3, 4, 5];
    if (!days || days.length === 0) return 'Cerrado';
    const minDay = Math.min(...days);
    const maxDay = Math.max(...days);
    if (days.length === (maxDay - minDay + 1)) {
      return `${DAYS_MAP[minDay]} — ${DAYS_MAP[maxDay]}`;
    }
    return days.map((d: number) => DAYS_MAP[d].substring(0, 3)).join(', ');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden relative">
      
      {/* Elementos decorativos de fondo para impacto visual */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d4af37]/3 rounded-full blur-[120px] -mr-[400px] -mt-[400px] pointer-events-none" />
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
                <div className="w-8 h-px bg-[#d4af37]" />
                <span className="text-[#d4af37] font-bold text-[10px] uppercase tracking-[0.5em] block">
                  Concierge & Care
                </span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-serif font-medium text-stone-900 leading-[0.85] tracking-tighter">
                Estamos <br /> 
                <span className="italic font-light text-stone-300 ml-[0.1em]">contigo.</span>
              </h1>
              <p className="text-xl md:text-2xl text-stone-500 max-w-xl leading-relaxed font-light">
                Tu viaje hacia la belleza natural comienza con un mensaje. Estamos aquí para escucharte.
              </p>
            </motion.div>

            {/* GRID DE INFORMACIÓN DINÁMICA */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-16">
              
              {/* Ubicación Dinámica */}
              <div className="space-y-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-luxury flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-500">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Encuéntranos</h3>
                  <p className="text-xl text-stone-900 font-medium leading-tight">
                    {settings?.clinic_address || "Calle Favareta, 46, Alzira"}
                  </p>
                  <p className="text-sm text-stone-400 font-medium">Valencia, 46600</p>
                </div>
              </div>

              {/* Horarios Dinámicos (Lógica Footer) */}
              <div className="space-y-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-luxury flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-500">
                  <Clock size={22} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Disponibilidad</h3>
                  <p className="text-xl text-stone-900 font-medium leading-tight">
                    {getWorkingDaysDisplay()}
                  </p>
                  <p className="text-sm text-stone-500 font-bold">
                    {settings?.open_time || '10:00'} — {settings?.close_time || '20:00'}
                  </p>
                  {settings?.lunch_start && (
                    <p className="text-[10px] text-stone-400 italic">
                      Descanso: {settings.lunch_start} - {settings.lunch_end}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ACCIONES DE CONTACTO DIRECTO */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-8">
              <a 
                href={`https://wa.me/${settings?.whatsapp_number?.replace('+', '') || '34605407128'}`}
                className="flex items-center gap-4 text-stone-900 hover:text-[#d4af37] transition-all group"
              >
                <div className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/5 transition-all duration-500">
                  <Share2 size={24} strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Escríbenos</p>
                  <p className="text-sm font-bold tracking-tight">WhatsApp Business</p>
                </div>
              </a>
              <a 
                href={`tel:${settings?.clinic_phone || '+34605407128'}`}
                className="flex items-center gap-4 text-stone-900 hover:text-[#d4af37] transition-all group"
              >
                <div className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/5 transition-all duration-500">
                  <Phone size={24} strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Llámanos</p>
                  <p className="text-sm font-bold tracking-tight">{settings?.clinic_phone || '+34 605 40 71 28'}</p>
                </div>
              </a>
            </motion.div>

            {/* FORMULARIO EDITORIAL REFORZADO */}
            <motion.div variants={itemVariants} className="pt-24 border-t border-stone-200/60">
              <h2 className="text-4xl font-serif font-medium text-stone-900 mb-16 italic tracking-tight">Solicita información personalizada</h2>
              
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="relative group">
                    <input required type="text" placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-[#d4af37] transition-all text-xl" />
                    <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#d4af37] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#d4af37]">Tu Nombre</label>
                  </div>
                  <div className="relative group">
                    <input required type="email" placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-[#d4af37] transition-all text-xl" />
                    <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#d4af37] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#d4af37]">Tu Email</label>
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea required rows={1} placeholder=" " className="peer w-full bg-transparent border-b-2 border-stone-100 py-4 outline-none focus:border-[#d4af37] transition-all text-xl resize-none" />
                  <label className="absolute left-0 top-4 text-stone-300 text-xl pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#d4af37] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-[#d4af37]">¿En qué podemos ayudarte?</label>
                </div>

                <BotonReservaPro 
                  type="submit"
                  texto={formState === 'idle' ? 'Enviar Consulta' : formState === 'sending' ? 'Enviando...' : 'Mensaje Recibido'}
                  className="w-full md:w-auto"
                />
              </form>
            </motion.div>

          </div>

          {/* LADO DERECHO: MAPA CARD (Cols 8-12) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              variants={itemVariants}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-luxury border border-white group"
            >
              {/* Mapa con filtro Dark/Muted reforzado */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!2sCalle+Favareta+46+Alzira!2m2!1d-0.437!2d39.151!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd61ab5d9d9d9d9d%3A0xd61ab5d9d9d9d9d!2sCalle%20Favareta%2C%2046%2C%2046600%20Alzira%2C%20Valencia!5e0!3m2!1ses!2ses!4v1715685000000!5m2!1ses!2ses"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                className="grayscale contrast-[1.1] brightness-[0.85] hover:grayscale-0 hover:brightness-100 transition-all duration-1000 ease-in-out"
              />
              
              {/* Float Glass Card */}
              <div className="absolute inset-x-8 bottom-8 p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl translate-y-6 group-hover:translate-y-0 transition-all duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">Estamos aquí</span>
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-2xl mb-4 italic leading-tight">Alzira</h4>
                <p className="text-stone-500 text-sm leading-relaxed mb-8 font-medium">Ubicados en la Calle Favareta, un entorno de confianza a la altura de tu belleza.</p>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=Calle+Favareta+46+Alzira" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group/link w-full bg-stone-900 text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-all"
                >
                  Cómo llegar <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>

            {/* Redes Sociales con impacto */}
            <motion.div variants={itemVariants} className="mt-12 flex justify-center gap-10">
              <a href="#" className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-[#d4af37] group-hover:shadow-md transition-all">
                  <Camera size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Instagram</span>
              </a>
              <a href="#" className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-[#d4af37] group-hover:shadow-md transition-all">
                  <Mail size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Email</span>
              </a>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
