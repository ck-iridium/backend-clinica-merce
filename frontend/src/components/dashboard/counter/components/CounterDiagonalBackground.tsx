"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ShowcaseService } from '../types';
import { LuxuryTreatmentPlaceholder } from '@/components/ui/LuxuryTreatmentPlaceholder';

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
}: {
  service: ShowcaseService;
  isDarkMode: boolean;
  clinicName: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const fullUrl = getFullImageUrl(service.image_url);
  const hasValidImage = Boolean(fullUrl && !imgFailed);

  const formattedPrice =
    service.price !== null && service.price !== undefined && service.price !== ''
      ? `${Number(service.price).toFixed(0)} €`
      : null;

  return (
    <div
      className={`group relative aspect-[4/3] w-full rounded-2xl overflow-hidden border transition-colors ${
        isDarkMode
          ? 'bg-stone-900/90 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
          : 'bg-white/95 border-stone-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
      }`}
    >
      {hasValidImage ? (
        <img
          src={fullUrl}
          alt={service.name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover opacity-90 scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div className="relative w-full h-full">
          <LuxuryTreatmentPlaceholder
            mode={isDarkMode ? 'dark' : 'light'}
            alt={service.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-stone-950/60'
                : 'bg-gradient-to-br from-[#D4AF37]/15 via-transparent to-stone-900/20'
            }`}
          />
        </div>
      )}

      {/* Degradado inferior para legibilidad elegante */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          isDarkMode
            ? 'from-stone-950/90 via-stone-950/25 to-transparent'
            : 'from-stone-900/75 via-stone-900/15 to-transparent'
        }`}
      />

      {/* Sutil borde superior dorado */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      {/* Etiqueta de categoría o marca */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-md border border-white/15">
        <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
        <span className="text-[9px] font-medium tracking-wider uppercase text-white/90 truncate max-w-[110px]">
          {service.category_name || clinicName}
        </span>
      </div>

      {/* Título y detalles del servicio */}
      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-0.5">
        <p className="font-serif text-xs sm:text-sm font-semibold text-white leading-tight line-clamp-1 drop-shadow-xs">
          {service.name}
        </p>
        {(service.duration_minutes || formattedPrice) && (
          <div className="flex items-center gap-2 text-[10px] text-white/75 font-sans">
            {service.duration_minutes ? <span>{service.duration_minutes} min</span> : null}
            {service.duration_minutes && formattedPrice ? <span>·</span> : null}
            {formattedPrice ? (
              <span className="text-[#D4AF37] font-semibold">{formattedPrice}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CounterDiagonalBackground
 * Muro 3D en perspectiva diagonal con tarjetas de servicios del tenant en marquee infinito.
 * Incluye fallback editorial elegante para tenants sin imágenes configuradas.
 */
export function CounterDiagonalBackground({
  services,
  clinicName,
  isDarkMode,
}: CounterDiagonalBackgroundProps) {
  // Construir pool garantizado de al menos 16 tarjetas para poblar 4 columnas sin huecos
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

    const minTotal = 16;
    const expanded: ShowcaseService[] = [];
    while (expanded.length < minTotal) {
      for (const item of basePool) {
        expanded.push(item);
        if (expanded.length >= Math.max(minTotal, basePool.length)) break;
      }
    }

    // Repartir en 4 columnas con desplazamiento distinto para variedad visual
    const cols: ShowcaseService[][] = [[], [], [], []];
    expanded.forEach((item, index) => {
      cols[index % 4].push(item);
    });

    return cols;
  }, [services, clinicName]);

  const durations = [52, 64, 56, 68];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Plano 3D inclinado en perspectiva diagonal */}
      <div
        className="absolute -inset-[35%] flex items-center justify-center"
        style={{
          transform: 'perspective(1200px) rotateX(18deg) rotateY(-8deg) rotateZ(-14deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-[135vw] max-w-[1900px]">
          {columns.map((colItems, colIdx) => {
            const isReverse = colIdx % 2 === 1;
            const duplicated = [...colItems, ...colItems];

            return (
              <div key={colIdx} className="overflow-hidden">
                <motion.div
                  className="flex flex-col gap-4 sm:gap-5 will-change-transform"
                  animate={{
                    y: isReverse ? ['-50%', '0%'] : ['0%', '-50%'],
                  }}
                  transition={{
                    duration: durations[colIdx],
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
                    />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Velo atmosférico y viñeta radial para legibilidad del teclado central */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 58% 62% at 50% 50%, rgba(12,10,9,0.90) 0%, rgba(12,10,9,0.68) 55%, rgba(12,10,9,0.45) 100%)'
            : 'radial-gradient(ellipse 58% 62% at 50% 50%, rgba(250,249,246,0.92) 0%, rgba(250,249,246,0.72) 55%, rgba(250,249,246,0.45) 100%)',
        }}
      />

      {/* Halo dorado ambiental sutil detrás del pedestal central */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[130px] ${
          isDarkMode ? 'bg-[#D4AF37]/12' : 'bg-[#D4AF37]/15'
        }`}
      />
    </div>
  );
}
