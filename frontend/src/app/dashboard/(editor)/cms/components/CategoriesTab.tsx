"use client"
import React, { useState, useEffect, memo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Sparkles, Loader2 } from 'lucide-react';
import ImageUploadBlock from './ImageUploadBlock';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { toast } from 'sonner';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window === 'undefined') return headers;
  let tenantId = getCookie('tenant_id') || '';
  let authToken = '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!tenantId) tenantId = parsed.tenant_id || '';
      authToken = parsed.access_token || parsed.token || '';
    }
  } catch {}
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

const CategoriesTab = memo(({ 
  initialCategories, 
  setCategories, 
  selectedCategoryId, 
  setSelectedCategoryId, 
  setPickerTarget, 
  handleCategoryChange,
  formData,
  setFormData,
  onOpenAICategoryModal
}: {
  initialCategories: any[],
  setCategories: React.Dispatch<React.SetStateAction<any[]>>,
  selectedCategoryId: string | null,
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>,
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>,
  handleCategoryChange: (id: string, field: string, value: any) => void,
  formData: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  onOpenAICategoryModal?: (categoryId: string) => void;
}) => {
  const { t } = useLanguage();
  const [isGeneratingCategoryCopy, setIsGeneratingCategoryCopy] = useState(false);

  // El estado vive AQUÍ, totalmente aislado del padre durante el drag
  const [localItems, setLocalItems] = useState(initialCategories);

  // Sincronizar si las categorías cambian externamente (ej: al cargar)
  useEffect(() => {
    setLocalItems(initialCategories);
  }, [initialCategories]);

  const selectedCategory = localItems.find((c: any) => c.id === selectedCategoryId) || localItems[0];

  const catalogConfig = formData.categories_catalog_config || {
    enabled: false,
    title: 'Nuestras Especialidades',
    subtitle: 'Explora todas las áreas de cuidado y tratamientos diseñados para tu bienestar.',
    layout_style: 'bento',
    show_services_count: true,
    hide_individual_sections: false
  };

  const updateCatalogConfig = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      categories_catalog_config: {
        ...(prev.categories_catalog_config || {
          enabled: false,
          title: 'Nuestras Especialidades',
          subtitle: 'Explora todas las áreas de cuidado y tratamientos diseñados para tu bienestar.',
          layout_style: 'bento',
          show_services_count: true,
          hide_individual_sections: false
        }),
        [key]: value
      }
    }));
  };

  const handleGenerateCategoryCopy = async () => {
    if (!selectedCategory) return;
    setIsGeneratingCategoryCopy(true);
    try {
      const promptText = `Genera un nombre comercial elegante y una descripción breve (1 o 2 frases) para una categoría de tratamientos estéticos. Categoría actual: "${selectedCategory.name || ''}"`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: promptText,
          type: 'category_copy',
          tone: 'premium'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al generar datos de categoría con IA');
      }
      const data = await res.json();
      if (data.name) handleCategoryChange(selectedCategory.id, 'name', data.name);
      if (data.description) handleCategoryChange(selectedCategory.id, 'description', data.description);
      toast.success('¡Categoría redactada con éxito!');
    } catch (e: any) {
      toast.error(e.message || 'Error al generar texto con IA');
    } finally {
      setIsGeneratingCategoryCopy(false);
    }
  };

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

      {/* ─── BLOQUE DE MOSAICO GENERAL DE CATEGORÍAS ─── */}
      <div className="p-5 border border-stone-100 rounded-3xl bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-stone-800 block">
              Mosaico de Categorías en Portada
            </span>
            <span className="text-xs text-stone-400">
              Unifica todas las categorías en un Bento/Grid interactivo para navegar.
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateCatalogConfig('enabled', !catalogConfig.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
              catalogConfig.enabled ? 'bg-emerald-500' : 'bg-stone-200'
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                catalogConfig.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {catalogConfig.enabled && (
          <div className="pt-3 border-t border-stone-100 space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1.5">
                Título de la Sección
              </label>
              <input
                type="text"
                value={catalogConfig.title || ''}
                onChange={(e) => updateCatalogConfig('title', e.target.value)}
                placeholder="Ej: Nuestras Especialidades"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-stone-400 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1.5">
                Subtítulo
              </label>
              <input
                type="text"
                value={catalogConfig.subtitle || ''}
                onChange={(e) => updateCatalogConfig('subtitle', e.target.value)}
                placeholder="Breve frase introductoria..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-stone-400 text-xs font-normal"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { value: 'bento', label: 'Bento Luxury', icon: '⊞' },
                { value: 'grid', label: 'Grid Homogéneo', icon: '▦' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateCatalogConfig('layout_style', opt.value)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    (catalogConfig.layout_style || 'bento') === opt.value
                      ? 'bg-stone-900 border-stone-900 text-white shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Toggle Clave: Ocultar secciones individuales */}
            <div className="pt-3 border-t border-stone-100 flex items-start justify-between gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50">
              <div className="flex-1">
                <span className="text-xs font-bold text-stone-800 block">
                  Ocultar despliegue individual de categorías
                </span>
                <span className="text-[11px] text-stone-500 leading-snug block mt-0.5">
                  Mantiene la portada limpia: solo mostrará el Mosaico sin desplegar todas las categorías una por una.
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateCatalogConfig('hide_individual_sections', !catalogConfig.hide_individual_sections)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none mt-0.5 ${
                  catalogConfig.hide_individual_sections ? 'bg-amber-500' : 'bg-stone-200'
                }`}
              >
                <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  catalogConfig.hide_individual_sections ? 'translate-x-[20px]' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
          Detalle y Contenido por Categoría
        </h3>
      </div>
      
      {selectedCategory && (
         <div className="p-5 border border-stone-100 rounded-3xl bg-[#F7F7F5] shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B00]"></div>
            
            <div className="space-y-1">
              <ImageUploadBlock 
                label={t('cms.categories.bg_image')}
                value={selectedCategory.image_url} 
                onSelect={() => setPickerTarget({ type: 'category', id: selectedCategory.id, field: 'image_url' })}
                onClear={() => handleCategoryChange(selectedCategory.id, 'image_url', '')}
                onUpload={(url) => handleCategoryChange(selectedCategory.id, 'image_url', url)}
                onGenerateAI={() => onOpenAICategoryModal?.(selectedCategory.id)}
                accepts="image"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Diseño de Visualización
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'cards_slider', label: 'Slider', icon: '🎞️', tooltip: 'Slider 9:16' },
                  { value: 'bento_grid', label: 'Bento', icon: '⊞', tooltip: 'Bento Grid' },
                  { value: 'traditional_grid', label: 'Grid', icon: '▦', tooltip: 'Grid Tradicional' },
                  { value: 'minimalist_list', label: 'Lista', icon: '☰', tooltip: 'Lista Minimalista' }
                ].map(opt => {
                  const currentStyle = selectedCategory.layout_preferences?.layout_style || 'cards_slider';
                  const isSelected = currentStyle === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const newPrefs = { ...(selectedCategory.layout_preferences || {}), layout_style: opt.value };
                        handleCategoryChange(selectedCategory.id, 'layout_preferences', newPrefs);
                      }}
                      title={opt.tooltip}
                      className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-stone-900 border-stone-900 text-[#FF6B00] shadow-sm'
                          : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                      }`}
                    >
                      <span className="text-base mb-1">{opt.icon}</span>
                      <span className="text-[9px] font-bold tracking-tight leading-none uppercase">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                   {t('cms.categories.public_name')}
                 </label>
                 <button
                   type="button"
                   onClick={handleGenerateCategoryCopy}
                   disabled={isGeneratingCategoryCopy}
                   className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-2 py-0.5 rounded-lg transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                   title="Generar nombre y descripción con IA"
                 >
                   {isGeneratingCategoryCopy ? (
                     <Loader2 size={11} className="animate-spin text-[#FF6B00]" />
                   ) : (
                     <Sparkles size={11} className="text-[#FF6B00]" />
                   )}
                   <span>Generar con IA</span>
                 </button>
               </div>
               <input type="text" value={selectedCategory.name || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 text-sm font-bold shadow-sm transition-colors" />
            </div>
            
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                 {t('cms.categories.short_description')}
               </label>
               <textarea rows={3} value={selectedCategory.description || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'description', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 text-xs font-medium shadow-sm leading-relaxed transition-colors resize-y" placeholder={t('cms.categories.desc_placeholder')} />
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
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-grab active:cursor-grabbing ${selectedCategoryId === cat.id ? 'border-[#FF6B00] bg-white shadow-md' : 'border-stone-100 bg-stone-50/30 hover:bg-white hover:border-stone-200'}`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <div className="flex items-center gap-6">
                  <GripVertical size={16} className="text-stone-300" />
                  <span className={`font-bold text-sm tracking-tight ${selectedCategoryId === cat.id ? 'text-stone-900' : 'text-stone-500'}`}>{cat.name}</span>
                </div>

                <div className="flex items-center gap-6">
                  {selectedCategoryId === cat.id && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-3 py-1 rounded-full">
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
                        const nextVal = !cat.is_active;
                        setLocalItems(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: nextVal } : c));
                        handleCategoryChange(cat.id, 'is_active', nextVal);
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
