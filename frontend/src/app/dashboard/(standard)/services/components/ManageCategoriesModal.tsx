"use client"
import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MediaPickerModal from '@/components/MediaPickerModal';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  fetchCategories: () => Promise<void>;
  fetchServices: () => Promise<void>;
  services: any[];
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  fetchCategories,
  fetchServices,
  services,
}: ManageCategoriesModalProps) {
  const { t } = useLanguage();
  const { showFeedback } = useFeedback();

  // Local modal and editing states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryImage, setEditingCategoryImage] = useState<string | null>(null);
  const [showCatMediaPicker, setShowCatMediaPicker] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        setShowCategoryModal(false);
        fetchCategories();
        toast.success(t('dashboard.services.category_created'));
      } else {
        const errorData = await res.json();
        toast.error(t('dashboard.services.category_created_error', { error: errorData.detail || 'No se pudo crear la categoría' }));
      }
    } catch (err) {
      toast.error(t('dashboard.services.category_connection_error'));
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId || !editingCategoryName) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${editingCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategoryName, image_url: editingCategoryImage })
      });
      if (res.ok) {
        setEditingCategoryId(null);
        setEditingCategoryName('');
        setEditingCategoryImage(null);
        fetchCategories();
        fetchServices();
        toast.success(t('dashboard.services.category_updated'));
      } else {
        toast.error(t('dashboard.services.category_updated_error'));
      }
    } catch (err) {
      toast.error(t('dashboard.services.category_update_connection_error'));
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const hasServices = services.some(s => s.category_id === catId);
    if (hasServices) {
      showFeedback({ type: 'error', title: 'Conflicto', message: t('dashboard.services.delete_category_conflict') });
      return;
    }

    showFeedback({
      type: 'confirm',
      title: t('dashboard.services.delete_category_title'),
      message: t('dashboard.services.delete_category_desc'),
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${catId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            fetchCategories();
            toast.success(t('dashboard.services.category_deleted'));
          } else {
            toast.error(t('dashboard.services.error_deleting_category'));
          }
        } catch (err) {
          toast.error(t('dashboard.services.connection_error'));
        }
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`p-0 border border-stone-200/80 max-w-lg rounded-3xl shadow-2xl bg-white overflow-hidden transition-all duration-300 ${showCategoryModal ? 'blur-[2.5px] opacity-60 scale-[0.98] pointer-events-none' : ''}`}>
          <DialogHeader className="p-8 pr-16 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-serif font-bold text-stone-900">{t('dashboard.services.manage_categories')}</DialogTitle>
                <DialogDescription className="text-stone-400 text-sm mt-1">
                  {t('dashboard.services.manage_categories_desc')}
                </DialogDescription>
              </div>
              <Button 
                id="services-manage-categories-add-btn"
                onClick={() => setShowCategoryModal(true)}
                variant="luxury"
                size="sm"
                className="rounded-xl px-4 font-bold shadow-luxury text-stone-950 gap-1.5 self-start sm:self-center shrink-0"
              >
                <Plus size={16} strokeWidth={2} /> {t('dashboard.services.new')}
              </Button>
            </div>
          </DialogHeader>

          <div className="p-8 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col p-4 bg-stone-50/70 rounded-2xl border border-stone-200/70 group transition-all gap-3 hover:bg-stone-50">
                  <div className="flex items-center justify-between">
                    {editingCategoryId === cat.id ? (
                      <form onSubmit={handleUpdateCategory} className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">{t('dashboard.services.category_name_label')}</label>
                            <input 
                              id="services-category-edit-name-input"
                              autoFocus
                              type="text" 
                              value={editingCategoryName} 
                              onChange={(e) => setEditingCategoryName(e.target.value)} 
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] bg-white transition-all"
                            />
                          </div>
                          
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200">
                            {editingCategoryImage && (
                              <img src={editingCategoryImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${editingCategoryImage}` : editingCategoryImage} className="w-12 h-12 object-cover rounded-xl shadow-2xs border border-stone-100" alt="cat" />
                            )}
                            <div className="flex-1">
                              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">{t('dashboard.services.category_cover_label')}</label>
                              <div className="flex gap-2">
                                <button
                                  id="services-category-edit-cover-btn"
                                  type="button"
                                  onClick={() => setShowCatMediaPicker(true)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-semibold transition-all border border-stone-200"
                                >
                                  <ImageIcon size={14} strokeWidth={1.5} />
                                  {editingCategoryImage ? t('dashboard.services.modify') : t('dashboard.services.gallery')}
                                </button>
                                {editingCategoryImage && (
                                  <button id="services-category-edit-remove-cover-btn" type="button" onClick={() => setEditingCategoryImage('')} className="text-[10px] text-rose-500 font-bold px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-all uppercase tracking-widest">
                                    {t('dashboard.services.remove')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Button id="services-category-edit-cancel-btn" type="button" variant="outline" size="sm" onClick={() => {setEditingCategoryId(null); setEditingCategoryImage(null);}} className="rounded-xl font-bold text-xs uppercase">{t('dashboard.services.cancel')}</Button>
                            <Button id="services-category-edit-submit-btn" type="submit" variant="luxury" size="sm" className="rounded-xl font-bold text-xs uppercase shadow-luxury text-stone-950">{t('dashboard.services.save')}</Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img src={cat.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${cat.image_url}` : cat.image_url} alt="" className="w-10 h-10 object-cover rounded-xl border border-stone-200/80 shadow-2xs" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-400">
                              <FolderTree size={18} strokeWidth={1.5} />
                            </div>
                          )}
                          <span className="font-bold text-stone-800 text-sm">{cat.name}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button 
                            id={`services-category-edit-btn-${cat.id}`}
                            type="button"
                            onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.image_url || null); }}
                            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-white rounded-xl transition-all border border-transparent hover:border-stone-200"
                            title={t('dashboard.services.edit')}
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </button>
                          <button 
                            id={`services-category-delete-btn-${cat.id}`}
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                            title={t('dashboard.services.delete_category')}
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-4 border-t border-stone-100 bg-stone-50/60 italic text-stone-400 text-[11px] text-center block rounded-b-3xl z-20">
            {t('dashboard.services.category_delete_safety_desc')}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nueva Categoría */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="p-0 border border-stone-200/80 max-w-sm rounded-3xl shadow-2xl bg-white overflow-hidden">
          <DialogHeader className="p-6 border-b border-stone-100 bg-white/95 backdrop-blur-md">
            <DialogTitle className="text-xl font-serif font-bold text-stone-900">{t('dashboard.services.new_category')}</DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-0.5">
              {t('dashboard.services.new_category_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <form id="services-new-category-form" onSubmit={handleCreateCategory}>
              <input 
                id="services-new-category-name-input"
                required 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder={t('dashboard.services.new_category_placeholder')} 
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all text-sm font-semibold placeholder:text-stone-400" 
              />
            </form>
          </div>

          <DialogFooter className="p-6 border-t border-stone-100 bg-white flex flex-row gap-3 rounded-b-3xl">
            <Button id="services-new-category-cancel-btn" type="button" variant="outline" size="lg" onClick={() => setShowCategoryModal(false)} className="flex-1 rounded-xl font-bold text-stone-700 h-11">
              {t('dashboard.services.cancel')}
            </Button>
            <Button id="services-new-category-submit-btn" form="services-new-category-form" type="submit" variant="luxury" size="lg" className="flex-1 font-bold shadow-luxury text-stone-950 rounded-xl h-11">
              {t('dashboard.services.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCatMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowCatMediaPicker(false)}
          onImageSelected={(url) => {
            setEditingCategoryImage(url);
            setShowCatMediaPicker(false);
          }}
        />
      )}
    </>
  );
}
