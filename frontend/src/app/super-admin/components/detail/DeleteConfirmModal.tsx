"use client"

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantSlug: string;
  tenantName: string;
  confirmText: string;
  onChangeConfirmText: (val: string) => void;
  onDelete: () => Promise<void>;
  deleting: boolean;
}

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  tenantSlug,
  tenantName,
  confirmText,
  onChangeConfirmText,
  onDelete,
  deleting
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-3xl border border-stone-200/50 p-8 shadow-xl max-w-lg w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-serif font-bold text-red-600 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6" /> ¿Eliminar esta clínica permanentemente?
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-500 leading-relaxed font-sans">
            Estás a punto de borrar **físicamente en cascada** la clínica <strong className="text-stone-900 font-bold">{tenantName}</strong>. Esta acción destruirá de manera irreversible:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 font-sans">
          <div className="bg-red-50/20 p-4 rounded-xl border border-red-100 text-xs text-red-700 space-y-2 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-red-800">
              🚨 ¡ADVERTENCIA CRÍTICA!
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Todos los expedientes médicos e historiales de clientes serán purgados.</li>
              <li>Se borrarán citas activas, facturas emitidas y agendas de especialistas.</li>
              <li>Todos los archivos multimedia y firmas subidas a Supabase Storage serán destruidos.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest block">
              Escribe el subdominio para confirmar: <strong className="text-stone-900 font-bold font-mono">{tenantSlug}</strong>
            </label>
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => onChangeConfirmText(e.target.value)}
              placeholder={`Escribe ${tenantSlug}`}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-sans"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
            <button
              onClick={() => {
                onOpenChange(false);
                onChangeConfirmText('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onDelete}
              disabled={confirmText !== tenantSlug || deleting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 text-white ${
                confirmText !== tenantSlug || deleting
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
            >
              {deleting ? 'Destruyendo datos...' : 'Confirmar Borrado'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
