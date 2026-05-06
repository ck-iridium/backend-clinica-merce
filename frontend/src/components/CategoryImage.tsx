'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface CategoryImageProps {
  src?: string;
  alt: string;
}

export default function CategoryImage({ src, alt }: CategoryImageProps) {
  const [error, setError] = useState(false);

  // Si no hay src o ha fallado la carga, mostramos el fallback elegante
  if (!src || error) {
    return (
      <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300 border border-stone-100/50">
        <ImageIcon size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">{alt.split(' ')[0]}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-opacity duration-300"
      onError={() => setError(true)}
    />
  );
}
