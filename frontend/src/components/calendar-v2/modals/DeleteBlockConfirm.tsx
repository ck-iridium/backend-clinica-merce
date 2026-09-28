import React, { useState } from 'react';
import { Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteBlockConfirmProps {
  showBlockDeleteModal: boolean;
  setShowBlockDeleteModal: (v: boolean) => void;
  selectedBlock: any;
  fetchData: () => Promise<void>;
}

/**
 * DeleteBlockConfirm
 * Componente modular para la confirmación de liberación de horarios bloqueados.
 */
export function DeleteBlockConfirm({
  showBlockDeleteModal,
  setShowBlockDeleteModal,
  selectedBlock,
  fetchData,
}: DeleteBlockConfirmProps) {
  const { t } = useLanguage();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleDeleteBlock = async () => {
    if (!selectedBlock) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-blocks/${selectedBlock.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        setShowBlockDeleteModal(false);
        toast.success(t('dashboard.calendar.toast.block_released') || 'Horario liberado');
      } else {
        toast.error(t('dashboard.calendar.toast.release_error') || 'Error al liberar');
      }
    } catch (err) {
      toast.error(t('dashboard.calendar.toast.connection_error') || 'Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={showBlockDeleteModal} onOpenChange={setShowBlockDeleteModal}>
      <DialogContent className="flex flex-col w-[95vw] sm:max-w-sm max-h-[85dvh] p-0 overflow-hidden bg-white border border-stone-200/80 shadow-2xl rounded-3xl">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200/60 text-[#B38F26] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Unlock size={28} strokeWidth={1.75} />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl font-serif font-bold text-stone-900 mb-1">
              {t('dashboard.calendar.modal.release_title') || 'Liberar Horario'}
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs leading-relaxed">
              {t('dashboard.calendar.modal.release_desc') || '¿Deseas eliminar este bloqueo y permitir nuevas citas en este hueco?'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="shrink-0 p-6 pt-0 flex flex-col gap-2.5 sm:flex-col border-t-0">
          <Button
            id="delete-block-confirm-btn"
            onClick={handleDeleteBlock}
            disabled={updatingStatus}
            variant="default"
            size="lg"
            className="w-full h-12 rounded-xl font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
          >
            {updatingStatus ? (t('dashboard.calendar.modal.releasing') || 'Liberando...') : (t('dashboard.calendar.modal.confirm_release') || 'Sí, Eliminar Bloqueo')}
          </Button>
          <Button
            id="delete-block-cancel-btn"
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => setShowBlockDeleteModal(false)}
            className="w-full h-12 rounded-xl font-semibold text-stone-500 hover:text-stone-900"
          >
            {t('dashboard.calendar.modal.cancel') || 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
