"use client";

import { useState, useEffect, useRef } from 'react';

interface TreatmentMediaProps {
  imageUrl: string;
  videoUrl?: string;
  headerStyle: string;
  clinicName?: string;
}

export default function TreatmentMedia({ imageUrl, videoUrl, headerStyle, clinicName }: TreatmentMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Verificación proactiva para imágenes/vídeos ya cargados (Caché / F5)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsLoaded(true);
    }
  }, []);

  const displayClinicName = clinicName || 'ProBookia';

  // Si es estilo video y tenemos URL, usamos el reproductor con poster
  if (headerStyle === 'split_video' && videoUrl) {
    return (
      <div className="relative h-full aspect-[9/16] max-w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] bg-stone-100">
        {!hasError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl}
            className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100/50 text-stone-400 border border-stone-200/40 rounded-[2rem] md:rounded-[3rem] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200/50 flex items-center justify-center mb-4 shadow-sm">
              <span className="font-serif text-primary text-2xl italic">{displayClinicName.charAt(0).toUpperCase()}</span>
            </div>
            <h4 className="font-serif text-3xl italic text-stone-800 mb-1 leading-tight">{displayClinicName}</h4>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400/80">Estética Avanzada</span>
          </div>
        )}
      </div>
    );
  }

  // Si es imagen estática o no hay video, mostramos la imagen con el mismo estilo
  return (
    <div className={`relative ${headerStyle === 'split_video' ? 'h-full aspect-[9/16] max-w-full rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]' : 'w-full h-full'} overflow-hidden bg-stone-100`}>
      {imageUrl && !hasError ? (
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Tratamiento"
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100/50 text-stone-400 border border-stone-200/40 rounded-[2rem] md:rounded-[3rem] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200/50 flex items-center justify-center mb-4 shadow-sm">
            <span className="font-serif text-primary text-2xl italic">{displayClinicName.charAt(0).toUpperCase()}</span>
          </div>
          <h4 className="font-serif text-3xl italic text-stone-800 mb-1 leading-tight">{displayClinicName}</h4>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400/80">Estética Avanzada</span>
        </div>
      )}
    </div>
  );
}
