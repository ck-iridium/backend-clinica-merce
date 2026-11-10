"use client"

import React, { useState } from 'react';
import { Building2, Plus, Trash2, MapPin } from 'lucide-react';

export interface ExtraLocationItem {
  name: string;
  address: string;
  phone?: string;
}

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
  planType?: string;
  extraLocations?: ExtraLocationItem[];
  setExtraLocations?: React.Dispatch<React.SetStateAction<ExtraLocationItem[]>>;
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
  setMaxCoverageRadiusKm,
  planType = 'basic',
  extraLocations = [],
  setExtraLocations
}) => {
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<'clinic' | 'home' | null>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Extra location form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocPhone, setNewLocPhone] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);

  const maxTotalLocations = planType === 'gold' ? 5 : planType === 'pro' ? 2 : 1;
  const currentTotalLocations = 1 + extraLocations.length;
  const canAddMoreLocations = currentTotalLocations < maxTotalLocations;

  const handleAddressChange = (val: string, field: 'clinic' | 'home') => {
    if (field === 'clinic') {
      setLocationAddress(val);
    } else {
      setOperationsCenterAddress(val);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.length < 3) {
      setSuggestions([]);
      setActiveInput(null);
      return;
    }

    setLoading(true);
    setActiveInput(field);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val
          )}&limit=5&addressdetails=1&countrycodes=es,fr`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(
            data.map((item: any) => ({
              id: item.place_id,
              display_name: item.display_name,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (display_name: string, field: 'clinic' | 'home') => {
    if (field === 'clinic') {
      setLocationAddress(display_name);
    } else {
      setOperationsCenterAddress(display_name);
    }
    setSuggestions([]);
    setActiveInput(null);
  };

  const handleAddExtraLocation = () => {
    if (!newLocName.trim() || !newLocAddress.trim() || !setExtraLocations) return;
    setExtraLocations(prev => [
      ...prev,
      {
        name: newLocName.trim(),
        address: newLocAddress.trim(),
        phone: newLocPhone.trim() || undefined
      }
    ]);
    setNewLocName('');
    setNewLocAddress('');
    setNewLocPhone('');
    setShowAddLocation(false);
  };

  const handleRemoveExtraLocation = (index: number) => {
    if (!setExtraLocations) return;
    setExtraLocations(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
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
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-stone-800 text-sm font-bold">
                Información de Sede Principal
              </h3>
              {maxTotalLocations > 1 && (
                <span className="text-[10px] font-bold text-[#d4af37] bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Plan {planType.toUpperCase()}: hasta {maxTotalLocations} sedes
                </span>
              )}
            </div>
            
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

            <div className="space-y-1 relative">
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Física de Sede</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={locationAddress} 
                  onChange={(e) => handleAddressChange(e.target.value, 'clinic')} 
                  onFocus={() => { if (locationAddress.length >= 3) { setActiveInput('clinic'); } }}
                  onBlur={() => { setTimeout(() => setActiveInput(null), 200); }}
                  placeholder="Calle, número, piso, código postal y ciudad de tu cabina" 
                  className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
                {loading && activeInput === 'clinic' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></span>
                )}
              </div>
              {activeInput === 'clinic' && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-stone-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s.display_name, 'clinic')}
                      className="w-full text-left px-4 py-3 hover:bg-[#FAF9F5] text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#d4af37]">📍</span>
                      <span className="truncate">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Extra Locations Section for Pro / Gold */}
            {maxTotalLocations > 1 && setExtraLocations && (
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif italic text-stone-800 text-xs font-bold">
                      Sedes Adicionales (Opcional)
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Tienes {currentTotalLocations} de {maxTotalLocations} sedes configuradas.
                    </p>
                  </div>
                  {canAddMoreLocations && !showAddLocation && (
                    <button
                      type="button"
                      onClick={() => setShowAddLocation(true)}
                      className="text-xs font-bold text-[#d4af37] hover:text-[#b89528] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir Sede
                    </button>
                  )}
                </div>

                {/* Lista de sedes extra añadidas */}
                {extraLocations.length > 0 && (
                  <div className="space-y-2">
                    {extraLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl shadow-sm text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                          <div>
                            <span className="font-bold text-stone-800">{loc.name}</span>
                            <p className="text-[10px] text-stone-400 truncate max-w-[260px]">{loc.address}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraLocation(idx)}
                          className="p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subformulario para añadir sede extra */}
                {showAddLocation && canAddMoreLocations && (
                  <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Nombre de la Sede *</label>
                        <input
                          type="text"
                          value={newLocName}
                          onChange={(e) => setNewLocName(e.target.value)}
                          placeholder="Ej. Sede Norte / Sucursal 2"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Teléfono (Opcional)</label>
                        <input
                          type="text"
                          value={newLocPhone}
                          onChange={(e) => setNewLocPhone(e.target.value)}
                          placeholder="Ej. +34 931 999 888"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Física *</label>
                        <input
                          type="text"
                          value={newLocAddress}
                          onChange={(e) => setNewLocAddress(e.target.value)}
                          placeholder="Calle, número y ciudad de la sucursal"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLocation(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-400 hover:text-stone-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddExtraLocation}
                        disabled={!newLocName.trim() || !newLocAddress.trim()}
                        className="bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                      >
                        Guardar Sede
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(workModality === 'home_only' || workModality === 'both') && (
          <div className="space-y-4 pt-2">
            <h3 className="font-serif italic text-stone-700 text-sm">Configuración de Servicios a Domicilio</h3>
            
            <div className="space-y-1 relative">
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Dirección Base / Centro de Operaciones</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={operationsCenterAddress} 
                  onChange={(e) => handleAddressChange(e.target.value, 'home')} 
                  onFocus={() => { if (operationsCenterAddress.length >= 3) { setActiveInput('home'); } }}
                  onBlur={() => { setTimeout(() => setActiveInput(null), 200); }}
                  placeholder="Dirección desde donde se calculan las rutas a domicilio" 
                  className="w-full bg-[#FAF9F5]/30 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-300 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-all shadow-sm"
                />
                {loading && activeInput === 'home' && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></span>
                )}
              </div>
              {activeInput === 'home' && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-stone-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s.display_name, 'home')}
                      className="w-full text-left px-4 py-3 hover:bg-[#FAF9F5] text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#d4af37]">📍</span>
                      <span className="truncate">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
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
