"use client"
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, ShieldCheck, Info, X, MapPin, Building2, Globe, Search, Compass, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

const getTenantId = () => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; tenant_id=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

export default function Step3Details({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  selectedService,
  privacyAccepted,
  setPrivacyAccepted,
  settings
}: {
  formData: any;
  setFormData: (d: any) => void;
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
  settings?: any;
}) {
  const { language, t, translate } = useLanguage();
  const [showFianzaInfo, setShowFianzaInfo] = useState(false);
  const [addressQuery, setAddressQuery] = useState(formData.client_address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [savedAddressData, setSavedAddressData] = useState<any | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [loadingReverseGeo, setLoadingReverseGeo] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);



  const getServiceDepositInfo = (srv: any) => {
    if (!srv) return { required: false, amount: 0 };
    if (srv.requires_deposit && srv.deposit_amount && srv.deposit_amount > 0) {
      return { required: true, amount: srv.deposit_amount };
    }
    if (settings?.global_deposit_required && settings?.global_deposit_amount && settings?.global_deposit_amount > 0) {
      const isExempt = srv.deposit_amount !== null && srv.deposit_amount !== undefined && parseFloat(srv.deposit_amount) === 0.0;
      if (!isExempt) {
        return { required: true, amount: settings.global_deposit_amount };
      }
    }
    return { required: false, amount: 0 };
  };

  // 1-Click Checkout: Comprobar si el cliente recurrente ya tiene dirección guardada en el CRM
  useEffect(() => {
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    if (email.length > 5 && phone.length > 7) {
      const tenantId = getTenantId();
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/appointments/client-saved-address?email=${encodeURIComponent(
          email
        )}&phone=${encodeURIComponent(phone)}`,
        {
          headers: { 'X-Tenant-ID': tenantId }
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.has_saved_address) {
            setSavedAddressData(data);
          } else {
            setSavedAddressData(null);
          }
        })
        .catch(() => setSavedAddressData(null));
    } else {
      setSavedAddressData(null);
    }
  }, [formData.email, formData.phone]);

  const handleApplySavedAddress = () => {
    if (!savedAddressData) return;
    setFormData({
      ...formData,
      client_address: savedAddressData.client_address,
      client_latitude: savedAddressData.client_latitude,
      client_longitude: savedAddressData.client_longitude,
      client_postal_code: savedAddressData.client_postal_code,
      client_city: savedAddressData.client_city
    });
    setAddressQuery(savedAddressData.client_address);
    setSavedAddressData(null);
  };

  // Buscar sugerencias de autocompletado (Soporte España y Francia)
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

  // Carga e inicialización dinámica de Leaflet para el modal interactivo de Pin Drop
  useEffect(() => {
    if (showMapModal) {
      // Cargar Leaflet CSS
      const linkId = 'leaflet-css-cdn';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Cargar Leaflet JS
      const scriptId = 'leaflet-js-cdn';
      if (!window.hasOwnProperty('L')) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initMap();
        };
        document.body.appendChild(script);
      } else {
        setTimeout(() => {
          initMap();
        }, 300);
      }
    } else {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markerRef.current = null;
    }
  }, [showMapModal]);

  const initMap = () => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const initialLat = formData.client_latitude || settings?.operations_center_latitude || 40.416775;
    const initialLon = formData.client_longitude || settings?.operations_center_longitude || -3.703790;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLon], 14);
    leafletMapRef.current = map;

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

    const marker = L.marker([initialLat, initialLon], {
      draggable: true,
      icon: goldIcon
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      map.panTo(pos);
    });
  };

  const handleConfirmPinDrop = async () => {
    if (!markerRef.current) return;
    const pos = markerRef.current.getLatLng();
    setLoadingReverseGeo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        const resolvedAddress = data.display_name;
        const postalCode = data.address?.postcode || '';
        const city = data.address?.city || data.address?.town || data.address?.village || '';

        setFormData({
          ...formData,
          client_address: resolvedAddress,
          client_latitude: pos.lat,
          client_longitude: pos.lng,
          client_postal_code: postalCode,
          client_city: city
        });
        setAddressQuery(resolvedAddress);
        setShowMapModal(false);
      }
    } catch (e) {
      console.error('Error on reverse geocoding:', e);
    } finally {
      setLoadingReverseGeo(false);
    }
  };

  const showModalitySelector =
    (selectedService?.allowed_modality === 'both' || !selectedService?.allowed_modality) &&
    (settings?.work_modality === 'both' || settings?.work_modality === 'mix');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col flex-grow min-h-0 bg-background text-foreground animate-in duration-300"
    >
      {/* Header Equilibrado */}
      <div className="shrink-0 px-6 pt-4 pb-2 z-30 bg-background">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">{t('wizard.fill_details')}</h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium truncate">
          {t('wizard.finish_booking_for')} <span className="text-primary font-bold">{translate(selectedService?.name, selectedService?.translations, 'name')}</span>
        </p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-3 pb-6 space-y-5">
        {/* Card de Resumen */}
        <div className="bg-card rounded-luxury-card p-4 md:p-6 md:px-8 border border-border shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-black uppercase text-primary tracking-[0.2em] mb-0.5">{t('wizard.appointment_for_date')}</p>
            <p className="text-base md:text-xl font-serif text-foreground leading-tight">
              {selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs md:text-sm font-bold text-muted-foreground mt-0.5">{t('wizard.at_time').replace('{time}', selectedTime)}</p>
          </div>

          <div className="text-right relative z-10 flex flex-col items-end">
            <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/50 tracking-widest mb-0.5">{t('wizard.total')}</p>
            <p className="text-2xl md:text-3xl font-serif text-foreground font-bold">{selectedService?.price}€</p>
            {(() => {
              const dep = getServiceDepositInfo(selectedService);
              if (!dep.required) return null;
              return (
                <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                  <motion.button
                    type="button"
                    onClick={() => setShowFianzaInfo(true)}
                    animate={{
                      scale: [1, 1.12, 1],
                      boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 8px rgba(59, 130, 246, 0.45)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors p-1 rounded-full focus:outline-none flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50 mr-0.5"
                    title={t('wizard.deposit_info_title')}
                  >
                    <Info size={13} className="shrink-0" />
                  </motion.button>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t('wizard.fianza')}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-primary">
                    {dep.amount}€
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 1-Click Checkout: Dirección Habitual Detectada */}
        <AnimatePresence>
          {savedAddressData && formData.service_modality === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50/50 border border-[#d4af37]/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm"
            >
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                  <CheckCircle size={16} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#b08e23]">{t('wizard.detected_address_title')}</h4>
                  <p className="text-[11px] text-stone-500 font-medium leading-normal mt-0.5">
                    {t('wizard.detected_address_desc')} <strong>{savedAddressData.client_address}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplySavedAddress}
                className="w-full md:w-auto px-4 py-2 bg-[#d4af37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                {t('wizard.autocomplete')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario de Reserva */}
        <div className="space-y-4">
          <div className="space-y-3.5 md:space-y-5">
            {/* Modalidad de servicio (Clínica vs Domicilio) */}
            {showModalitySelector && (
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1">
                  {t('wizard.service_modality')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, service_modality: 'clinic' })}
                    className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all outline-none
                      ${
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
                    className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all outline-none
                      ${
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
                      <span className="w-4 h-4 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 hover:text-white border border-stone-750"
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

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.full_name')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <User size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder={t('wizard.full_name_placeholder')}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.email')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Mail size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.phone')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Phone size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Trust */}
          <div className="pt-2 px-1">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={e => setPrivacyAccepted(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-border rounded-luxury-btn bg-card transition-all flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                  <AnimatePresence>
                    {privacyAccepted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute inset-0 bg-primary flex items-center justify-center"
                      >
                        <motion.svg
                          className="w-3.5 h-3.5 md:w-5 md:h-5 text-stone-900 stroke-current"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut", delay: 0.05 }}
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] md:text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {t('wizard.accept_privacy')}{' '}
                  <a
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('wizard.privacy_policy')}
                  </a>
                </span>
                <span className="text-[9px] md:text-xs text-muted-foreground/70 uppercase tracking-widest mt-0.5 font-medium">{t('wizard.secure_data')}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Explicativo de Fianza */}
      <AnimatePresence>
        {showFianzaInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in duration-300">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFianzaInfo(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-card rounded-luxury-card p-6 md:p-8 border border-border shadow-xl z-10 flex flex-col gap-5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary" />
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                  <h3 className="text-foreground font-serif text-lg font-bold leading-tight">{t('wizard.deposit_policy')}</h3>
                </div>
                <button
                  onClick={() => setShowFianzaInfo(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                <p>{t('wizard.deposit_policy_desc')}</p>
                {(() => {
                  const dep = getServiceDepositInfo(selectedService);
                  const remaining = Math.max(0, parseFloat(selectedService?.price || 0) - dep.amount);
                  return (
                    <div className="bg-muted rounded-xl p-3 border border-border flex flex-col gap-2 font-medium">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">{t('wizard.total_treatment')}</span>
                        <span className="font-bold text-foreground">{selectedService?.price}€</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-primary">
                        <span>{t('wizard.deposit_online_today')}</span>
                        <span className="font-bold">{dep.amount}€</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">{t('wizard.remaining_at_clinic')}</span>
                        <span className="font-bold text-foreground">{remaining}€</span>
                      </div>
                    </div>
                  );
                })()}
                <p>
                  <strong>{t('wizard.need_to_cancel_title')}</strong><br />
                  {t('wizard.need_to_cancel_desc').replace('{hours}', (settings?.cancellation_margin_hours || 24).toString())}
                </p>
              </div>

              <button
                onClick={() => setShowFianzaInfo(false)}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground active:scale-98 transition-all py-3 rounded-luxury-btn font-bold uppercase tracking-wider text-xs"
              >
                {t('common.understood')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL INTERACTIVO DE PIN DROP PARA GEOLOCALIZACIÓN MANUAL */}
      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in duration-300">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMapModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-card rounded-luxury-card border border-border shadow-2xl z-[110] overflow-hidden flex flex-col h-[75vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">{t('wizard.fix_map_title')}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{t('wizard.fix_map_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="text-stone-400 hover:text-stone-200 transition-colors p-1.5 rounded-full hover:bg-stone-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Map Canvas */}
              <div className="flex-1 w-full bg-stone-900 relative min-h-0">
                <div ref={mapContainerRef} className="w-full h-full z-10" style={{ minHeight: '200px' }} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-card shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-stone-700 hover:text-white"
                >
                  {t('wizard.cancel')}
                </button>
                <button
                  type="button"
                  disabled={loadingReverseGeo}
                  onClick={handleConfirmPinDrop}
                  className="flex-grow bg-[#d4af37] hover:bg-[#c29e2f] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loadingReverseGeo ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    t('wizard.confirm_location')
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
