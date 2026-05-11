"use client";

import { useState, useEffect, useRef } from 'react';

interface TreatmentMediaProps {
  imageUrl: string;
  videoUrl?: string;
  headerStyle: string;
}

export default function TreatmentMedia({ imageUrl, videoUrl, headerStyle }: TreatmentMediaProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Si no hay vídeo, no necesitamos lógica de carga
  const hasVideo = !!videoUrl && headerStyle === 'split_video';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Imagen de Fondo / Placeholder */}
      <img
        src={imageUrl}
        alt="Tratamiento"
        className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'} ${headerStyle === 'split_video' ? 'aspect-[9/16] rounded-[2rem] md:rounded-[3rem]' : 'aspect-[9/16] md:aspect-auto'}`}
      />

      {/* Vídeo con carga progresiva */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'} aspect-[9/16] rounded-[2rem] md:rounded-[3rem]`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
        />
      )}

      {/* Sombra suave para dar profundidad si es estilo video */}
      {headerStyle === 'split_video' && (
        <div className="absolute inset-0 pointer-events-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] rounded-[2rem] md:rounded-[3rem]" />
      )}
    </div>
  );
}
