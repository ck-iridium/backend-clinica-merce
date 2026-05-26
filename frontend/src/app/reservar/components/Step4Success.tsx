"use client"
import React from 'react';
import { Check, Calendar, Clock, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function Step4Success({
  selectedDate,
  selectedTime,
  selectedService,
  formData
}: {
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  formData: { name: string; email: string };
}) {
  const { t, language } = useLanguage();

  // Ajustamos el idioma de la fecha dinámicamente
  const dateLocale = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES';

  return (
    <div className="w-full flex flex-col flex-grow bg-background text-foreground items-center justify-center px-6 overflow-y-auto py-12 md:py-24">
      {/* Círculo de Éxito Animado */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="w-20 h-20 md:w-28 md:h-28 bg-primary rounded-full flex items-center justify-center mb-8 md:mb-12 shadow-2xl relative"
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
        className="text-center mb-10 md:mb-14"
      >
        <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight mb-2 md:mb-4">
          {t('success.title')}
        </h1>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles size={12} className="md:scale-125" />
          <span>{t('success.subtitle')}</span>
        </div>
      </motion.div>

      {/* Tarjeta Bento de Confirmación */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm md:max-w-xl bg-card rounded-luxury-card border border-border shadow-xl overflow-hidden mb-8 md:mb-12"
      >
        <div className="p-6 md:p-8 md:px-10 border-b border-border/40">
          <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-widest mb-4 md:mb-6">
            {t('success.summary')}
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

      {/* Nota de Correo Estilizada */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center max-w-xs md:max-w-md mb-10 md:mb-14 px-4"
      >
        <div className="inline-flex items-center gap-2 bg-card px-4 py-2 md:px-6 md:py-3 rounded-full border border-border shadow-sm mb-4">
          <Mail size={14} className="text-primary md:scale-125" />
          <span className="text-[10px] md:text-xs font-bold text-foreground">{formData.email}</span>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {t('success.emailNote1')} <span className="text-foreground font-bold">{t('success.emailNoteTime')}</span> {t('success.emailNote2')}
        </p>
      </motion.div>

      {/* Botón Final */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-xs md:max-w-md"
      >
        <Link
          href="/"
          className="group w-full bg-primary text-primary-foreground py-4 md:py-5 rounded-luxury-btn font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span>{t('success.backHome')}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform md:scale-125" />
        </Link>
      </motion.div>
    </div>
  );
}