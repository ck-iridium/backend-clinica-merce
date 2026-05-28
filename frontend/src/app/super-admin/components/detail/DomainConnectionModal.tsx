"use client"

import React from 'react';
import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DomainConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputDomain: string;
  onChangeInputDomain: (val: string) => void;
  onConnect: () => Promise<void>;
  saving: boolean;
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
      <DialogContent className="bg-white rounded-3xl border border-stone-200/50 p-8 shadow-xl max-w-lg w-full">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#d4af37]" /> Conectar Dominio Propio
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-500 leading-relaxed font-sans">
            Asocia tu propio dominio comercial para que tus clientes puedan reservar tratamientos directamente en tu dirección web.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">
              Ingresa tu Dominio
            </label>
            <input 
              type="text" 
              value={inputDomain}
              onChange={(e) => onChangeInputDomain(e.target.value)}
              placeholder="ej: www.miestetica.com"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all text-sm font-sans"
            />
          </div>

          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-4">
            <h5 className="text-xs font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
              📋 Registros DNS Requeridos
            </h5>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Accede a tu proveedor de dominios (GoDaddy, Namecheap, etc.) y añade el siguiente registro CNAME para habilitar el mapeo:
            </p>
            
            <div className="grid grid-cols-3 gap-3 text-xs md:text-sm font-mono border-t border-stone-200/50 pt-4">
              <span className="text-stone-400 font-bold">Tipo:</span>
              <span className="col-span-2 text-stone-800 font-black">CNAME</span>

              <span className="text-stone-400 font-bold">Host:</span>
              <span className="col-span-2 text-stone-800 font-black">www o @</span>

              <span className="text-stone-400 font-bold">Valor:</span>
              <span className="col-span-2 text-stone-800 font-black text-[#b08e23]">cname.probookia.com</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-stone-100">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConnect}
              disabled={saving}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {saving ? 'Guardando...' : 'Verificar y Conectar'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
