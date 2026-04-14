"use client"
import { useState, useEffect, useRef } from 'react';
import { Cloud, Download, Server, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BackupsPage() {
  const [cloudBackups, setCloudBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Backup Restore Modal State
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [restoring, setRestoring] = useState(false);
  
  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCloudBackups();
  }, []);

  const fetchCloudBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backups/`);
      if (res.ok) {
        setCloudBackups(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCloudBackup = async (filename: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/backups/${filename}/download`);
      if (res.ok) {
        const data = await res.json();
        const fileRes = await fetch(data.url);
        const blob = await fileRes.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Error al generar el enlace de descarga.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al contactar con la nube.");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/backup/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_manual_${new Date().toISOString().split('T')[0]}.json`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true, view: window }));
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al exportar");
    }
  };

  const handleRestoreClick = () => {
    backupInputRef.current?.click();
  };
  
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirmCode('');
    setShowBackupModal(true);
  };
  
  const executeRestore = async () => {
    if (confirmCode !== 'CONFIRMAR' || !pendingFile) return;
    setRestoring(true);
    try {
      const text = await pendingFile.text();
      const payload = JSON.parse(text);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Sistema restaurado con éxito. Refrescando plataforma...");
        window.location.reload();
      } else {
         const d = await res.json();
         alert("Fallo restaurando: " + d.detail);
      }
    } catch (err) {
      console.error(err);
      alert("El archivo no es válido");
    } finally {
      setRestoring(false);
    }
  };

  const formatSize = (bytes: number) => {
      if (!bytes) return "0 B";
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1100px] mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight flex items-center gap-3">
               <Server className="w-8 h-8 text-[#d9777f]" />
               Copias de Seguridad
            </h1>
           <p className="text-stone-500 font-medium mt-2">Gestiona el histórico de la base de datos local y en la nube.</p>
        </div>
        <button 
           onClick={fetchCloudBackups}
           className="bg-white border border-stone-200 text-stone-600 hover:text-[#d9777f] px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar Lista
        </button>
      </div>

      <div className="space-y-8">
        {/* NUBE SUPABASE */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-stone-100 flex items-center gap-4 bg-gradient-to-r from-blue-50/50 to-white">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                 <Cloud className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-extrabold text-stone-800 text-lg">Retención Automatizada en la Nube</h3>
                <p className="text-sm text-stone-500">Histórico de los últimos 7 días. Generado cada noche a través de Cron.</p>
             </div>
           </div>

           <div className="p-0">
              {loading ? (
                  <div className="py-16 text-center text-stone-400">
                      <div className="w-8 h-8 mx-auto border-4 border-stone-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                      <p className="font-bold text-sm tracking-widest uppercase">Conectando al Storage...</p>
                  </div>
              ) : cloudBackups.length === 0 ? (
                  <div className="py-16 text-center text-stone-400">
                      <p className="font-bold">No hay copias de seguridad en la nube.</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm table-fixed min-w-[900px]">
                        <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-8 py-5 w-[40%]">ARCHIVO</th>
                                <th className="px-8 py-5 w-[25%]">FECHA DE CREACIÓN</th>
                                <th className="px-8 py-5 w-[15%]">TAMAÑO</th>
                                <th className="px-8 py-5 w-[20%] text-right">ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 bg-white">
                            {cloudBackups.map((file, idx) => (
                                <tr key={idx} className="hover:bg-stone-50 transition-colors group">
                                    <td className="px-8 py-5 font-mono font-bold text-stone-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-stone-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-stone-300" />
                                            {new Date(file.created_at).toLocaleString('es-ES', { 
                                                day: '2-digit', 
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-stone-100 text-stone-600 text-[11px] font-bold px-2 py-1 rounded-md">
                                            {formatSize(file.metadata?.size || 0)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => downloadCloudBackup(file.name)}
                                            className="inline-flex items-center gap-2 text-white bg-[#d9777f] px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#c7656e] active:scale-95 transition-all text-xs"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Descargar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              )}
           </div>
        </div>

        {/* MIGRACION MANUAL (Antiguo Ajustes) */}
        <div className="bg-red-50/30 rounded-[2rem] border border-red-100 p-8 shadow-sm">
           <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4 border-b border-red-100 pb-2 flex items-center gap-2">
             <AlertCircle className="w-4 h-4" />
             <span>Manipulación Crítica de Datos (Manual)</span>
           </h3>
           <p className="text-sm text-stone-600 mb-6">
             Exporta o importa toda la base de datos manualmente. <span className="font-bold underline text-red-600">La importación destruirá la información actual para sobre-escribirla.</span>
           </p>
           
           <div className="flex flex-wrap gap-4">
              <button type="button" onClick={handleExport} className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors">
                📥 Exportar DB Abierta (.json)
              </button>
              <input type="file" accept=".json" ref={backupInputRef} className="hidden" onChange={onFileSelect} />
              <button type="button" onClick={handleRestoreClick} className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors">
                ⚠️ Cargar DB Externa (Restaurar)
              </button>
           </div>
        </div>
      </div>

      {/* MODAL DE ALERTA ROJA: RESTAURACIÓN CRÍTICA (Sándwich) */}
      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-red-50/95 backdrop-blur-xl border-red-200 shadow-2xl rounded-[2.5rem] flex flex-col max-h-[85dvh]">
          <DialogHeader className="p-8 pb-4 bg-red-100/50 border-b border-red-200">
            <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg animate-pulse">⚠️</div>
            <DialogTitle className="text-2xl font-black text-red-700 uppercase tracking-tighter">Peligro Crítico</DialogTitle>
            <DialogDescription className="text-red-600/80 font-medium">
              Estás a punto de **SOBRESCRIBIR TODA LA BASE DE DATOS**. Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="p-4 bg-white rounded-2xl border border-red-100 shadow-inner">
              <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 px-1">Validación de Seguridad</label>
              <input 
                type="text" 
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value)}
                placeholder="Escribe CONFIRMAR"
                className="w-full p-4 bg-red-50/50 border-2 border-red-100 rounded-2xl focus:border-red-500 outline-none text-center font-black tracking-[0.2em] text-red-700 transition-all"
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 bg-red-100/50 border-t border-red-200 flex flex-col gap-3">
            <button 
              onClick={executeRestore} 
              disabled={confirmCode !== 'CONFIRMAR' || restoring} 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all disabled:opacity-30 text-sm"
            >
              {restoring ? 'RESTAURANDO...' : 'SÍ, BORRAR Y RESTAURAR'}
            </button>
            <button 
              onClick={() => setShowBackupModal(false)}
              className="w-full py-3 rounded-2xl font-bold bg-white text-red-400 hover:text-red-600 transition-all text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
