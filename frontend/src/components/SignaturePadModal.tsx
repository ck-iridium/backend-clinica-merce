import React, { useRef, useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureB64: string, docType: string) => void;
  clientName: string;
}

export function SignaturePadModal({ isOpen, onClose, onSave, clientName }: SignaturePadModalProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [docType, setDocType] = useState('rgpd_general');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#292524'; // stone-800
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      clearCanvas();
    }
  }, [isOpen]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasSignature(false);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.closePath();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const handleSave = () => {
    if (!hasSignature || !canvasRef.current) return;
    
    // Convert to transparent PNG
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl, docType);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 border-none max-w-4xl">
        <DialogHeader className="px-8 py-6 border-b border-stone-100 bg-stone-50 rounded-t-xl">
          <DialogTitle className="text-2xl font-extrabold text-stone-800">{t('dashboard.clients.medical_consent_title')}</DialogTitle>
          <DialogDescription className="text-stone-500 font-medium text-sm">
            {t('dashboard.clients.medical_consent_desc', { name: clientName })}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pb-4">
          {/* Tipo de Documento */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#d9777f] uppercase tracking-widest mb-2">{t('dashboard.clients.select_agreement_label')}</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="w-full bg-white border-stone-200">
                <SelectValue placeholder={t('dashboard.clients.select_agreement_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rgpd_general">{t('dashboard.clients.consent_agreements.rgpd_general')}</SelectItem>
                <SelectItem value="laser_hair_removal">{t('dashboard.clients.consent_agreements.laser_hair_removal')}</SelectItem>
                <SelectItem value="botulinum_toxin">{t('dashboard.clients.consent_agreements.botulinum_toxin')}</SelectItem>
                <SelectItem value="facial_fillers">{t('dashboard.clients.consent_agreements.facial_fillers')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Texto Legal */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 h-48 overflow-y-auto mb-6 text-xs text-stone-500 text-justify leading-relaxed whitespace-pre-line">
            <p className="font-bold text-stone-700 mb-2">{t('dashboard.clients.patient_declaration_title')}</p>
            {t('dashboard.clients.consent_declaration_body', { name: clientName })}
          </div>

          {/* Canvas Wrapper */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-[#d9777f] uppercase tracking-widest">{t('dashboard.clients.signature_label')}</label>
              <button 
                onClick={clearCanvas}
                className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 hover:bg-stone-200 hover:text-stone-600 px-3 py-1 rounded-full transition-colors"
                type="button"
              >
                ↻ {t('dashboard.clients.clear_canvas')}
              </button>
            </div>
            <div className="bg-white border-2 border-stone-200 border-dashed rounded-2xl overflow-hidden touch-none relative" style={{ height: '250px' }}>
               {!hasSignature && (
                 <div className="absolute inset-0 flex items-center justify-center font-serif italic text-stone-300 pointer-events-none text-2xl select-none">
                    {t('dashboard.clients.sign_here')}
                 </div>
               )}
               <canvas
                 ref={canvasRef}
                 width={800}
                 height={250}
                 className="w-full h-full cursor-crosshair"
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseOut={stopDrawing}
                 onTouchStart={startDrawing}
                 onTouchMove={draw}
                 onTouchEnd={stopDrawing}
               />
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 left-0 w-full px-8 py-6 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 rounded-b-2xl z-20 flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 font-bold text-stone-500 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors">
              {t('common.cancel') || t('dashboard.services.cancel')}
           </button>
           <button 
             onClick={handleSave} 
             disabled={!hasSignature}
             className="px-8 py-3 font-extrabold text-white bg-[#d9777f] hover:bg-[#c6646b] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-[#d9777f]"
            >
              ✓ {t('dashboard.clients.accept_and_sign')}
           </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
