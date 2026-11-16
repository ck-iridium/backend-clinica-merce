"use client";

import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { Sector, resolveSectorImage } from './showcaseData';

interface Showcase3DCardProps {
  slotKey: number;
  slotOffset: number;
  absOffset: number;
  angleStep: number;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  sector: Sector;
  actualItemIndex: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function Showcase3DCard({
  slotKey,
  slotOffset,
  absOffset,
  angleStep,
  radius,
  cardWidth,
  cardHeight,
  sector,
  actualItemIndex,
  onPointerDown,
  onClick,
}: Showcase3DCardProps) {
  // Fórmulas matemáticas de arco convexo (Bambu Lab geometry)
  const angleDeg = slotOffset * angleStep;
  const angleRad = (angleDeg * Math.PI) / 180;

  const rawX = Math.sin(angleRad) * radius;
  const x = Math.round(rawX * 100) / 100;

  const rawZ = (Math.cos(angleRad) - 1) * radius;
  const z = Math.round(rawZ * 100) / 100;

  const rotY = Math.round(-angleDeg * 100) / 100;

  const scale = Math.round(Math.max(0.75, 1 - absOffset * 0.045) * 1000) / 1000;
  const opacity = Math.round(Math.max(0, 1 - Math.pow(absOffset / 3.4, 2.2)) * 1000) / 1000;
  const zIndex = Math.round(100 - absOffset * 10);

  if (absOffset > 3.5 || opacity <= 0.01) return null;

  const isCenterCard = Math.abs(slotOffset) < 0.45;
  const imgSrc = resolveSectorImage(sector, actualItemIndex);

  return (
    <div
      suppressHydrationWarning={true}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={`absolute rounded-[2.4rem] md:rounded-[2.8rem] overflow-hidden cursor-pointer select-none transition-shadow duration-300 group pointer-events-auto ${
        isCenterCard
          ? 'border-[3.5px] border-[#D4AF37] ring-4 ring-[#D4AF37]/25 shadow-[0_30px_90px_-15px_rgba(212,175,55,0.45),0_15px_40px_rgba(0,0,0,0.35)]'
          : 'border-[3px] border-stone-800/80 shadow-2xl hover:border-stone-700'
      }`}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) scale(${scale})`,
        opacity: opacity,
        zIndex: zIndex,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
        pointerEvents: opacity > 0.1 ? 'auto' : 'none',
      }}
    >
      {/* ── ISLA DINÁMICA / SPEAKER SUPERIOR DE SMARTPHONE ── */}
      <div className="absolute top-3 inset-x-0 z-30 flex justify-center pointer-events-none">
        <div className="w-20 md:w-24 h-4 bg-black/90 rounded-full border border-white/10 flex items-center justify-center gap-1.5 shadow-md backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-stone-900 border border-white/20" />
          <span className="w-6 h-0.5 rounded-full bg-stone-700" />
        </div>
      </div>

      {/* ── IMAGEN DE FONDO VERTICAL 9:16 ── */}
      <img
        src={imgSrc}
        alt={sector.title}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
      />

      {/* ── VELO DEGRADADO SUTIL SOLO EN LA BASE PARA LECTURA ── */}
      <div className="absolute bottom-0 inset-x-0 h-[48%] bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* ── BADGE SUPERIOR DE SECTOR ── */}
      <div className="absolute top-9 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${
          isCenterCard
            ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]'
            : 'bg-black/60 text-white border-white/20'
        }`}>
          {sector.badge || sector.title}
        </span>

        {isCenterCard && (
          <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Activo
          </span>
        )}
      </div>

      {/* ── BOTÓN PLAY CENTRAL EN LA FICHA ACTIVA ── */}
      {isCenterCard && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-black/40">
            <Play className="w-7 h-7 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* ── PIE DE LA FICHA MÓVIL ── */}
      <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 z-20 text-white flex flex-col justify-end pointer-events-none">
        <h3 className="font-serif text-base md:text-xl font-bold leading-tight drop-shadow-md text-white group-hover:text-[#D4AF37] transition-colors">
          {sector.title}
        </h3>

        <p className="text-[11px] md:text-xs text-stone-200 mt-1.5 font-medium line-clamp-2 opacity-90 leading-relaxed">
          {sector.copy || 'Entorno SaaS exclusivo con expedientes LOPD y motor de reservas sin comisiones.'}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-300 flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
            <span>Ver demostración</span>
            <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
          </span>
        </div>

        {/* Barra Home Indicator de Smartphone */}
        <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-4" />
      </div>
    </div>
  );
}
