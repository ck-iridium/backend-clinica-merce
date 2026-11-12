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
  const voiceEnergyRef = useRef<number>(0.8);
  const lastBoundaryTimeRef = useRef<number>(0);

  useEffect(() => {
    // Escuchar pulsos y límites de palabras de la síntesis de voz
    const handleVoiceVibration = () => {
      voiceEnergyRef.current = 1.0;
      lastBoundaryTimeRef.current = performance.now();
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
    const numBars = 32; // Cantidad de barras verticales del ecualizador
    const freqData = new Uint8Array(32);

    const render = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 280;
      const width = (canvas.width = Math.min(containerWidth, 320));
      const height = (canvas.height = 36);
      ctx.clearRect(0, 0, width, height);

      time += 0.08;
      const centerY = height / 2;
      const maxHalfHeight = 15; // Altura máxima hacia arriba y hacia abajo

      // 1. Verificar si hay un AnalyserNode de Web Audio activo con datos reales
      const analyser = getPersistentAnalyser();
      let hasRealFFT = false;
      if (analyser) {
        try {
          analyser.getByteFrequencyData(freqData);
          hasRealFFT = freqData.some((val) => val > 5);
        } catch {}
      }

      // 2. Si es SpeechSynthesis, decaimiento orgánico y reactivación por fonemas
      const now = performance.now();
      const elapsedSinceBoundary = now - lastBoundaryTimeRef.current;
      
      // Decaimiento suave de la energía vocal si no llega nuevo pulso
      voiceEnergyRef.current = Math.max(
        0.2,
        voiceEnergyRef.current * 0.94 - (elapsedSinceBoundary > 450 ? 0.03 : 0)
      );

      // Si ha pasado poco tiempo desde que empezó una palabra, inyectar micro-oscilación de voz
      if (elapsedSinceBoundary < 800) {
        const syllableRhythm = Math.sin(time * 18) * 0.25;
        voiceEnergyRef.current = Math.min(1.0, voiceEnergyRef.current + Math.max(0, syllableRhythm));
      }

      // Espaciado del ecualizador
      const barSpacing = width / (numBars + 1);
      const barWidth = Math.max(2.5, Math.min(4, barSpacing - 2.5));

      // Configuración de sombra de neón / bloom
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 8;
      ctx.lineCap = 'round';

      for (let i = 0; i < numBars; i++) {
        // Envolvente de campana (más alto en el centro, como en la imagen de referencia rosa)
        const normalizedIndex = i / (numBars - 1); // de 0 a 1
        const centerProximity = 1 - Math.abs(normalizedIndex - 0.5) * 2; // 1 en el centro, 0 en bordes
        const bellEnvelope = Math.pow(Math.sin(normalizedIndex * Math.PI), 1.6);

        let barMagnitude = 0;

        if (hasRealFFT) {
          // Lectura directa de FFT
          const binIndex = Math.floor(centerProximity * (freqData.length - 1));
          const rawVal = (freqData[binIndex] || 0) / 255;
          barMagnitude = rawVal * bellEnvelope;
        } else {
          // Simulación acústica reactiva a fonemas y sincronizada con la locución
          // Vibración rápida (flutter) de 35Hz para emular formantes vocales
          const voiceFlutter =
            Math.sin(time * 26 + i * 0.9) * 0.35 +
            Math.cos(time * 38 - i * 0.6) * 0.25;
          const organicNoise = (Math.sin(i * 13 + time * 15) * 0.5 + 0.5) * 0.3;

          const baseEnergy = voiceEnergyRef.current;
          const liveSignal = Math.max(0.1, baseEnergy * 0.8 + voiceFlutter * baseEnergy + organicNoise);
          barMagnitude = liveSignal * bellEnvelope;
        }

        const halfHeight = Math.max(2, barMagnitude * maxHalfHeight);
        const x = barSpacing * (i + 1);

        // Paleta de degradado Neón exactamente como la captura de referencia:
        // Centro: Rosa/Magenta Neón vivo (#f43f5e, #ec4899, #d946ef)
        // Laterales: Púrpura eléctrico (#a855f7) hacia azul cian (#06b6d4, #38bdf8)
        let barColor = '#ec4899';
        if (centerProximity > 0.6) {
          barColor = '#f43f5e'; // Magenta fuerte central
        } else if (centerProximity > 0.3) {
          barColor = '#c084fc'; // Violeta eléctrico
        } else {
          barColor = '#38bdf8'; // Cian luminoso en los extremos
        }

        ctx.strokeStyle = barColor;
        ctx.lineWidth = barWidth;

        // Dibujo de barra vertical simétrica (arriba y abajo desde el centro horizontal)
        ctx.beginPath();
        ctx.moveTo(x, centerY - halfHeight);
        ctx.lineTo(x, centerY + halfHeight);
        ctx.stroke();
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
    <div className="relative z-10 w-full bg-black/95 backdrop-blur-xl border-b border-stone-800/80 px-4 py-2 flex items-center justify-between gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300 select-none">
      {/* Indicador de estado */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping absolute opacity-75" />
          <span className="w-2 h-2 rounded-full bg-pink-500 relative" />
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 size={13} className="text-pink-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-stone-200">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Ecualizador de Barras Verticales de Neón Sincronizado */}
      <div className="flex-1 h-7 flex items-center justify-center overflow-hidden mx-1 max-w-[280px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Botón Detener locución */}
      <button
        onClick={onStop}
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 text-[11px] font-medium transition-all duration-200 shrink-0 shadow-xs hover:border-pink-500/50 active:scale-95"
        title={stopLabel}
      >
        <Square size={10} fill="currentColor" className="text-pink-400" />
        <span>{stopLabel}</span>
      </button>
    </div>
  );
}
