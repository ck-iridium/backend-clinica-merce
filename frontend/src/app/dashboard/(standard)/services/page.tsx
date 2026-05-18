"use client"
import { useState, useEffect, useRef } from 'react';
import CropImageModal from '@/components/CropImageModal';
import MediaPickerModal from '@/components/MediaPickerModal';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthRole } from '@/hooks/useAuthRole';
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
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from '@/app/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
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
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error(t('dashboard.services.access_denied'));
        router.replace('/dashboard');
      } else {
        fetchServices();
        fetchCategories();
      }
    }
  }, [role, loadingRole, router]);

  if (loadingRole) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

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

  // El botón Editar ahora navega al Split-Screen editor en lugar de abrir un modal
  const handleEditClick = (svc: any) => {
    router.push(`/dashboard/services/${svc.id}/edit`);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (formData.duration_minutes < 15 || formData.duration_minutes % 15 !== 0) {
      toast.error(t('dashboard.services.duration_error'));
      return;
    }
    
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
        toast.success(editingId ? t('dashboard.services.service_updated') : t('dashboard.services.service_created'));
      } else {
        const errorData = await res.json();
        toast.error(t('dashboard.services.save_error', { error: errorData.detail || 'No se pudo guardar el servicio' }));
      }
    } catch (err) {
      toast.error(t('dashboard.services.connection_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!editingId) return;
    
    showFeedback({
      type: 'confirm',
      title: t('dashboard.services.delete_modal_title'),
      message: t('dashboard.services.delete_modal_desc'),
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
            toast.success(t('dashboard.services.service_deleted'));
          } else {
            toast.error(t('dashboard.services.error_deleting_service'));
          }
        } catch (err) {
          toast.error(t('dashboard.services.connection_error'));
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
        toast.success(t('dashboard.services.image_uploaded'));
      } else {
        toast.error(t('dashboard.services.image_upload_error'));
      }
    } catch (err) {
      toast.error(t('dashboard.services.connection_error'));
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
        toast.success(t('dashboard.services.image_cropped'));
      } else {
        toast.error(t('dashboard.services.image_crop_error'));
      }
    } catch (err) {
      toast.error(t('dashboard.services.connection_error'));
    } finally {
      setUploadingImage(false);
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
          <h1 className="text-3xl font-extrabold text-stone-800">{t('dashboard.services.title')}</h1>
          <p className="text-stone-500 mt-1 font-medium">{t('dashboard.services.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showArchived ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
            {showArchived ? t('dashboard.services.hide_archived') : t('dashboard.services.show_archived')}
          </button>
          <button 
            onClick={() => setShowManageCategoriesModal(true)}
            className="px-4 py-3 rounded-xl bg-white text-stone-600 border border-stone-200 font-bold transition-all hover:bg-stone-50 active:scale-95 shadow-sm flex items-center gap-2">
            <Settings2 size={18} strokeWidth={1.5} className="text-stone-400" /> <span className="hidden sm:inline">{t('dashboard.services.categories')}</span>
          </button>
          <Link 
            href="/dashboard/services/new"
            className="px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 bg-[#d4af37] hover:bg-[#b08e23] border border-transparent text-white">
            <Plus size={18} strokeWidth={1.5} />
            {t('dashboard.services.new_service')}
          </Link>
        </div>
      </div>


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
          {showArchived ? t('dashboard.services.no_services') : t('dashboard.services.no_active_services')}
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
                        {!svc.is_active && <span className="inline-block bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">{t('dashboard.services.archived')}</span>}
                        {svc.is_featured && <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ml-1">{t('dashboard.services.featured_cover')}</span>}
                        <h4 className={`text-xl font-bold pr-4 leading-tight ${svc.is_active ? 'text-stone-800' : 'text-stone-500'}`}>{svc.name}</h4>
                      </div>
                      <span className="bg-[#fcf8e5] text-[#b08e23] font-bold px-3 py-1.5 rounded-xl text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100">
                        {svc.price} €
                      </span>
                    </div>
                    
                    <p className="text-stone-500 text-sm mb-8 line-clamp-3 min-h-[4rem] relative z-10 font-medium">
                      {svc.description || t('dashboard.services.generic_description')}
                    </p>
                    
                    <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-auto relative z-10">
                      <div className="flex items-center gap-2 text-stone-400 text-sm font-semibold bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                        <Clock size={16} strokeWidth={1.5} className="text-[#d4af37]" /> {t('dashboard.services.duration_mins', { minutes: svc.duration_minutes })}
                      </div>
                      <button onClick={() => handleEditClick(svc)} className="text-stone-400 hover:text-stone-800 font-bold text-sm bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5">
                        <Pencil size={14} strokeWidth={1.5} /> {t('dashboard.services.edit')}
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
            <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.services.new_category')}</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm">
              {t('dashboard.services.new_category_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8">
            <form id="new-category-form" onSubmit={handleCreateCategory}>
              <input 
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
            <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-600 bg-white border border-stone-100 hover:bg-stone-50 transition-all">
              {t('dashboard.services.cancel')}
            </button>
            <button form="new-category-form" type="submit" className="flex-1 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 border border-stone-800">
              {t('dashboard.services.create')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Gestionar Categorías */}
      <Dialog open={showManageCategoriesModal} onOpenChange={setShowManageCategoriesModal}>
        <DialogContent className="p-0 border-none max-w-lg">
          <DialogHeader className="p-8 border-b border-stone-50 bg-white rounded-t-xl">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-stone-800">{t('dashboard.services.manage_categories')}</DialogTitle>
                <DialogDescription className="text-stone-400 text-sm mt-1">
                  {t('dashboard.services.manage_categories_desc')}
                </DialogDescription>
              </div>
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#b08e23] transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2} /> {t('dashboard.services.new')}
              </button>
            </div>
          </DialogHeader>

          <div className="p-8">
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
                                  type="button"
                                  onClick={() => setShowCatMediaPicker(true)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-all border border-stone-200"
                                >
                                  <ImageIcon size={14} strokeWidth={1.5} />
                                  {editingCategoryImage ? t('dashboard.services.modify') : t('dashboard.services.gallery')}
                                </button>
                                {editingCategoryImage && (
                                  <button type="button" onClick={() => setEditingCategoryImage('')} className="text-[10px] text-red-500 font-bold px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-all uppercase tracking-widest">
                                    {t('dashboard.services.remove')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button type="button" onClick={() => {setEditingCategoryId(null); setEditingCategoryImage(null);}} className="bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold text-xs uppercase hover:bg-stone-300 transition-all">{t('dashboard.services.cancel')}</button>
                            <button type="submit" className="bg-[#d4af37] border border-[#b08e23] text-white px-4 py-3 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#b08e23] transition-all">{t('dashboard.services.save')}</button>
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
                            title={t('dashboard.services.edit')}
                          >
                            <Pencil size={16} strokeWidth={1.5} />
                          </button>
                          <button 
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
