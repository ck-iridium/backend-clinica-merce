'use client';

import React from 'react';

interface ChromaticOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isSpeaking?: boolean;
}

export default function ChromaticOrb({
  size = 'md',
  className = '',
  isSpeaking = false,
}: ChromaticOrbProps) {
  // Dimensiones según variante
  const dimensions = {
    sm: 'w-10 h-10',      // Avatar en mensajes (40px)
    md: 'w-9 h-9',        // Cabecera (36px)
    lg: 'w-14 h-14',      // Lanzador flotante WOW (56px)
  }[size];

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none shadow-[0_0_20px_rgba(168,85,247,0.35)] ${dimensions} ${className}`}
      style={{
        background: '#07060d',
      }}
    >
      {/* ── CAPA 1: Torbellino Cromático Conic (Rotación Continua) ── */}
      <div
        className="absolute -inset-[35%] rounded-full animate-spin-slow opacity-95 blur-[6px]"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, #00f0ff 0deg, #3b82f6 60deg, #a855f7 120deg, #ec4899 180deg, #f59e0b 240deg, #10b981 300deg, #00f0ff 360deg)',
          animationDuration: isSpeaking ? '4s' : '10s',
        }}
      />

      {/* ── CAPA 2: Lóbulo Magenta / Púrpura Fluido (Rotación Inversa) ── */}
      <div
        className="absolute -inset-[30%] rounded-full animate-spin-reverse opacity-80 mix-blend-screen blur-[8px]"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, #f43f5e 0%, #d946ef 35%, #8b5cf6 65%, transparent 80%)',
          animationDuration: isSpeaking ? '3s' : '8s',
        }}
      />

      {/* ── CAPA 3: Lóbulo Ámbar / Cian de Alta Frecuencia ── */}
      <div
        className="absolute -inset-[25%] rounded-full animate-pulse-gentle opacity-75 mix-blend-screen blur-[5px]"
        style={{
          background:
            'radial-gradient(circle at 30% 70%, #06b6d4 0%, #fbbf24 40%, transparent 75%)',
        }}
      />

      {/* ── CAPA 4: Vacío Central Toroidal (Efecto Agujero / 3D Dribbble) ── */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(7, 6, 13, 0.94) 28%, rgba(7, 6, 13, 0.45) 54%, transparent 72%)',
        }}
      />

      {/* ── CAPA 5: Resplandor de Cristal y Reflejo Especular 3D ── */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 32% 26%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.2) 28%, transparent 55%)',
          boxShadow:
            'inset 0 0 8px rgba(255, 255, 255, 0.4), inset 0 0 16px rgba(217, 70, 239, 0.35), inset 0 -4px 10px rgba(56, 189, 248, 0.3)',
        }}
      />

      {/* ── Micro-pulso vivo al hablar ── */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-40 pointer-events-none" />
      )}
    </div>
  );
}

