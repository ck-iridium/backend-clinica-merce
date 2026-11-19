import React from 'react';

interface LuxuryTreatmentPlaceholderProps {
  mode?: 'light' | 'dark' | 'auto';
  className?: string;
  alt?: string;
}

export function LuxuryTreatmentPlaceholder({
  mode = 'auto',
  className = 'w-full h-full object-cover',
  alt = 'Tratamiento',
}: LuxuryTreatmentPlaceholderProps) {
  if (mode === 'light') {
    return (
      <img
        src="/placeholders/treatment-placeholder-light.svg"
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  if (mode === 'dark') {
    return (
      <img
        src="/placeholders/treatment-placeholder-dark.svg"
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  // Modo "auto": responde dinámicamente a la clase dark de HTML / Tailwind
  return (
    <>
      <img
        src="/placeholders/treatment-placeholder-light.svg"
        alt={alt}
        className={`${className} block dark:hidden`}
        loading="lazy"
      />
      <img
        src="/placeholders/treatment-placeholder-dark.svg"
        alt={alt}
        className={`${className} hidden dark:block`}
        loading="lazy"
      />
    </>
  );
}
