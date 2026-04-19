import React, { useState } from 'react';
import { Unlock } from 'lucide-react';
import { toast } from 'sonner';
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
        toast.success('Horario liberado');
      } else {
        toast.error('Error al liberar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={showBlockDeleteModal} onOpenChange={setShowBlockDeleteModal}>
      <DialogContent className="flex flex-col w-[95vw] sm:max-w-[300px] lg:max-w-[22em] max-h-[85dvh] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-xl">
        <div className="flex-1 overflow-y-auto p-8 text-center">
          <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Unlock size={32} strokeWidth={1.5} />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl font-extrabold text-stone-800 mb-2">Liberar Horario</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm">
              ¿Deseas eliminar este bloqueo y permitir nuevas citas en este hueco?
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="shrink-0 p-6 pt-2 flex flex-col gap-2 sm:flex-col border-t-0">
          <button
            onClick={handleDeleteBlock}
            disabled={updatingStatus}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
          >
            {updatingStatus ? 'Liberando...' : 'Sí, Eliminar Bloqueo'}
          </button>
          <button
            onClick={() => setShowBlockDeleteModal(false)}
            className="w-full bg-stone-50 text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all"
          >
            Cancelar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
