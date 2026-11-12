'use client';

import React, { useEffect, useRef } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { getPersistentAnalyser } from './useCopilotSpeech';

interface VoiceWaveVisualizerProps {
  isSpeaking: boolean;
  onStop: () => void;
  language?: string;
}

interface WaveParticle {
  x: number;
  yOffset: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
}

export default function VoiceWaveVisualizer({
  isSpeaking,
  onStop,
  language = 'es',
}: VoiceWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const surgeRef = useRef<number>(1.0);

  useEffect(() => {
    // Al recibir un fonema o palabra, provocar un pico de energía instantáneo
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
    const freqData = new Uint8Array(32);

    // Partículas luminosas que flotan y cabalgan sobre la onda (como en la referencia)
    const particles: WaveParticle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * 320,
      yOffset: (Math.random() - 0.5) * 12,
      size: Math.random() * 2.2 + 0.8,
      color: Math.random() > 0.4 ? '#ff2a8d' : '#c084fc',
      speed: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 280;
      const width = (canvas.width = Math.min(containerWidth, 340));
      const height = (canvas.height = 52); // Altura generosa de 52px para onda muy pronunciada
      ctx.clearRect(0, 0, width, height);

      time += 0.085; // Velocidad fluida de avance de fase
      const centerY = height / 2;
      const maxAmp = 22; // Hasta 44px de oscilación total (cresta a valle)

      // Decaimiento natural del pico de voz
      surgeRef.current = Math.max(0.65, surgeRef.current * 0.965);

      // Comprobar FFT real si existe
      const analyser = getPersistentAnalyser();
      let realVolume = 0;
      if (analyser) {
        try {
          analyser.getByteFrequencyData(freqData);
          const sum = freqData.reduce((acc, v) => acc + v, 0);
          realVolume = sum / (freqData.length * 255);
        } catch {}
      }

      // Modulación de cadencia vocal humana pronunciada
      const speechCadence =
        (Math.sin(time * 3.8) * 0.35 + 0.65) *
        (1 + 0.28 * Math.cos(time * 8.2));
      const jitter = (Math.random() - 0.5) * 0.15;
      const activeFactor = realVolume > 0.05
        ? Math.min(1.4, realVolume * 2.8)
        : Math.min(1.4, (speechCadence + jitter) * surgeRef.current);

      // ── CAPA 1: ONDA DE AURORA VIOLETA CON RELLENO SUAVE (Fondo) ──
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x <= width; x += 3) {
        const u = x / width;
        // Envolvente acampanada con centro amplio
        const envelope = Math.pow(Math.sin(u * Math.PI), 1.15);
        const y =
          centerY +
          Math.sin(u * 8 + time * 4.5) * maxAmp * 0.85 * envelope * activeFactor +
          Math.cos(u * 14 - time * 3.2) * 4 * envelope;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, centerY);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, centerY - maxAmp, 0, centerY + maxAmp);
      fillGrad.addColorStop(0, 'rgba(192, 132, 252, 0.25)');
      fillGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.12)');
      fillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.22)');
      ctx.fillStyle = fillGrad;
      ctx.fill();
      ctx.restore();

      // ── CAPA 2: ONDA SECUNDARIA VIOLETA / CIAN ELÉCTRICO ──
      ctx.save();
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#c084fc';
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const u = x / width;
        const envelope = Math.pow(Math.sin(u * Math.PI), 1.2);
        const y =
          centerY +
          Math.sin(u * 10 - time * 5.2) * maxAmp * 0.75 * envelope * activeFactor +
          Math.sin(u * 16 + time * 6.5) * 3 * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ── CAPA 3: ONDA PRINCIPAL DE NEÓN ROSA / MAGENTA VIBRANTE (Crestas Pronunciadas) ──
      ctx.save();
      ctx.shadowColor = '#ff1f85';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3.2;

      // Gradiente lineal a lo largo de la onda: Cian -> Hot Magenta -> Púrpura
      const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
      strokeGrad.addColorStop(0, '#38bdf8');
      strokeGrad.addColorStop(0.2, '#ec4899');
      strokeGrad.addColorStop(0.5, '#ff1f85');
      strokeGrad.addColorStop(0.8, '#ec4899');
      strokeGrad.addColorStop(1, '#a855f7');
      ctx.strokeStyle = strokeGrad;

      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const u = x / width;
        const envelope = Math.pow(Math.sin(u * Math.PI), 1.1);
        // Resonancia de onda pronunciada: picos altos y dinámicos
        const primarySine = Math.sin(u * 7.5 + time * 6.8);
        const harmonicSine = Math.cos(u * 13 - time * 4.2) * 0.35;
        const phonemeJitter = Math.sin(time * 22 + u * 15) * 0.15;
        const y =
          centerY +
          (primarySine + harmonicSine + phonemeJitter) * maxAmp * envelope * activeFactor;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ── CAPA 4: NÚCLEO BLANCO CENTRAL DE ALTA LUMINISCENCIA ──
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        const u = x / width;
        const envelope = Math.pow(Math.sin(u * Math.PI), 1.25);
        const primarySine = Math.sin(u * 7.5 + time * 6.8);
        const y = centerY + primarySine * maxAmp * envelope * activeFactor;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ── CAPA 5: PARTÍCULAS LUMINOSAS CABALGANDO LA ONDA (Como en la foto de referencia) ──
      ctx.save();
      particles.forEach((p) => {
        p.x = (p.x + p.speed) % width;
        const u = p.x / width;
        const envelope = Math.pow(Math.sin(u * Math.PI), 1.1);
        const waveY =
          centerY +
          Math.sin(u * 7.5 + time * 6.8) * maxAmp * envelope * activeFactor;
        const py = waveY + p.yOffset * envelope;

        ctx.beginPath();
        ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.opacity * (0.4 + 0.6 * envelope);
        ctx.fill();
      });
      ctx.restore();

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

      {/* Visualizador de Onda Neón Fluida con Movimiento Muy Pronunciado y Partículas */}
      <div className="flex-1 h-13 flex items-center justify-center overflow-hidden mx-1 max-w-[340px]">
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
