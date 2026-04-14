'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import CropImageModal from '@/components/CropImageModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from "lucide-react";

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
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MediaPickerModal = forwardRef<HTMLDivElement, MediaPickerModalProps>(
  ({ onClose, onImageSelected }, ref) => {
    const { showFeedback } = useFeedback();
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');

    const [galleryFiles, setGalleryFiles] = useState<MediaFile[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryLoaded, setGalleryLoaded] = useState(false);

    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
    const [uploading, setUploading] = useState(false);

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
          setGalleryFiles(await res.json());
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

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (!e.target.files || e.target.files.length === 0) return;
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageForCrop(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = '';
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

    return (
      <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay 
                className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 pointer-events-auto" 
                onClick={handleClose}
            />
            
            <DialogPrimitive.Content 
                ref={ref}
                className={cn(
                    "fixed inset-0 z-[210] overflow-y-auto pointer-events-auto custom-scrollbar flex flex-col items-center justify-start outline-none",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )}
                onPointerDownOutside={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onInteractOutside={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <button 
                    onClick={handleClose}
                    className="fixed top-4 right-4 sm:top-6 sm:right-6 rounded-full ring-offset-background transition-colors hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-10 h-10 flex items-center justify-center bg-white shadow-lg border border-stone-100 z-[250]"
                >
                    <X size={20} strokeWidth={2.5} className="text-stone-800" />
                </button>

                {/* EL FOLIO BLANCO (Altura máxima y border-radius unificado a 2rem) */}
                <div className="relative mx-auto my-4 w-[calc(100%-24px)] sm:w-full sm:max-w-4xl bg-white rounded-[2rem] shadow-2xl p-0 overflow-hidden flex flex-col min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Galería de Selección de Imágenes</DialogTitle>
                        <DialogDescription>Selecciona o sube imágenes para la clínica.</DialogDescription>
                    </DialogHeader>

                    {/* Header Interno */}
                    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-stone-100 bg-stone-50/80 shrink-0">
                        <div>
                            <h3 className="text-xl font-extrabold text-stone-800 tracking-tight">Galería de Medios</h3>
                            <p className="text-xs text-stone-500 font-medium mt-1">Elige o sube contenido gráfico</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-stone-100 px-6 sm:px-8 bg-white shrink-0">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('gallery'); }}
                            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-all flex-[0_0_auto] ${activeTab === 'gallery' ? 'border-[#d4af37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            Imágenes Disponibles
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('upload'); }}
                            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-all flex-[0_0_auto] ${activeTab === 'upload' ? 'border-[#d4af37] text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            Subir Nueva
                        </button>
                    </div>

                    {/* Content area con scroll interno */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-50/30 relative">
                        {activeTab === 'gallery' && (
                            <div className="h-full">
                                {galleryLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                                        <div className="w-10 h-10 border-4 border-stone-200 border-t-[#d4af37] rounded-full animate-spin" />
                                        <p className="text-stone-400 text-sm font-medium tracking-widest uppercase">Cargando...</p>
                                    </div>
                                ) : galleryFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
                                        <span className="text-5xl opacity-40">🖼️</span>
                                        <p className="text-stone-500 font-medium">No hay imágenes.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 pb-20">
                                        {galleryFiles.map(file => (
                                            <button
                                                type="button"
                                                key={file.url}
                                                onClick={(e) => safeSelectImage(e, file.url)}
                                                className="group relative rounded-2xl overflow-hidden aspect-square bg-white border border-stone-200 hover:border-[#d4af37] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
                                            >
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
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
                            <div className="flex flex-col items-center justify-center min-h-[300px] h-full">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#d4af37] rounded-full animate-spin" />
                                        <p className="text-stone-600 font-bold">Procesando...</p>
                                    </div>
                                ) : (
                                    <label 
                                        className="w-full max-w-lg cursor-pointer group"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <input type="file" accept="image/*" className="sr-only" onChange={handleFileInput} />
                                        <div className="border-2 border-dashed border-stone-300 group-hover:border-[#d4af37] rounded-[2rem] p-16 text-center transition-all bg-white group-hover:bg-[#fbf9f4] shadow-sm group-hover:shadow-md">
                                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📤</div>
                                            <p className="font-extrabold text-stone-800 text-xl mb-2">Subir Foto</p>
                                            <p className="text-sm text-stone-500">Toca para explorar imágenes</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* BOTÓN DE CIERRE STICKY (Siempre visible) */}
                        <div className="sticky bottom-0 left-0 right-0 flex justify-center py-6 pointer-events-none z-[100]">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="pointer-events-auto px-10 py-3.5 rounded-full font-black text-stone-600 bg-white/90 backdrop-blur-md border border-stone-200 hover:bg-white hover:text-stone-900 transition-all text-sm shadow-2xl active:scale-95 uppercase tracking-widest ring-1 ring-black/5"
                            >
                                Cerrar Galería
                            </button>
                        </div>
                    </div>
                </div>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

        {/* Modal de Crop anidado */}
        {showCropModal && (
          <div className="fixed inset-0 z-[500]" onClick={(e) => e.stopPropagation()}>
            <CropImageModal
              imageSrc={selectedImageForCrop}
              onClose={() => { setShowCropModal(false); setSelectedImageForCrop(''); }}
              onCropComplete={handleCropComplete}
            />
          </div>
        )}
      </Dialog>
    );
  }
);

MediaPickerModal.displayName = 'MediaPickerModal';

export default MediaPickerModal;
