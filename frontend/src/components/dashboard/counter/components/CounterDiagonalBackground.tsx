"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ShowcaseService } from '../types';

interface CounterDiagonalBackgroundProps {
  services: ShowcaseService[];
  clinicName: string;
  isDarkMode: boolean;
}

const FALLBACK_EDITORIAL_TITLES = [
  'Tratamiento Signature',
  'Ritual de Bienestar',
  'Cuidado Personalizado',
  'Experiencia Premium',
  'Diagnóstico Exclusivo',
  'Estética Avanzada',
  'Sesión de Autor',
  'Protocolo Revitalizante',
  'Armonía & Belleza',
  'Cuidado Integral',
  'Ritual Sensorial',
  'Esencia & Diseño',
];

// Paletas editoriales "Quiet Luxury" para tarjetas sin fotografía
const EDITORIAL_PALETTES_LIGHT = [
  'from-[#F5EFE6] via-[#E8DCCB] to-[#D6C2A5]',
  'from-[#EFECE6] via-[#DFD8CC] to-[#C8B9A6]',
  'from-[#F4EBE1] via-[#E5D3BE] to-[#C9AD88]',
  'from-[#EAECEF] via-[#D8DCE3] to-[#BFC6D1]',
  'from-[#F3EAE8] via-[#E2D0CC] to-[#C9ADA7]',
  'from-[#292524] via-[#1C1917] to-[#0C0A09]',
];

const EDITORIAL_PALETTES_DARK = [
  'from-stone-800 via-stone-900 to-stone-950',
  'from-[#29231B] via-[#1E1913] to-[#120F0B]',
  'from-zinc-800 via-zinc-900 to-black',
  'from-[#241E1C] via-[#1A1514] to-[#0F0C0B]',
];

function getFullImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

