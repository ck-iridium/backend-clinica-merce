"use client"
import React, { useState, useRef } from 'react';
import { Camera, Trash2, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { processVideo } from '@/lib/videoProcessor';
import VideoAudioPromptModal from '@/components/VideoAudioPromptModal';

export default function ImageUploadBlock({ 
  label, 
  value, 
  onSelect, 
  onClear, 
  onUpload, 
  accepts = 'both',
  onGenerateAI,
  tenantId,
  token
}: { 
  label: string, 
  value: string | null | undefined, 
  onSelect: () => void, 
  onClear: () => void, 
  onUpload: (url: string) => void,
  accepts?: 'image' | 'video' | 'both',
  onGenerateAI?: () => void,
  tenantId?: string,
  token?: string
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [showVideoAudioPrompt, setShowVideoAudioPrompt] = useState(false);
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

  const uploadFileToServer = async (fileToUpload: File | Blob, originalFileName: string, isVideo: boolean) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const safeName = isVideo 
        ? originalFileName.replace(/\.[^/.]+$/, "") + ".mp4" 
        : originalFileName;
      formData.append('file', fileToUpload, safeName);

      const headers: Record<string, string> = {};
      if (tenantId) headers['X-Tenant-ID'] = tenantId;
      if (token) headers['Authorization'] = `Bearer ${token}`;

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
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsUploading(false);
      setProcessingProgress(0);
    }
  };

  const handleConfirmVideoAudio = async (keepAudio: boolean) => {
    if (!pendingVideoFile) return;
    const file = pendingVideoFile;
    setShowVideoAudioPrompt(false);
    setPendingVideoFile(null);

    setIsUploading(true);
    setProcessingProgress(0);
    toast.info("Optimizando vídeo para pantalla móvil...");

    try {
      const optimized = await processVideo(file, (p) => setProcessingProgress(p), {
        keepAudio,
        maxDimension: 540
      });
      await uploadFileToServer(optimized, file.name, true);
    } catch (err) {
      console.error("Error procesando video", err);
      toast.error("Error al procesar el vídeo, se subirá el original.");
      await uploadFileToServer(file, file.name, true);
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

    if (isVideo) {
      setPendingVideoFile(file);
      setShowVideoAudioPrompt(true);
      return;
    }

    await uploadFileToServer(file, file.name, false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</label>
        {onGenerateAI && accepts !== 'video' && (
          <button
            type="button"
            onClick={onGenerateAI}
            className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-2.5 py-1 rounded-xl transition-all shadow-2xs active:scale-95"
            title="Generar fotografía de alta resolución con IA"
          >
            <Sparkles size={12} className="text-[#FF6B00]" />
            <span>Generar con IA</span>
          </button>
        )}
      </div>
      <div 
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group w-full aspect-video rounded-2xl overflow-hidden bg-stone-50 border transition-all duration-300 ${isDragging ? 'border-[#FF6B00] ring-4 ring-[#FF6B00]/10 bg-[#FF6B00]/5 scale-[0.98] shadow-inner' : 'border-stone-200 shadow-sm hover:border-stone-300'}`}
      >
        {/* Overlay invisible para capturar eventos sin interferencias de hijos */}
        {isDragging && (
          <div className="absolute inset-0 z-[60] bg-transparent" />
        )}

        {isUploading && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-50">
             <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                <Loader2 size={32} className="text-[#FF6B00] animate-spin absolute" />
                {processingProgress > 0 && (
                  <span className="text-[10px] font-bold text-[#FF6B00]">{processingProgress}%</span>
                )}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">
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
             <div className="w-16 h-16 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-2xl mb-4">
                <Sparkles size={32} className="text-white animate-bounce" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00]">¡Suelta para subir!</span>
          </div>
        )}

        <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5 flex-wrap px-4 ${isDragging ? 'hidden' : ''}`}>
          <button
            type="button"
            onClick={onSelect}
            className="bg-white text-stone-900 px-3.5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Camera size={14} />
            <span>{value ? 'Cambiar' : 'Galería'}</span>
          </button>
          {onGenerateAI && accepts !== 'video' && (
            <button
              type="button"
              onClick={onGenerateAI}
              className="bg-[#FF6B00] hover:bg-[#EA5E00] text-white px-3.5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-1.5"
              title="Estudio Fotográfico IA"
            >
              <Sparkles size={14} />
              <span>Estudio IA</span>
            </button>
          )}
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="w-9 h-9 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-rose-600 hover:scale-105 transition-all"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {showVideoAudioPrompt && pendingVideoFile && (
        <VideoAudioPromptModal
          isOpen={showVideoAudioPrompt}
          fileName={pendingVideoFile.name}
          fileSize={pendingVideoFile.size}
          onSelectOption={handleConfirmVideoAudio}
          onCancel={() => {
            setShowVideoAudioPrompt(false);
            setPendingVideoFile(null);
          }}
        />
      )}
    </div>
  );
}
