"use client"
import React from 'react';
import { MapPin, Phone, Mail, ChevronRight, Navigation } from 'lucide-react';
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
    <div className="flex-grow flex flex-col min-h-0 bg-background text-foreground px-6 py-6 overflow-y-auto custom-scrollbar">
      <div className="text-center max-w-lg mx-auto mt-6 mb-10">
        <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-primary uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
          PROBOOKIA SAAS
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mt-3 tracking-tight">
          Selecciona tu Sede
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-sans font-light">
          Disponemos de varios centros equipados con la última tecnología y el mejor equipo de profesionales. Escoge el que mejor se adapte a ti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full pb-16">
        {locations.map((loc, i) => (
          <motion.button
            key={loc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectLocation(loc)}
            className="group flex flex-col justify-between p-6 bg-card hover:bg-muted border border-border hover:border-primary/45 rounded-3xl text-left transition-all duration-300 shadow-sm hover:shadow-xl active:scale-[0.98] relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-300" />
            
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={18} />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {loc.name}
                </h3>
              </div>

              <div className="space-y-3 font-sans text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <Navigation size={14} className="text-muted-foreground/60 mt-0.5 shrink-0" />
                  <span>{loc.address}</span>
                </div>
                {loc.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-muted-foreground/60 shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                )}
                {loc.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-muted-foreground/60 shrink-0" />
                    <span className="truncate">{loc.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between w-full">
              <span className="text-[10px] uppercase tracking-widest font-black text-primary">
                Ver servicios disponibles
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary text-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300">
                <ChevronRight size={16} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
