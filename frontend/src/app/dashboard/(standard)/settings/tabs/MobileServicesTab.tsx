"use client"
import { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Home, Building2, Plus, X, Globe } from 'lucide-react';

interface MobileServicesTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function MobileServicesTab({ settings, setSettings }: MobileServicesTabProps) {
  const [addressQuery, setAddressQuery] = useState(settings.operations_center_address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState('');
  const [zonesList, setZonesList] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar lista blanca guardada (en formato JSON string en la base de datos)
  useEffect(() => {
    if (settings.whitelist_zones) {
      try {
        const parsed = JSON.parse(settings.whitelist_zones);
        if (Array.isArray(parsed)) {
          setZonesList(parsed);
        }
      } catch (e) {
        // Si no es JSON o está vacío, probar separando por comas
        if (typeof settings.whitelist_zones === 'string') {
          setZonesList(settings.whitelist_zones.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      }
    }
  }, [settings.whitelist_zones]);

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

  // Autocompletado de dirección con Nominatim (OpenStreetMap) o Mapbox
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
          // Autocompletado con Mapbox
          const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
              value
            )}&language=es&access_token=${mapboxToken}&session_token=admin-settings-session`
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
          // Fallback a OpenStreetMap Nominatim (Gratuito y sin claves)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              value
            )}&limit=5&addressdetails=1&countrycodes=es`
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
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Tarjeta 1: Modalidad de Trabajo */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Truck size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Modalidad de Trabajo</h3>
        </div>

        <p className="text-sm text-stone-400 mb-6 font-medium">
          Define si atiendes a tus clientes de forma presencial en tu establecimiento, te desplazas a su domicilio, o combinas ambas modalidades.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'clinic_only',
              label: 'Solo en Centro',
              desc: 'Tus servicios se realizan exclusivamente en el local físico.',
              icon: Building2
            },
            {
              id: 'home_only',
              label: 'Solo a Domicilio',
              desc: 'Eres profesional móvil y te desplazas a la dirección del cliente.',
              icon: Home
            },
            {
              id: 'both',
              label: 'Modalidad Mixta',
              desc: 'Ofreces la opción de reservar en el centro o a domicilio.',
              icon: Globe
            }
          ].map((mode) => {
            const isSelected = settings.work_modality === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSettings({ ...settings, work_modality: mode.id })}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-3 group outline-none
                  ${
                    isSelected
                      ? 'border-[#d4af37] bg-stone-50 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
              >
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-stone-50 text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-600'
                    }`}
                >
                  <mode.icon size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <h4 className={`font-bold text-sm leading-tight transition-colors ${isSelected ? 'text-stone-800' : 'text-stone-600'}`}>
                    {mode.label}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-medium leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {settings.work_modality !== 'clinic_only' && (
        <>
          {/* Tarjeta 2: Centro de Operaciones */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
              <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
                <MapPin size={18} strokeWidth={1.5} />
              </span>
              <h3 className="text-2xl font-serif font-semibold text-stone-800">Centro de Operaciones</h3>
            </div>

            <p className="text-sm text-stone-400 mb-6 font-medium">
              Escribe la dirección base desde donde calculamos el radio geográfico de cobertura (ej: tu domicilio o local principal).
            </p>

            <div className="relative">
              <label className="block text-xs font-bold text-stone-500 mb-2">Dirección Base de Operaciones</label>
              <div className="relative">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={handleAddressChange}
                  className="w-full p-4 pl-12 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all text-stone-800 outline-none"
                  placeholder="Ej: Calle de Serrano 15, Madrid"
                />
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                {loadingSuggestions && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="w-4 h-4 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></span>
                  </div>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-stone-100">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-5 py-3.5 hover:bg-stone-50 text-xs font-semibold text-stone-600 transition-colors flex items-center gap-3"
                    >
                      <MapPin size={14} className="text-[#d4af37] shrink-0" />
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {settings.operations_center_latitude && (
              <div className="mt-4 p-3 bg-[#fcf8e5]/40 border border-[#d4af37]/10 rounded-xl flex items-center justify-between text-xs font-bold text-[#d4af37]">
                <span>📍 Coordenadas base configuradas:</span>
                <span className="font-mono">
                  {settings.operations_center_latitude.toFixed(5)}, {settings.operations_center_longitude.toFixed(5)}
                </span>
              </div>
            )}
          </div>

          {/* Tarjeta 3: Cobertura Geográfica Híbrida */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
              <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
                <Globe size={18} strokeWidth={1.5} />
              </span>
              <h3 className="text-2xl font-serif font-semibold text-stone-800">Cobertura Geográfica</h3>
            </div>

            {/* Radio de Cobertura */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-700">Radio Kilométrico Máximo</h4>
                  <p className="text-xs text-stone-400 mt-1 font-medium leading-relaxed">
                    Distancia máxima en línea recta que estás dispuesto a recorrer para prestar un servicio.
                  </p>
                </div>
                <div className="bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl text-[#d4af37] font-serif font-bold text-lg">
                  {settings.max_coverage_radius_km || 10} km
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                value={settings.max_coverage_radius_km || 10}
                onChange={(e) => setSettings({ ...settings, max_coverage_radius_km: parseFloat(e.target.value) })}
                className="w-full h-1 bg-stone-100 accent-[#d4af37] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-bold mt-2">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
                <span>150 km</span>
              </div>
            </div>

            {/* Lista Blanca de Zonas */}
            <div>
              <h4 className="text-sm font-bold text-stone-700 mb-1">Zonas en Lista Blanca (Excepciones)</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed mb-4">
                Define códigos postales o nombres de poblaciones específicas a los que viajas siempre, incluso si superan el radio kilométrico.
              </p>

              <form onSubmit={handleAddZone} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={whitelistInput}
                  onChange={(e) => setWhitelistInput(e.target.value)}
                  placeholder="Ej: 08028 o Badalona"
                  className="flex-1 p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] outline-none text-xs font-semibold text-stone-700"
                />
                <button
                  type="submit"
                  className="px-5 py-3.5 bg-stone-900 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </form>

              {zonesList.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-100 max-h-48 overflow-y-auto">
                  {zonesList.map((zone, index) => (
                    <span
                      key={index}
                      className="bg-white border border-[#d4af37]/20 text-[#d4af37] text-xs font-bold pl-3.5 pr-2.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm animate-in zoom-in-50 duration-200"
                    >
                      {zone}
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(index)}
                        className="hover:bg-stone-100 rounded-full p-0.5 transition-colors text-stone-400 hover:text-stone-700"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-stone-200 rounded-2xl">
                  <p className="text-xs text-stone-400 font-medium italic">No se han definido zonas de excepción en la lista blanca.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
