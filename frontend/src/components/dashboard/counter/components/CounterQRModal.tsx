"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CounterQRModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  qrToken: string;
  qrUrl: string;
  qrSecondsLeft: number;
  isFetchingToken: boolean;
}

export function CounterQRModal({
  isOpen,
  onClose,
  qrToken,
  qrUrl,
  qrSecondsLeft,
  isFetchingToken,
}: CounterQRModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-[2rem] p-6 sm:p-7 bg-white border-stone-100 shadow-2xl text-center">
        <DialogHeader className="items-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-[11px] font-bold shadow-2xs">
            <Clock size={12} />
            <span>Código Dinámico Anti-Fraude</span>
          </div>
          <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-stone-900 pt-1">
            Fichar con tu Móvil
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 max-w-[260px] mx-auto mt-1 leading-relaxed">
            Abre la cámara de tu teléfono móvil y enfoca este código QR para registrar tu turno.
          </DialogDescription>
        </DialogHeader>

        {/* Contenedor del Código QR */}
        <div className="my-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/70 shadow-2xs flex flex-col items-center justify-center mx-auto w-fit">
          {qrToken ? (
            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200/60">
              <QRCodeSVG
                value={qrUrl}
                size={175}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="w-[175px] h-[175px] flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
            </div>
          )}

          {/* Barra de progreso de rotación de 20s */}
          <div className="w-full mt-3.5 space-y-1.5 px-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
              <span className="flex items-center gap-1">
                <RefreshCw size={11} className={`text-[#FF6B00] ${isFetchingToken ? 'animate-spin' : ''}`} />
                Se renueva en:
              </span>
              <span className="font-mono text-[#FF6B00] font-black">{qrSecondsLeft}s</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-[#FF6B00] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(qrSecondsLeft / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2.5 text-left">
          <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Vinculación de terminal</strong>: Ficha exclusivamente desde tu teléfono vinculado para garantizar presencia física en el centro.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
