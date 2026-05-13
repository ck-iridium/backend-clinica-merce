"use client"
import { useState, useEffect } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';
import { Skeleton } from "@/components/ui/skeleton";
import HomeBuilderLayout from '@/components/cms/HomeBuilderLayout';
import HomeBuilderPreview from '@/components/cms/HomeBuilderPreview';
import { Reorder } from 'framer-motion';
import { GripVertical, Camera, Trash2, Image as ImageIcon } from 'lucide-react';

const TABS = ['HERO', 'SOBRE MÍ', 'CATEGORÍAS', 'CTA', 'SEO'];

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
    hero_image_url: '', hero_video_url: '', hero_alignment: 'center',
    about_title: '', about_text: '', about_image_url: '',
    cta_title: '', cta_subtitle: '', cta_button_text: '', cta_button_link: '',
    seo_title: '', seo_description: '', seo_keywords: '',
    home_sections_order: ''
  };

  const [formData, setFormData] = useState<any>(defaultContent);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

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
             image_url: cat.image_url
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

  const handleCategoryChange = (id: string, field: string, value: string) => {
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

  // Componente interno reutilizable para cualquier imagen
  const ImageUploadBlock = ({ label, value, onSelect, onClear }: { label: string, value: string | null, onSelect: () => void, onClear: () => void }) => {
    return (
      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</label>
        <div className="relative group w-full aspect-video rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-sm transition-all hover:border-stone-300">
          {value ? (
            <img src={value.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${value}` : value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-200">
               <ImageIcon size={40} strokeWidth={1} />
               <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">Sin imagen</span>
            </div>
          )}

          {/* Overlay de Controles (Solo visible en hover) */}
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

  const renderActiveTabContent = () => {
    if (activeTab === 'HERO') {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6">
             <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Portada Principal</h2>
             <p className="text-stone-500">Lo primero que ven tus clientes. Diseña un recibimiento impactante.</p>
          </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Texto Botón</label>
                <input type="text" value={formData.hero_button_text || ""} onChange={e => setFormData({...formData, hero_button_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Enlace Botón</label>
                <input type="text" value={formData.hero_button_link || ""} onChange={e => setFormData({...formData, hero_button_link: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Alineación Visual</label>
              <select value={formData.hero_alignment || "center"} onChange={e => setFormData({...formData, hero_alignment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold">
                <option value="top">Superior (Alineado arriba)</option>
                <option value="center">Centrado Absoluto</option>
                <option value="bottom">Inferior (Alineado abajo)</option>
              </select>
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Título de la Sección</label>
              <input type="text" value={formData.about_title || ""} onChange={e => setFormData({...formData, about_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Biografía / Filosofía</label>
              <textarea rows={8} value={formData.about_text || ""} onChange={e => setFormData({...formData, about_text: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'CATEGORÍAS') {
      const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-2">
             <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">Edición de Categorías</h2>
             <p className="text-xs text-stone-500">Gestiona el contenido y el orden de tus servicios.</p>
          </div>
          
          {selectedCategory && (
            <div className="p-6 border border-stone-100 rounded-3xl bg-[#F7F7F5] shadow-sm space-y-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d4af37]"></div>
               
               {/* Fila 1: Imagen y Acciones */}
               <ImageUploadBlock 
                 label="Fondo de Categoría" 
                 value={selectedCategory.image_url} 
                 onSelect={() => setPickerTarget({ type: 'category', id: selectedCategory.id, field: 'image_url' })}
                 onClear={() => handleCategoryChange(selectedCategory.id, 'image_url', '')}
               />
               
               {/* Fila 2: Nombre */}
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Nombre Público</label>
                  <input type="text" value={selectedCategory.name || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-sm font-bold shadow-sm transition-all" />
               </div>
               
               {/* Fila 3: Descripción */}
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Descripción Corta</label>
                  <textarea rows={3} value={selectedCategory.description || ""} onChange={e => handleCategoryChange(selectedCategory.id, 'description', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 text-xs font-medium shadow-sm leading-relaxed transition-all" placeholder="Ej: Especialistas en potenciar tu mirada natural..." />
               </div>
            </div>
          )}

          <div className="pt-6 border-t border-stone-200">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Lista de Categorías (Orden)</h3>
             <Reorder.Group axis="y" values={categories} onReorder={setCategories} className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <Reorder.Item 
                    key={cat.id} 
                    value={cat}
                    className={`p-5 rounded-2xl border flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${selectedCategoryId === cat.id ? 'border-[#d4af37] bg-white shadow-lg ring-1 ring-[#d4af37]/10' : 'border-stone-100 bg-stone-50/30 hover:bg-white hover:border-stone-200 hover:shadow-md'}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical size={18} className="text-stone-300" />
                      <span className={`font-bold text-base tracking-tight ${selectedCategoryId === cat.id ? 'text-stone-900' : 'text-stone-500'}`}>{cat.name}</span>
                    </div>
                    {selectedCategoryId === cat.id && <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/5 px-3 py-1.5 rounded-full">Activa</span>}
                  </Reorder.Item>
                ))}
             </Reorder.Group>
          </div>
        </div>
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
        preview={
          <HomeBuilderPreview 
            formData={formData}
            categories={categories}
            services={services}
          />
        }
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
