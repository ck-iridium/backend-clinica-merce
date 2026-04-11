'use client';

import { useState, useEffect } from 'react';
import CropImageModal from '@/components/CropImageModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';

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

export default function MediaPickerModal({ onClose, onImageSelected }: MediaPickerModalProps) {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');

  // Gallery state
  const [galleryFiles, setGalleryFiles] = useState<MediaFile[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  // Upload / Crop state (managed internally)
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load gallery when tab is first opened
  useEffect(() => {
    if (activeTab === 'gallery' && !galleryLoaded) {
      loadGallery();
    }
  }, [activeTab]);

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

  // ── Upload flow ──
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      } else {
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen.' });
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al subir.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-stone-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-stone-100 bg-stone-50/60 shrink-0">
            <div>
              <h3 className="text-xl font-extrabold text-stone-800">Seleccionar Imagen</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Sube una nueva o elige de la galería</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-all font-bold"
            >
              ✕
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-stone-100 px-8 shrink-0">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-[#d9777f] text-[#d9777f]' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
            >
              🖼️ Elegir de la Galería
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upload' ? 'border-[#d9777f] text-[#d9777f]' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
            >
              📤 Subir Nueva Imagen
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── GALLERY TAB ── */}
            {activeTab === 'gallery' && (
              <div className="p-6">
                {galleryLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-10 h-10 border-4 border-stone-200 border-t-[#d9777f] rounded-full animate-spin" />
                    <p className="text-stone-400 text-sm font-medium tracking-widest uppercase">Cargando galería...</p>
                  </div>
                ) : galleryFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <span className="text-5xl opacity-20">🖼️</span>
                    <p className="text-stone-400 font-medium">La galería está vacía.</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="text-sm font-bold text-[#d9777f] underline underline-offset-2"
                    >
                      Sube tu primera imagen →
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">{galleryFiles.length} imágenes disponibles — haz clic para seleccionar</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                      {galleryFiles.map(file => (
                        <button
                          key={file.name}
                          onClick={() => onImageSelected(file.url)}
                          onMouseEnter={() => setHoveredFile(file.name)}
                          onMouseLeave={() => setHoveredFile(null)}
                          className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-100 border-2 border-transparent hover:border-[#d9777f] hover:shadow-lg hover:scale-[1.03] transition-all duration-200 focus:outline-none focus:border-[#d9777f]"
                          title={file.name}
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Status dot */}
                          <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full shadow ${file.status === 'in_use' ? 'bg-emerald-400' : 'bg-stone-400'}`} />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-[#d9777f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                            <span className="text-white text-xl font-black">✓</span>
                            <span className="text-white text-[9px] font-bold truncate w-full text-center">{formatBytes(file.size)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── UPLOAD TAB ── */}
            {activeTab === 'upload' && (
              <div className="p-8 flex flex-col items-center justify-center min-h-64">
                {uploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-stone-200 border-t-[#d9777f] rounded-full animate-spin" />
                    <p className="text-stone-500 font-medium">Optimizando y subiendo imagen...</p>
                  </div>
                ) : (
                  <label className="w-full max-w-sm cursor-pointer group">
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileInput} />
                    <div className="border-2 border-dashed border-stone-300 group-hover:border-[#d9777f] rounded-2xl p-12 text-center transition-all group-hover:bg-[#fdf2f3]/50">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                      <p className="font-bold text-stone-700 mb-1">Clic para seleccionar imagen</p>
                      <p className="text-sm text-stone-400">JPG, PNG, WEBP, SVG — Se convertirá a WebP automáticamente</p>
                      <div className="mt-6 inline-flex items-center gap-2 bg-stone-900 group-hover:bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
                        <span>Explorar archivos</span>
                      </div>
                    </div>
                  </label>
                )}
                <p className="text-xs text-stone-400 font-medium mt-6 text-center">
                  💡 Se abrirá un editor de recorte antes de subir para que ajustes la proporción perfecta.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-stone-100 bg-stone-50/60 shrink-0 flex justify-between items-center">
            <p className="text-xs text-stone-400 font-medium">
              {activeTab === 'gallery' ? '💡 Las imágenes marcadas en verde ya están en uso en tu web.' : '💡 Recuerda: la imagen se comprimirá a WebP antes de guardarse.'}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-all text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Internal CropModal — rendered above this modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-[100]">
          <CropImageModal
            imageSrc={selectedImageForCrop}
            onClose={() => { setShowCropModal(false); setSelectedImageForCrop(''); }}
            onCropComplete={handleCropComplete}
          />
        </div>
      )}
    </>
  );
}
