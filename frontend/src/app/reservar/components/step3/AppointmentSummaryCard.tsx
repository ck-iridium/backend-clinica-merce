"use client";

import React from 'react';
import { MapPin, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getServiceDepositInfo } from './utils';

interface AppointmentSummaryCardProps {
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  selectedLocation?: any;
  settings?: any;
  onOpenDepositInfo: () => void;
}

export default function AppointmentSummaryCard({
  selectedDate,
  selectedTime,
  selectedService,
  selectedLocation,
  settings,
  onOpenDepositInfo,
}: AppointmentSummaryCardProps) {
  const { language, t, translate } = useLanguage();
  const dep = getServiceDepositInfo(selectedService, settings);

  const locName = selectedLocation?.name || settings?.clinic_name;
  const locAddr = selectedLocation?.address || settings?.clinic_address;

  const formattedDate = selectedDate.toLocaleDateString(
    language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long' }
  );

  return (
    <div className="bg-card rounded-luxury-card p-4 md:p-6 md:px-8 border border-border shadow-sm flex items-center justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

      <div className="relative z-10">
        <p className="text-[10px] md:text-xs font-black uppercase text-primary tracking-[0.2em] mb-0.5">
          {t('wizard.appointment_for_date')}
        </p>
        <p className="text-base md:text-xl font-serif text-foreground leading-tight">
          {formattedDate}
        </p>
        <p className="text-xs md:text-sm font-bold text-muted-foreground mt-0.5">
          {t('wizard.at_time').replace('{time}', selectedTime)}
        </p>
        
        {locName && (
          <div className="mt-2 text-[11px] md:text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <MapPin size={12} className="text-primary shrink-0" />
            <span className="truncate max-w-[200px] md:max-w-[300px]">
              {locName}{locAddr ? ` (${locAddr})` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="text-right relative z-10 flex flex-col items-end">
        <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/50 tracking-widest mb-0.5">
          {t('wizard.total')}
        </p>
        <p className="text-2xl md:text-3xl font-serif text-foreground font-bold">
          {selectedService?.price}€
        </p>
        
        {dep.required && (
          <div className="flex items-center gap-1.5 mt-1.5 justify-end">
            <motion.button
              type="button"
              onClick={onOpenDepositInfo}
              animate={{
                scale: [1, 1.12, 1],
                boxShadow: [
                  "0px 0px 0px rgba(59, 130, 246, 0)",
                  "0px 0px 8px rgba(59, 130, 246, 0.45)",
                  "0px 0px 0px rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors p-1 rounded-full focus:outline-none flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50 mr-0.5"
              title={t('wizard.deposit_info_title')}
            >
              <Info size={13} className="shrink-0" />
            </motion.button>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t('wizard.fianza')}
            </span>
            <span className="text-xs md:text-sm font-bold text-primary">
              {dep.amount}€
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
