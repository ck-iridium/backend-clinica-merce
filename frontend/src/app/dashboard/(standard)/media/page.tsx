'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import CropImageModal from '@/components/CropImageModal';
import { processVideo } from '@/lib/videoProcessor';
import { type MediaFile, type Quota, MAX_BYTES } from '@/lib/mediaTypes';
import MediaQuotaBar from '@/components/media/MediaQuotaBar';
import MediaGrid from '@/components/media/MediaGrid';
import MediaBulkBar from '@/components/media/MediaBulkBar';
import MediaLuxuryViewer from '@/components/media/MediaLuxuryViewer';
import { Loader2, Sparkles } from 'lucide-react';

export default function MediaGalleryPage() {
  const { showFeedback } = useFeedback();

  // Core state
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_use' | 'orphan' | 'video'>('all');

  // Multi-select state
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Upload / Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
  const [uploadingNew, setUploadingNew] = useState(false);

  // Video Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // ── Data fetching ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, quotaRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/all`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/quota`),
      ]);
      if (filesRes.ok) setFiles(await filesRes.json());
      if (quotaRes.ok) setQuota(await quotaRes.json());
    } catch (e) {
      showFeedback({ type: 'error', title: 'Error de Red', message: 'No se pudo conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Single delete ──
  const handleDelete = () => {
    if (!selectedFile) return;

    if (selectedFile.status === 'in_use') {
      showFeedback({ type: 'error', title: 'Imagen en Uso', message: `No se puede eliminar. Está vinculada a: ${selectedFile.usages.join(', ')}.` });
      return;
    }

    showFeedback({
      type: 'confirm',
      title: 'Eliminar Imagen',
      message: `¿Seguro que deseas eliminar "${selectedFile.name}"? Esta acción es permanente.`,
      onConfirm: async () => {
        setDeleting(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${encodeURIComponent(selectedFile.name)}`, { method: 'DELETE' });
          if (res.ok) {
            setSelectedFile(null);
            await fetchData();
            showFeedback({ type: 'success', title: 'Eliminado', message: 'La imagen ha sido eliminada correctamente.' });
          } else {
            const err = await res.json();
            showFeedback({ type: 'error', title: 'Error', message: err.detail || 'No se pudo eliminar la imagen.' });
          }
        } catch {
          showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al servidor.' });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // ── Multi-select helpers ──
  const toggleSelect = (name: string) => {
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setSelectedFile(null);
  };

  const selectAllOrphans = () => {
    const orphans = filteredFiles.filter(f => f.status === 'orphan').map(f => f.name);
    setSelectedNames(new Set(orphans));
  };

  const clearSelection = () => setSelectedNames(new Set());

  // ── Bulk delete ──
  const handleBulkDelete = () => {
    if (selectedNames.size === 0) return;

    showFeedback({
      type: 'confirm',
      title: `Eliminar ${selectedNames.size} imágenes`,
      message: `¿Estás seguro de que deseas eliminar estas ${selectedNames.size} imágenes definitivamente? Esta acción NO se puede deshacer.`,
      onConfirm: async () => {
        setBulkDeleting(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filenames: Array.from(selectedNames) }),
          });
          if (res.ok) {
            const data = await res.json();
            clearSelection();
            await fetchData();
            showFeedback({ type: 'success', title: '¡Limpieza completada!', message: data.message });
          } else {
            const err = await res.json();
            showFeedback({ type: 'error', title: 'Error', message: err.detail || 'No se pudo ejecutar la limpieza.' });
          }
        } catch {
          showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al servidor.' });
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  // ── Upload handlers ──
  const handleUpload = async (blob: Blob, name: string) => {
    setUploadingNew(true);
    const uploadData = new FormData();
    uploadData.append('file', blob, name);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, { method: 'POST', body: uploadData });
      if (res.ok) {
        await fetchData();
        showFeedback({ type: 'success', title: 'Subida Completa', message: 'Nuevo archivo añadido a la galería.' });
      } else {
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo subir el archivo.' });
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al subir.' });
    } finally {
      setUploadingNew(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type.startsWith('video/')) {
      setIsProcessing(true);
      setProcessingStatus('Cargando motor de vídeo...');
      try {
        const optimizedBlob = await processVideo(file, (progress) => {
          setProcessingStatus(`Optimizando vídeo... ${progress}%`);
          setProcessingProgress(progress);
        });
        setProcessingStatus('Finalizando subida...');
        await handleUpload(optimizedBlob, `video_${Date.now()}.mp4`);
      } catch (err) {
        console.error(err);
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo procesar el vídeo. Asegúrate de usar un navegador compatible.' });
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
        setProcessingProgress(0);
      }
    } else {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageForCrop(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);
    await handleUpload(croppedBlob, 'media_upload.webp');
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const pseudoEvent = { target: { files: droppedFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(pseudoEvent);
    }
  };

  // ── Derived state ──
  const filteredFiles = files.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'video') return f.name.toLowerCase().endsWith('.mp4') || f.content_type?.includes('video');
    return f.status === filter;
  });
  const orphanCount = files.filter(f => f.status === 'orphan').length;
  const usedPercent = quota ? Math.min((quota.used_bytes / MAX_BYTES) * 100, 100) : 0;
  const isNearLimit = usedPercent > 80;

  // ── Render ──
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight flex items-center gap-3">
          <span className="bg-stone-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🖼️</span>
          Galería de Medios
        </h1>
        <p className="text-stone-500 font-medium mt-2">Gestión centralizada de imágenes alojadas en Supabase.</p>
      </div>

      {/* Upload Zone */}
      {!isProcessing && (
        <div className="mb-8">
          <label
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300
              ${isDragging
                ? 'border-[#d4af37] bg-[#fbf9f4] scale-[1.01] shadow-lg'
                : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 shadow-sm'}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-[#d4af37] text-white' : 'bg-stone-100 text-stone-400'}`}>
                <span className="text-2xl">{isDragging ? '📥' : '☁️'}</span>
              </div>
              <p className="mb-1 text-sm text-stone-800 font-black uppercase tracking-widest">
                {isDragging ? '¡Suéltalo aquí!' : 'Haz clic o arrastra para subir'}
              </p>
              <p className="text-xs text-stone-400 font-medium italic">
                Optimización automática de vídeo (720p, sin audio) activa
              </p>
            </div>
            <input type="file" className="hidden" onChange={handleFileSelect} multiple accept="image/*,video/*" />
          </label>
        </div>
      )}

      {/* Quota Bar */}
      {quota && <MediaQuotaBar quota={quota} usedPercent={usedPercent} isNearLimit={isNearLimit} />}

      {/* Video Processing HUD */}
      {isProcessing && (
        <div className="mb-8 p-6 rounded-[2rem] bg-stone-900 text-white shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                <Sparkles className="animate-pulse" />
              </div>
              <p className="text-lg font-bold">{processingStatus}</p>
            </div>
            <p className="text-2xl font-black text-[#d4af37]">{processingProgress}%</p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#d9777f] transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-3 italic">
            Estamos eliminando el audio y comprimiendo el vídeo para que la web de la clínica vuele. No cierres esta pestaña.
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 bg-white border border-stone-200 p-1 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          {(['all', 'in_use', 'orphan', 'video'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); clearSelection(); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-stone-900 text-white shadow' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              {f === 'all' ? `Todas (${files.length})` :
                f === 'in_use' ? `En Uso (${files.filter(x => x.status === 'in_use').length})` :
                  f === 'orphan' ? `Huérfanas (${files.filter(x => x.status === 'orphan').length})` :
                    `Vídeos (${files.filter(x => x.name.toLowerCase().endsWith('.mp4') || x.content_type?.includes('video')).length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {orphanCount > 0 && selectedNames.size === 0 && (
            <button
              onClick={selectAllOrphans}
              className="text-sm font-bold text-stone-500 hover:text-stone-800 border border-stone-200 bg-white px-4 py-2.5 rounded-2xl transition-all hover:border-stone-400"
            >
              Seleccionar todas las huérfanas
            </button>
          )}
          <label className={`relative cursor-pointer ${(uploadingNew || isProcessing) ? 'opacity-60 pointer-events-none' : ''}`}>
            <input type="file" accept="image/*,video/*" className="sr-only" onChange={handleFileSelect} disabled={uploadingNew || isProcessing} />
            <div className="flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95">
              {(uploadingNew || isProcessing)
                ? <><Loader2 size={16} className="animate-spin" /><span>{isProcessing ? 'Procesando...' : 'Subiendo...'}</span></>
                : <><span className="text-lg">+</span><span>Subir Nueva</span></>
              }
            </div>
          </label>
        </div>
      </div>

      {/* Media Grid */}
      <MediaGrid
        files={filteredFiles}
        loading={loading}
        selectedFile={selectedFile}
        selectedNames={selectedNames}
        onFileClick={(file) => setSelectedFile(file)}
        onToggleSelect={toggleSelect}
      />

      {/* Floating Bulk Action Bar */}
      <MediaBulkBar
        count={selectedNames.size}
        deleting={bulkDeleting}
        onClear={clearSelection}
        onDelete={handleBulkDelete}
      />

      {/* Luxury Viewer Modal */}
      {selectedFile && selectedNames.size === 0 && (
        <MediaLuxuryViewer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <CropImageModal
          imageSrc={selectedImageForCrop}
          onClose={() => { setShowCropModal(false); setSelectedImageForCrop(''); }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
