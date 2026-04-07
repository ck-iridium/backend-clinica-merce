"use client"
import { useState, useEffect } from 'react';

export default function CMSPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

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
        alert("Contenido actualizado exitosamente.");
      } else {
        alert("Error al actualizar contenido.");
      }
    } catch (err) {
      alert("Error de conexión al servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
        method: "POST",
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      } else {
        alert("Error al subir la imagen");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) {
    return <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-yellow-100 border-t-[#d4af37] rounded-full animate-spin"></div></div>;
  }

  const ImageUploadBlock = ({ label, fieldName }: { label: string, fieldName: keyof typeof defaultContent }) => {
    const val = formData[fieldName];
    return (
      <div className="mb-6 p-6 border border-stone-100 bg-stone-50 rounded-2xl">
        <label className="block text-sm font-semibold text-stone-700 mb-4">{label}</label>
        <div className="flex items-center gap-6">
          {val && (
            <div className="w-32 h-32 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white p-1">
              <img src={val.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${val}` : val} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            </div>
          )}
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, fieldName)}
              className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37] file:text-white hover:file:bg-[#b08e23] transition-all cursor-pointer"
            />
            {val && <button type="button" onClick={() => setFormData(prev => ({...prev, [fieldName]: ''}))} className="mt-4 text-xs font-bold font-stone-500 text-red-500 hover:underline">Quitar imagen</button>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800">Editor Web (CMS)</h1>
        <p className="text-stone-500 mt-2 font-medium">Personaliza los textos e imágenes principales de tu web pública.</p>
        <p className="text-stone-400 mt-1 text-sm italic">Nota: Los datos de contacto (Teléfono, Dirección, RRSS) se configuran desde Ajustes globales.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="flex border-b border-stone-100 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('hero')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'hero' ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-yellow-50/30' : 'text-stone-500 hover:bg-stone-50'}`}>
            Portada (Hero)
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'about' ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-yellow-50/30' : 'text-stone-500 hover:bg-stone-50'}`}>
            Sobre Mí
          </button>
          <button 
            onClick={() => setActiveTab('cta')}
            className={`px-8 py-5 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'cta' ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-yellow-50/30' : 'text-stone-500 hover:bg-stone-50'}`}>
            Llamada a la Acción (CTA)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Bloque Principal (Arriba)</h2>
              
              <ImageUploadBlock label="Imagen Principal (Fondo o Lado)" fieldName="hero_image_url" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Título Principal (H1)</label>
                  <input required type="text" value={formData.hero_title} onChange={e => setFormData({...formData, hero_title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-xl font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Subtítulo (Opcional)</label>
                  <textarea rows={2} value={formData.hero_subtitle} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Texto del Botón</label>
                  <input type="text" value={formData.hero_button_text} onChange={e => setFormData({...formData, hero_button_text: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Enlace del Botón</label>
                  <input type="text" value={formData.hero_button_link} onChange={e => setFormData({...formData, hero_button_link: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Ej: /tratamientos o #contacto" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Bloque "Sobre Mí" o Filosofía</h2>
              
              <ImageUploadBlock label="Foto Perfil o Clínica" fieldName="about_image_url" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Título de la Sección</label>
                  <input type="text" value={formData.about_title} onChange={e => setFormData({...formData, about_title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-xl font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Texto Biografía / Filosofía</label>
                  <textarea rows={6} value={formData.about_text} onChange={e => setFormData({...formData, about_text: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cta' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Bloque Final (Llamada a la Acción)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Título CTA</label>
                  <input type="text" value={formData.cta_title} onChange={e => setFormData({...formData, cta_title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-xl font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Subtítulo CTA</label>
                  <input type="text" value={formData.cta_subtitle} onChange={e => setFormData({...formData, cta_subtitle: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Texto del Botón</label>
                  <input type="text" value={formData.cta_button_text} onChange={e => setFormData({...formData, cta_button_text: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Enlace del Botón</label>
                  <input type="text" value={formData.cta_button_link} onChange={e => setFormData({...formData, cta_button_link: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Ej: https://wa.me/346..." />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-stone-100 flex justify-end">
            <button disabled={saving} type="submit" className="bg-stone-900 hover:bg-[#d4af37] disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
