"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DocSection } from '../types';

interface CreatePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: DocSection[];
  targetSectionId: string;
  setTargetSectionId: (id: string) => void;
  newPageTitle: Record<string, string>;
  setNewPageTitle: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  newPageSlug: string;
  setNewPageSlug: (slug: string) => void;
  setNewPageSlugManual: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
}

export default function CreatePageModal({
  open,
  onOpenChange,
  sections,
  targetSectionId,
  setTargetSectionId,
  newPageTitle,
  setNewPageTitle,
  newPageSlug,
  setNewPageSlug,
  setNewPageSlugManual,
  onSubmit,
  creating,
}: CreatePageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8">
        <DialogHeader className="mb-6 text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Manual de ayuda
          </span>
          <DialogTitle className="font-serif text-2xl font-bold text-stone-850">
            Añadir nueva página
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs mt-1">
            Crea una página de documentación en la sección seleccionada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Sección Destino
            </label>
            <Select
              value={targetSectionId}
              onValueChange={setTargetSectionId}
            >
              <SelectTrigger className="h-11 text-xs bg-white border-stone-200">
                <SelectValue placeholder="Seleccionar sección destino" />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
                {sections.map(sec => (
                  <SelectItem key={sec.id} value={sec.id} className="text-xs">
                    {sec.title?.es || sec.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Título de la Guía (ES)
            </label>
            <Input
              type="text"
              value={newPageTitle.es || ''}
              onChange={e => setNewPageTitle({ ...newPageTitle, es: e.target.value })}
              placeholder="Ej: Aislamiento Multi-tenant"
              className="w-full text-sm font-medium"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Título de la Guía (EN - Opcional)
            </label>
            <Input
              type="text"
              value={newPageTitle.en || ''}
              onChange={e => setNewPageTitle({ ...newPageTitle, en: e.target.value })}
              placeholder="Ej: Multi-tenant Isolation"
              className="w-full text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
              Dirección URL / Slug
            </label>
            <Input
              type="text"
              value={newPageSlug}
              onChange={e => {
                setNewPageSlug(e.target.value);
                setNewPageSlugManual(true);
              }}
              placeholder="ej: aislamiento-multi-tenant"
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
              disabled={creating || !newPageTitle.es?.trim() || !newPageSlug.trim()}
              className="flex-1 py-3 text-sm font-bold"
            >
              {creating ? 'Creando...' : 'Crear Página'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

