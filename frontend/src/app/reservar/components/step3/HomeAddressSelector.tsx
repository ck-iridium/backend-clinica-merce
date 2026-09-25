"use client";

import React, { useState, useRef } from 'react';
import { Building2, MapPin, Compass } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface HomeAddressSelectorProps {
  formData: any;
  setFormData: (d: any) => void;
  addressQuery: string;
  setAddressQuery: (q: string) => void;
  showModalitySelector: boolean;
  onOpenMapModal: () => void;
}

export default function HomeAddressSelector({
  formData,
  setFormData,
  addressQuery,
  setAddressQuery,
  showModalitySelector,
  onOpenMapModal,
}: HomeAddressSelectorProps) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar sugerencias de autocompletado (Mapbox con fallback a OpenStreetMap Nominatim)
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressQuery(value);
    setFormData({ ...formData, client_address: value });

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (mapboxToken) {
          const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
              value
            )}&language=es&access_token=${mapboxToken}&country=es,fr&session_token=booking-flow-session`
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(
              data.suggestions.map((s: any) => ({
                id: s.mapbox_id,
                display_name: s.full_address || s.name,
                source: 'mapbox'
              }))
            );
          }
        } else {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value
            )}&limit=5&addressdetails=1&countrycodes=es,fr`
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(
              data.map((item: any) => ({
                id: item.place_id,
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                postal_code: item.address?.postcode || '',
                city: item.address?.city || item.address?.town || item.address?.village || '',
                source: 'nominatim'
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setSuggestions([]);
    setAddressQuery(suggestion.display_name);

    if (suggestion.source === 'nominatim') {
      setFormData({
        ...formData,
        client_address: suggestion.display_name,
        client_latitude: suggestion.lat,
        client_longitude: suggestion.lon,
        client_postal_code: suggestion.postal_code,
        client_city: suggestion.city
      });
    } else if (suggestion.source === 'mapbox') {
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}?access_token=${mapboxToken}&session_token=booking-flow-session`
        );
        if (res.ok) {
          const data = await res.json();
          const feature = data.features[0];
          const [lon, lat] = feature.geometry.coordinates;
          const context = feature.properties?.context || {};
          
          setFormData({
            ...formData,
            client_address: suggestion.display_name,
            client_latitude: lat,
            client_longitude: lon,
            client_postal_code: context.postcode?.name || '',
            client_city: context.place?.name || ''
          });
        }
      } catch (err) {
        console.error('Error retrieving Mapbox coordinates:', err);
      }
    }
  };

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* Modalidad de servicio (Centro vs Domicilio) */}
      {showModalitySelector && (
        <div className="group">
          <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1">
            {t('wizard.service_modality')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, service_modality: 'clinic' })}
              className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all outline-none ${
                formData.service_modality === 'clinic'
                  ? 'border-[#d4af37] bg-[#24211e] text-[#d4af37] shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-stone-300'
              }`}
            >
              <Building2 size={14} />
              {t('wizard.in_center')}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, service_modality: 'home' })}
              className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all outline-none ${
                formData.service_modality === 'home'
                  ? 'border-[#d4af37] bg-[#24211e] text-[#d4af37] shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-stone-300'
              }`}
            >
              <MapPin size={14} />
              {t('wizard.at_home')}
            </button>
          </div>
        </div>
      )}

      {/* Dirección a Domicilio (Si aplica) */}
      {formData.service_modality === 'home' && (
        <div className="group animate-in slide-in-from-top-2 duration-300 relative">
          <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1">
            {t('wizard.your_address')}
          </label>
          <div className="relative">
            <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
              <MapPin size={18} className="md:scale-125" />
            </div>
            <input
              required
              type="text"
              value={addressQuery}
              onChange={handleAddressChange}
              className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-28 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder={t('wizard.address_placeholder')}
            />
            {loadingSuggestions && (
              <div className="absolute right-24 top-1/2 -translate-y-1/2 flex items-center">
                <span className="w-4 h-4 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={onOpenMapModal}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 hover:text-white border border-stone-755"
            >
              <Compass size={11} />
              {t('wizard.map')}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 w-full mt-1.5 bg-[#24211e] border border-stone-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-800 max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-stone-800/60 text-[11px] font-bold text-stone-300 transition-colors flex items-center gap-2"
                >
                  <MapPin size={12} className="text-[#d4af37] shrink-0" />
                  {s.display_name}
                </button>
              ))}
            </div>
          )}

          {/* Consentimiento para guardar la dirección (Caché de cliente) */}
          <div className="mt-3 ml-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.save_address_to_crm}
                onChange={(e) => setFormData({ ...formData, save_address_to_crm: e.target.checked })}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded border border-stone-700 bg-card peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] flex items-center justify-center text-white transition-all shadow-sm shrink-0">
                <svg className="w-3 h-3 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[10px] md:text-[11px] text-stone-400 font-bold hover:text-stone-300 transition-colors">
                {t('wizard.save_address_label')}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
