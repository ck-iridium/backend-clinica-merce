"use client"
import { useState, useEffect } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';

export default function CMSPage() {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Media Picker state
  const [pickerFieldName, setPickerFieldName] = useState<string | null>(null);
  const [uploadingFieldName, setUploadingFieldName] = useState<string | null>(null);

  const defaultContent = {
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    hero_button_link: '',
    hero_image_url: '',
    about_title: '',
    about_text: '',
    about_image_url: '',
    cta_title: '',
    cta_subtitle: '',
    cta_button_text: '',
    cta_button_link: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  };

  const [formData, setFormData] = useState(defaultContent);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showFeedback({ type: 'success', title: 'Éxito', message: 'Contenido actualizado exitosamente.' });
      } else {
        showFeedback({ type: 'error', title: 'Error', message: 'Error al actualizar contenido.' });
      }
    } catch (err) {
      showFeedback({ type: 'error', title: 'Error', message: 'Error de conexión al servidor.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelected = (fieldName: string, url: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: url }));
    setPickerFieldName(null);
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="bg-card rounded-[2.5rem] border border-border/40 p-10 h-96 shadow-sm">
           <Skeleton className="h-12 w-full mb-8" />
           <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const ImageUploadBlock = ({ label, fieldName }: { label: string, fieldName: keyof typeof defaultContent }) => {
    const val = formData[fieldName];
    const isUploading = uploadingFieldName === fieldName;

    return (
      <div className="mb-8 p-8 border border-border/40 bg-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
        <label className="block text-sm font-bold text-foreground mb-4 font-sans">{label}</label>
        <div className="flex items-center gap-8">
          {(val || isUploading) && (
            <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-inner shrink-0 bg-muted/30 p-1.5 relative border border-border/50">
              {isUploading ? (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center animate-in fade-in z-10 backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : null}
              {val && <img src={val.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${val}` : val} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-sm" />}
            </div>
          )}
          <div className="flex-1 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setPickerFieldName(String(fieldName))}
              className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 w-fit"
            >
              <span className="text-lg">🖼️</span>
              <span>Seleccionar imagen</span>
            </button>
            {val && !isUploading && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({...prev, [fieldName]: ''}))}
                className="text-xs font-bold text-destructive hover:text-destructive/80 transition-colors text-left w-fit px-2"
              >
                Quitar imagen actual
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-stone-800">Editor Web (CMS)</h1>
        <p className="text-muted-foreground mt-2 text-sm font-sans">Personaliza los textos e imágenes principales de tu web pública.</p>
        <p className="text-muted-foreground/70 mt-1 text-xs italic">Nota: Los datos de contacto se configuran desde Ajustes globales.</p>
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/40 overflow-hidden">
        <div className="flex border-b border-border/50 overflow-x-auto custom-scrollbar font-sans px-4">
          <button 
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'hero' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-stone-500 hover:bg-stone-50'}`}>
            Portada (Hero)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'about' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-stone-500 hover:bg-stone-50'}`}>
            Sobre Mí
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('cta')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'cta' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-stone-500 hover:bg-stone-50'}`}>
            Llamada a la Acción (CTA)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'seo' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-stone-500 hover:bg-stone-50'}`}>
            SEO y Redes Sociales
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-12 font-sans font-medium">
          {activeTab === 'hero' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 border-b border-border/30 pb-4">Bloque Principal (Portada)</h2>
              
              <ImageUploadBlock label="Imagen Principal (Hero Background)" fieldName="hero_image_url" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Título Principal (H1)</label>
                  <input required type="text" value={formData.hero_title || ""} onChange={e => setFormData({...formData, hero_title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-xl font-bold shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Subtítulo (Opcional)</label>
                  <textarea rows={2} value={formData.hero_subtitle || ""} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Texto del Botón Principal</label>
                  <input type="text" value={formData.hero_button_text || ""} onChange={e => setFormData({...formData, hero_button_text: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Enlace del Botón</label>
                  <input type="text" value={formData.hero_button_link || ""} onChange={e => setFormData({...formData, hero_button_link: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" placeholder="Ej: /servicios o #contacto" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 border-b border-border/30 pb-4">Bloque "Sobre la Clínica"</h2>
              
              <ImageUploadBlock label="Fotografía de Presentación" fieldName="about_image_url" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Título de la Sección</label>
                  <input type="text" value={formData.about_title || ""} onChange={e => setFormData({...formData, about_title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold shadow-sm text-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Texto Biografía / Filosofía</label>
                  <textarea rows={6} value={formData.about_text || ""} onChange={e => setFormData({...formData, about_text: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm leading-relaxed" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 border-b border-border/30 pb-4">Despedida (Llamada a la Acción)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Título CTA</label>
                  <input type="text" value={formData.cta_title || ""} onChange={e => setFormData({...formData, cta_title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold shadow-sm text-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Subtítulo CTA</label>
                  <input type="text" value={formData.cta_subtitle || ""} onChange={e => setFormData({...formData, cta_subtitle: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Texto del Botón</label>
                  <input type="text" value={formData.cta_button_text || ""} onChange={e => setFormData({...formData, cta_button_text: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Enlace del Botón</label>
                  <input type="text" value={formData.cta_button_link || ""} onChange={e => setFormData({...formData, cta_button_link: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" placeholder="Ej: /reserva" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 border-b border-border/30 pb-4">Optimización Redes y Buscadores</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Título de la Página (SEO H1)</label>
                  <input type="text" value={formData.seo_title || ""} onChange={e => setFormData({...formData, seo_title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold shadow-sm" placeholder="Ej: Clínica Merce | Estética Avanzada" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Descripción (Extracto Meta)</label>
                  <textarea rows={3} value={formData.seo_description || ""} onChange={e => setFormData({...formData, seo_description: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm" placeholder="Resumen de 1-2 frases para convencer en Google..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-foreground mb-3">Palabras Clave (Separadas por comas)</label>
                  <input type="text" value={formData.seo_keywords || ""} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-stone-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-sm cursor-text" placeholder="estética, láser, belleza..." />
                </div>
              </div>
              
              <div className="p-8 bg-muted/50 rounded-3xl border border-border/50 flex gap-6 mt-8 shadow-inner shadow-black/5">
                 <div className="text-3xl shrink-0">📱</div>
                 <div>
                    <h3 className="font-bold text-stone-800 text-sm mb-1 font-sans">Previsualización Social Automática</h3>
                    <p className="text-sm text-muted-foreground font-medium">Cuando pegues tu enlace en WhatsApp o redes sociales, automáticamente usaremos estos textos y la <b>Imagen Principal</b> definida en la pestaña Portada.</p>
                 </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border/40 flex justify-end">
            <button disabled={saving} type="submit" className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-base">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
      {/* Media Picker Modal */}
      {pickerFieldName && (
        <MediaPickerModal
          onClose={() => setPickerFieldName(null)}
          onImageSelected={(url) => handleImageSelected(pickerFieldName, url)}
        />
      )}
    </div>
  );
}
