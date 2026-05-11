"use client";

import { useEffect, useRef } from 'react';

export default function TreatmentScrollHandler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Auto-scroll suave inicial para mostrar un trozo del contenido
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: 120, // Un pequeño scroll para asomar el contenido
          behavior: 'smooth'
        });
      }
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="md:snap-none snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth"
    >
      {children}
    </div>
  );
}
