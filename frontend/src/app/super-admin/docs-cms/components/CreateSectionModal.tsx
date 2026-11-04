"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CreateSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionTitle: Record<string, string>;
  setSectionTitle: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  sectionSlug: string;
  setSectionSlug: (slug: string) => void;
  setSectionSlugManual: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export default function CreateSectionModal({
  open,
  onOpenChange,
  sectionTitle,
  setSectionTitle,
  sectionSlug,
  setSectionSlug,
  setSectionSlugManual,
  onSubmit,
  saving,
}: CreateSectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8">
        <DialogHeader className="mb-6 text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Estructura
          </span>
          <DialogTitle className="font-serif text-2xl font-bold text-stone-850">
            Añadir nueva sección
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs mt-1">
            Representa una categoría superior en el índice del manual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Nombre de la Sección (ES)
            </label>
            <Input
              type="text"
              value={sectionTitle.es || ''}
              onChange={e => setSectionTitle({ ...sectionTitle, es: e.target.value })}
              placeholder="Ej: Empezando con ProBookia"
              className="w-full text-sm font-medium"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Nombre de la Sección (EN - Opcional)
            </label>
            <Input
              type="text"
              value={sectionTitle.en || ''}
              onChange={e => setSectionTitle({ ...sectionTitle, en: e.target.value })}
              placeholder="Ej: Getting Started"
              className="w-full text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Slug / Directorio URL
            </label>
            <Input
              type="text"
              value={sectionSlug}
              onChange={e => {
                setSectionSlug(e.target.value);
                setSectionSlugManual(true);
              }}
              placeholder="ej: empezando-probookia"
              className="w-full text-sm font-mono text-stone-700"
              required
              pattern="[a-z0-9-]+"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-3 text-sm font-bold text-stone-500"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="luxury"
              disabled={saving || !sectionTitle.es?.trim() || !sectionSlug.trim()}
              className="flex-1 py-3 text-sm font-bold"
            >
              {saving ? 'Creando...' : 'Crear Sección'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

