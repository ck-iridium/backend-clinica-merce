"use client"
import React, { useState, useRef } from 'react';
import { Camera, Trash2, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { processVideo } from '@/lib/videoProcessor';

export default function ImageUploadBlock({ 
  label, 
  value, 
  onSelect, 
  onClear, 
  onUpload, 
  accepts = 'both',
  tenantId,
  token
}: { 
  label: string, 
  value: string | null, 
  onSelect: () => void, 
  onClear: () => void, 
  onUpload: (url: string) => void,
  accepts?: 'image' | 'video' | 'both',
  tenantId?: string,
  token?: string
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const dragCounter = useRef(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv|3gp|quicktime)$/i.test(name);

    if (accepts === 'image' && !isImage) {
      toast.error("El archivo debe ser una imagen (webp, png, jpg, svg, gif)");
      return;
    }

    if (accepts === 'video' && !isVideo) {
      toast.error("El archivo debe ser un vídeo (mp4, webm, mov, avi)");
      return;
    }

    if (accepts === 'both' && !isImage && !isVideo) {
      toast.error("El archivo debe ser una imagen o un vídeo");
      return;
    }

    setIsUploading(true);
    setProcessingProgress(0);

    try {
      let fileToUpload: File | Blob = file;

      if (isVideo) {
        toast.info("Optimizando vídeo para la web...");
        try {
          fileToUpload = await processVideo(file, (progress) => {
            setProcessingProgress(progress);
          });
        } catch (err) {
          console.error("Error procesando video", err);
          toast.error("Error al procesar el vídeo, se subirá el original.");
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, isVideo ? `video_${Date.now()}.mp4` : file.name);

      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        onUpload(data.url);
        toast.success("Archivo subido correctamente");
      } else {
        toast.error("Error al subir el archivo");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsUploading(false);
      setProcessingProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</label>
      <div 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group w-full aspect-video rounded-2xl overflow-hidden bg-stone-50 border transition-all duration-300 ${isDragging ? 'border-[#d4af37] ring-4 ring-[#d4af37]/10 bg-[#d4af37]/5 scale-[0.98] shadow-inner' : 'border-stone-200 shadow-sm hover:border-stone-300'}`}
      >
        {/* Overlay invisible para capturar eventos sin interferencias de hijos */}
        {isDragging && (
          <div className="absolute inset-0 z-[60] bg-transparent" />
        )}

        {isUploading && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-50">
             <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                <Loader2 size={32} className="text-[#d4af37] animate-spin absolute" />
                {processingProgress > 0 && (
                  <span className="text-[10px] font-bold text-[#d4af37]">{processingProgress}%</span>
                )}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
                {processingProgress > 0 ? 'Optimizando...' : 'Subiendo...'}
             </span>
          </div>
        )}

        <div className={`w-full h-full transition-all duration-500 ${isDragging ? 'blur-sm scale-110 grayscale opacity-30' : ''}`}>
          {value ? (
            value.toLowerCase().endsWith('.mp4') || value.toLowerCase().endsWith('.webm') ? (
              <video src={value && value.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${value}` : value || ""} className="w-full h-full object-cover" autoPlay muted loop />
            ) : (
              <img src={value && value.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${value}` : value || ""} alt="Preview" className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-200">
               <ImageIcon size={40} strokeWidth={1} />
               <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">Sin medios</span>
               <span className="text-[9px] font-medium text-stone-400 mt-1 italic">o arrastra un archivo aquí</span>
            </div>
          )}
        </div>

        {/* Capa de Drop Visual */}
        {isDragging && (
          <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center shadow-2xl mb-4">
                <Sparkles size={32} className="text-white animate-bounce" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">¡Suelta para subir!</span>
          </div>
        )}

        <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 ${isDragging ? 'hidden' : ''}`}>
          <button
            type="button"
            onClick={onSelect}
            className="bg-white text-stone-900 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Camera size={14} />
            <span>{value ? 'Cambiar' : 'Seleccionar'}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-rose-600 hover:scale-105 transition-all"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
