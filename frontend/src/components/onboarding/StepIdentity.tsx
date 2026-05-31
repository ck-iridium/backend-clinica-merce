"use client"

import React from 'react';
import { Upload } from 'lucide-react';

interface Sector {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

const SECTORS: Sector[] = [
  { id: 'Medicina Estética', label: 'Medicina Estética', desc: 'Clínicas médicas, botox, rellenos y láser advanced.', icon: '💉' },
  { id: 'Estética y Bienestar', label: 'Estética y Bienestar', desc: 'Tratamientos faciales, masajes, spa y mimos.', icon: '✨' },
  { id: 'Clínicas de Salud', label: 'Clínicas de Salud', desc: 'Fisioterapia, nutrición, dermatología y salud integral.', icon: '🏥' },
  { id: 'Salones y Barberías', label: 'Salones y Barberías', desc: 'Peluquería de lujo, estilismo de barba y color.', icon: '💈' }
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Nombre de tu Negocio
        </label>
        <input 
          type="text" 
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="Ej. Clínica Mercè"
          className="w-full bg-[#FAF9F5]/40 border border-stone-200 rounded-xl px-5 py-4 text-sm font-semibold text-stone-850 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/10 focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Sector o Especialidad Principal
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTORS.map((sec) => {
            const isSelected = selectedSector === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 select-none group relative ${
                  isSelected 
                    ? 'bg-[#FAF9F5] border-[#d4af37] shadow-sm' 
                    : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <span className="text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110">{sec.icon}</span>
                <div>
                  <h4 className="font-bold text-stone-850 text-xs leading-none mb-1.5 flex items-center gap-1.5">
                    {sec.label}
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
          Logotipo de la Marca (Opcional)
        </label>
        <div className="flex items-center gap-6 p-5 border border-dashed border-stone-200 rounded-2xl bg-[#FAF9F5]/30">
          {logoBase64 ? (
            <div className="relative group shrink-0">
              <img src={logoBase64} alt="Preview Logo" className="h-16 w-16 object-contain rounded-xl border border-stone-200 bg-white shadow-sm" />
              <button onClick={() => setLogoBase64(null)} className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow hover:bg-rose-500 transition-colors">
                ✕
              </button>
            </div>
          ) : (
            <div className="h-16 w-16 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-stone-300 shrink-0">
              <Upload className="w-5 h-5 text-stone-400" />
            </div>
          )}
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoChange}
              id="logo-upload"
              className="hidden"
            />
            <label 
              htmlFor="logo-upload"
              className="inline-block bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm uppercase tracking-wider active:scale-95 duration-300"
            >
              Elegir Imagen
            </label>
            <span className="text-[10px] text-stone-400 font-medium block mt-1.5">
              Formatos admitidos: PNG, JPEG o SVG. Máx. 2MB.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