function ShowcaseCard({
  service,
  isDarkMode,
  clinicName,
  paletteIndex,
}: {
  service: ShowcaseService;
  isDarkMode: boolean;
  clinicName: string;
  paletteIndex: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const fullUrl = getFullImageUrl(service.image_url);
  const hasValidImage = Boolean(fullUrl && !imgFailed);

  const formattedPrice =
    service.price !== null && service.price !== undefined && service.price !== ''
      ? `${Number(service.price).toFixed(0)} €`
      : null;

  const palettes = isDarkMode ? EDITORIAL_PALETTES_DARK : EDITORIAL_PALETTES_LIGHT;
  const gradientClass = palettes[paletteIndex % palettes.length];
  const isDarkCard = isDarkMode || (!hasValidImage && paletteIndex % palettes.length === 5);

  return (
    <div
      style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
      className={`group relative aspect-[4/3] w-full shrink-0 rounded-2xl overflow-hidden border transition-colors ${
        isDarkMode
          ? 'bg-stone-900 border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
          : 'bg-white border-stone-200/80 shadow-[0_12px_32px_rgba(28,25,23,0.08)]'
      }`}
    >
      {hasValidImage ? (
        <>
          <img
            src={fullUrl}
            alt={service.name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover scale-[1.02]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />
        </>
      ) : (
        <div className={`relative w-full h-full bg-gradient-to-br ${gradientClass}`}>
          <div
            className={`absolute -right-8 -top-8 w-36 h-36 rounded-full border ${
              isDarkCard ? 'border-[#D4AF37]/20' : 'border-[#D4AF37]/30'
            }`}
          />
          <div
            className={`absolute -right-3 -top-3 w-24 h-24 rounded-full border ${
              isDarkCard ? 'border-white/5' : 'border-white/40'
            }`}
          />
          <div
            className={`absolute right-4 bottom-3 font-serif text-5xl font-bold select-none leading-none ${
              isDarkCard ? 'text-white/[0.06]' : 'text-stone-900/[0.06]'
            }`}
          >
            {clinicName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Sutil línea superior dorada */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

      {/* Etiqueta de categoría o marca */}
      <div
        className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border ${
          hasValidImage || isDarkCard
            ? 'bg-black/40 border-white/15 text-white/90'
            : 'bg-white/65 border-stone-900/10 text-stone-800'
        }`}
      >
        <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
        <span className="text-[9px] font-semibold tracking-wider uppercase truncate max-w-[120px]">
          {service.category_name || clinicName}
        </span>
      </div>

      {/* Título y detalles del servicio */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col gap-0.5">
        <p
          className={`font-serif text-sm sm:text-base font-semibold leading-tight line-clamp-1 ${
            hasValidImage || isDarkCard ? 'text-white drop-shadow-xs' : 'text-stone-900'
          }`}
        >
          {service.name}
        </p>
        {(service.duration_minutes || formattedPrice) && (
          <div
            className={`flex items-center gap-2 text-[11px] font-sans ${
              hasValidImage || isDarkCard ? 'text-white/80' : 'text-stone-600'
            }`}
          >
            {service.duration_minutes ? <span>{service.duration_minutes} min</span> : null}
            {service.duration_minutes && formattedPrice ? <span>·</span> : null}
            {formattedPrice ? (
              <span className={hasValidImage || isDarkCard ? 'text-[#D4AF37] font-semibold' : 'text-amber-700 font-semibold'}>
                {formattedPrice}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CounterDiagonalBackground
 * Muro 3D en perspectiva diagonal con 6 columnas en marquee infinito.
 * Cada columna tiene una altura fija menor que el 50% de su contenido duplicado,
 * garantizando un loop 100% continuo sin huecos ni apariciones repentinas.
 */
export function CounterDiagonalBackground({
  services,
  clinicName,
  isDarkMode,
}: CounterDiagonalBackgroundProps) {
  const NUM_COLUMNS = 6;

  // Pool de al menos 48 tarjetas (8 por columna x 2 duplicado = 16 por columna)
  // para asegurar que 1x bloque siempre supere la altura del contenedor visible.
  const columns = useMemo(() => {
    const basePool: ShowcaseService[] =
      services.length > 0
        ? services
        : FALLBACK_EDITORIAL_TITLES.map((title, idx) => ({
            id: `fallback-${idx}`,
            name: title,
            image_url: null,
            category_name: clinicName,
          }));

    const minTotal = 48;
    const expanded: ShowcaseService[] = [];
    while (expanded.length < minTotal) {
      for (const item of basePool) {
        expanded.push(item);
        if (expanded.length >= minTotal && expanded.length >= basePool.length) break;
      }
    }

    const cols: ShowcaseService[][] = Array.from({ length: NUM_COLUMNS }, () => []);
    expanded.forEach((item, index) => {
      cols[index % NUM_COLUMNS].push(item);
    });

    return cols;
  }, [services, clinicName]);

  const durations = [72, 84, 76, 88, 80, 90];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Plano 3D inclinado sobredimensionado */}
      <div
        className="absolute -inset-[45%] flex items-center justify-center"
        style={{
          transform: 'perspective(1200px) rotateX(16deg) rotateY(-6deg) rotateZ(-12deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5 w-[185vw] min-w-[2100px] h-[175vh] min-h-[1450px]">
          {columns.map((colItems, colIdx) => {
            const isReverse = colIdx % 2 === 1;
            const duplicated = [...colItems, ...colItems];

            return (
              <div key={colIdx} className="h-full overflow-hidden relative">
                <motion.div
                  className="flex flex-col gap-4 sm:gap-5 will-change-transform"
                  initial={{ y: isReverse ? '-50%' : '0%' }}
                  animate={{
                    y: isReverse ? ['-50%', '0%'] : ['0%', '-50%'],
                  }}
                  transition={{
                    duration: durations[colIdx % durations.length],
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {duplicated.map((svc, idx) => (
                    <ShowcaseCard
                      key={`${colIdx}-${svc.id}-${idx}`}
                      service={svc}
                      isDarkMode={isDarkMode}
                      clinicName={clinicName}
                      paletteIndex={colIdx * 3 + idx}
                    />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay blanco/marfil suave para dar protagonismo al pedestal central */}
      <div
        className={`absolute inset-0 backdrop-blur-[1.5px] ${
          isDarkMode ? 'bg-stone-950/35' : 'bg-white/30'
        }`}
      />

      {/* Viñeta radial suave para enfocar la atención en el centro */}
      <div
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 50% 56% at 50% 50%, rgba(12,10,9,0.84) 0%, rgba(12,10,9,0.45) 55%, rgba(12,10,9,0.22) 100%)'
            : 'radial-gradient(ellipse 50% 56% at 50% 50%, rgba(255,255,255,0.78) 0%, rgba(250,249,246,0.38) 55%, rgba(250,249,246,0.18) 100%)',
        }}
      />

      {/* Halo dorado ambiental sutil detrás del pedestal central */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full blur-[130px] ${
          isDarkMode ? 'bg-[#D4AF37]/15' : 'bg-[#D4AF37]/20'
        }`}
      />
    </div>
  );
}
