"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteDocModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  deleting: boolean;
}

export default function ConfirmDeleteDocModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  deleting,
}: ConfirmDeleteDocModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-8 text-center">
        <DialogHeader className="mb-3 text-center">
          <DialogTitle className="font-serif text-xl font-black text-stone-850">
            {title}
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs font-sans mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 py-3 text-xs font-bold text-stone-500"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 text-xs font-bold"
          >
            {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

