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

  const iconSizes = {
    sm: 22,
    md: 20,
    lg: 32,
  }[size];

  // Trazo fino y detallado según tamaño
  const baseStroke = size === 'lg' ? 1.4 : 1.3;
  const beamStroke = size === 'lg' ? 1.7 : 1.5;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none flex items-center justify-center border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.9),0_4px_20px_rgba(0,0,0,0.6)] ${dimensions} ${className}`}
      style={{
        background: 'radial-gradient(circle at 35% 30%, #1e1e24 0%, #0c0c0f 55%, #030304 100%)',
      }}
    >
      {/* ── Reflejo Especular Superior de Vidrio Pulido ── */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none z-20"
        style={{
          background:
            'radial-gradient(ellipse at 32% 22%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 32%, transparent 60%)',
        }}
      />

      {/* ── Símbolo de Infinito Fino, Detallado y Animado (ProBookia Orange) ── */}
      <div
        className="relative z-10 flex items-center justify-center animate-infinity-float"
        style={{
          filter: isSpeaking
            ? 'drop-shadow(0 0 6px rgba(255, 107, 0, 0.95)) drop-shadow(0 0 14px rgba(255, 138, 43, 0.7))'
            : 'drop-shadow(0 0 4px rgba(255, 107, 0, 0.85)) drop-shadow(0 0 9px rgba(255, 138, 43, 0.45))',
        }}
      >
        <svg
          width={iconSizes}
          height={iconSizes}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Gradiente fino de luz naranja ProBookia */}
            <linearGradient id="probookia-laser-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff2d6" />
              <stop offset="35%" stopColor="#ff7a18" />
              <stop offset="70%" stopColor="#ff5500" />
              <stop offset="100%" stopColor="#ffaa44" />
            </linearGradient>
            <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff8c2b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Trazo base fino y nítido (Semi-translúcido) */}
          <path
            d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
            stroke="#ff5e00"
            strokeWidth={baseStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />

          {/* 2. Haz de luz láser circulante continuo (Efecto de corriente infinita) */}
          <path
            d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
            stroke="url(#probookia-laser-grad)"
            strokeWidth={beamStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="22 78"
            className={isSpeaking ? 'animate-infinity-beam-fast' : 'animate-infinity-beam'}
          />

          {/* 3. Micro-nodo central brillante en el cruce */}
          <circle
            cx="12"
            cy="12"
            r={size === 'lg' ? 0.9 : 0.7}
            fill="#ffffff"
            opacity={0.8}
          />
        </svg>
      </div>

      {/* ── Micro-anillo sutil al hablar ── */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border border-orange-500/40 animate-ping opacity-30 pointer-events-none" />
      )}
    </div>
  );
}
