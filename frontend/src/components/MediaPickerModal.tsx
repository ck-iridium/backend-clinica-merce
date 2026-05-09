'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import CropImageModal from '@/components/CropImageModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { processVideo } from '@/lib/videoProcessor';
import { Loader2, Sparkles } from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X, Play } from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  content_type: string;
  status: 'in_use' | 'orphan';
  usages: string[];
}

interface MediaPickerModalProps {
  onClose: () => void;
  onImageSelected: (url: string) => void;
  forceAspect?: number;
  maxResolution?: number;
  mediaType?: 'image' | 'video';
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MediaPickerModal = forwardRef<HTMLDivElement, MediaPickerModalProps>(
  ({ onClose, onImageSelected, forceAspect, maxResolution, mediaType = 'image' }, ref) => {
    const { showFeedback } = useFeedback();
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');

    const [galleryFiles, setGalleryFiles] = useState<MediaFile[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryLoaded, setGalleryLoaded] = useState(false);

    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const onDragLeave = () => {
      setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        // Simular el evento para reutilizar la lógica de handleFileInput
        const pseudoEvent = {
          target: { files: files },
          stopPropagation: () => {}
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileInput(pseudoEvent);
      }
    };

    useEffect(() => {
      if (activeTab === 'gallery' && !galleryLoaded) {
        loadGallery();
      }
    }, [activeTab, galleryLoaded]);

    const loadGallery = async () => {
      setGalleryLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/all`);
        if (res.ok) {
          const allFiles = await res.json();
          // Filtrar por tipo si se especifica
          const filtered = allFiles.filter((f: MediaFile) => {
            if (mediaType === 'video') return f.content_type.startsWith('video/');
            if (mediaType === 'image') return f.content_type.startsWith('image/');
            return true;
          });
          setGalleryFiles(filtered);
          setGalleryLoaded(true);
        } else {
          showFeedback({ type: 'error', title: 'Error', message: 'No se pudo cargar la galería.' });
        }
      } catch {
        showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al cargar imágenes.' });
      } finally {
        setGalleryLoading(false);
      }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Si es video, optimizar antes de subir
      if (file.type.startsWith('video/')) {
        setIsProcessing(true);
        setProcessingProgress(0);
        try {
          const optimizedBlob = await processVideo(file, (p) => setProcessingProgress(p));
          await uploadDirectly(optimizedBlob, `video_${Date.now()}.mp4`);
        } catch (err) {
          console.error(err);
          showFeedback({ type: 'error', title: 'Error', message: 'No se pudo optimizar el vídeo.' });
        } finally {
          setIsProcessing(false);
          setProcessingProgress(0);
        }
      } else {
        // Si es imagen, pasar por crop
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setSelectedImageForCrop(reader.result?.toString() || '');
          setShowCropModal(true);
        });
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    };

    const uploadDirectly = async (fileOrBlob: File | Blob, customName?: string) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', fileOrBlob, customName || (fileOrBlob instanceof File ? fileOrBlob.name : 'upload.mp4'));
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onImageSelected(data.url);
          onClose();
        } else {
          showFeedback({ type: 'error', title: 'Error', message: 'No se pudo subir el archivo.' });
        }
      } catch {
        showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión.' });
      } finally {
        setUploading(false);
      }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
      setShowCropModal(false);
      setUploading(true);
      const formData = new FormData();
      formData.append('file', croppedBlob, 'picked_image.webp');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onImageSelected(data.url);
          onClose();
        } else {
          showFeedback({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen.' });
        }
      } catch {
        showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión.' });
      } finally {
        setUploading(false);
      }
    };

    const safeSelectImage = (e: React.MouseEvent, url: string) => {
      e.preventDefault();
      e.stopPropagation();
      onImageSelected(url);
    };

    const handleClose = (e?: React.MouseEvent | boolean) => {
      if (typeof e === 'object' && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      onClose();
    };

    const isVideo = (contentType: string) => contentType.startsWith('video/');

    return (
      <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
        <DialogPrimitive.Portal>
            {/* CAPA 1: OVERLAY HERMANO (Z-200) */}
            <DialogPrimitive.Overlay 
                className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 pointer-events-auto" 
                onClick={handleClose}
            />
            
            {/* CAPA 2: CONTENEDOR DE SCROLL HERMANO (Z-210) */}
            {/* Centrado inteligente: centrado por defecto, pero con sm:justify-start para formularios largos si fuera necesario */}
            <DialogPrimitive.Content 
                ref={ref}
                className={cn(
                    "fixed inset-0 z-[210] overflow-hidden pointer-events-none flex flex-col items-center justify-center outline-none p-4 sm:p-20",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )}
                onPointerDownOutside={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onInteractOutside={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                {/* BOTÓN CIERRE STICKY DENTRO DEL FOLIO (top-8 right-8) */}
                {/* Se mantiene visible sobre el folio blanco */}
                <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-0 overflow-hidden flex flex-col h-full max-h-[750px] pointer-events-auto border border-stone-100">
                    <button 
                        onClick={handleClose}
                        className="absolute top-6 right-6 rounded-full ring-offset-background transition-colors hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-10 h-10 flex items-center justify-center bg-white shadow-lg border border-stone-100 z-[250] pointer-events-auto"
                    >
                        <X size={20} strokeWidth={2.5} className="text-stone-800" />
                    </button>

                    <DialogHeader className="sr-only">
                        <DialogTitle>Galería de Selección de Medios</DialogTitle>
                        <DialogDescription>Selecciona o sube imágenes o vídeos para la clínica.</DialogDescription>
                    </DialogHeader>

                    {/* Header Interno */}
                    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-stone-100 bg-stone-50/80 shrink-0">
                        <div>
                            <h3 className="text-xl font-extrabold text-stone-800 tracking-tight text-left">
                              {mediaType === 'video' ? 'Galería de Vídeos' : 'Galería de Imágenes'}
                            </h3>
                            <p className="text-xs text-stone-500 font-medium mt-1 text-left">Elige o sube contenido multimedia optimizado</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-stone-100 px-6 sm:px-8 bg-white shrink-0">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('gallery'); }}
                            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-all flex-[0_0_auto] ${activeTab === 'gallery' ? 'border-[#d4af37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            {mediaType === 'video' ? 'Vídeos Disponibles' : 'Imágenes Disponibles'}
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('upload'); }}
                            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-all flex-[0_0_auto] ${activeTab === 'upload' ? 'border-[#d4af37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            Subir {mediaType === 'video' ? 'Vídeo' : 'Imagen'}
                        </button>
                    </div>

                    {/* Content area con scroll interno PROPIO */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/30 relative">
                        <div className="p-6">
                            {activeTab === 'gallery' && (
                                <div className="h-full">
                                    {galleryLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                                            <div className="w-10 h-10 border-4 border-stone-200 border-t-[#d4af37] rounded-full animate-spin" />
                                            <p className="text-stone-400 text-sm font-medium tracking-widest uppercase">Cargando...</p>
                                        </div>
                                    ) : galleryFiles.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
                                            <span className="text-5xl opacity-40">{mediaType === 'video' ? '🎥' : '🖼️'}</span>
                                            <p className="text-stone-500 font-medium">No hay {mediaType === 'video' ? 'vídeos' : 'imágenes'}.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-24">
                                            {galleryFiles.map(file => (
                                                <button
                                                    type="button"
                                                    key={file.url}
                                                    onClick={(e) => safeSelectImage(e, file.url)}
                                                    className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-100 border border-stone-200 hover:border-[#d4af37] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
                                                >
                                                    {isVideo(file.content_type) ? (
                                                      <div className="w-full h-full relative flex items-center justify-center bg-stone-900">
                                                        <video src={file.url} className="w-full h-full object-cover opacity-60" crossOrigin="anonymous" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                                                            <Play fill="white" size={16} className="text-white ml-1" />
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <img
                                                          src={file.url}
                                                          alt={file.name}
                                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                          loading="lazy"
                                                          crossOrigin="anonymous"
                                                      />
                                                    )}
                                                    
                                                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                                                      {formatBytes(file.size)}
                                                    </div>

                                                    {file.status === 'in_use' && (
                                                        <div className="absolute top-2 right-2 z-10">
                                                            <span className="flex h-3 w-3 relative">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm border border-white"></span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-all flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-[#d4af37] text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                                            Elegir
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div className="flex flex-col items-center justify-center min-h-[300px] h-full pb-24">
                                    {(uploading || isProcessing) ? (
                                        <div className="flex flex-col items-center gap-6 p-12 bg-white rounded-3xl border border-stone-100 shadow-sm w-full max-w-sm">
                                            <div className="relative flex items-center justify-center">
                                              <Loader2 size={48} className="text-[#d4af37] animate-spin" />
                                              {isProcessing && (
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-stone-800">
                                                  {processingProgress}%
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-center">
                                              <p className="text-stone-800 font-black uppercase tracking-widest text-xs mb-1">
                                                {isProcessing ? 'Optimizando Vídeo' : 'Subiendo a la Nube'}
                                              </p>
                                              <p className="text-stone-400 text-[10px] font-medium leading-relaxed">
                                                {isProcessing ? 'Eliminando audio y reduciendo tamaño...' : 'Guardando archivo en el servidor...'}
                                              </p>
                                            </div>
                                            {isProcessing && (
                                              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                  className="h-full bg-[#d4af37] transition-all duration-300"
                                                  style={{ width: `${processingProgress}%` }}
                                                />
                                              </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label 
                                            className={cn(
                                              "w-full max-w-lg cursor-pointer group transition-all duration-300",
                                              isDragging ? "scale-105" : ""
                                            )}
                                            onClick={(e) => e.stopPropagation()}
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                        >
                                            <input 
                                              type="file" 
                                              accept={mediaType === 'video' ? "video/*" : "image/*"} 
                                              className="sr-only" 
                                              onChange={handleFileInput} 
                                            />
                                            <div className={cn(
                                              "border-2 border-dashed rounded-3xl p-16 text-center transition-all bg-white shadow-sm group-hover:shadow-md",
                                              isDragging ? "border-[#d4af37] bg-[#fbf9f4]" : "border-stone-300 group-hover:border-[#d4af37] group-hover:bg-[#fbf9f4]"
                                            )}>
                                                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                                  {mediaType === 'video' ? '📹' : '🖼️'}
                                                </div>
                                                <p className="font-extrabold text-stone-800 text-xl mb-2">Subir {mediaType === 'video' ? 'Vídeo' : 'Foto'}</p>
                                                <p className="text-sm text-stone-500 italic">
                                                  {mediaType === 'video' ? 'Formatos sugeridos: .mp4, .webm' : 'Formatos sugeridos: .webp, .jpg'}
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

        {/* Modal de Crop anidado (Radix Dialog) */}
        {showCropModal && (
          <CropImageModal
            imageSrc={selectedImageForCrop}
            onClose={() => { setShowCropModal(false); setSelectedImageForCrop(''); }}
            onCropComplete={handleCropComplete}
            forceAspect={forceAspect}
            maxResolution={maxResolution}
          />
        )}
      </Dialog>
    );
  }
);

MediaPickerModal.displayName = 'MediaPickerModal';

export default MediaPickerModal;
