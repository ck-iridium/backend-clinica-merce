"use client"
import { useState, useEffect, useRef } from 'react';
import CropImageModal from '@/components/CropImageModal';
import MediaPickerModal from '@/components/MediaPickerModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { 
  Settings2, 
  Plus, 
  Sparkles, 
  Image as ImageIcon, 
  Trash2, 
  Pencil, 
  FolderTree, 
  Flower2, 
  Clock, 
  X, 
  ChevronDown 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServicesPage() {
  const { showFeedback } = useFeedback();
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
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCatMediaPicker, setShowCatMediaPicker] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);



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
        toast.success(editingId ? 'Servicio actualizado' : 'Servicio creado con éxito');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || 'No se pudo guardar el servicio'}`);
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!editingId) return;
    
    showFeedback({
      type: 'confirm',
      title: 'Eliminar Servicio',
      message: '¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer y borrará también su foto.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${editingId}`, {
            method: 'DELETE'
          });
          
          if (res.status === 409) {
            const errorData = await res.json();
            showFeedback({ type: 'error', title: 'Conflicto', message: errorData.detail });
          } else if (res.ok) {
            await fetchServices();
            handleCancel();
            toast.success('Servicio eliminado correctamente');
          } else {
            toast.error('No se pudo eliminar el servicio');
          }
        } catch (err) {
          toast.error('Error de conexión al servidor');
        }
      }
    });
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
        toast.success('Categoría creada');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || 'No se pudo crear la categoría'}`);
      }
    } catch (err) {
      toast.error('Error de conexión al crear categoría');
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
        toast.success('Categoría actualizada');
      } else {
        toast.error('No se pudo actualizar la categoría');
      }
    } catch (err) {
      toast.error('Error de conexión al actualizar categoría');
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
        toast.success('Imagen subida');
      } else {
        toast.error('Error al subir la imagen');
      }
    } catch (err) {
      toast.error('Error de conexión');
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
        toast.success('Imagen recortada y guardada');
      } else {
        toast.error('Error al procesar el recorte');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const hasServices = services.some(s => s.category_id === catId);
    if (hasServices) {
      showFeedback({ type: 'error', title: 'Conflicto', message: 'No puedes borrar una categoría con servicios asignados. Mueve los servicios a otra categoría primero.' });
      return;
    }

    showFeedback({
      type: 'confirm',
      title: 'Eliminar Categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/${catId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            fetchCategories();
            toast.success('Categoría eliminada');
          } else {
            toast.error('Error al eliminar categoría');
          }
        } catch (err) {
          toast.error('Error de conexión');
        }
      }
    });
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
            <Settings2 size={18} strokeWidth={1.5} className="text-stone-400" /> <span className="hidden sm:inline">Categorías</span>
          </button>
          <button 
            onClick={() => showForm ? handleCancel() : setShowForm(true)}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 ${showForm ? 'bg-stone-200 text-stone-700' : 'bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white'}`}>
            {showForm ? <X size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
            {showForm ? 'Cancelar' : 'Nuevo Servicio'}
          </button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="p-0 border-none">
          <DialogHeader className="p-6 md:p-8 border-b border-stone-100 bg-white relative z-10 rounded-t-xl">
            <DialogTitle className="text-2xl font-bold text-stone-800 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#fcf8e5] flex items-center justify-center text-[#b08e23]">
                <Sparkles size={20} strokeWidth={1.5} />
              </span>
              {editingId ? 'Editar Técnica de Tratamiento' : 'Alta Técnica de Tratamiento'}
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-sm ml-13">
              Configura los detalles técnicos, precio y visibilidad del tratamiento en el catálogo.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 md:p-8 pb-32">
            <form id="service-form" onSubmit={handleSubmit}>
              {/* Sección de Imagen del Tratamiento */}
              <div className="mb-8 flex flex-col md:flex-row items-center md:items-start bg-stone-50 border border-stone-200 p-6 rounded-[2rem] gap-6 text-center md:text-left">
                {uploadingImage ? (
                  <div className="w-28 h-28 rounded-2xl bg-white border border-stone-200 flex flex-col justify-center items-center shrink-0">
                    <div className="w-6 h-6 border-4 border-yellow-100 border-t-[#d4af37] rounded-full animate-spin mb-2"></div>
                    <span className="text-[9px] font-bold text-[#d4af37] uppercase tracking-widest">Subiendo...</span>
                  </div>
                ) : formData.image_url ? (
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0">
                    <img src={formData.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formData.image_url}` : formData.image_url} alt="Tratamiento" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-white border border-stone-200 border-dashed flex flex-col justify-center items-center shrink-0">
                    <ImageIcon size={20} strokeWidth={1.5} className="text-stone-300 mb-1" />
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Sin Foto</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 mb-1 text-sm uppercase tracking-tight">Imagen del Catálogo</h3>
                  <p className="text-xs text-stone-400 mb-4 leading-relaxed max-w-sm mx-auto md:mx-0">Selecciona una imagen de tu galería o sube una nueva.</p>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="px-4 py-2 rounded-xl font-bold bg-stone-900 hover:bg-[#d9777f] text-white text-xs transition-colors shadow-md flex items-center gap-2"
                    >
                      <ImageIcon size={14} strokeWidth={1.5} /> {formData.image_url ? 'Cambiar' : 'Seleccionar Imagen'}
                    </button>
                    {formData.image_url && (
                      <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="px-4 py-2 rounded-xl font-bold bg-red-50 text-red-600 text-xs transition-colors hover:bg-red-100">
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
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Duración (min) *</label>
                    <input required type="number" min="5" step="5" value={formData.duration_minutes || 0} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Precio (€) *</label>
                    <input required type="number" min="0" step="0.5" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-center font-bold" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Categoría *</label>
                  <div className="flex flex-row gap-2">
                    <Select value={formData.category_id || ""} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                      <SelectTrigger className="flex-1 md:w-full">
                        <SelectValue placeholder="-- Elige --" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button type="button" onClick={() => setShowCategoryModal(true)} className="w-11 h-11 md:w-auto md:px-4 md:py-2 bg-stone-800 text-white p-2 rounded-xl font-bold transition-all text-sm shrink-0 flex items-center justify-center gap-2 hover:bg-stone-900">
                      <Plus size={20} strokeWidth={2.5} />
                      <span className="hidden md:inline">Nueva Categoría</span>
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
                    <div className="flex items-center gap-2">
                      <Settings2 size={18} strokeWidth={1.5} className="text-stone-500" /> Configuración SEO <span className="font-normal text-sm text-stone-400 ml-2">(Opcional)</span>
                    </div>
                    <ChevronDown size={18} strokeWidth={1.5} className="text-stone-400 group-open:rotate-180 transition-transform" />
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
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-white via-white to-white/0 flex flex-row items-center justify-end gap-3 rounded-b-2xl z-20">
            {editingId && (
              <button 
                type="button" 
                onClick={handleDeleteService} 
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-11 h-11 rounded-xl transition-all shadow-sm flex items-center justify-center mr-auto" 
                title="Eliminar Servicio"
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            )}
            <button 
              onClick={handleCancel} 
              type="button" 
              className="px-5 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-all text-sm"
            >
              Cancelar
            </button>
            <button 
              form="service-form"
              disabled={saving || uploadingImage} 
              type="submit" 
              className="bg-stone-900 hover:bg-[#d4af37] disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg text-sm active:scale-95"
            >
              {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir Servicio')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCropModal && (
        <CropImageModal 
          imageSrc={selectedImageForCrop}
          onClose={() => {setShowCropModal(false); setSelectedImageForCrop('');}}
          onCropComplete={onServiceCropComplete}
        />
      )}

      {/* Media Picker for service image */}
      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowMediaPicker(false)}
          onImageSelected={(url) => {
            setFormData(prev => ({ ...prev, image_url: url }));
            setShowMediaPicker(false);
          }}
        />
      )}

      {/* Grid of Services */}
      {loading ? (
        <div className="space-y-12">
          {Array(2).fill(0).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                      </div>
                      <Skeleton className="w-16 h-8 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                    <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto">
                      <Skeleton className="h-8 w-24 rounded-lg" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-24 text-stone-400 bg-stone-50/50 rounded-[2rem] border border-stone-200 border-dashed">
          {showArchived ? 'No hay servicios en el catálogo.' : 'No tienes servicios activos actualmente. Activa alguno o crea uno nuevo.'}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedServices).map(([categoryName, svcs]) => (
            <div key={categoryName}>
              <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-[#d4af37] text-sm leading-none">
                  <Flower2 size={16} strokeWidth={1.5} />
                </span>
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
                        <Clock size={16} strokeWidth={1.5} className="text-[#d4af37]" /> {svc.duration_minutes} min
                      </div>
                      <button onClick={() => handleEditClick(svc)} className="text-stone-400 hover:text-stone-800 font-bold text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5">
                        <Pencil size={14} strokeWidth={1.5} /> Editar
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
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="p-0 border-none max-w-md">
          <DialogHeader className="p-8 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-xl font-extrabold text-stone-800">Nueva Categoría</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm">
              Añade una agrupación para tus servicios.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 pb-32">
            <form id="new-category-form" onSubmit={handleCreateCategory}>
              <input 
                required 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="Ej: Depilación Láser, Faciales..." 
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all" 
              />
            </form>
          </div>

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 flex gap-3 rounded-b-2xl z-20">
            <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 transition-all">
              Cancelar
            </button>
            <button form="new-category-form" type="submit" className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
              Crear
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Gestionar Categorías */}
      <Dialog open={showManageCategoriesModal} onOpenChange={setShowManageCategoriesModal}>
        <DialogContent className="p-0 border-none max-w-lg">
          <DialogHeader className="p-8 border-b border-stone-50 bg-white rounded-t-xl">
            <DialogTitle className="text-2xl font-extrabold text-stone-800">Gestionar Categorías</DialogTitle>
            <DialogDescription className="text-stone-400 text-sm">
              Organiza las agrupaciones de tratamientos y sus imágenes de portada.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 pb-32">
            <div className="space-y-3">
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
                          <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase shadow-sm">OK</button>
                          <button type="button" onClick={() => {setEditingCategoryId(null); setEditingCategoryImage(null);}} className="bg-stone-200 text-stone-600 px-3 py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center">
                            <X size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          {editingCategoryImage && (
                            <img src={editingCategoryImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${editingCategoryImage}` : editingCategoryImage} className="w-12 h-12 object-cover rounded-md shadow-sm border border-stone-200" alt="cat" />
                          )}
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-stone-500 mb-2 block">Imagen de portada (opcional)</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowCatMediaPicker(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition-all border border-stone-200"
                              >
                                <ImageIcon size={14} strokeWidth={1.5} />
                                {editingCategoryImage ? 'Cambiar' : 'Galería'}
                              </button>
                              {editingCategoryImage && (
                                <button type="button" onClick={() => setEditingCategoryImage('')} className="text-xs text-red-500 font-bold px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-all">
                                  Quitar
                                </button>
                              )}
                            </div>
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
                            onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.image_url || null); }}
                            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-white rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                            title="Eliminar categoría"
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

          <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-white italic text-stone-400 text-[10px] text-center block rounded-b-2xl">
            Las categorías que tengan servicios asignados no podrán ser eliminadas por seguridad.
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

    </div>
  );
}
