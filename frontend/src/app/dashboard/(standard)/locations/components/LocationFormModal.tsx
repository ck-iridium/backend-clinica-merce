"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Location, LocationFormData, LocationSuggestion } from './types';
import { formatCleanAddress } from './locationUtils';
import LocationMapPicker from './LocationMapPicker';

interface LocationFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: Location | null;
  onSubmit: (data: LocationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function LocationFormModal({
  isOpen,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  isSubmitting,
}: LocationFormModalProps) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    is_active: true,
    latitude: 39.151,
    longitude: -0.437,
  });

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Inicializar formulario al abrir o cambiar de modo / datos
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          address: initialData.address,
          phone: initialData.phone || '',
          email: initialData.email || '',
          is_active: initialData.is_active,
          latitude: initialData.latitude || 39.151,
          longitude: initialData.longitude || -0.437,
        });
      } else {
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          is_active: true,
          latitude: 39.151,
          longitude: -0.437,
        });
      }
      setSuggestions([]);
    }
  }, [isOpen, mode, initialData]);

  // Manejo de autocompletado con Nominatim
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&addressdetails=1&countrycodes=es,fr`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(
            data.map((item: any) => {
              const cleanAddress = formatCleanAddress(item, value);
              const secondary = [
                item.address?.town || item.address?.city || item.address?.village,
                item.address?.province || item.address?.state
              ].filter(Boolean).join(', ');

              return {
                id: item.place_id,
                clean_address: cleanAddress,
                secondary_text: secondary,
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
              };
            })
          );
        }
      } catch (err) {
        console.error('Error al obtener sugerencias de dirección:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSuggestions([]);
    setFormData(prev => ({
      ...prev,
      address: suggestion.clean_address || suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isEdit = mode === 'edit';
  const formId = isEdit ? "locations-edit-form" : "locations-create-form";
  const nameInputId = isEdit ? "locations-edit-name-input" : "locations-create-name-input";
  const addressInputId = isEdit ? "locations-edit-address-input" : "locations-create-address-input";
  const phoneInputId = isEdit ? "locations-edit-phone-input" : "locations-create-phone-input";
  const emailInputId = isEdit ? "locations-edit-email-input" : "locations-create-email-input";
  const cancelBtnId = isEdit ? "locations-edit-cancel-btn" : "locations-create-cancel-btn";
  const submitBtnId = isEdit ? "locations-edit-save-btn" : "locations-create-submit-btn";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 bg-white border-stone-100 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-serif italic text-2xl text-stone-800">
            {isEdit ? t('dashboard.locations.edit_title') : t('dashboard.locations.create_title')}
          </DialogTitle>
          <DialogDescription className="text-stone-400 font-medium">
            {isEdit ? t('dashboard.locations.edit_desc') : t('dashboard.locations.create_desc')}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de la Sede */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              {t('dashboard.locations.name_label')}
            </label>
            <input 
              id={nameInputId} 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
              placeholder={isEdit ? '' : t('dashboard.locations.name_placeholder')} 
              required 
            />
          </div>

          {/* Dirección Física con Autocompletado */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
              {t('dashboard.locations.address_label')}
            </label>
            <div className="relative">
              <input 
                id={addressInputId} 
                type="text" 
                value={formData.address} 
                onChange={handleAddressChange}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all"
                placeholder={isEdit ? '' : t('dashboard.locations.address_placeholder')} 
                required 
              />
              {loadingSuggestions && (
                <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
              )}
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute z-[100] left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-stone-100">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex flex-col gap-0.5 text-stone-700 hover:text-stone-950 font-sans"
                  >
                    <span className="text-xs font-semibold text-stone-800">{s.clean_address}</span>
                    {s.secondary_text && (
                      <span className="text-[11px] text-stone-400 truncate">{s.secondary_text}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mapa Interactivo Leaflet con Pin Dorado */}
          <LocationMapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            address={formData.address}
            onCoordinatesChange={(lat, lon) => {
              setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lon
              }));
            }}
            onAddressResolved={(resolvedAddress) => {
              setFormData(prev => {
                if (prev.address && prev.address.trim().length > 0) return prev;
                return { ...prev, address: resolvedAddress };
              });
            }}
          />

          {/* Teléfono y Email de Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                {t('dashboard.locations.phone_label')}
              </label>
              <input 
                id={phoneInputId} 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                {t('dashboard.locations.email_label')}
              </label>
              <input 
                id={emailInputId} 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('dashboard.locations.email_placeholder')}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all" 
              />
            </div>
          </div>

          {/* Footer del Modal */}
          <DialogFooter className="pt-6">
            <button 
              id={cancelBtnId} 
              type="button" 
              onClick={() => onOpenChange(false)} 
              className="text-stone-400 hover:text-stone-700 transition-all font-bold text-xs uppercase tracking-wider px-4 py-2"
            >
              {t('dashboard.locations.cancel')}
            </button>
            <button 
              id={submitBtnId} 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEdit ? t('dashboard.locations.saving') : t('dashboard.locations.creating'))
                : (isEdit ? t('dashboard.locations.save_btn') : t('dashboard.locations.create_submit'))
              }
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
