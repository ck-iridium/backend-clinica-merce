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
        <DialogContent className={`p-0 border-none max-w-lg transition-all duration-300 ${showCategoryModal ? 'blur-[2.5px] opacity-60 scale-[0.98] pointer-events-none' : ''}`}>
          <DialogHeader className="p-8 pr-20 border-b border-stone-50 bg-white rounded-t-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-stone-800">{t('dashboard.services.manage_categories')}</DialogTitle>
                <DialogDescription className="text-stone-400 text-sm mt-1">
                  {t('dashboard.services.manage_categories_desc')}
                </DialogDescription>
              </div>
              <button 
                id="services-manage-categories-add-btn"
                onClick={() => setShowCategoryModal(true)}
                className="bg-[#d4af37] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#b08e23] transition-all active:scale-95 flex items-center gap-2 self-start sm:self-center shrink-0"
              >
                <Plus size={16} strokeWidth={2} /> {t('dashboard.services.new')}
              </button>
            </div>
          </DialogHeader>

          <div className="p-8 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col p-4 bg-stone-50 rounded-2xl border border-stone-200 group transition-all gap-3">
                  <div className="flex items-center justify-between">
                    {editingCategoryId === cat.id ? (
                      <form onSubmit={handleUpdateCategory} className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">{t('dashboard.services.category_name_label')}</label>
                            <input 
                              id="services-category-edit-name-input"
                              autoFocus
                              type="text" 
                              value={editingCategoryName} 
                              onChange={(e) => setEditingCategoryName(e.target.value)} 
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                            />
                          </div>
                          
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200">
                            {editingCategoryImage && (
                              <img src={editingCategoryImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${editingCategoryImage}` : editingCategoryImage} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-stone-100" alt="cat" />
                            )}
                            <div className="flex-1">
                              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 block">{t('dashboard.services.category_cover_label')}</label>
                              <div className="flex gap-2">
                                <button
                                  id="services-category-edit-cover-btn"
                                  type="button"
                                  onClick={() => setShowCatMediaPicker(true)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-all border border-stone-200"
                                >
                                  <ImageIcon size={14} strokeWidth={1.5} />
                                  {editingCategoryImage ? t('dashboard.services.modify') : t('dashboard.services.gallery')}
                                </button>
                                {editingCategoryImage && (
                                  <button id="services-category-edit-remove-cover-btn" type="button" onClick={() => setEditingCategoryImage('')} className="text-[10px] text-red-500 font-bold px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-all uppercase tracking-widest">
                                    {t('dashboard.services.remove')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button id="services-category-edit-cancel-btn" type="button" onClick={() => {setEditingCategoryId(null); setEditingCategoryImage(null);}} className="bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold text-xs uppercase hover:bg-stone-300 transition-all">{t('dashboard.services.cancel')}</button>
                            <button id="services-category-edit-submit-btn" type="submit" className="bg-[#d4af37] border border-[#b08e23] text-white px-4 py-3 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#b08e23] transition-all">{t('dashboard.services.save')}</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img src={cat.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${cat.image_url}` : cat.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400">
                              <FolderTree size={18} strokeWidth={1.5} />
                            </div>
                          )}
                          <span className="font-bold text-stone-700">{cat.name}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            id={`services-category-edit-btn-${cat.id}`}
                            type="button"
                            onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.image_url || null); }}
                            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-white rounded-lg transition-all"
                            title={t('dashboard.services.edit')}
                          >
                            <Pencil size={16} strokeWidth={1.5} />
                          </button>
                          <button 
                            id={`services-category-delete-btn-${cat.id}`}
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                            title={t('dashboard.services.delete_category')}
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-white italic text-stone-400 text-[10px] text-center block rounded-b-xl z-20">
            {t('dashboard.services.category_delete_safety_desc')}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nueva Categoría */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="p-0 border-none max-w-xs">
          <DialogHeader className="p-8 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.services.new_category')}</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm">
              {t('dashboard.services.new_category_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8">
            <form id="services-new-category-form" onSubmit={handleCreateCategory}>
              <input 
                id="services-new-category-name-input"
                required 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder={t('dashboard.services.new_category_placeholder')} 
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" 
              />
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent flex gap-3 rounded-b-xl z-20">
            <button id="services-new-category-cancel-btn" type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 transition-all">
              {t('dashboard.services.cancel')}
            </button>
            <button id="services-new-category-submit-btn" form="services-new-category-form" type="submit" className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 border border-stone-800">
              {t('dashboard.services.create')}
            </button>
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
