"use client";

import React, { useRef, useState, useEffect } from 'react';
import { X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Sector, resolveSectorVideo, resolveSectorImage } from './showcaseData';

interface ShowcaseVideoModalProps {
  modalSector: { sector: Sector; index: number };
  onClose: () => void;
  onConfigureEntorno: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  accentColor: string;
  brandPrimary: string;
  isPreview?: boolean;
}

export function ShowcaseVideoModal({
  modalSector,
  onClose,
  onConfigureEntorno,
  accentColor,
  brandPrimary,
  isPreview = false,
}: ShowcaseVideoModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropPointerDownRef = useRef(false);

  // Al abrir el modal, el sonido está activado por defecto
  useEffect(() => {
    setIsMuted(false);
  }, [modalSector]);

  // Sincronizar sonido y reproducir de forma segura
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;

    if (!isMuted) {
      videoRef.current.play().catch(() => {
        // Fallback si la política de autoplay estricta del navegador bloquea el audio
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isMuted, modalSector]);

  // Autoplay seguro inicial al abrir
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [modalSector]);

  // Listener tecla Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          backdropPointerDownRef.current = true;
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && backdropPointerDownRef.current) {
          backdropPointerDownRef.current = false;
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-[82vh] max-h-[900px] aspect-[9/16] w-auto max-w-[94vw] rounded-[2.8rem] md:rounded-[3.4rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95)] border-[4px] border-stone-800 bg-stone-950 flex flex-col justify-between animate-in zoom-in-95 duration-300"
        style={{
          boxShadow: `0 30px 100px -10px ${accentColor}60, 0 15px 50px rgba(0,0,0,0.95)`
        }}
      >
        {/* Isla dinámica superior en el smartphone */}
        <div className="absolute top-3 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="w-28 h-5 bg-black/90 rounded-full border border-white/10 flex items-center justify-center gap-2 shadow-md backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-white/20" />
            <span className="w-7 h-0.5 rounded-full bg-stone-700" />
          </div>
        </div>

        {/* Vídeo / Poster de Fondo en 9:16 */}
        <video
          ref={videoRef}
          key={modalSector.sector.id}
          src={resolveSectorVideo(modalSector.sector, modalSector.index)}
          poster={resolveSectorImage(modalSector.sector, modalSector.index)}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Velo degradado sutil en la parte inferior */}
        <div className="absolute bottom-0 inset-x-0 h-[48%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

        {/* Cabecera del modal */}
        <div className="relative z-20 pt-10 px-6 flex items-center justify-between">
          <span
            style={{ backgroundColor: accentColor, color: '#1c1917' }}
            className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md"
          >
            {modalSector.sector.badge || modalSector.sector.title}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pie de detalles y botón de acción */}
        <div className="relative z-20 p-6 md:p-8 text-white space-y-3.5 pb-8">
          <div>
            <h3 className="font-serif text-xl md:text-3xl font-bold leading-tight drop-shadow-md">
              {modalSector.sector.title}
            </h3>
            <p className="text-xs md:text-sm text-stone-200 mt-2 leading-relaxed font-medium line-clamp-3">
              {modalSector.sector.copy || 'Entorno SaaS exclusivo para centros selectos con expedientes LOPD y motor de reservas sin comisiones.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfigureEntorno('pro');
            }}
            style={{ backgroundColor: brandPrimary }}
            className="w-full text-white py-4 px-5 rounded-2xl text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:opacity-95 border border-white/20 cursor-pointer"
          >
            <span>Configurar este Entorno</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Home indicator en el modal */}
          <div className="w-28 h-1 bg-white/40 rounded-full mx-auto pt-1" />
        </div>
      </div>
    </div>
  );
}
