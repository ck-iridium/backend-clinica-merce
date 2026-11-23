'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AppointmentPOSPanel } from './AppointmentPOSPanel';

interface AppointmentPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppt: any;
  client: any;
  initialService: any;
  allServices: any[];
  onPaymentComplete: () => Promise<void> | void;
}

export function AppointmentPOSModal({
  isOpen,
  onClose,
  selectedAppt,
  client,
  initialService,
  allServices = [],
  onPaymentComplete,
}: AppointmentPOSModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 border border-stone-200/90 w-[95vw] sm:max-w-xl max-h-[90vh] rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden">
        <AppointmentPOSPanel
          selectedAppt={selectedAppt}
          client={client}
          initialService={initialService}
          allServices={allServices}
          onPaymentComplete={onPaymentComplete}
          onClose={onClose}
          isEmbedded={false}
        />
      </DialogContent>
    </Dialog>
  );
}
