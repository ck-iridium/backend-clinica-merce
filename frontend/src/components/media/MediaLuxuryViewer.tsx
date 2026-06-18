'use client';

import { type MediaFile, formatBytes, isVideoFile, isDocumentFile } from '@/lib/mediaTypes';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Download, Link2, Trash2, X, CheckCircle2, FileText, FileSpreadsheet } from 'lucide-react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

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
      const isDoc = isDocumentFile(file);
      let downloadUrl = file.url;
      const headers: Record<string, string> = {};

      if (isDoc) {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let token = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) tenantId = parsed.tenant_id || '';
            token = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error('Error parsing user session for download:', e);
          }
        }
        
        if (tenantId) headers['X-Tenant-ID'] = tenantId;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/media/download/${encodeURIComponent(file.name)}`;
      }

      const response = await fetch(downloadUrl, { headers });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo descargar el archivo de forma segura.' });
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
            ) : isDocumentFile(file) ? (
              <div className="flex flex-col items-center justify-center p-8 text-center max-h-[70vh]">
                <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4 border border-stone-200 shadow-sm">
                  {file.name.toLowerCase().endsWith('.csv') ? (
                    <FileSpreadsheet size={40} className="text-[#d4af37]" />
                  ) : (
                    <FileText size={40} />
                  )}
                </div>
                <h4 className="text-lg font-extrabold text-stone-800 tracking-tight mb-2 truncate max-w-md">{file.name}</h4>
                <p className="text-xs text-stone-500 max-w-sm mb-6">
                  Este es un documento almacenado de forma segura en la nube. La previsualización directa no está disponible, pero puedes descargarlo para editarlo.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Download size={14} />
                  Descargar Documento
                </button>
              </div>
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
