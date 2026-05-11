"use client";

import { useRef } from 'react';

export default function TreatmentScrollHandler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Lógica de auto-scroll eliminada temporalmente por petición del usuario

  return (
    <div 
      ref={containerRef}
      className="md:snap-none snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth"
    >
      {children}
    </div>
  );
}
