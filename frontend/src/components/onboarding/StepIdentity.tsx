"use client"

import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Activity, 
  Scissors, 
  Upload, 
  Check, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  Crown,
  LucideIcon
} from 'lucide-react';

interface Sector {
  id: string;
  label: string;
  badge: string;
  desc: string;
  icon: LucideIcon;
  secondaryIcon?: LucideIcon;
}

const SECTORS: Sector[] = [
  { 
    id: 'Medicina Estética', 
    label: 'Medicina Estética', 
    badge: 'IA Facial & Inyectables',
    desc: 'Protocolos médicos de alta precisión, neuromoduladores, rellenos dérmicos y láser avanzado.', 
    icon: Sparkles,
    secondaryIcon: Cpu
  },
  { 
    id: 'Estética y Bienestar', 
    label: 'Estética y Bienestar', 
    badge: 'Cabinas & Concurrencia',
    desc: 'Rituales faciales, spa sensorial, aparatología corporal de vanguardia y terapias de bienestar.', 
    icon: Layers,
    secondaryIcon: ShieldCheck
  },
  { 
    id: 'Clínicas de Salud', 
    label: 'Clínicas de Salud', 
    badge: 'Multi-Box & Historial Clínico',
    desc: 'Fisioterapia, nutrición clínica, salud integral, gestión multi-box y consultas médicas.', 
    icon: Activity,
    secondaryIcon: ShieldCheck
  },
  { 
    id: 'Salones y Barberías', 
    label: 'Salones y Barberías', 
    badge: 'Multi-Sillón & TPV Rápido',
    desc: 'Estilismo de autor, peluquería de lujo, rituales de afeitado tradicional y venta rápida en barra.', 
    icon: Scissors,
    secondaryIcon: Crown
  }
];

interface StepIdentityProps {
  clinicName: string;
  setClinicName: (val: string) => void;
  selectedSector: string;
  setSelectedSector: (val: string) => void;
  logoBase64: string | null;
  setLogoBase64: (val: string | null) => void;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({
  clinicName,
  setClinicName,
  selectedSector,
  setSelectedSector,
  logoBase64,
  setLogoBase64,
  handleLogoChange
}) => {
  return (
    <div className="space-y-7 animate-in fade-in duration-500 font-sans">
      
      {/* 1. Nombre del Negocio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
            Nombre Oficial de tu Negocio *
          </label>
          <span className="text-[10px] text-[#d4af37] font-semibold">Identificador de tu espacio</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <Building2 className="w-4 h-4 text-[#d4af37]" />
          </div>
          <input 
            type="text" 
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Ej. Clínica Mercè · Haute Esthetics"
            className="w-full bg-[#FAF9F5]/60 border border-stone-200/80 rounded-2xl pl-11 pr-5 py-4 text-sm font-semibold text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 2. Bento Tech Sector Grid (2026 Edition) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
            Sector Operativo & Especialidad Tecnológica
          </label>
          <span className="text-[10px] text-stone-400 font-medium">Configura catálogo e IA</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SECTORS.map((sec) => {
            const isSelected = selectedSector === sec.id;
            const IconComp = sec.icon;

            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none group relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border-[#d4af37] shadow-[0_12px_30px_rgba(28,25,23,0.12)] text-white ring-1 ring-[#d4af37]/50' 
                    : 'bg-white/95 border-stone-200/70 hover:bg-[#FAF9F5] hover:border-stone-300/90 text-stone-800 shadow-2xs hover:shadow-sm'
                }`}
              >
                {/* Micro-glow ambiental de selección */}
                {isSelected && (
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      isSelected 
                        ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 shadow-inner' 
                        : 'bg-stone-100/80 text-stone-600 border border-stone-200/60'
                    }`}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-xs leading-tight transition-colors ${
                        isSelected ? 'text-white' : 'text-stone-900'
                      }`}>
                        {sec.label}
                      </h4>
                      <span className={`inline-block text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full mt-1 border ${
                        isSelected 
                          ? 'bg-[#d4af37]/20 text-[#e6c86e] border-[#d4af37]/30' 
                          : 'bg-stone-100 text-stone-500 border-stone-200/50'
                      }`}>
                        {sec.badge}
                      </span>
                    </div>
                  </div>

                  {/* Radio check estilizado */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 mt-0.5 border ${
                    isSelected 
                      ? 'bg-[#d4af37] border-[#d4af37] text-stone-950 shadow-sm' 
                      : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'
                  }`}>
                    {isSelected && <Check size={11} strokeWidth={3.5} />}
                  </div>
                </div>

                <p className={`text-[10.5px] leading-relaxed transition-colors ${
                  isSelected ? 'text-stone-300 font-normal' : 'text-stone-400 font-medium'
                }`}>
                  {sec.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Logotipo de la Marca (Quiet Luxury Card) */}
      <div className="space-y-2 pt-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
          Logotipo de Marca & Sello Visual (Opcional)
        </label>
        
        <div className="flex items-center gap-5 p-4 md:p-5 border border-dashed border-stone-200/90 rounded-2xl bg-[#FAF9F5]/40 hover:bg-[#FAF9F5]/70 transition-colors">
          {logoBase64 ? (
            <div className="relative group shrink-0">
              <img 
                src={logoBase64} 
                alt="Preview Logo" 
                className="h-16 w-16 object-contain rounded-xl border border-stone-200 bg-white shadow-sm p-1" 
              />
              <button 
                type="button"
                onClick={() => setLogoBase64(null)} 
                className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow hover:bg-rose-500 transition-colors"
                title="Eliminar logo"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="h-14 w-14 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 shadow-inner">
              <Upload size={18} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <label 
              htmlFor="logo-upload" 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Upload size={13} />
              {logoBase64 ? 'Cambiar imagen' : 'Seleccionar logotipo'}
            </label>
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleLogoChange}
              className="hidden" 
            />
            <p className="text-[10px] text-stone-400 mt-1.5 truncate">
              Formatos aceptados: PNG, JPG o SVG. Máximo 2MB.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
