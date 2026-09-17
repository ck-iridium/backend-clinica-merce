"use client"
import React from 'react';
import { Check, Calendar, Clock, Sparkles, Mail, ArrowRight, MapPin, CalendarPlus, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function Step4Success({
  selectedDate,
  selectedTime,
  selectedService,
  formData,
  selectedLocation,
  settings
}: {
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  formData: { name: string; email: string };
  selectedLocation?: any;
  settings?: any;
}) {
  const { t, language } = useLanguage();

  // Ajustamos el idioma de la fecha dinámicamente
  const dateLocale = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES';
  
  const locName = selectedLocation?.name || settings?.clinic_name || 'Estética Mercè';
  const locAddress = selectedLocation?.address || settings?.clinic_address || '';

  const getGoogleCalendarUrl = () => {
    if (!selectedDate || !selectedTime || !selectedService) return '#';
    try {
      const [h, m] = selectedTime.split(':');
      const start = new Date(selectedDate);
      start.setHours(parseInt(h || '0', 10), parseInt(m || '0', 10), 0, 0);
      const durationMin = selectedService.duration_minutes || 60;
      const end = new Date(start.getTime() + durationMin * 60000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatCal = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

      const clinic = locName || 'Clínica';
      const title = encodeURIComponent(`${selectedService.name} - ${clinic}`);
      const details = encodeURIComponent(
        `Cita confirmada para ${selectedService.name} en ${clinic}.\nCliente: ${formData.name || ''}\nUbicación: ${locAddress}`
      );
      const location = encodeURIComponent(locAddress || clinic);

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatCal(start)}/${formatCal(end)}&details=${details}&location=${location}&ctz=Europe/Madrid`;
    } catch {
      return '#';
    }
  };

  const whatsappNumber = settings?.whatsapp_number || settings?.clinic_phone;
  const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : null;

  return (
    <div className="w-full flex flex-col flex-grow bg-background text-foreground items-center justify-center px-6 overflow-y-auto py-12 md:py-20">
      {/* Círculo de Éxito Animado */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="w-20 h-20 md:w-28 md:h-28 bg-primary rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-2xl relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 scale-150"
        />
        <Check size={40} className="text-primary-foreground md:scale-125" />
      </motion.div>

      {/* Título Editorial */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8 md:mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight mb-2 md:mb-3">
          {t('success.title') || '¡Cita Confirmada!'}
        </h1>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles size={12} className="md:scale-125" />
          <span>{t('success.subtitle') || 'Tu espacio está reservado'}</span>
        </div>
      </motion.div>

      {/* Tarjeta Bento de Confirmación */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm md:max-w-xl bg-card rounded-luxury-card border border-border shadow-xl overflow-hidden mb-6 md:mb-8"
      >
        <div className="p-6 md:p-8 md:px-10 border-b border-border/40">
          <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-widest mb-4 md:mb-6">
            {t('success.summary') || 'Resumen de tu cita'}
          </p>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-muted rounded-luxury-btn flex items-center justify-center text-muted-foreground">
                <Calendar size={18} className="md:scale-125" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground">{t('common.date')}</p>
                <p className="text-sm md:text-lg font-bold text-foreground">
                  {selectedDate.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-muted rounded-luxury-btn flex items-center justify-center text-muted-foreground">
                <Clock size={18} className="md:scale-125" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground">{t('common.time')}</p>
                <p className="text-sm md:text-lg font-bold text-foreground">{selectedTime}h</p>
              </div>
            </div>

            {locName && (
              <div className="flex items-start gap-4 md:gap-6 pt-3 border-t border-border/40">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-muted rounded-luxury-btn flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                  <MapPin size={18} className="md:scale-125" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs uppercase font-bold text-muted-foreground">UBICACIÓN / SEDE</p>
                  <p className="text-sm md:text-base font-bold text-foreground">{locName}</p>
                  {locAddress && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{locAddress}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-6 md:p-8 md:px-10 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-widest mb-0.5">{t('common.treatment')}</p>
            <p className="text-xs md:text-base font-serif font-bold text-foreground/80 italic">{selectedService?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg md:text-2xl font-serif font-bold text-foreground">{selectedService?.price}€</p>
          </div>
        </div>
      </motion.div>

      {/* Nota de Correo Informativo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center max-w-xs md:max-w-md mb-6 md:mb-8 px-4"
      >
        <div className="inline-flex items-center gap-2 bg-card px-4 py-2 md:px-6 md:py-2.5 rounded-full border border-border shadow-sm mb-3">
          <Mail size={14} className="text-primary md:scale-125" />
          <span className="text-[10px] md:text-xs font-bold text-foreground">{formData.email}</span>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {t('success.emailNote1') || 'Hemos registrado tu cita en nuestra agenda. Te hemos enviado un'}{' '}
          <span className="text-foreground font-bold">{t('success.emailNoteTime') || 'justificante detallado'}</span>{' '}
          {t('success.emailNote2') || 'a tu correo con todos los datos.'}
        </p>
      </motion.div>

      {/* Botones de Acción (Añadir a Calendario + WhatsApp / Home) */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs md:max-w-md flex flex-col gap-3"
      >
        <a
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-primary text-primary-foreground py-3.5 md:py-4 rounded-luxury-btn font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2.5 active:scale-95 transition-all hover:opacity-95"
        >
          <CalendarPlus size={16} />
          <span>{t('success.addToCalendar') || 'Añadir a Google Calendar'}</span>
        </a>

        {cleanWhatsapp && (
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
              `¡Hola! Acabo de reservar cita para ${selectedService?.name} el ${selectedDate.toLocaleDateString(dateLocale)} a las ${selectedTime}h.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-card hover:bg-muted text-foreground border border-border py-3 md:py-3.5 rounded-luxury-btn font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <MessageCircle size={15} className="text-emerald-500" />
            <span>{t('success.contactWhatsApp') || 'Contactar por WhatsApp'}</span>
          </a>
        )}

        <Link
          href="/"
          className="group w-full py-2.5 text-muted-foreground hover:text-foreground text-center font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-1.5"
        >
          <span>{t('success.backHome') || 'Volver al Inicio'}</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}