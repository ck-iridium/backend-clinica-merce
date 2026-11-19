'use client';

import { useState } from 'react';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';

interface CategoryImageProps {
  src?: string;
  alt: string;
}

export default function CategoryImage({ src, alt }: CategoryImageProps) {
  const [error, setError] = useState(false);

  // Si no hay src o ha fallado la carga, mostramos el placeholder de lujo sin texto
  if (!src || error) {
    return <LuxuryTreatmentPlaceholder mode="auto" className="w-full h-full object-cover" alt={alt} />;
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
