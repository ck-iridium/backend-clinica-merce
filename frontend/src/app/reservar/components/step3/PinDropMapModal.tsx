"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PinDropMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number | null;
  initialLon?: number | null;
  fallbackLat?: number;
  fallbackLon?: number;
  onConfirmCoordinates: (result: {
    address: string;
    lat: number;
    lon: number;
    postal_code: string;
    city: string;
  }) => void;
}

export default function PinDropMapModal({
  isOpen,
  onClose,
  initialLat,
  initialLon,
  fallbackLat = 40.416775,
  fallbackLon = -3.703790,
  onConfirmCoordinates,
}: PinDropMapModalProps) {
  const { t } = useLanguage();
  const [loadingReverseGeo, setLoadingReverseGeo] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  const initMap = () => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const lat = initialLat || fallbackLat;
    const lon = initialLon || fallbackLon;

    const map = L.map(mapContainerRef.current).setView([lat, lon], 14);
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

    const marker = L.marker([lat, lon], {
      draggable: true,
      icon: goldIcon
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      map.panTo(pos);
    });
  };

  useEffect(() => {
    if (isOpen) {
      const linkId = 'leaflet-css-cdn';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

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
        const timer = setTimeout(() => {
          initMap();
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markerRef.current = null;
    }
  }, [isOpen]);

  const handleConfirm = async () => {
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

        onConfirmCoordinates({
          address: resolvedAddress,
          lat: pos.lat,
          lon: pos.lng,
          postal_code: postalCode,
          city: city
        });
        onClose();
      }
    } catch (e) {
      console.error('Error al realizar geocodificación inversa:', e);
    } finally {
      setLoadingReverseGeo(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in duration-300">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <h3 className="font-serif font-bold text-base text-foreground">
                  {t('wizard.fix_map_title')}
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                  {t('wizard.fix_map_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
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
                onClick={onClose}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-stone-700 hover:text-white"
              >
                {t('wizard.cancel')}
              </button>
              <button
                type="button"
                disabled={loadingReverseGeo}
                onClick={handleConfirm}
                className="flex-grow bg-[#d4af37] hover:bg-[#c29e2f] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loadingReverseGeo ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  t('wizard.confirm_location')
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
