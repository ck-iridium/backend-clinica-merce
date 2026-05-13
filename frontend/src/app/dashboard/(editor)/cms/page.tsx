"use client"
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';
import { Skeleton } from "@/components/ui/skeleton";
import HomeBuilderLayout from '@/components/cms/HomeBuilderLayout';
import HomeBuilderPreview from '@/components/cms/HomeBuilderPreview';
import { Reorder } from 'framer-motion';
import { GripVertical, Camera, Trash2, Image as ImageIcon } from 'lucide-react';

const TABS = ['HERO', 'SOBRE MÍ', 'CATEGORÍAS', 'CTA', 'SEO'];

// Componente interno reutilizable para cualquier imagen (Fuera de los componentes para ser accesible por todos)
const ImageUploadBlock = ({ label, value, onSelect, onClear }: { label: string, value: string | null, onSelect: () => void, onClear: () => void }) => {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</label>
      <div className="relative group w-full aspect-video rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-sm transition-all hover:border-stone-300">
        {value ? (
          <img src={value && value.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${value}` : value || ""} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-200">
             <ImageIcon size={40} strokeWidth={1} />
             <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">Sin imagen</span>
          </div>
        )}

        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSelect}
            className="bg-white text-stone-900 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Camera size={14} />
            <span>{value ? 'Cambiar' : 'Seleccionar'}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-rose-600 hover:scale-105 transition-all"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CMSPage() {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('HERO');

  // Preview Order State
  const [sections, setSections] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Media Picker state generalizado
  const [pickerTarget, setPickerTarget] = useState<{ type: 'form' | 'category', id?: string, field: string } | null>(null);

  const defaultContent = {
    hero_title: '', hero_subtitle: '', hero_button_text: '', hero_button_link: '',
    hero_image_url: '', hero_video_url: '', hero_alignment: 'center', hero_horizontal_alignment: 'center',
    hero_show_button: true,
    about_title: '', about_text: '', about_image_url: '', about_layout: 'right',
    about_show_button: false, about_button_text: 'Saber Más', about_button_link: '/contacto',
    cta_title: '', cta_subtitle: '', cta_button_text: '', cta_button_link: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    home_sections_order: ''
  };

  const [formData, setFormData] = useState<any>(defaultContent);
  const [categories, setCategories] = useState<any[]>([]); // Fuente de verdad (Preview y Save)
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const memoizedPreview = useMemo(() => (
    <HomeBuilderPreview 
      formData={formData}
      categories={categories}
      services={services}
    />
  ), [formData, categories, services]);

  const fetchContent = async () => {
    try {
      const [resContent, resCats, resServices] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
      ]);
      
      if (resContent.ok && resCats.ok && resServices.ok) {
        const data = await resContent.json();
        const cats = await resCats.json();
        const svcs = await resServices.json();
        
        setFormData(data);
        setCategories(cats);
        setServices(svcs);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);

        // Configurar secciones para la preview visual
        const baseSections = [
          { id: 'hero', type: 'hero', label: 'Portada Principal (Hero)', locked: true },
          { id: 'about', type: 'about', label: 'Sobre la Clínica', locked: false },
          { id: 'cta', type: 'cta', label: 'Llamada a la Acción', locked: false },
          { id: 'seo', type: 'seo', label: 'SEO', locked: true }
        ];

        const catSections = cats.map((c: any) => ({
          id: c.id,
          type: 'category',
          label: c.name,
          locked: false
        }));

        const allAvailable = [...baseSections, ...catSections];
        let ordered: any[] = [];

        if (data.home_sections_order) {
           try {
             const savedOrder = JSON.parse(data.home_sections_order);
             savedOrder.forEach((id: string) => {
               const found = allAvailable.find(s => s.id === id);
               if (found) ordered.push(found);
             });
             allAvailable.forEach(s => {
               if (!ordered.find(o => o.id === s.id)) ordered.push(s);
             });
           } catch {
             ordered = [baseSections[0], baseSections[1], ...catSections, baseSections[2], baseSections[3]];
           }
        } else {
           ordered = [baseSections[0], baseSections[1], ...catSections, baseSections[2], baseSections[3]];
        }
        
        const hero = ordered.find(s => s.id === 'hero');
        const seo = ordered.find(s => s.id === 'seo');
        const middle = ordered.filter(s => s.id !== 'hero' && s.id !== 'seo');
        
        setSections([hero, ...middle, seo]);
      }
    } catch (err) {
      console.error("Error cargando el CMS", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Guardar orden global y site-content
      const orderToSave = sections.map(s => s.id);
      const payload = {
        ...formData,
        home_sections_order: JSON.stringify(orderToSave)
      };

      const resContent = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // 2. Sincronizar reordenamiento de categorías
      const categoryItems = sections.filter(s => s.type === 'category');
      const reorderPayload = categoryItems.map((c, index) => ({
         id: c.id,
         order_index: index
      }));
      
      if (reorderPayload.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/reorder`, {
          method: 'POST', // Modificado a POST como medida anti-CORS
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reorderPayload)
        });
      }

      // 3. Guardar metadatos de las categorías que pudieron haber sido editados
      const categoryPromises = categories.map(cat => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${cat.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             name: cat.name,
             description: cat.description,
             image_url: cat.image_url,
             is_active: cat.is_active
          })
        })
      );
      await Promise.all(categoryPromises);

      if (resContent.ok) {
        showFeedback({ type: 'success', title: 'Home Guardada', message: 'Contenido, orden y categorías actualizados.' });
        // Recargar los datos localmente para asegurar sincronía, opcional
      } else {
        throw new Error('Falló al guardar site content');
      }
    } catch (err) {
      console.error(err);
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo guardar correctamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelected = (url: string) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'form') {
      setFormData((prev: any) => ({ ...prev, [pickerTarget.field]: url }));
    } else if (pickerTarget.type === 'category' && pickerTarget.id) {
      setCategories(prev => prev.map(cat => 
        cat.id === pickerTarget.id ? { ...cat, [pickerTarget.field]: url } : cat
      ));
    }
    setPickerTarget(null);
  };

  const handleCategoryChange = (id: string, field: string, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
    
    // También actualizar la etiqueta en la sección de preview si cambia el nombre
    if (field === 'name') {
      setSections(prev => prev.map(sec => 
        sec.id === id ? { ...sec, label: value } : sec
      ));
    }
  };


  const renderActiveTabContent = () => {
    if (activeTab === 'HERO') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ImageUploadBlock 
            label="Imagen Principal (Fondo)" 
            value={formData.hero_image_url} 
            onSelect={() => setPickerTarget({ type: 'form', field: 'hero_image_url' })} 
            onClear={() => setFormData({...formData, hero_image_url: ''})} 
          />
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Título Principal (H1)</label>
              <input type="text" value={formData.hero_title || ""} onChange={e => setFormData({...formData, hero_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-serif font-bold text-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Subtítulo</label>
              <textarea rows={2} value={formData.hero_subtitle || ""} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-medium text-sm" />
            </div>
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Botón de Acción</label>
                <button 
                  onClick={() => setFormData({...formData, hero_show_button: !formData.hero_show_button})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hero_show_button ? 'bg-[#d4af37]' : 'bg-stone-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hero_show_button ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {formData.hero_show_button && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Texto Botón</label>
                    <input type="text" value={formData.hero_button_text || ""} onChange={e => setFormData({...formData, hero_button_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Enlace Botón</label>
                    <input type="text" value={formData.hero_button_link || ""} onChange={e => setFormData({...formData, hero_button_link: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Alineación Vertical</label>
                <select value={formData.hero_alignment || "center"} onChange={e => setFormData({...formData, hero_alignment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold">
                  <option value="top">Superior</option>
                  <option value="center">Centrado</option>
                  <option value="bottom">Inferior</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Alineación Horizontal</label>
                <select value={formData.hero_horizontal_alignment || "center"} onChange={e => setFormData({...formData, hero_horizontal_alignment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold">
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/30 mt-8">
            <ImageUploadBlock 
              label="Video de Fondo (Opcional - Reemplaza la imagen)" 
              value={formData.hero_video_url} 
              onSelect={() => setPickerTarget({ type: 'form', field: 'hero_video_url' })} 
              onClear={() => setFormData({...formData, hero_video_url: ''})} 
            />
          </div>
        </div>
      );
    }
    
    if (activeTab === 'SOBRE MÍ') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6">
             <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Sobre la Clínica</h2>
             <p className="text-stone-500">Construye confianza explicando tu filosofía o presentando a tu equipo.</p>
          </div>
          <ImageUploadBlock 
            label="Fotografía de Perfil / Clínica" 
            value={formData.about_image_url} 
            onSelect={() => setPickerTarget({ type: 'form', field: 'about_image_url' })} 
            onClear={() => setFormData({...formData, about_image_url: ''})} 
          />
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Posición Imagen</label>
                  <select value={formData.about_layout || "right"} onChange={e => setFormData({...formData, about_layout: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold">
                    <option value="left">Imagen a la Izquierda</option>
                    <option value="right">Imagen a la Derecha</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Título de la Sección</label>
                  <input type="text" value={formData.about_title || ""} onChange={e => setFormData({...formData, about_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Biografía / Filosofía</label>
              <textarea rows={8} value={formData.about_text || ""} onChange={e => setFormData({...formData, about_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium leading-relaxed" />
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Botón de Acción (Opcional)</label>
                <button 
                  onClick={() => setFormData({...formData, about_show_button: !formData.about_show_button})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.about_show_button ? 'bg-[#d4af37]' : 'bg-stone-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.about_show_button ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {formData.about_show_button && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Texto Botón</label>
                    <input type="text" value={formData.about_button_text || ""} onChange={e => setFormData({...formData, about_button_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Enlace Botón</label>
                    <input type="text" value={formData.about_button_link || ""} onChange={e => setFormData({...formData, about_button_link: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'DESTACADOS') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-2">
             <h2 className="text-lg font-serif font-bold text-stone-900 leading-tight">Servicios Destacados</h2>
             <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">Gestiona qué tratamientos aparecen en portada</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {services.map((svc) => (
              <div key={svc.id} className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-between hover:border-stone-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden border border-stone-100 shrink-0">
                    {svc.image_url ? (
                      <img src={svc.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${svc.image_url}` : svc.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-200">
                        <Sparkles size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800 leading-tight">{svc.name}</p>
                    <p className="text-[10px] text-stone-400 font-medium">{categories.find(c => c.id === svc.category_id)?.name || 'Sin categoría'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   {/* Toggle Destacado */}
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[8px] font-black uppercase tracking-tighter text-stone-400">Destacar</span>
                      <button 
                        onClick={() => handleServiceToggle(svc.id, 'is_featured')}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${svc.is_featured ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
                      >
                        <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${svc.is_featured ? 'translate-x-[20px]' : 'translate-x-1'}`} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'CATEGORÍAS') {
      return (
        <CategoriesTab 
          initialCategories={categories}
          setCategories={setCategories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          setPickerTarget={setPickerTarget}
          handleCategoryChange={handleCategoryChange}
        />
      );
    }

    if (activeTab === 'CTA') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6">
             <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Llamada a la Acción (CTA)</h2>
             <p className="text-stone-500">El bloque de cierre de tu web, justo antes del footer.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Título CTA</label>
              <input type="text" value={formData.cta_title || ""} onChange={e => setFormData({...formData, cta_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Subtítulo CTA</label>
              <input type="text" value={formData.cta_subtitle || ""} onChange={e => setFormData({...formData, cta_subtitle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Texto Botón</label>
                <input type="text" value={formData.cta_button_text || ""} onChange={e => setFormData({...formData, cta_button_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Enlace</label>
                <input type="text" value={formData.cta_button_link || ""} onChange={e => setFormData({...formData, cta_button_link: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'SEO') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6">
             <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Metadatos SEO</h2>
             <p className="text-stone-500">Configuración invisible que leen los buscadores como Google o al compartir en WhatsApp.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Título de la Página (H1 Global)</label>
              <input type="text" value={formData.seo_title || ""} onChange={e => setFormData({...formData, seo_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" placeholder="Ej: Clínica Merce | Medicina Estética Avanzada" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Descripción (Extracto)</label>
              <textarea rows={4} value={formData.seo_description || ""} onChange={e => setFormData({...formData, seo_description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Palabras Clave (Separadas por comas)</label>
              <input type="text" value={formData.seo_keywords || ""} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-20 w-full mb-8 rounded-3xl" />
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <HomeBuilderLayout 
        isSaving={saving}
        onSave={handleSave}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        panel={renderActiveTabContent()}
        preview={memoizedPreview}
      />
      
      {/* Selector de Medios */}
      {pickerTarget && (
        <MediaPickerModal
          onClose={() => setPickerTarget(null)}
          onImageSelected={handleImageSelected}
        />
      )}
    </div>
  );
}

// Componente Aislado para la pestaña de categorías (Soluciona LAG y OFFSET)
const CategoriesTab = memo(({ 
  initialCategories, 
  setCategories, 
  selectedCategoryId, 
  setSelectedCategoryId, 
  setPickerTarget, 
  handleCategoryChange 
}: any) => {
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
         <h2 className="text-lg font-serif font-bold text-stone-900 leading-tight">Edición de Categorías</h2>
         <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">Gestiona el contenido y el orden</p>
      </div>
      
      {selectedCategory && (
        <div className="p-5 border border-stone-100 rounded-3xl bg-[#F7F7F5] shadow-sm space-y-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
           
           <div className="space-y-1">
             <ImageUploadBlock 
               label="Imagen de Fondo" 
               value={selectedCategory.image_url} 
               onSelect={() => setPickerTarget({ type: 'category', id: selectedCategory.id, field: 'image_url' })}
               onClear={() => handleCategoryChange(selectedCategory.id, 'image_url', '')}
             />
           </div>
           
           <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Nombre Público</label>
              <input type="text" value={selectedCategory.name || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-sm font-bold shadow-sm transition-all" />
           </div>
           
           <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Descripción Corta</label>
              <textarea rows={3} value={selectedCategory.description || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'description', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-xs font-medium shadow-sm leading-relaxed transition-all" placeholder="Ej: Especialistas en potenciar tu mirada natural..." />
           </div>
        </div>
      )}

      <div className="pt-4 border-t border-stone-200">
         <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4">Orden de Categorías</h3>
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
                      Editando
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2 border-l border-stone-100 pl-4">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${cat.is_active ? 'text-emerald-500' : 'text-stone-300'}`}>
                      {cat.is_active ? 'Visible' : 'Oculta'}
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
