"use client"

import React from 'react';
import { Building2 } from 'lucide-react';

interface StepOperationsProps {
  workModality: string;
  setWorkModality: (val: string) => void;
  locationName: string;
  setLocationName: (val: string) => void;
  locationAddress: string;
  setLocationAddress: (val: string) => void;
  locationPhone: string;
  setLocationPhone: (val: string) => void;
  operationsCenterAddress: string;
  setOperationsCenterAddress: (val: string) => void;
  maxCoverageRadiusKm: number;
  setMaxCoverageRadiusKm: (val: number) => void;
}

export const StepOperations: React.FC<StepOperationsProps> = ({
  workModality,
  setWorkModality,
  locationName,
  setLocationName,
  locationAddress,
  setLocationAddress,
  locationPhone,
  setLocationPhone,
  operationsCenterAddress,
  setOperationsCenterAddress,
  maxCoverageRadiusKm,
  setMaxCoverageRadiusKm
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Modelo de Negocio / Modalidad de Trabajo
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sede Card */}
          <div 
            onClick={() => setWorkModality('clinic_only')}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
              workModality === 'clinic_only'
                ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              workModality === 'clinic_only' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-850 text-xs mb-1">Solo en Clínica</h4>
              <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                Los clientes agendan y asisten a tu centro físico.
              </p>
            </div>
          </div>

          {/* Domicilio Card */}
          <div 
            onClick={() => setWorkModality('home_only')}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
              workModality === 'home_only'
                ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              workModality === 'home_only' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
            }`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
                <path d="M13 17H9"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-stone-850 text-xs mb-1">A Domicilio</h4>
              <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                Te desplazas a casa u oficina del cliente.
              </p>
            </div>
          </div>

          {/* Hybrid Card */}
          <div 
            onClick={() => setWorkModality('both')}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 select-none hover:-translate-y-0.5 ${
              workModality === 'both'
                ? 'border-[#d4af37] bg-[#FAF9F5] shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              workModality === 'both' ? 'bg-[#d4af37]/10 text-[#bf9b30]' : 'bg-stone-50 text-stone-400'
            }`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-stone-850 text-xs mb-1">Modelo Híbrido</h4>
              <p className="text-[9px] text-stone-400 leading-relaxed max-w-[155px] mx-auto">
                Ofreces cabina física y atención móvil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Subforms */}
      <div className="space-y-4 pt-2 border-t border-stone-100 animate-in fade-in duration-500">
        {(workModality === 'clinic_only' || workModality === 'both') && (
          <div className="space-y-4">
            <h3 className="font-serif italic text-stone-700 text-sm">Información de Sede Principal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Nombre de la Sede</label>
                <input 
                  type="text" 
                  value={locationName} 
                  onChange={(e) => setLocationName(e.target.value)} 
                  placeholder="Ej. Sede Central Mercè" 
                  className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Teléfono de Sede</label>
                <input 
                  type="text" 
                  value={locationPhone} 
                  onChange={(e) => setLocationPhone(e.target.value)} 
                  placeholder="Ej. +34 931 234 567" 
                  className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Física de Sede</label>
              <input 
                type="text" 
                value={locationAddress} 
                onChange={(e) => setLocationAddress(e.target.value)} 
                placeholder="Calle, número, piso, código postal y ciudad de tu cabina" 
                className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {(workModality === 'home_only' || workModality === 'both') && (
          <div className="space-y-4 pt-2">
            <h3 className="font-serif italic text-stone-700 text-sm">Configuración de Servicios a Domicilio</h3>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Base / Centro de Operaciones</label>
              <input 
                type="text" 
                value={operationsCenterAddress} 
                onChange={(e) => setOperationsCenterAddress(e.target.value)} 
                placeholder="Dirección desde donde se calculan las rutas a domicilio" 
                className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-[#FAF9F5]/50 border border-stone-200/50">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Radio Máximo de Cobertura</label>
                <span className="text-xs font-bold text-[#bf9b30] bg-[#d4af37]/10 px-2.5 py-1 rounded-full">{maxCoverageRadiusKm} km</span>
              </div>
              
              <input 
                type="range" 
                min="2" 
                max="50" 
                step="1"
                value={maxCoverageRadiusKm} 
                onChange={(e) => setMaxCoverageRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37] focus:outline-none focus:ring-0"
              />
              
              <div className="flex justify-between text-[8px] text-stone-400 font-bold uppercase tracking-wider">
                <span>2 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
