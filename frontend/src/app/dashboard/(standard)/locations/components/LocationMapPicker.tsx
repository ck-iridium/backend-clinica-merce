"use client";

import React, { useEffect, useRef } from 'react';
import { formatCleanAddress } from './locationUtils';

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  onCoordinatesChange: (lat: number, lon: number) => void;
  onAddressResolved?: (address: string) => void;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  address,
  onCoordinatesChange,
  onAddressResolved,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && onAddressResolved) {
          const clean = formatCleanAddress(data, '');
          if (clean) {
            onAddressResolved(clean);
          }
        }
      }
    } catch (e) {
      console.error("Error en geocodificación inversa:", e);
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const lat = latitude || 39.151;
    const lon = longitude || -0.437;

    const map = L.map(mapContainerRef.current).setView([lat, lon], 15);
    mapRef.current = map;

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

    const marker = L.marker([lat, lon], { icon: goldIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      onCoordinatesChange(latLng.lat, latLng.lng);
      if (!address || !address.trim()) {
        reverseGeocode(latLng.lat, latLng.lng);
      }
    });
  };

  // Carga asíncrona de recursos Leaflet
  useEffect(() => {
    const linkId = 'leaflet-css-cdn';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const scriptId = 'leaflet-js-cdn';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initMap();
        };
        document.body.appendChild(script);
      }
    } else {
      const timer = setTimeout(() => {
        initMap();
      }, 150);
      return () => clearTimeout(timer);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sincronizar posición de marcador cuando cambian coordenadas
  useEffect(() => {
    if (mapRef.current && latitude && longitude) {
      const L = (window as any).L;
      if (!L) return;

      const newPos = [latitude, longitude] as [number, number];
      mapRef.current.setView(newPos, 15);

      if (markerRef.current) {
        markerRef.current.setLatLng(newPos);
      } else {
        const goldIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        const marker = L.marker(newPos, { icon: goldIcon, draggable: true }).addTo(mapRef.current);
        markerRef.current = marker;

        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          onCoordinatesChange(latLng.lat, latLng.lng);
          if (!address || !address.trim()) {
            reverseGeocode(latLng.lat, latLng.lng);
          }
        });
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
        Verificar ubicación en mapa (Arrastra el pin para precisión)
      </label>
      <div 
        ref={mapContainerRef} 
        className="w-full h-40 rounded-xl border border-stone-200 overflow-hidden relative z-10"
        style={{ minHeight: '160px' }}
      />
    </div>
  );
}
