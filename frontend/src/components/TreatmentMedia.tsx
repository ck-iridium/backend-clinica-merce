"use client";

import { useState, useEffect, useRef } from 'react';

interface TreatmentMediaProps {
  imageUrl: string;
  videoUrl?: string;
  headerStyle: string;
}

export default function TreatmentMedia({ imageUrl, videoUrl, headerStyle }: TreatmentMediaProps) {
  // Si es estilo video y tenemos URL, usamos el reproductor con poster
  if (headerStyle === 'split_video' && videoUrl) {
    return (
      <div className="relative h-full aspect-[9/16] max-w-full mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] bg-stone-100">
        <video
          src={videoUrl}
          poster={imageUrl}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    );
  }

  // Si es imagen estática o no hay video, mostramos la imagen con el mismo estilo
  return (
    <div className={`relative ${headerStyle === 'split_video' ? 'h-full aspect-[9/16] max-w-full mx-auto rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]' : 'w-full h-full'} overflow-hidden bg-stone-100`}>
      <img
        src={imageUrl}
        alt="Tratamiento"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
