'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import CropImageModal from '@/components/CropImageModal';

interface MediaFile {
  name: string;
  url: string;
  size: number;
  content_type: string;
  created_at: string;
  status: 'in_use' | 'orphan';
  usages: string[];
}

interface Quota {
  used_bytes: number;
  max_bytes: number;
  file_count: number;
}

const MAX_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaGalleryPage() {
  const { showFeedback } = useFeedback();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_use' | 'orphan'>('all');

  // Multi-select state
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Upload / Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
  const [uploadingNew, setUploadingNew] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Single delete ---
  const handleDelete = () => {
    if (!selectedFile) return;

    if (selectedFile.status === 'in_use') {
      showFeedback({
        type: 'error',
        title: 'Imagen en Uso',
        message: `No se puede eliminar. Está vinculada a: ${selectedFile.usages.join(', ')}.`,
      });
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

  // --- Multi-select helpers ---
  const toggleSelect = (name: string) => {
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    // Deselect detail panel when selecting via checkbox
    setSelectedFile(null);
  };

  const selectAllOrphans = () => {
    const orphans = filteredFiles.filter(f => f.status === 'orphan').map(f => f.name);
    setSelectedNames(new Set(orphans));
  };

  const clearSelection = () => setSelectedNames(new Set());

  // --- Bulk delete ---
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

  // Upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadingNew(true);
    const uploadData = new FormData();
    uploadData.append('file', croppedBlob, 'media_upload.webp');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, { method: 'POST', body: uploadData });
      if (res.ok) {
        await fetchData();
        showFeedback({ type: 'success', title: 'Subida Completa', message: 'Nueva imagen añadida a la galería.' });
      } else {
        showFeedback({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen.' });
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al subir.' });
    } finally {
      setUploadingNew(false);
    }
  };

  const filteredFiles = files.filter(f => filter === 'all' || f.status === filter);
  const orphanCount = files.filter(f => f.status === 'orphan').length;
  const usedPercent = quota ? Math.min((quota.used_bytes / MAX_BYTES) * 100, 100) : 0;
  const isNearLimit = usedPercent > 80;

  return (
    <div className="animate-in fade-in duration-500 pb-32">
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight flex items-center gap-3">
          <span className="bg-stone-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🖼️</span>
          Galería de Medios
        </h1>
        <p className="text-stone-500 font-medium mt-2">Gestión centralizada de imágenes alojadas en Supabase.</p>
      </div>

      {/* Quota Bar */}
      {quota && (
        <div className={`mb-8 p-6 rounded-[2rem] border ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-white border-stone-100'} shadow-sm`}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">Cuota del Bucket</p>
              <p className={`text-2xl font-black ${isNearLimit ? 'text-red-600' : 'text-stone-800'}`}>
                {formatBytes(quota.used_bytes)}
                <span className="text-sm font-medium text-stone-400 ml-2">/ 1 GB</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-stone-500">{quota.file_count} archivos</p>
              <p className={`text-sm font-bold ${isNearLimit ? 'text-red-500' : 'text-stone-400'}`}>{usedPercent.toFixed(1)}% utilizado</p>
            </div>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${isNearLimit ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-[#d9777f] to-[#d4af37]'}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          {isNearLimit && <p className="text-xs font-bold text-red-500 mt-2">⚠️ Atención: estás usando más del 80% de la cuota disponible.</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-wrap">
        {/* Filter Pills */}
        <div className="flex gap-2 bg-white border border-stone-200 p-1 rounded-2xl shadow-sm">
          {(['all', 'in_use', 'orphan'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); clearSelection(); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-stone-900 text-white shadow' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              {f === 'all' ? `Todas (${files.length})` : f === 'in_use' ? `En Uso (${files.filter(x => x.status === 'in_use').length})` : `Huérfanas (${files.filter(x => x.status === 'orphan').length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Select All Orphans shortcut */}
          {orphanCount > 0 && selectedNames.size === 0 && (
            <button
              onClick={selectAllOrphans}
              className="text-sm font-bold text-stone-500 hover:text-stone-800 border border-stone-200 bg-white px-4 py-2.5 rounded-2xl transition-all hover:border-stone-400"
            >
              Seleccionar todas las huérfanas
            </button>
          )}

          {/* Upload Button */}
          <label className={`relative cursor-pointer ${uploadingNew ? 'opacity-60 pointer-events-none' : ''}`}>
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} disabled={uploadingNew} />
            <div className="flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95">
              {uploadingNew
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Subiendo...</span></>
                : <><span className="text-lg">+</span><span>Subir Nueva</span></>
              }
            </div>
          </label>
        </div>
      </div>

      {/* Main Grid + Detail Panel */}
      <div className="flex gap-6 items-start">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-[#d9777f] rounded-full animate-spin" />
              <p className="text-stone-400 font-medium text-sm tracking-widest uppercase">Cargando galería...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-[2rem] border border-stone-100">
              <span className="text-5xl opacity-30">🖼️</span>
              <p className="text-stone-400 font-medium">No hay imágenes en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredFiles.map(file => {
                const isChecked = selectedNames.has(file.name);
                const canSelect = file.status === 'orphan';
                return (
                  <div
                    key={file.name}
                    className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-200 cursor-pointer bg-stone-100
                      ${isChecked ? 'border-red-500 ring-2 ring-red-400/40 scale-[0.97]' : selectedFile?.name === file.name ? 'border-[#d9777f] ring-2 ring-[#d9777f]/30 scale-[0.98]' : 'border-transparent hover:border-stone-300 hover:shadow-md'}`}
                    onClick={() => {
                      if (selectedNames.size > 0 && canSelect) {
                        toggleSelect(file.name);
                      } else {
                        setSelectedFile(file === selectedFile ? null : file);
                      }
                    }}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Status dot */}
                    <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-md transition-opacity ${isChecked ? 'opacity-0' : 'opacity-100'} ${file.status === 'in_use' ? 'bg-emerald-400' : 'bg-stone-400'}`} />

                    {/* Checkbox — only for orphans */}
                    {canSelect && (
                      <div
                        className="absolute top-2 left-2"
                        onClick={e => { e.stopPropagation(); toggleSelect(file.name); }}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-md
                          ${isChecked ? 'bg-red-500 border-red-500' : 'bg-white/80 border-stone-300 opacity-0 group-hover:opacity-100'}`}>
                          {isChecked && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                      <p className="text-white text-[10px] font-bold truncate w-full text-left leading-tight">{file.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedFile && selectedNames.size === 0 && (
          <div className="w-72 shrink-0 bg-white rounded-[2rem] border border-stone-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300 sticky top-6">
            {/* Preview */}
            <div className="aspect-video bg-stone-100 relative">
              <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-3 right-3 w-7 h-7 bg-white/80 rounded-full text-stone-500 hover:text-stone-900 flex items-center justify-center font-bold text-sm shadow-md"
              >✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${selectedFile.status === 'in_use' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                <span className={`w-2 h-2 rounded-full ${selectedFile.status === 'in_use' ? 'bg-emerald-400' : 'bg-stone-400'}`} />
                {selectedFile.status === 'in_use' ? 'EN USO' : 'HUÉRFANA'}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Archivo</p>
                  <p className="text-sm font-bold text-stone-800 break-all">{selectedFile.name}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tamaño</p>
                    <p className="text-sm font-bold text-stone-700">{formatBytes(selectedFile.size)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tipo</p>
                    <p className="text-sm font-bold text-stone-700">{selectedFile.content_type?.split('/')[1]?.toUpperCase() || 'IMG'}</p>
                  </div>
                </div>
              </div>

              {/* Usages */}
              {selectedFile.usages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Usado en</p>
                  <ul className="space-y-1">
                    {selectedFile.usages.map((u, i) => (
                      <li key={i} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        ✓ {u}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Copy URL */}
              <button
                onClick={() => { navigator.clipboard.writeText(selectedFile.url); showFeedback({ type: 'success', title: '¡Copiado!', message: 'URL de la imagen copiada al portapapeles.' }); }}
                className="w-full text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 py-2.5 px-4 rounded-xl transition-all border border-stone-200"
              >
                📋 Copiar URL
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting || selectedFile.status === 'in_use'}
                title={selectedFile.status === 'in_use' ? `No se puede borrar: ${selectedFile.usages.join(', ')}` : 'Eliminar imagen permanentemente'}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${selectedFile.status === 'in_use' ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 active:scale-95 shadow-sm'}`}
              >
                {deleting ? 'Eliminando...' : selectedFile.status === 'in_use' ? '🔒 En uso (No eliminable)' : '🗑️ Eliminar imagen'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Bulk Action Bar ── */}
      {selectedNames.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-red-500 text-white rounded-xl flex items-center justify-center text-sm font-black">
                {selectedNames.size}
              </span>
              <span className="text-sm font-bold">imagen{selectedNames.size > 1 ? 'es' : ''} seleccionada{selectedNames.size > 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <button
              onClick={clearSelection}
              className="text-sm text-white/60 hover:text-white font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-500/30"
            >
              {bulkDeleting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Eliminando...</span></>
                : <><span>🗑️</span><span>Borrar {selectedNames.size} seleccionadas</span></>
              }
            </button>
          </div>
        </div>
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
