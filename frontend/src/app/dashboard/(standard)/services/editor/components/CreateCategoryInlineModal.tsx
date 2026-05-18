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
import { useLanguage } from '@/app/contexts/LanguageContext';

interface CreateCategoryInlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (newCategoryId: string) => void;
}

export default function CreateCategoryInlineModal({ open, onOpenChange, onCreated }: CreateCategoryInlineModalProps) {
  const { t } = useLanguage();
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
        toast.success(t('dashboard.services.category_created'));
        setName('');
        onCreated(data.id);
        onOpenChange(false);
      } else {
        const errorData = await res.json();
        toast.error(t('dashboard.services.category_create_error', { error: errorData.detail || 'No se pudo crear la categoría' }));
      }
    } catch (error) {
      toast.error(t('dashboard.services.connection_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none max-w-sm">
        <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.services.new_category')}</DialogTitle>
          <DialogDescription className="text-stone-500 text-xs">
            {t('dashboard.services.new_category_inline_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-white">
          <form id="inline-category-form" onSubmit={handleSubmit}>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.services.category_name_label')} *</label>
            <input 
              required
              autoFocus
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('dashboard.services.new_category_placeholder')} 
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
            {t('dashboard.services.cancel')}
          </button>
          <button 
            form="inline-category-form" 
            type="submit" 
            className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md active:scale-95 border border-transparent disabled:opacity-50"
            disabled={saving}
          >
            {saving ? t('dashboard.services.creating') : t('dashboard.services.create')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
