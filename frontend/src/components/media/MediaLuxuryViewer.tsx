'use client';

import { type MediaFile, formatBytes, isVideoFile } from '@/lib/mediaTypes';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Download, Link2, Trash2, X, CheckCircle2 } from 'lucide-react';

interface MediaLuxuryViewerProps {
  file: MediaFile;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function MediaLuxuryViewer({ file, onClose, onDelete, deleting }: MediaLuxuryViewerProps) {
  const { showFeedback } = useFeedback();

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo descargar el archivo.' });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
    showFeedback({ type: 'success', title: '¡Copiado!', message: 'URL del archivo copiada al portapapeles.' });
  };

  const fileType = file.content_type?.split('/')[1]?.toUpperCase()
    || file.name.split('.').pop()?.toUpperCase()
    || 'MED';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 max-h-[90vh]">

        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 md:hidden z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-600 shadow-md"
        >
          <X size={18} />
        </button>

        {/* Left: Media View */}
        <div className="flex-[7] bg-stone-50 flex items-center justify-center p-4 md:p-8 min-h-[250px] md:min-h-[450px]">
          <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
            {isVideoFile(file) ? (
              <video
                src={file.url}
                className="w-full h-full object-contain max-h-[70vh]"
                controls
                autoPlay
                muted
                loop
                crossOrigin="anonymous"
              />
            ) : (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain max-h-[70vh]"
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="flex-[3] p-6 md:p-8 border-t md:border-t-0 md:border-l border-stone-100 flex flex-col bg-white overflow-y-auto">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${file.status === 'in_use' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
                <span className={`w-2 h-2 rounded-full ${file.status === 'in_use' ? 'bg-emerald-400' : 'bg-stone-400'}`} />
                {file.status === 'in_use' ? 'EN USO' : 'HUÉRFANA'}
              </div>
              <button
                onClick={onClose}
                className="hidden md:flex w-9 h-9 items-center justify-center text-stone-300 hover:text-stone-800 transition-colors rounded-full hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* File Info */}
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Archivo</p>
                <p className="text-sm font-bold text-stone-800 break-all leading-snug">{file.name}</p>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tamaño</p>
                  <p className="text-sm font-bold text-stone-700">{formatBytes(file.size)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tipo</p>
                  <p className="text-sm font-bold text-stone-700">{fileType}</p>
                </div>
              </div>

              {/* Usages */}
              {file.usages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Vinculado a</p>
                  <ul className="space-y-1.5">
                    {file.usages.map((u, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={14} className="shrink-0" />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 mt-auto space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Download size={15} />
                Descargar
              </button>
              <button
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Link2 size={15} />
                Copiar URL
              </button>
            </div>

            <button
              onClick={onDelete}
              disabled={deleting || file.status === 'in_use'}
              title={file.status === 'in_use' ? `No se puede borrar: ${file.usages.join(', ')}` : 'Eliminar archivo permanentemente'}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${file.status === 'in_use' ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 shadow-sm'}`}
            >
              <Trash2 size={15} />
              {deleting ? 'Eliminando...' : file.status === 'in_use' ? 'En uso (No eliminable)' : 'Eliminar archivo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
