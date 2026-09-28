"use client"

import React from 'react'
import { Globe, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DomainConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inputDomain: string
  onChangeInputDomain: (val: string) => void
  onConnect: () => Promise<void>
  saving: boolean
}

export default function DomainConnectionModal({
  open,
  onOpenChange,
  inputDomain,
  onChangeInputDomain,
  onConnect,
  saving
}: DomainConnectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-stone-200/70 p-7 sm:p-8 shadow-2xl max-w-lg w-full">
        <DialogHeader className="space-y-2.5">
          <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#D4AF37]" /> Conectar Dominio Propio
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-stone-500 leading-relaxed font-sans">
            Asocia tu propio dominio comercial para que tus clientes puedan reservar tratamientos directamente en tu dirección web personalizada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1.5 ml-1">
              Ingresa tu Dominio
            </label>
            <Input 
              type="text" 
              value={inputDomain}
              onChange={(e) => onChangeInputDomain(e.target.value)}
              placeholder="ej: www.miestetica.com"
              className="h-11"
            />
          </div>

          <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-200/60 space-y-3">
            <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Registros DNS Requeridos</span>
            </h5>
            <p className="text-xs text-stone-500 leading-relaxed">
              Accede a tu proveedor de dominios y añade el siguiente registro CNAME para habilitar el mapeo:
            </p>
            
            <div className="grid grid-cols-3 gap-2.5 text-xs font-mono border-t border-stone-200/50 pt-3">
              <span className="text-stone-400 font-bold">Tipo:</span>
              <span className="col-span-2 text-stone-850 font-bold">CNAME</span>

              <span className="text-stone-400 font-bold">Host:</span>
              <span className="col-span-2 text-stone-850 font-bold">www o @</span>

              <span className="text-stone-400 font-bold">Valor:</span>
              <span className="col-span-2 text-[#B38F26] font-bold">cname.probookia.com</span>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end pt-2 border-t border-stone-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-stone-500"
            >
              Cancelar
            </Button>
            <Button
              variant="luxury"
              size="sm"
              onClick={onConnect}
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                'Verificar y Conectar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
