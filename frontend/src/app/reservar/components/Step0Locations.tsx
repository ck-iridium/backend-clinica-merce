"use client"
import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Location {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export default function Step0Locations({
  locations,
  onSelectLocation
}: {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative bg-background text-foreground animate-in fade-in duration-300">
      {/* Header Compacto */}
      <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-background">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">
          {t('wizard.select_location_title') || 'Selecciona tu Sede'}
        </h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium">
          {t('wizard.select_location_subtitle') || 'Elige la ubicación donde deseas realizar tu tratamiento'}
        </p>
      </div>

      <div className="flex flex-col flex-grow min-h-0 relative">
        {/* Superior gradient for depth */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />

        <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-6 pb-20 space-y-3">
          {locations.map((loc, i) => (
            <motion.button
              key={loc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelectLocation(loc)}
              className="w-full bg-card rounded-luxury-card border border-border hover:border-primary/30 hover:bg-muted/50 p-4 flex items-center justify-between shadow-sm active:scale-98 transition-all shrink-0 group text-left gap-4"
            >
              {/* Left side: Icon & Text */}
              <div className="flex items-center gap-3.5 md:gap-4.5 min-w-0 flex-grow">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-luxury-btn bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="text-foreground font-serif text-base md:text-xl font-bold group-hover:text-primary transition-colors leading-snug">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal truncate">
                    {loc.address}
                  </p>
                  
                  {/* Compact contact details */}
                  {(loc.phone || loc.email) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-stone-400 font-medium mt-1">
                      {loc.phone && <span>📞 {loc.phone}</span>}
                      {loc.email && <span className="truncate max-w-[180px] md:max-w-none">✉️ {loc.email}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Action indicator */}
              <div className="flex items-center gap-3 shrink-0 pl-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-primary hidden md:inline group-hover:underline">
                  {t('common.select') || 'Seleccionar'}
                </span>
                <span className="text-muted-foreground/55 group-hover:text-primary transition-colors text-lg md:text-xl font-bold">
                  ›
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
