"use client"
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Staff {
  id: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  email?: string;
}

export default function Step1Specialists({
  staffList,
  selectedStaff,
  onSelectStaff
}: {
  staffList: Staff[];
  selectedStaff: Staff;
  onSelectStaff: (staff: Staff) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full flex flex-col flex-grow min-h-0 relative bg-background text-foreground animate-in fade-in duration-300">
      {/* Header Compacto */}
      <div className="shrink-0 px-6 pt-3 pb-2 z-30 bg-background">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">
          {t('wizard.select_specialist') || 'Selecciona Especialista'}
        </h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium">
          {t('wizard.select_specialist_subtitle') || 'Escoge con quién prefieres realizar tu sesión'}
        </p>
      </div>

      <div className="flex flex-col flex-grow min-h-0 relative">
        {/* Superior gradient for depth */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />

        <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-6 pb-20 space-y-3">
          {/* Opción 1: Cualquiera */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            onClick={() => onSelectStaff({ id: 'any', full_name: 'Cualquiera (Recomendado)' })}
            className={`w-full rounded-luxury-card border p-4 flex items-center justify-between shadow-sm active:scale-98 transition-all shrink-0 group text-left gap-4
              ${selectedStaff?.id === 'any'
                ? 'bg-stone-900 border-primary text-white'
                : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'}`}
          >
            <div className="flex items-center gap-3.5 md:gap-4.5 min-w-0 flex-grow">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-luxury-btn flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105
                ${selectedStaff?.id === 'any'
                  ? 'bg-primary/20 border-primary/45 text-primary'
                  : 'bg-primary/5 border-primary/20 text-primary'}`}>
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-grow">
                <h3 className={`font-serif text-base md:text-xl font-bold leading-snug transition-colors
                  ${selectedStaff?.id === 'any' ? 'text-primary' : 'group-hover:text-primary text-foreground'}`}>
                  {t('wizard.any_specialist') || 'Cualquiera (Recomendado)'}
                </h3>
                <p className={`text-xs mt-1 leading-normal truncate
                  ${selectedStaff?.id === 'any' ? 'text-stone-300' : 'text-muted-foreground'}`}>
                  {t('wizard.any_specialist_desc') || 'Elige esta opción para obtener la máxima disponibilidad de horarios'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-2">
              <span className="text-muted-foreground/55 group-hover:text-primary transition-colors text-lg md:text-xl font-bold">
                ›
              </span>
            </div>
          </motion.button>

          {/* Lista de especialistas */}
          {staffList.map((st, i) => {
            const isSelected = selectedStaff?.id === st.id;
            // Formatear el rol de forma premium
            const specialtyLabel = st.role 
              ? (st.role.toLowerCase() === 'admin' || st.role.toLowerCase() === 'administrador')
                ? (t('dashboard.team.roles.admin') || 'Director / Administrador')
                : (t('dashboard.team.roles.specialist') || 'Especialista en Cabina')
              : (t('dashboard.team.roles.specialist') || 'Especialista');

            return (
              <motion.button
                key={st.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.05 }}
                onClick={() => onSelectStaff(st)}
                className={`w-full rounded-luxury-card border p-4 flex items-center justify-between shadow-sm active:scale-98 transition-all shrink-0 group text-left gap-4
                  ${isSelected
                    ? 'bg-stone-950 border-primary text-white shadow-md'
                    : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'}`}
              >
                {/* Left side: Avatar & Name */}
                <div className="flex items-center gap-3.5 md:gap-4.5 min-w-0 flex-grow">
                  {st.avatar_url ? (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-luxury-btn overflow-hidden border border-border shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                      <img src={st.avatar_url} alt={st.full_name} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-luxury-btn flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105
                      ${isSelected
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-gradient-to-tr from-primary/5 to-primary/20 border-border text-primary'}`}>
                      <span className="text-sm md:text-base font-serif font-bold">
                        {st.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-grow">
                    <h3 className={`font-serif text-base md:text-xl font-bold leading-snug transition-colors
                      ${isSelected ? 'text-primary' : 'group-hover:text-primary text-foreground'}`}>
                      {st.full_name}
                    </h3>
                    <p className={`text-xs mt-1 leading-normal truncate
                      ${isSelected ? 'text-stone-300' : 'text-muted-foreground'}`}>
                      {specialtyLabel}
                    </p>
                  </div>
                </div>

                {/* Right side: Action indicator */}
                <div className="flex items-center gap-3 shrink-0 pl-2">
                  <span className="text-muted-foreground/55 group-hover:text-primary transition-colors text-lg md:text-xl font-bold">
                    ›
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
