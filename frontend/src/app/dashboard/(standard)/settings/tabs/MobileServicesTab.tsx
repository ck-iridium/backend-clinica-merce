"use client"
import { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Home, Building2, Plus, X, Globe } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface MobileServicesTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function MobileServicesTab({ settings, setSettings }: MobileServicesTabProps) {
  const { t } = useLanguage();
  const [addressQuery, setAddressQuery] = useState(settings.operations_center_address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState('');
  const [zonesList, setZonesList] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const adminMapContainerRef = useRef<HTMLDivElement | null>(null);
  const adminMapRef = useRef<any | null>(null);
  const adminMarkerRef = useRef<any | null>(null);
  const adminCircleRef = useRef<any | null>(null);

  // Cargar lista blanca guardada (en formato JSON string en la base de datos)
  useEffect(() => {
    if (settings.whitelist_zones) {
      try {
        const parsed = JSON.parse(settings.whitelist_zones);
        if (Array.isArray(parsed)) {
          setZonesList(parsed);
        }
      } catch (e) {
        if (typeof settings.whitelist_zones === 'string') {
          setZonesList(settings.whitelist_zones.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      }
    }
  }, [settings.whitelist_zones]);

  // Cargar e inicializar Leaflet para la visualización del radio de cobertura
  useEffect(() => {
    if (settings.operations_center_latitude && settings.work_modality !== 'clinic_only') {
      const linkId = 'leaflet-css-cdn-admin';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.hasOwnProperty('L')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js-cdn-admin';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initAdminMap();
        };
        document.body.appendChild(script);
      } else {
        setTimeout(() => {
          initAdminMap();
        }, 300);
      }
    } else {
      if (adminMapRef.current) {
        adminMapRef.current.remove();
        adminMapRef.current = null;
      }
      adminMarkerRef.current = null;
      adminCircleRef.current = null;
    }
  }, [settings.operations_center_latitude, settings.work_modality]);

  // Actualizar el mapa en tiempo real cuando cambie el radio o las coordenadas
  useEffect(() => {
    const L = (window as any).L;
    if (L && adminMapRef.current) {
      const lat = settings.operations_center_latitude || 40.416775;
      const lon = settings.operations_center_longitude || -3.703790;
      const radiusMeters = (settings.max_coverage_radius_km || 10) * 1000;

      const newLatLng = new L.LatLng(lat, lon);
      adminMapRef.current.setView(newLatLng);
      
      if (adminMarkerRef.current) {
        adminMarkerRef.current.setLatLng(newLatLng);
      }

      if (adminCircleRef.current) {
        adminCircleRef.current.setLatLng(newLatLng);
        adminCircleRef.current.setRadius(radiusMeters);
      } else {
        const circle = L.circle(newLatLng, {
          color: '#d4af37',
          fillColor: '#d4af37',
          fillOpacity: 0.12,
          weight: 1.5,
          radius: radiusMeters
        }).addTo(adminMapRef.current);
        adminCircleRef.current = circle;
      }

      const bounds = adminCircleRef.current.getBounds();
      adminMapRef.current.fitBounds(bounds, { padding: [15, 15] });
    }
  }, [settings.max_coverage_radius_km, settings.operations_center_latitude, settings.operations_center_longitude]);

  const initAdminMap = () => {
    if (!adminMapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (adminMapRef.current) {
      adminMapRef.current.remove();
    }

    const lat = settings.operations_center_latitude || 40.416775;
    const lon = settings.operations_center_longitude || -3.703790;
    const radiusMeters = (settings.max_coverage_radius_km || 10) * 1000;

    const map = L.map(adminMapContainerRef.current).setView([lat, lon], 12);
    adminMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const goldIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lon], { icon: goldIcon }).addTo(map);
    adminMarkerRef.current = marker;

    const circle = L.circle([lat, lon], {
      color: '#d4af37',
      fillColor: '#d4af37',
      fillOpacity: 0.12,
      weight: 1.5,
      radius: radiusMeters
    }).addTo(map);
    adminCircleRef.current = circle;

    const bounds = circle.getBounds();
    map.fitBounds(bounds, { padding: [15, 15] });
  };

  // Actualizar configuración cuando cambia la lista de zonas
  const updateWhitelistSettings = (newList: string[]) => {
    setZonesList(newList);
    setSettings({
      ...settings,
      whitelist_zones: JSON.stringify(newList)
    });
  };

  const handleAddZone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const zone = whitelistInput.trim();
    if (!zone) return;

    if (!zonesList.includes(zone)) {
      const updated = [...zonesList, zone];
      updateWhitelistSettings(updated);
    }
    setWhitelistInput('');
  };

  const handleRemoveZone = (indexToRemove: number) => {
    const updated = zonesList.filter((_, i) => i !== indexToRemove);
    updateWhitelistSettings(updated);
  };

  // Autocompletado de dirección con Nominatim (OpenStreetMap) o Mapbox (España y Francia)
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressQuery(value);
    setSettings({ ...settings, operations_center_address: value });

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
            )}&language=es&access_token=${mapboxToken}&country=es,fr&session_token=admin-settings-session`
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
                source: 'nominatim'
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error al obtener sugerencias de dirección:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setSuggestions([]);
    setAddressQuery(suggestion.display_name);

    if (suggestion.source === 'nominatim') {
      setSettings({
        ...settings,
        operations_center_address: suggestion.display_name,
        operations_center_latitude: suggestion.lat,
        operations_center_longitude: suggestion.lon
      });
    } else if (suggestion.source === 'mapbox') {
      try {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}?access_token=${mapboxToken}&session_token=admin-settings-session`
        );
        if (res.ok) {
          const data = await res.json();
          const feature = data.features[0];
          const [lon, lat] = feature.geometry.coordinates;
          setSettings({
            ...settings,
            operations_center_address: suggestion.display_name,
            operations_center_latitude: lat,
            operations_center_longitude: lon
          });
        }
      } catch (err) {
        console.error('Error al recuperar detalles de Mapbox:', err);
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      {/* Tarjeta 1: Modalidad de Trabajo */}
      <div className="bg-white rounded-3xl md:rounded-[2rem] border border-stone-100 p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Truck size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl font-serif font-semibold text-stone-800">{t('settings.mobile_services.work_modality')}</h3>
        </div>

        <p className="text-xs text-stone-400 mb-4 font-medium leading-relaxed">
          {t('settings.mobile_services.work_modality_desc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'clinic_only',
              label: t('settings.mobile_services.clinic_only'),
              desc: t('settings.mobile_services.clinic_only_desc'),
              icon: Building2
            },
            {
              id: 'home_only',
              label: t('settings.mobile_services.home_only'),
              desc: t('settings.mobile_services.home_only_desc'),
              icon: Home
            },
            {
              id: 'both',
              label: t('settings.mobile_services.both'),
              desc: t('settings.mobile_services.both_desc'),
              icon: Globe
            }
          ].map((mode) => {
            const isSelected = settings.work_modality === mode.id;
            return (
              <button
                key={mode.id}
                id={`mobile-work-modality-btn-${mode.id}`}
                type="button"
                onClick={() => setSettings({ ...settings, work_modality: mode.id })}
                className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col gap-2 group outline-none
                  ${
                    isSelected
                      ? 'border-[#d4af37] bg-stone-50/50 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-stone-50 text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-600'
                    }`}
                >
                  <mode.icon size={16} strokeWidth={1.5} />
                </span>
                <div>
                  <h4 className={`font-bold text-xs leading-tight transition-colors ${isSelected ? 'text-stone-800' : 'text-stone-600'}`}>
                    {mode.label}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {settings.work_modality !== 'clinic_only' && (
        <div className="bg-white rounded-3xl md:rounded-[2rem] border border-stone-100 p-5 md:p-6 shadow-sm">
          {/* Header Compacto */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Globe size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-xl font-serif font-semibold text-stone-800">{t('settings.mobile_services.home_coverage')}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: Configuración de Controles */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* 1. Centro de Operaciones */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-0.5">{t('settings.mobile_services.ops_center')}</h4>
                <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
                  {t('settings.mobile_services.ops_center_desc')}
                </p>
                <div className="relative">
                  <input
                    id="mobile-ops-center-address-input"
                    type="text"
                    value={addressQuery}
                    onChange={handleAddressChange}
                    className="w-full p-3 pl-10 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all text-xs text-stone-800 outline-none font-semibold"
                    placeholder={t('settings.mobile_services.address_placeholder')}
                  />
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  {loadingSuggestions && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                      <span className="w-3.5 h-3.5 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></span>
                    </div>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-stone-100 max-h-52 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-[10px] font-bold text-stone-600 transition-colors flex items-center gap-2.5"
                      >
                        <MapPin size={11} className="text-[#d4af37] shrink-0" />
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Radio de Cobertura */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-stone-700">{t('settings.mobile_services.max_radius')}</h4>
                    <p className="text-[10px] text-stone-400 leading-normal">
                      {t('settings.mobile_services.max_radius_desc')}
                    </p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 px-3 py-1 rounded-lg text-[#d4af37] font-serif font-black text-xs">
                    {settings.max_coverage_radius_km || 10} km
                  </div>
                </div>
                <input
                  id="mobile-coverage-radius-slider"
                  type="range"
                  min="1"
                  max="150"
                  value={settings.max_coverage_radius_km || 10}
                  onChange={(e) => setSettings({ ...settings, max_coverage_radius_km: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-stone-100 accent-[#d4af37] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-stone-400 font-bold mt-1.5">
                  <span>1 km</span>
                  <span>75 km</span>
                  <span>150 km</span>
                </div>
              </div>

              {/* 3. Lista Blanca */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-0.5">{t('settings.mobile_services.whitelist_zones')}</h4>
                <p className="text-[10px] text-stone-400 leading-normal mb-2">
                  {t('settings.mobile_services.whitelist_zones_desc')}
                </p>

                <form onSubmit={handleAddZone} className="flex gap-2 mb-2">
                  <input
                    id="mobile-whitelist-zone-input"
                    type="text"
                    value={whitelistInput}
                    onChange={(e) => setWhitelistInput(e.target.value)}
                    placeholder={t('settings.mobile_services.whitelist_placeholder')}
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] outline-none text-xs font-semibold text-stone-700"
                  />
                  <button
                    id="mobile-add-zone-btn"
                    type="submit"
                    className="px-4 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={12} />
                    {t('settings.mobile_services.add')}
                  </button>
                </form>

                {zonesList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-xl border border-stone-100 max-h-32 overflow-y-auto">
                    {zonesList.map((zone, index) => (
                      <span
                        key={index}
                        className="bg-white border border-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold pl-2.5 pr-1.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-in zoom-in-50 duration-200"
                      >
                        {zone}
                        <button
                          id={`mobile-remove-zone-btn-${index}`}
                          type="button"
                          onClick={() => handleRemoveZone(index)}
                          className="hover:bg-stone-100 rounded-full p-0.5 transition-colors text-stone-400 hover:text-stone-700"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-stone-200 rounded-xl">
                    <p className="text-[10px] text-stone-400 font-medium italic">{t('settings.mobile_services.no_exceptions')}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Columna Derecha: Mapa Cuadrado de Cobertura */}
            <div className="lg:col-span-7 flex flex-col justify-stretch h-full">
              {settings.operations_center_latitude ? (
                <div className="w-full aspect-square max-h-[380px] lg:max-h-[420px] rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden z-10">
                  <div ref={adminMapContainerRef} className="w-full h-full" />
                </div>
              ) : (
                <div className="w-full aspect-square max-h-[380px] lg:max-h-[420px] rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center p-6 text-center bg-stone-50">
                  <MapPin size={28} className="text-stone-300 mb-2" />
                  <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">{t('settings.mobile_services.no_location')}</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[220px]">{t('settings.mobile_services.no_location_desc')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
