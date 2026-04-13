import React, { useRef, useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureB64: string, docType: string) => void;
  clientName: string;
}

export function SignaturePadModal({ isOpen, onClose, onSave, clientName }: SignaturePadModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800">Consentimiento Médico (RGPD)</h2>
            <p className="text-stone-500 font-medium text-sm">Validación legal y protección de datos</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-bold">
            ✕
          </button>
        </div>

        <div className="p-8 pb-4 flex-1 overflow-y-auto">
          {/* Tipo de Documento */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#d9777f] uppercase tracking-widest mb-2">Seleccione el Acuerdo:</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="w-full bg-white border-stone-200">
                <SelectValue placeholder="Seleccione un acuerdo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rgpd_general">Tratamiento de Datos Personales (Ley General RGPD)</SelectItem>
                <SelectItem value="laser_hair_removal">Consentimiento Informado: Depilación Láser</SelectItem>
                <SelectItem value="botulinum_toxin">Consentimiento Informado: Toxina Botulínica</SelectItem>
                <SelectItem value="facial_fillers">Consentimiento Informado: Rellenos Faciales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Texto Legal Frozen (Demo) */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 h-48 overflow-y-auto mb-6 text-xs text-stone-500 text-justify leading-relaxed">
            <p className="font-bold text-stone-700 mb-2">DECLARACIÓN DEL PACIENTE:</p>
            <p className="mb-2">Don/Doña <strong>{clientName}</strong> manifiesto que he sido debidamente informado/a y he comprendido la naturaleza y propósito del tratamiento seleccionado, así como las posibles complicaciones, riesgos generales e infrecuentes asociados al mismo.</p>
            <p className="mb-2">Adicionalmente, presto mi consentimiento EXPRESO, de acuerdo a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) y el Reglamento (UE) 2016/679 (RGPD), para el uso, tratamiento y archivo de mis datos personales, historial clínico y fotografías con fines de diagnóstico y evolución médica, a favor de <strong>Clínica Mercè</strong>.</p>
            <p>Con la firma del presente documento, asumo que he tenido la oportunidad de aclarar dudas y realizo la aceptación del tratamiento propuesto de forma libre y voluntaria.</p>
          </div>

          {/* Canvas Wrapper */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-[#d9777f] uppercase tracking-widest">Firma del Cliente:</label>
              <button 
                onClick={clearCanvas}
                className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 hover:bg-stone-200 hover:text-stone-600 px-3 py-1 rounded-full transition-colors"
                type="button"
              >
                ↻ Limpiar Lienzo
              </button>
            </div>
            <div className="bg-white border-2 border-stone-200 border-dashed rounded-2xl overflow-hidden touch-none relative" style={{ height: '250px' }}>
               {!hasSignature && (
                 <div className="absolute inset-0 flex items-center justify-center font-serif italic text-stone-300 pointer-events-none text-2xl select-none">
                    Firmar aquí...
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

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 font-bold text-stone-500 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors">
              Cancelar
           </button>
           <button 
             onClick={handleSave} 
             disabled={!hasSignature}
             className="px-8 py-3 font-extrabold text-white bg-[#d9777f] hover:bg-[#c6646b] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:bg-[#d9777f]"
            >
              ✓ Aceptar y Firmar Documento
           </button>
        </div>
      </div>
    </div>
  );
}
