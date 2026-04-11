"use client"
import { useState, useEffect, useRef } from 'react';
import CropImageModal from '@/components/CropImageModal';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryImage, setEditingCategoryImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const defaultForm = { name: '', description: '', duration_minutes: 30, price: 0, is_active: true, category_id: '', is_featured: false, image_url: '', seo_title: '', seo_description: '', seo_keywords: '' };
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Bloqueo de scroll cuando hay modales abiertos
  useEffect(() => {
    if (showForm || showManageCategoriesModal || showCategoryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showForm, showManageCategoriesModal, showCategoryModal]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`);
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`);
      if (res.ok) setServices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (svc: any) => {
    setEditingId(svc.id);
    setFormData({
      name: svc.name,
      description: svc.description || '',
      duration_minutes: svc.duration_minutes,
      price: svc.price,
      is_active: svc.is_active,
      category_id: svc.category_id || '',
      is_featured: svc.is_featured || false,
      image_url: svc.image_url || '',
      seo_title: svc.seo_title || '',
      seo_description: svc.seo_description || '',
      seo_keywords: svc.seo_keywords || ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setSaving(true);
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/services/${editingId}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/services/`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchServices();
        handleCancel();
      } else {
        alert("Error al guardar el servicio.");
      }
    } catch (err) {
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

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
      } else {
        const errorData = await res.json();
        alert(`Error al crear categoría: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (err) {
      alert("Error de conexión al crear categoría.");
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
        fetchServices(); // Refresh to see updated category names
      } else {
        alert("Error al actualizar categoría.");
      }
    } catch (err) {
      alert("Error de conexión al actualizar categoría.");
    }
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditingCategoryImage(data.url);
      } else {
        alert("Error al subir la imagen");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const handleServiceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setSelectedImageForCrop(reader.result?.toString() || "");
      setShowCropModal(true);
    });
    reader.readAsDataURL(e.target.files[0]);
  };

  const onServiceCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);
    setSelectedImageForCrop('');
    
    // Subir el blob como archivo
    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", croppedBlob, "cropped_service_image.webp");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
        method: "POST",
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert("Error al guardar la imagen recortada en la nube");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const hasServices = services.some(s => s.category_id === catId);
    if (hasServices) {
      alert("⚠️ No puedes borrar una categoría con servicios asignados. Mueve los servicios a otra categoría primero.");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${catId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert("Error al eliminar categoría.");
      }
    } catch (err) {
      alert("Error de conexión.");
    }
  };

  const filteredServices = showArchived 
    ? services 
    : services.filter(s => s.is_active);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "General";
  
  const groupedServices = filteredServices.reduce((acc, svc) => {
    const catName = getCategoryName(svc.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(svc);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">Catálogo de Servicios</h1>
          <p className="text-stone-500 mt-1 font-medium">Tratamientos, tiempos estimativos y tarifas base</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showArchived ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
            {showArchived ? 'Ocultar Archivados' : 'Ver Archivados'}
          </button>
          <button 
            onClick={() => setShowManageCategoriesModal(true)}
            className="px-4 py-3 rounded-xl bg-white text-stone-600 border border-stone-200 font-bold transition-all hover:bg-stone-50 active:scale-95 shadow-sm flex items-center gap-2">
            <span>⚙️</span> <span className="hidden sm:inline">Categorías</span>
          </button>
          <button 
            onClick={() => showForm ? handleCancel() : setShowForm(true)}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${showForm ? 'bg-stone-200 text-stone-700' : 'bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white'}`}>
            {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
          </button>
        </div>
      </div>

      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 md:p-6 sm:p-2 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden relative animate-in zoom-in-95 fade-in duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            {/* Header del Modal */}
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-stone-50 relative z-10">
              <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">✨</span>
                {editingId ? 'Editar Técnica de Tratamiento' : 'Alta Técnica de Tratamiento'}
              </h2>
              <button 
                onClick={handleCancel}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-800 transition-all text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Sección de Imagen del Tratamiento */}
              <div className="mb-8 flex gap-6 items-start bg-stone-50 border border-stone-200 p-6 rounded-[2rem]">
                 {uploadingImage ? (
                    <div className="w-32 h-32 rounded-2xl bg-white border border-stone-200 flex flex-col justify-center items-center shrink-0">
                       <div className="w-8 h-8 border-4 border-yellow-100 border-t-[#d4af37] rounded-full animate-spin mb-2"></div>
                       <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest text-center px-2">Subiendo...</span>
                    </div>
                 ) : formData.image_url ? (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0">
                       <img src={formData.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formData.image_url}` : formData.image_url} alt="Tratamiento" className="w-full h-full object-cover" />
                    </div>
                 ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white border border-stone-200 border-dashed flex flex-col justify-center items-center shrink-0">
                       <span className="text-2xl mb-1">🖼️</span>
                       <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center px-2">Sin Foto</span>
                    </div>
                 )}
                 <div className="flex-1">
                    <h3 className="font-bold text-stone-800 mb-2">Imagen del Catálogo</h3>
                    <p className="text-sm text-stone-500 mb-4 leading-relaxed">Selecciona una imagen atractiva que ilustre el tratamiento. Podrás enfocar y recortar la parte importante en el siguiente paso.</p>
                    <input type="file" ref={imgInputRef} accept="image/*" className="hidden" onChange={handleServiceImageSelect} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => imgInputRef.current?.click()} className="px-5 py-2.5 rounded-xl font-bold bg-white border border-stone-200 shadow-sm text-stone-600 hover:text-[#d4af37] text-sm transition-colors">
                        Subir Imagen
                      </button>
                      {formData.image_url && (
                        <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="px-5 py-2.5 rounded-xl font-bold bg-red-50 text-red-600 text-sm transition-colors hover:bg-red-100">
                          Quitar
                        </button>
                      )}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Nombre del servicio *</label>
                  <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Ej: Láser Axilas" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Descripción pública</label>
                  <input type="text" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="El tratamiento perfecto para..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Duración (minutos) *</label>
                  <input required type="number" min="5" step="5" value={formData.duration_minutes || 0} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                  <p className="text-xs text-stone-400 mt-2 font-medium">Reserva el hueco total bloqueado en Agenda.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Precio Base (€) *</label>
                  <input required type="number" min="0" step="0.5" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Categoría *</label>
                  <div className="flex gap-2">
                    <select required value={formData.category_id || ""} onChange={e => setFormData({...formData, category_id: e.target.value})} className="flex-1 px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all appearance-none cursor-pointer">
                      <option value="">-- Selecciona una categoría --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowCategoryModal(true)} className="px-4 py-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold transition-all text-sm border border-stone-200 shrink-0">
                      + Nueva Categoría
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-5 mt-2 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active} 
                        onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className={`text-sm font-bold transition-colors ${formData.is_active ? 'text-emerald-700' : 'text-stone-500'}`}>
                      {formData.is_active ? 'Servicio Activo (Visible en Agenda)' : 'Servicio Archivado (Oculto)'}
                    </span>
                  </label>
                  
                  <div className="h-px bg-stone-200 w-full"></div>

                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured} 
                        onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_featured ? 'bg-[#d4af37]' : 'bg-stone-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_featured ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold transition-colors ${formData.is_featured ? 'text-[#b08e23]' : 'text-stone-500'}`}>
                        {formData.is_featured ? 'Destacado en Portada' : 'Servicio Normal'}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">Marcando esta opción, el tratamiento aparecerá en el slider de la web pública.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* BLOQUE SEO */}
              <div className="mt-8 border border-stone-100 bg-stone-50/50 rounded-2xl overflow-hidden">
                <details className="group">
                  <summary className="font-extrabold text-stone-700 bg-stone-100/50 px-6 py-4 cursor-pointer hover:bg-stone-100 transition-colors list-none flex justify-between items-center">
                     <div>
                       <span className="text-lg">⚙️</span> Configuración SEO <span className="font-normal text-sm text-stone-400 ml-2">(Opcional)</span>
                     </div>
                     <span className="text-stone-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="p-6 grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Título de la Página (Meta Title)</label>
                      <input type="text" value={formData.seo_title || ""} onChange={e => setFormData({...formData, seo_title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder={`Ej: ${formData.name || 'Tratamiento'} en Clínica Merce`} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Descripción Corta (Meta Description)</label>
                      <textarea rows={3} value={formData.seo_description || ""} onChange={e => setFormData({...formData, seo_description: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="Resumen persuasivo de 150 caracteres sobre este tratamiento..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Palabras Clave (Meta Keywords)</label>
                      <input type="text" value={formData.seo_keywords || ""} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" placeholder="láser, depilación, axilas, tratamiento..." />
                    </div>
                  </div>
                </details>
              </div>

            </form>
            <div className="p-6 md:p-8 bg-stone-50/50 border-t border-stone-100 flex justify-end gap-4 relative z-10">
              <button onClick={handleCancel} type="button" className="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-all active:scale-95">
                Cancelar
              </button>
              <button disabled={saving} onClick={handleSubmit} type="button" className="bg-stone-900 hover:bg-[#d4af37] disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 min-w-[200px]">
                {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir Servicio')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && (
        <CropImageModal 
          imageSrc={selectedImageForCrop}
          onClose={() => {setShowCropModal(false); setSelectedImageForCrop('');}}
          onCropComplete={onServiceCropComplete}
        />
      )}

      {/* Grid of Services */}
      {loading ? (
        <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-yellow-100 border-t-[#d4af37] rounded-full animate-spin"></div></div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-24 text-stone-400 bg-stone-50/50 rounded-[2rem] border border-stone-200 border-dashed">
          {showArchived ? 'No hay servicios en el catálogo.' : 'No tienes servicios activos actualmente. Activa alguno o crea uno nuevo.'}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedServices).map(([categoryName, svcs]) => (
            <div key={categoryName}>
              <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-[#d4af37] text-sm leading-none">✽</span>
                {categoryName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(svcs as any[]).map((svc: any) => (
                  <div key={svc.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all duration-300 group relative overflow-hidden flex flex-col ${svc.is_active ? 'border-stone-100 hover:shadow-xl hover:shadow-yellow-50 hover:-translate-y-1' : 'opacity-60 grayscale-[0.3] border-dashed border-stone-300'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50 to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        {!svc.is_active && <span className="inline-block bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">Archivado</span>}
                        {svc.is_featured && <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ml-1">⭐ Portada</span>}
                        <h4 className={`text-xl font-bold pr-4 leading-tight ${svc.is_active ? 'text-stone-800' : 'text-stone-500'}`}>{svc.name}</h4>
                      </div>
                      <span className="bg-[#fcf8e5] text-[#b08e23] font-bold px-3 py-1.5 rounded-xl text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100">
                        {svc.price} €
                      </span>
                    </div>
                    
                    <p className="text-stone-500 text-sm mb-8 line-clamp-3 min-h-[4rem] relative z-10 font-medium">
                      {svc.description || 'Tratamiento genérico en clínica. Sin especificaciones adicionales.'}
                    </p>
                    
                    <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto relative z-10">
                      <div className="flex items-center gap-2 text-stone-400 text-sm font-semibold bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        <span className="text-[#d4af37] text-base leading-none">⏱</span> {svc.duration_minutes} min
                      </div>
                      <button onClick={() => handleEditClick(svc)} className="text-stone-400 hover:text-stone-800 font-bold text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCategoryModal(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-stone-800 mb-2">Nueva Categoría</h3>
            <p className="text-stone-500 text-sm mb-6">Añade una agrupación para tus servicios.</p>
            <form onSubmit={handleCreateCategory}>
              <input 
                required 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="Ej: Depilación Láser, Faciales..." 
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all mb-6" 
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                  Crear
                </button>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-6 py-4 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestionar Categorías */}
      {showManageCategoriesModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowManageCategoriesModal(false); }}
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-stone-800">Gestionar Categorías</h3>
              <button onClick={() => setShowManageCategoriesModal(false)} className="text-stone-300 hover:text-stone-800 transition-colors text-2xl leading-none">×</button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col p-4 bg-stone-50 rounded-2xl border border-stone-200 group transition-all gap-3">
                  <div className="flex items-center justify-between">
                    {editingCategoryId === cat.id ? (
                      <form onSubmit={handleUpdateCategory} className="flex-1 flex flex-col gap-3">
                        <div className="flex gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={editingCategoryName} 
                            onChange={(e) => setEditingCategoryName(e.target.value)} 
                            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                          />
                          <button type="submit" className="bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-xs uppercase shadow-sm">OK</button>
                          <button type="button" onClick={() => {setEditingCategoryId(null); setEditingCategoryImage(null);}} className="bg-stone-200 text-stone-600 px-3 py-2 rounded-lg font-bold text-xs uppercase">×</button>
                        </div>
                        <div className="flex items-center gap-3">
                          {editingCategoryImage && (
                            <img src={editingCategoryImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${editingCategoryImage}` : editingCategoryImage} className="w-12 h-12 object-cover rounded-md shadow-sm border border-stone-200" alt="cat" />
                          )}
                          <div className="flex-1">
                             <label className="text-xs font-semibold text-stone-500 mb-1 block">Imagen de portada (opcional)</label>
                             <input type="file" accept="image/*" onChange={handleCatImageUpload} className="w-full text-xs text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 transition-all cursor-pointer" />
                          </div>
                          {editingCategoryImage && <button type="button" onClick={() => setEditingCategoryImage('')} className="text-xs text-red-500 font-bold underline mt-4">Quitar</button>}
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img src={cat.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${cat.image_url}` : cat.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400 text-sm">📁</div>
                          )}
                          <span className="font-bold text-stone-700">{cat.name}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.image_url || null); }}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-white rounded-lg transition-all"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                            title="Eliminar categoría"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 italic text-stone-400 text-xs text-center">
              Las categorías que tengan servicios asignados no podrán ser eliminadas por seguridad.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
