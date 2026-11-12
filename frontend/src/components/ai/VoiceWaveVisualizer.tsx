'use client';

import React, { useEffect, useRef } from 'react';
import { Square, Volume2 } from 'lucide-react';

interface VoiceWaveVisualizerProps {
  isSpeaking: boolean;
  onStop: () => void;
  language?: string;
}

export default function VoiceWaveVisualizer({
  isSpeaking,
  onStop,
  language = 'es',
}: VoiceWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpeaking) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const render = () => {
      // Dynamic width adaptation
      const width = canvas.width = canvas.parentElement?.clientWidth || 240;
      const height = canvas.height = 36;
      ctx.clearRect(0, 0, width, height);

      step += 0.055;
      const centerY = height / 2;

      // Configuration of the 3 glowing waves (Aurora / Siri / Quiet Luxury aesthetic)
      const waves = [
        // Wave 1: Electric Blue / Cyan
        {
          frequency: 0.022,
          amplitude: 8 + Math.sin(step * 0.8) * 3,
          speed: step * 1.2,
          stroke: 'rgba(56, 189, 248, 0.75)',
          fill: 'rgba(56, 189, 248, 0.12)',
          lineWidth: 2,
        },
        // Wave 2: Neon Magenta / Violet
        {
          frequency: 0.028,
          amplitude: 10 + Math.cos(step * 0.9) * 4,
          speed: -step * 1.0,
          stroke: 'rgba(217, 70, 239, 0.8)',
          fill: 'rgba(217, 70, 239, 0.14)',
          lineWidth: 2.2,
        },
        // Wave 3: Champagne Gold
        {
          frequency: 0.018,
          amplitude: 7 + Math.sin(step * 1.1) * 3,
          speed: step * 0.9,
          stroke: 'rgba(212, 175, 55, 0.95)',
          fill: 'rgba(212, 175, 55, 0.18)',
          lineWidth: 2.5,
        },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = wave.stroke;

        // Attenuate waves near the ends for smooth fading (envelope filter)
        for (let x = 0; x <= width; x += 2) {
          const envelope = Math.sin((x / width) * Math.PI); // 0 at edges, 1 at center
          const y = centerY + Math.sin(x * wave.frequency + wave.speed) * wave.amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isSpeaking]);

  if (!isSpeaking) return null;

  const statusLabel =
    language === 'fr'
      ? 'Co-Pilote vocalise...'
      : language === 'en'
        ? 'Co-Pilot speaking...'
        : 'Co-Piloto hablando...';

  const stopLabel =
    language === 'fr'
      ? 'Arrêter'
      : language === 'en'
        ? 'Stop'
        : 'Detener';

  return (
    <div className="relative z-10 w-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-[#d4af37]/35 px-4 py-2 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.25)] animate-in fade-in slide-in-from-top-2 duration-300 select-none">
      {/* Indicador de estado */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping absolute opacity-75" />
          <span className="w-2 h-2 rounded-full bg-[#d4af37] relative" />
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 size={13} className="text-[#d4af37] animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-stone-200">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Canvas de Ondas Fluidas (Voice Waves) */}
      <div className="flex-1 h-7 flex items-center justify-center overflow-hidden mx-1 max-w-[260px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Botón Detener locución */}
      <button
        onClick={onStop}
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/90 hover:bg-stone-700/90 text-stone-300 hover:text-white border border-stone-700/80 text-[11px] font-medium transition-all duration-200 shrink-0 shadow-xs hover:border-[#d4af37]/40 active:scale-95"
        title={stopLabel}
      >
        <Square size={10} fill="currentColor" className="text-[#d4af37]" />
        <span>{stopLabel}</span>
      </button>
    </div>
  );
}

