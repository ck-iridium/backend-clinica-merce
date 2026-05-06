"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { toast } from 'sonner';
import { 
  ArrowLeft, Eye, Sparkles, Settings2, Image as ImageIcon,
  Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2,
  Lock, Unlock, Pipette, Palette, Trash2
} from 'lucide-react';
import MediaPickerModal from '@/components/MediaPickerModal';
import FeedbackModal from '@/components/FeedbackModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaz para el formulario
interface ServiceFormData {
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  content_html: string;
  layout_preferences: {
    alignment: 'left' | 'right';
    headerStyle: 'full' | 'split';
    accentColor: string;
  };
}

const DEFAULT_FORM_DATA: ServiceFormData = {
  name: '',
  slug: '',
  description: '',
  duration_minutes: 30,
  price: 0,
  is_active: true,
  is_featured: false,
  category_id: '',
  image_url: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  content_html: '',
  layout_preferences: {
    alignment: 'left',
    headerStyle: 'split',
    accentColor: '#d4af37'
  }
};

export default function ServiceEditor({ initialData, serviceId }: { initialData?: any, serviceId?: string }) {
  const router = useRouter();
  const isNew = !serviceId;
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'design' | 'seo'>('general');
  const [slugLocked, setSlugLocked] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, watch, setValue, control, reset } = useForm<ServiceFormData>({
    defaultValues: initialData ? {
      ...DEFAULT_FORM_DATA,
      ...initialData,
      layout_preferences: initialData.layout_preferences || DEFAULT_FORM_DATA.layout_preferences
    } : DEFAULT_FORM_DATA
  });

  // Sincronizar formulario cuando cargan los datos iniciales
  useEffect(() => {
    if (initialData) {
      // Sanity Check: Reemplazar nulls por strings vacíos u objetos por defecto para retrocompatibilidad
      const safeData = {
        ...DEFAULT_FORM_DATA,
        ...initialData,
        slug: initialData.slug || '',
        content_html: initialData.content_html || '',
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || '',
        layout_preferences: initialData.layout_preferences || DEFAULT_FORM_DATA.layout_preferences
      };
      
      reset(safeData);
      
      // Si estamos editando y el slug ya existe, mantenlo bloqueado por defecto
      if (initialData.slug) {
        setSlugLocked(true);
      } else {
        // Si no tiene slug (servicio antiguo), se autogenerará, así que lo dejamos desbloqueado o bloqueado
        // Es mejor dejarlo bloqueado para que la autogeneración haga su magia
        setSlugLocked(true);
      }
    }
  }, [initialData, reset]);

  const formValues = watch();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  // Autogenerar slug a partir del nombre (solo si está bloqueado)
  useEffect(() => {
    if (formValues.name && slugLocked && (isNew || !formValues.slug)) {
      const generatedSlug = formValues.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]+/g, '-') // Reemplazar no-alfanuméricos con guiones
        .replace(/^-+|-+$/g, ''); // Quitar guiones extra al inicio/fin
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [formValues.name, slugLocked, isNew, setValue]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
      }),
    ],
    content: formValues.content_html || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setValue('content_html', editor.getHTML(), { shouldDirty: true });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 bg-white border border-stone-200 rounded-b-xl',
      },
    },
  });

  // Sincronizar contenido del editor cuando los datos iniciales llegan (IMPORTANTE)
  useEffect(() => {
    if (editor && initialData?.content_html && !editor.isDestroyed) {
      if (editor.getHTML() !== initialData.content_html) {
        editor.commands.setContent(initialData.content_html);
      }
    }
  }, [initialData, editor]);

  const onSubmit = async (data: ServiceFormData) => {
    setSaving(true);
    try {
      const url = isNew 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/` 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/${serviceId}`;
      const method = isNew ? 'POST' : 'PATCH';

      // Validación simple para categoría
      if (!data.category_id) {
        toast.error("Por favor, selecciona una categoría.");
        setSaving(false);
        return;
      }

      // Aseguramos que data.category_id es string si uuid, o int. Si la bd requiere int y mandas string peta. 
      // Si antes se guardaba como int, deberíamos convertir. Mirando app/models.py, 'category_id' es un Integer.
      // Por si acaso, lo convertimos a numérico si no es uuid:
      const payload = {
        ...data,
        category_id: isNaN(Number(data.category_id)) ? data.category_id : Number(data.category_id)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isNew ? 'Servicio creado con éxito' : 'Servicio actualizado');
        router.push('/dashboard/services');
      } else {
        const errorData = await res.json();
        console.error("Error backend:", errorData);
        toast.error(`Error: ${errorData.detail || 'No se pudo guardar el servicio. Comprueba si el slug ya existe.'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Servicio eliminado correctamente");
        router.push('/dashboard/services');
      } else {
        const errorData = await res.json();
        if (res.status === 409) {
          toast.error(errorData.detail || "No se puede eliminar un servicio con citas o bonos activos.");
        } else {
          toast.error("Error al eliminar el servicio");
        }
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const MenuBar = () => {
    if (!editor) return null;
    return (
      <div className="flex flex-wrap gap-1 p-2 bg-stone-50 border border-stone-200 border-b-0 rounded-t-xl">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('bold') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-stone-300 mx-1 my-auto" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-stone-300 mx-1 my-auto" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('bulletList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-stone-200 ${editor.isActive('orderedList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}>
          <ListOrdered size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* ─── PANEL IZQUIERDO: Configuración (30%) ─────────────────────────────── */}
      <aside className="w-[30%] min-w-[350px] max-w-[450px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0">
        <form id="service-editor-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          
          {/* Cabecera del Panel */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fcf8e5] flex items-center justify-center">
                <Sparkles size={16} strokeWidth={1.75} className="text-[#b08e23]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-800 leading-tight">
                  {isNew ? 'Nuevo Servicio' : 'Editar Servicio'}
                </h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  CMS Visual
                </p>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* Pestañas de Navegación */}
          <div className="flex px-6 pt-4 gap-4 border-b border-stone-100 shrink-0">
            <button type="button" onClick={() => setActiveTab('general')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'general' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>General</button>
            <button type="button" onClick={() => setActiveTab('content')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'content' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Contenido</button>
            <button type="button" onClick={() => setActiveTab('design')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'design' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Diseño</button>
            <button type="button" onClick={() => setActiveTab('seo')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'seo' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>SEO</button>
          </div>

          {/* Cuerpo del Formulario */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-stone-50/30">
            
            {/* PESTAÑA: GENERAL */}
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nombre del Servicio *</label>
                  <input {...register('name', { required: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" placeholder="Ej: Tratamiento Facial" />
                </div>
                <div className="relative group">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Slug (URL) *</label>
                  <div className="relative">
                    <input 
                      {...register('slug', { required: true })} 
                      readOnly={slugLocked}
                      className={`w-full pl-4 pr-12 py-3 rounded-xl border outline-none transition-all text-sm font-mono ${slugLocked ? 'bg-stone-50 border-stone-200 text-stone-500' : 'bg-white border-[#d4af37] text-stone-800'}`} 
                    />
                    <button 
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${slugLocked ? 'text-stone-400 hover:text-stone-600' : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'}`}
                      title={slugLocked ? "Desbloquear para editar manualmente" : "Bloquear y autogenerar"}
                    >
                      {slugLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">Identificador único para la URL pública.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Categoría *</label>
                  <Controller
                    name="category_id"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full h-[46px] rounded-xl border-stone-200 bg-white font-semibold shadow-none">
                          <SelectValue placeholder="-- Seleccionar --" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Precio (€) *</label>
                    <input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Duración (min) *</label>
                    <input type="number" step="15" {...register('duration_minutes', { required: true, valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Descripción Corta</label>
                  <textarea {...register('description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none" placeholder="Breve resumen del servicio..." />
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl">
                  <input type="checkbox" {...register('is_active')} className="w-5 h-5 accent-[#d4af37] rounded" />
                  <div>
                    <p className="text-sm font-bold text-stone-700">Servicio Activo</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest">Visible en el catálogo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PESTAÑA: CONTENIDO (Tiptap) */}
            <div className={activeTab === 'content' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Contenido Enriquecido</label>
                  <div className="flex flex-col shadow-sm rounded-xl">
                    <MenuBar />
                    <EditorContent editor={editor} />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2">Usa este editor para añadir títulos, listas y dar formato al contenido principal de la página del tratamiento.</p>
                </div>
              </div>
            </div>

            {/* PESTAÑA: DISEÑO (Mini-Elementor) */}
            <div className={activeTab === 'design' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Imagen Principal</label>
                  {formValues.image_url ? (
                    <div className="relative group rounded-xl overflow-hidden border border-stone-200">
                      <img src={formValues.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.image_url}` : formValues.image_url} alt="Cover" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => setShowMediaPicker(true)} className="px-3 py-1.5 bg-white text-stone-800 rounded-lg text-xs font-bold">Cambiar</button>
                        <button type="button" onClick={() => setValue('image_url', '')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Quitar</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowMediaPicker(true)} className="w-full py-8 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-[#d4af37] transition-all">
                      <ImageIcon size={24} className="mb-2" />
                      <span className="text-sm font-semibold">Seleccionar Imagen</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-200 pt-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Estilo Cabecera</label>
                    <Controller
                      name="layout_preferences.headerStyle"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full h-[40px] rounded-lg border-stone-200 bg-white text-sm font-semibold shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="split">Dividida (Split)</SelectItem>
                            <SelectItem value="full">Fondo Completo (Full)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Alineación Imagen</label>
                    <Controller
                      name="layout_preferences.alignment"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full h-[40px] rounded-lg border-stone-200 bg-white text-sm font-semibold shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="right">Derecha</SelectItem>
                            <SelectItem value="left">Izquierda</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Color de Acento</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <button 
                        type="button" 
                        onClick={() => setValue('layout_preferences.accentColor', '#d4af37', { shouldDirty: true })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${formValues.layout_preferences.accentColor === '#d4af37' ? 'border-stone-400 scale-110 shadow-md' : 'border-stone-100 hover:scale-105'}`}
                        style={{ backgroundColor: '#d4af37' }}
                        title="Dorado Corporativo"
                      />
                      <div className="w-px h-6 bg-stone-200 mx-1" />
                      <div className="relative group" title="Color Personalizado">
                        <input 
                          type="color" 
                          value={formValues.layout_preferences.accentColor}
                          onChange={(e) => setValue('layout_preferences.accentColor', e.target.value, { shouldDirty: true })}
                          className="w-8 h-8 rounded-full cursor-pointer border-2 border-stone-100 overflow-hidden p-0 bg-transparent opacity-0 absolute inset-0 z-10"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-stone-100 flex items-center justify-center bg-white shadow-sm"
                          style={{ borderColor: formValues.layout_preferences.accentColor !== '#d4af37' ? formValues.layout_preferences.accentColor : '#e5e7eb' }}
                        >
                          <Pipette size={14} className="text-stone-400" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase">{formValues.layout_preferences.accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <input type="checkbox" {...register('is_featured')} className="w-5 h-5 accent-[#d4af37] rounded" />
                  <div>
                    <p className="text-sm font-bold text-yellow-800">Servicio Destacado</p>
                    <p className="text-[10px] text-yellow-600 uppercase tracking-widest">Mostrar en slider principal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PESTAÑA: SEO */}
            <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Meta Title</label>
                  <input {...register('seo_title')} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" placeholder={`Ej: ${formValues.name || 'Servicio'} | Clínica`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Meta Description</label>
                  <textarea {...register('seo_description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none" placeholder="Descripción atractiva para Google..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Keywords</label>
                  <input {...register('seo_keywords')} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm" placeholder="tratamiento, belleza, estética..." />
                </div>
              </div>
            </div>

          </div>

          {/* Footer con botones de acción */}
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 shrink-0">
            <div className="flex gap-3">
              {!isNew && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-red-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shrink-0"
                  title="Eliminar Servicio"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <Link
                href="/dashboard/services"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
              >
                <ArrowLeft size={15} strokeWidth={2} />
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </aside>

      {/* ─── PANEL DERECHO: Live Preview (70%) ────────────────────────────────── */}
      <div className="flex-1 h-full overflow-y-auto bg-stone-100/60 relative">

        {/* Barra Superior del Preview */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
            <Eye size={14} strokeWidth={1.75} className="text-stone-500" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">
            Vista Previa en Vivo: {formValues.slug ? `/tratamientos/${formValues.slug}` : 'URL pendiente'}
          </span>
          <div className="ml-auto flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          </div>
        </div>

        {/* CONTENEDOR DEL PREVIEW (Simulación del Frontend) */}
        <div className="w-full bg-white min-h-full pb-20 shadow-xl overflow-hidden">
          
          {/* Bloque 1: Hero Section */}
          <section className={`relative w-full ${formValues.layout_preferences.headerStyle === 'full' ? 'h-[60vh] flex items-center justify-center text-white text-center' : 'min-h-[50vh] flex flex-col md:flex-row'}`}>
            
            {/* Background Image para modo FULL */}
            {formValues.layout_preferences.headerStyle === 'full' && (
              <>
                <div className="absolute inset-0 bg-stone-900 z-0">
                  {formValues.image_url && (
                    <img src={formValues.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.image_url}` : formValues.image_url} alt="Hero bg" className="w-full h-full object-cover opacity-50" />
                  )}
                </div>
                <div className="relative z-10 p-8 max-w-4xl mx-auto flex flex-col items-center">
                  <span className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80" style={{ color: formValues.layout_preferences.accentColor }}>Tratamiento Especializado</span>
                  <h1 className="text-5xl md:text-7xl font-serif mb-6">{formValues.name || 'Título del Tratamiento'}</h1>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-8 leading-relaxed">{formValues.description || 'La descripción corta aparecerá aquí, dando a los pacientes una idea rápida de los beneficios del servicio.'}</p>
                  <div className="flex gap-4 items-center justify-center mb-8 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="text-center px-6 border-r border-white/20">
                      <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Duración</p>
                      <p className="text-xl font-bold">{formValues.duration_minutes} min</p>
                    </div>
                    <div className="text-center px-6">
                      <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Precio desde</p>
                      <p className="text-xl font-bold">{formValues.price} €</p>
                    </div>
                  </div>
                  <button className="px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-transform hover:scale-105" style={{ backgroundColor: formValues.layout_preferences.accentColor }}>
                    Reservar Cita Ahora
                  </button>
                </div>
              </>
            )}

            {/* Layout para modo SPLIT */}
            {formValues.layout_preferences.headerStyle === 'split' && (
              <>
                <div className={`w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center ${formValues.layout_preferences.alignment === 'right' ? 'md:order-1' : 'md:order-2'}`}>
                  <span className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: formValues.layout_preferences.accentColor }}>Tratamiento Especializado</span>
                  <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6 leading-tight">{formValues.name || 'Título del Tratamiento'}</h1>
                  <p className="text-stone-500 text-lg mb-8 leading-relaxed">{formValues.description || 'La descripción corta aparecerá aquí, dando a los pacientes una idea rápida de los beneficios del servicio.'}</p>
                  
                  <div className="flex flex-wrap gap-4 items-center mb-10">
                    <div className="bg-stone-50 border border-stone-100 px-6 py-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Duración</p>
                      <p className="text-lg font-bold text-stone-800">{formValues.duration_minutes} min</p>
                    </div>
                    <div className="bg-stone-50 border border-stone-100 px-6 py-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Precio desde</p>
                      <p className="text-lg font-bold text-stone-800">{formValues.price} €</p>
                    </div>
                  </div>

                  <button className="w-fit px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: formValues.layout_preferences.accentColor }}>
                    Reservar Cita Ahora
                  </button>
                </div>
                <div className={`w-full md:w-1/2 min-h-[400px] bg-stone-100 relative ${formValues.layout_preferences.alignment === 'right' ? 'md:order-2' : 'md:order-1'}`}>
                  {formValues.image_url ? (
                    <img src={formValues.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.image_url}` : formValues.image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                      <ImageIcon size={64} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Bloque 2: Contenido Enriquecido (Prose) */}
          <section className="max-w-3xl mx-auto px-8 py-20">
            <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-a:text-[#d4af37]"
                 dangerouslySetInnerHTML={{ __html: formValues.content_html || '<p class="text-stone-400 italic">El contenido detallado aparecerá aquí...</p>' }} />
          </section>
        </div>

      </div>

      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowMediaPicker(false)}
          onImageSelected={(url) => {
            setValue('image_url', url, { shouldDirty: true });
            setShowMediaPicker(false);
          }}
        />
      )}

      {showDeleteModal && (
        <FeedbackModal
          type="confirm"
          title="¿Eliminar este servicio?"
          message="Esta acción es irreversible. El servicio desaparecerá del catálogo público y del dashboard."
          onClose={() => setShowDeleteModal(false)}
          onConfirmHandler={handleDelete}
          confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar"}
          cancelText="Cancelar"
        />
      )}

    </div>
  );
}
