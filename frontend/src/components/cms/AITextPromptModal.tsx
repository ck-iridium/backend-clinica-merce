'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface AITextPromptOptions {
  instructions: string;
  tone: 'premium' | 'cercano' | 'clinico';
  length: 'short' | 'medium' | 'long';
}

interface AITextPromptModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  placeholder?: string;
  isGenerating?: boolean;
  onConfirm: (options: AITextPromptOptions) => Promise<void> | void;
}

export function AITextPromptModal({
  open,
  onClose,
  title,
  description = 'Indica a la IA cómo quieres que redacte el texto, su tono y longitud.',
  placeholder = 'Ej: Enfócate en peluquería y coloración balayage, tono cálido y cercano, menciona experiencia de más de 10 años...',
  isGenerating = false,
  onConfirm,
}: AITextPromptModalProps) {
  const [instructions, setInstructions] = useState('');
  const [tone, setTone] = useState<'premium' | 'cercano' | 'clinico'>('premium');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  useEffect(() => {
    if (!open) {
      setInstructions('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({ instructions, tone, length });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !isGenerating) onClose(); }}>
      <DialogContent className="p-0 border border-stone-200/90 max-w-lg rounded-3xl shadow-2xl bg-white overflow-hidden">
        <DialogHeader className="p-6 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2 text-[#FF6B00] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles size={13} /> Asistente de Redacción IA
          </div>
          <DialogTitle className="text-xl font-serif font-bold text-stone-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tono */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Tono del texto
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'premium', label: 'Elegante / Lujo' },
                { key: 'cercano', label: 'Cercano / Cálido' },
                { key: 'clinico', label: 'Técnico / Pro' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTone(opt.key)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tone === opt.key
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Longitud */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Longitud
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'short', label: 'Corto' },
                { key: 'medium', label: 'Medio' },
                { key: 'long', label: 'Largo' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setLength(opt.key)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    length === opt.key
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Instrucciones / Pautas (Opcional)
            </label>
            <Textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={placeholder}
              className="rounded-xl border-stone-200 text-xs focus-visible:ring-[#FF6B00] resize-none"
            />
          </div>

          <DialogFooter className="pt-2 flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isGenerating}
              onClick={onClose}
              className="rounded-xl text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="luxury"
              disabled={isGenerating}
              className="rounded-xl text-xs font-bold text-white gap-1.5"
            >
              {isGenerating ? (
                <><Loader2 size={14} className="animate-spin" /> Generando...</>
              ) : (
                <><Sparkles size={14} /> Generar con IA</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
