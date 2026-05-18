"use client"
import React, { useState, useEffect, memo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import ImageUploadBlock from './ImageUploadBlock';
import { useLanguage } from '@/app/contexts/LanguageContext';

const CategoriesTab = memo(({ 
  initialCategories, 
  setCategories, 
  selectedCategoryId, 
  setSelectedCategoryId, 
  setPickerTarget, 
  handleCategoryChange 
}: {
  initialCategories: any[],
  setCategories: React.Dispatch<React.SetStateAction<any[]>>,
  selectedCategoryId: string | null,
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>,
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>,
  handleCategoryChange: (id: string, field: string, value: any) => void
}) => {
  const { t } = useLanguage();

  // El estado vive AQUÍ, totalmente aislado del padre durante el drag
  const [localItems, setLocalItems] = useState(initialCategories);

  // Sincronizar si las categorías cambian externamente (ej: al cargar)
  useEffect(() => {
    setLocalItems(initialCategories);
  }, [initialCategories]);

  const selectedCategory = localItems.find((c: any) => c.id === selectedCategoryId) || localItems[0];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="mb-0">
         <h2 className="text-lg font-serif font-bold text-stone-900 leading-tight">
           {t('cms.categories.title')}
         </h2>
         <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
           {t('cms.categories.subtitle')}
         </p>
      </div>
      
      {selectedCategory && (
         <div className="p-5 border border-stone-100 rounded-3xl bg-[#F7F7F5] shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
            
            <div className="space-y-1">
              <ImageUploadBlock 
                label={t('cms.categories.bg_image')}
                value={selectedCategory.image_url} 
                onSelect={() => setPickerTarget({ type: 'category', id: selectedCategory.id, field: 'image_url' })}
                onClear={() => handleCategoryChange(selectedCategory.id, 'image_url', '')}
                onUpload={(url) => handleCategoryChange(selectedCategory.id, 'image_url', url)}
                accepts="image"
              />
            </div>
            
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                 {t('cms.categories.public_name')}
               </label>
               <input type="text" value={selectedCategory.name || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-sm font-bold shadow-sm transition-all" />
            </div>
            
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                 {t('cms.categories.short_description')}
               </label>
               <textarea rows={3} value={selectedCategory.description || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'description', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-xs font-medium shadow-sm leading-relaxed transition-all" placeholder={t('cms.categories.desc_placeholder')} />
            </div>
         </div>
      )}

      <div className="pt-4 border-t border-stone-200">
         <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4">
           {t('cms.categories.order_title')}
         </h3>
         <Reorder.Group axis="y" values={localItems} onReorder={setLocalItems} className="flex flex-col gap-2">
            {localItems.map((cat: any) => (
              <Reorder.Item 
                key={cat.id} 
                value={cat}
                onDragEnd={() => setCategories(localItems)} // Sincronizar con preview SOLO al soltar
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-grab active:cursor-grabbing ${selectedCategoryId === cat.id ? 'border-[#d4af37] bg-white shadow-md' : 'border-stone-100 bg-stone-50/30 hover:bg-white hover:border-stone-200'}`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <div className="flex items-center gap-6">
                  <GripVertical size={16} className="text-stone-300" />
                  <span className={`font-bold text-sm tracking-tight ${selectedCategoryId === cat.id ? 'text-stone-900' : 'text-stone-500'}`}>{cat.name}</span>
                </div>

                <div className="flex items-center gap-6">
                  {selectedCategoryId === cat.id && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/5 px-3 py-1 rounded-full">
                      {t('cms.categories.editing')}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2 border-l border-stone-100 pl-4">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${cat.is_active ? 'text-emerald-500' : 'text-stone-300'}`}>
                      {cat.is_active ? t('cms.categories.visible') : t('cms.categories.hidden')}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(cat.id, 'is_active', !cat.is_active);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${cat.is_active ? 'bg-emerald-500' : 'bg-stone-200'}`}
                    >
                      <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${cat.is_active ? 'translate-x-[20px]' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
         </Reorder.Group>
      </div>
    </div>
  );
});

CategoriesTab.displayName = 'CategoriesTab';
export default CategoriesTab;
