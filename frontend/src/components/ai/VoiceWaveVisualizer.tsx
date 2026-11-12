'use client';

import React, { useEffect, useRef } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { getPersistentAnalyser } from './useCopilotSpeech';

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
  const currentAmpRef = useRef<number>(14);
  const surgeRef = useRef<number>(1.0);

  useEffect(() => {
    // Al recibir un fonema o palabra de voz, provocar un pico de energía instantáneo
    const handleVoiceVibration = () => {
      surgeRef.current = 1.35;
    };

    window.addEventListener('copilot-voice-vibration', handleVoiceVibration);

    return () => {
      window.removeEventListener('copilot-voice-vibration', handleVoiceVibration);
    };
  }, []);

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

    let time = 0;
    const numLines = 11; // 11 líneas topográficas que forman la cinta holográfica 3D
    const freqData = new Uint8Array(32);

    const render = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 280;
      const width = (canvas.width = Math.min(containerWidth, 340));
      const height = (canvas.height = 54); // Altura cómoda para crestas 3D pronunciadas
      ctx.clearRect(0, 0, width, height);

      time += 0.065; // Velocidad de avance equilibrada: más suave y armónica
      const centerY = height / 2;
      const baseMaxAmp = 20; // Amplitud máxima generosa (hasta 40px de cresta a valle)

      // Decaimiento progresivo del pico de voz
      surgeRef.current = Math.max(0.72, surgeRef.current * 0.975);

      // Comprobar si hay FFT de Web Audio activo
      const analyser = getPersistentAnalyser();
      let realVolume = 0;
      if (analyser) {
        try {
          analyser.getByteFrequencyData(freqData);
          const sum = freqData.reduce((acc, v) => acc + v, 0);
          realVolume = sum / (freqData.length * 255);
        } catch {}
      }

      // Modulación vocal fluida con ondulación suave y controlada
      const speechCadence =
        (Math.sin(time * 3.0) * 0.28 + 0.72) *
        (1 + 0.20 * Math.cos(time * 5.2));
      
      const targetAmp = realVolume > 0.04
        ? Math.min(baseMaxAmp * 1.25, realVolume * 3.2 * baseMaxAmp)
        : baseMaxAmp * speechCadence * surgeRef.current;

      // Interpolación suave LERP de la amplitud
      currentAmpRef.current += (targetAmp - currentAmpRef.current) * 0.08;
      const activeAmp = Math.max(4.5, currentAmpRef.current);

      // ── 1. RESPLANDOR VOLUMÉTRICO AMBIENTAL DE FONDO ──
      ctx.save();
      const glowGrad = ctx.createRadialGradient(width / 2, centerY, 5, width / 2, centerY, width / 2);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.26)');
      glowGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.16)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // ── 2. CINTA HOLOGRÁFICA 3D CON MÚLTIPLES PICOS SUAVES ──
      // Dibujamos las 11 líneas distribuidas verticalmente
      for (let k = 0; k < numLines; k++) {
        // s va de -1 (arriba) a +1 (abajo)
        const s = (k - (numLines - 1) / 2) / ((numLines - 1) / 2);
        const absS = Math.abs(s);

        // Paleta idéntica a la imagen de referencia:
        // Arriba: Azul eléctrico / Cian
        // Centro: Rosa/Magenta Neón vivo con núcleo blanco
        // Abajo: Violeta / Púrpura eléctrico
        let strokeColor = '#ff2a8d';
        let glowColor = '#ff2a8d';

        if (s < -0.2) {
          // Superior: Cian a azul cielo eléctrico
          strokeColor = `rgba(56, 189, 248, ${0.9 - absS * 0.3})`;
          glowColor = '#38bdf8';
        } else if (s > 0.2) {
          // Inferior: Púrpura violeta eléctrico
          strokeColor = `rgba(168, 85, 247, ${0.9 - absS * 0.3})`;
          glowColor = '#a855f7';
        } else {
          // Núcleo central: Magenta intenso / blanco rosado
          strokeColor = k === 5 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 42, 141, 0.9)';
          glowColor = '#ff2a8d';
        }

        ctx.save();
        ctx.beginPath();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = k === 5 ? 14 : 7;
        ctx.lineWidth = k === 5 ? 2.2 : 1.35;
        ctx.strokeStyle = strokeColor;

        for (let x = 0; x <= width; x += 2) {
          const u = x / width; // de 0 a 1
          // Envolvente suave que amarra los extremos a la línea central
          const envelope = Math.pow(Math.sin(u * Math.PI), 1.15);

          // Armónicos de la onda: 4 a 6 picos definidos pero con avance suave y cadencioso
          const primaryWave = Math.sin(u * 13.5 - time * 3.8);
          const secondaryWave = Math.cos(u * 21.0 + time * 3.2) * 0.42;
          const detailWave = Math.sin(u * 29.0 - time * 4.4) * 0.18;

          const baseWaveY = (primaryWave + secondaryWave + detailWave) * activeAmp;

          // DISPERSIÓN TOPOGRÁFICA 3D:
          // En las crestas altas, las líneas se separan ampliamente creando la cinta tridimensional;
          // en las partes llanas, se comprimen formando un haz láser compacto.
          const dispersion = (Math.abs(baseWaveY) * 0.50 + 1.2) * s;
          const y = centerY + (baseWaveY + dispersion) * envelope;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
      }

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
    <div className="relative z-10 w-full bg-stone-950/95 backdrop-blur-xl border-b border-stone-800/80 px-4 py-2 flex items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-top-2 duration-300 select-none">
      {/* Indicador de estado */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping absolute opacity-75" />
          <span className="w-2 h-2 rounded-full bg-pink-500 relative" />
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 size={14} className="text-pink-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wide text-stone-200">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Visualizador de Cinta Holográfica 3D (Efecto WOW idéntico a la referencia) */}
      <div className="flex-1 h-14 flex items-center justify-center overflow-hidden mx-1 max-w-[340px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Botón Detener locución */}
      <button
        onClick={onStop}
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 text-[11px] font-medium transition-all duration-200 shrink-0 shadow-xs hover:border-pink-500/50 active:scale-95"
        title={stopLabel}
      >
        <Square size={10} fill="currentColor" className="text-pink-400" />
        <span>{stopLabel}</span>
      </button>
    </div>
  );
}
