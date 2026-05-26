import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X, Loader2, CheckCircle2 } from "lucide-react";

interface CropImageModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  forceAspect?: number;
  maxResolution?: number; // Nueva prop opcional
}

export default function CropImageModal({ imageSrc, onClose, onCropComplete, forceAspect, maxResolution }: CropImageModalProps) {
  const { showFeedback } = useFeedback();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number>(forceAspect || 4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const processImage = async (useCrop: boolean) => {
    if (useCrop && !croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Definir dimensiones de origen y destino
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = image.width;
      let sourceHeight = image.height;

      if (useCrop && croppedAreaPixels) {
        sourceX = croppedAreaPixels.x;
        sourceY = croppedAreaPixels.y;
        sourceWidth = croppedAreaPixels.width;
        sourceHeight = croppedAreaPixels.height;
      }

      let targetWidth = sourceWidth;
      let targetHeight = sourceHeight;

      // Aplicar reducción si se especifica una resolución máxima
      if (maxResolution && (targetWidth > maxResolution || targetHeight > maxResolution)) {
        const scale = maxResolution / Math.max(targetWidth, targetHeight);
        targetWidth *= scale;
        targetHeight *= scale;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        } else {
          showFeedback({ type: 'error', title: 'Error Técnico', message: 'No se pudo procesar la imagen.' });
          setIsProcessing(false);
        }
      }, 'image/webp', 0.9);
    } catch (e) {
      console.error(e);
      showFeedback({ type: 'error', title: 'Error', message: 'Fallo al procesar la imagen.' });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[800] bg-stone-900/90 backdrop-blur-sm animate-in fade-in duration-300"
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-[810] overflow-hidden flex items-center justify-center outline-none p-4",
            "animate-in zoom-in-95 duration-300"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="relative bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px] shadow-2xl border border-stone-200 pointer-events-auto">

            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
              <h3 className="font-serif font-bold text-xl text-stone-800">Editor de Imagen</h3>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors">
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            <DialogHeader className="sr-only">
              <DialogTitle>Editor de Recorte</DialogTitle>
              <DialogDescription>Ajusta tu imagen antes de subirla.</DialogDescription>
            </DialogHeader>

            <div className="flex-1 relative bg-stone-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 bg-white border-t border-stone-100 shrink-0">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8">
                <div className={cn("w-full", !forceAspect && "sm:flex-1")}>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 block px-1">Nivel de Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-900"
                  />
                </div>

                {!forceAspect && (
                  <div className="shrink-0">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 block px-1">Proporción</label>
                    <div className="flex gap-2 bg-stone-50 border border-stone-100 p-1.5 rounded-2xl">
                      {[
                        { label: '1:1', val: 1 },
                        { label: '3:4', val: 3 / 4 },
                        { label: '4:3', val: 4 / 3 },
                        { label: '9:16', val: 9 / 16 },
                        { label: '16:9', val: 16 / 9 }
                      ].map(ratio => (
                        <button
                          key={ratio.label}
                          onClick={() => setAspectRatio(ratio.val)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${Math.abs(aspectRatio - ratio.val) < 0.01 ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
                        >{ratio.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-2xl font-bold text-stone-400 hover:text-stone-800 transition-all text-sm order-3 sm:order-1"
                >Cancelar</button>

                <button
                  onClick={() => processImage(false)}
                  disabled={isProcessing}
                  className="px-6 py-3.5 rounded-2xl font-bold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-all text-sm active:scale-95 order-2"
                >
                  Omitir Recorte
                </button>

                <button
                  onClick={() => processImage(true)}
                  disabled={isProcessing}
                  className="bg-stone-900 hover:bg-primary text-white min-w-[160px] px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-stone-200 disabled:opacity-50 flex justify-center items-center gap-2 group order-1 sm:order-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />}
                  {isProcessing ? 'Procesando...' : 'Aplicar Recorte'}
                </button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
