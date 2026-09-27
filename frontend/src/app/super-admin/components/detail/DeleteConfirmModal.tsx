"use client"

import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantSlug: string
  tenantName: string
  confirmText: string
  onChangeConfirmText: (val: string) => void
  onDelete: () => Promise<void>
  deleting: boolean
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
  const isMatch = confirmText === tenantSlug

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-rose-200/80 p-7 sm:p-8 shadow-2xl max-w-lg w-full">
        <DialogHeader className="space-y-2.5">
          <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-rose-600 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> ¿Eliminar clínica de forma permanente?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-stone-500 leading-relaxed font-sans">
            Estás a punto de borrar <strong className="text-stone-900 font-bold">{tenantName}</strong> y todas sus dependencias. Esta acción destruirá de manera irreversible:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2 font-sans">
          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-1.5 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-rose-900">
              🚨 Advertencia de borrado en cascada
            </p>
            <ul className="list-disc pl-4 space-y-1 text-rose-700">
              <li>Todos los expedientes médicos e historiales de clientes serán purgados.</li>
              <li>Se borrarán citas activas, facturas emitidas y agendas de especialistas.</li>
              <li>Todos los archivos multimedia y firmas en Supabase Storage serán destruidos.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block ml-1">
              Escribe el subdominio para confirmar: <strong className="text-stone-900 font-mono">{tenantSlug}</strong>
            </label>
            <Input 
              type="text" 
              value={confirmText}
              onChange={(e) => onChangeConfirmText(e.target.value)}
              placeholder={`Escribe ${tenantSlug}`}
              className="h-11 focus-visible:border-rose-500 focus-visible:ring-rose-500/25"
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-3 border-t border-stone-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onChangeConfirmText('')
              }}
              className="text-stone-500"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={!isMatch || deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Eliminando datos...</span>
                </>
              ) : (
                'Confirmar Borrado Definitivo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
