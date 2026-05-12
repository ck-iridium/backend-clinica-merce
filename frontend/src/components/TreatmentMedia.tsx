"use client";

import { useState, useEffect, useRef } from 'react';

interface TreatmentMediaProps {
  imageUrl: string;
  videoUrl?: string;
  headerStyle: string;
}

export default function TreatmentMedia({ imageUrl, videoUrl, headerStyle }: TreatmentMediaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Si es estilo video y tenemos URL, usamos el reproductor con poster
  if (headerStyle === 'split_video' && videoUrl) {
    return (
      <div className="relative h-full aspect-[9/16] max-w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] bg-stone-100">
        {!hasError ? (
          <video
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
            <span className="font-serif text-5xl italic mb-2">Merce</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Estética & Bienestar</span>
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
          src={imageUrl}
          alt="Tratamiento"
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-400">
          <span className="font-serif text-5xl italic mb-2 text-stone-300">Merce</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Estética & Bienestar</span>
        </div>
      )}
    </div>
  );
}
