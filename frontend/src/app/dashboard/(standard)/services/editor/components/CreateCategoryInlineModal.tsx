import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface CreateCategoryInlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (newCategoryId: string) => void;
}

export default function CreateCategoryInlineModal({ open, onOpenChange, onCreated }: CreateCategoryInlineModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success('Categoría creada con éxito');
        setName('');
        onCreated(data.id);
        onOpenChange(false);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || 'No se pudo crear la categoría'}`);
      }
    } catch (error) {
      toast.error('Error de conexión al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none max-w-sm">
        <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-extrabold text-stone-800">Nueva Categoría</DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            Añade rápidamente una categoría para este servicio.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-white">
          <form id="inline-category-form" onSubmit={handleSubmit}>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Nombre de la Categoría *</label>
            <input 
              required
              autoFocus
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej: Depilación Láser..." 
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all font-semibold text-sm" 
            />
          </form>
        </div>

        <DialogFooter className="p-4 border-t border-stone-100 bg-stone-50/50 flex gap-2 rounded-b-xl">
          <button 
            type="button" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-xs text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 transition-all"
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            form="inline-category-form" 
            type="submit" 
            className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md active:scale-95 border border-transparent disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Creando...' : 'Crear'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
