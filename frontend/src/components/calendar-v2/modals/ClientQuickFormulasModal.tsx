'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ClientTechnicalHistoryPanel } from './ClientTechnicalHistoryPanel';

interface ClientQuickFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  clientFallbackName?: string;
  availableServices?: Array<{ id: string; name: string }>;
}

export function ClientQuickFormulasModal({
  isOpen,
  onClose,
  clientId,
  clientFallbackName,
  availableServices = [],
}: ClientQuickFormulasModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 border border-stone-200/90 w-[95vw] sm:max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden">
        <ClientTechnicalHistoryPanel
          clientId={clientId}
          clientFallbackName={clientFallbackName}
          onClose={onClose}
          availableServices={availableServices}
          isEmbedded={false}
        />
      </DialogContent>
    </Dialog>
  );
}
