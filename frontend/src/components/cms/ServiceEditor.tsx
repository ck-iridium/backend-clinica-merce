"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from 'sonner';
import {
  ArrowLeft, Eye, Sparkles, Image as ImageIcon, Trash2, Loader2
} from 'lucide-react';
import MediaPickerModal from '@/components/MediaPickerModal';
import FeedbackModal from '@/components/FeedbackModal';
import AIGeneratorModal from './AIGeneratorModal';
import { useAIImage } from '@/app/contexts/AIImageContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Tabs
import GeneralTab from '@/app/dashboard/(standard)/services/editor/components/GeneralTab';
import ContentTab from '@/app/dashboard/(standard)/services/editor/components/ContentTab';
import DesignTab from '@/app/dashboard/(standard)/services/editor/components/DesignTab';
import SeoTab from '@/app/dashboard/(standard)/services/editor/components/SeoTab';

// Interfaz para el formulario
export interface ServiceFormData {
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  image_url: string;
  video_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  content_html: string;
  layout_preferences: {
    alignment: 'left' | 'right';
    headerStyle: 'split_image' | 'split_video';
    accentColor: string;
  };
  requires_deposit: boolean;
  deposit_amount: number;
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
  video_url: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  content_html: '',
  layout_preferences: {
    alignment: 'left',
    headerStyle: 'split_image',
    accentColor: '#d4af37'
  },
  requires_deposit: false,
  deposit_amount: 0
};

export default function ServiceEditor({ initialData, serviceId }: { initialData?: any, serviceId?: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const isNew = !serviceId;
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [mediaPickerSlot, setMediaPickerSlot] = useState<'image' | 'video' | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'design' | 'seo'>('general');
  const [slugLocked, setSlugLocked] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAIModal, setShowAIModal] = useState<'short_description' | 'rich_content' | null>(null);

  const { register, handleSubmit, watch, setValue, control, reset, formState: { isDirty } } = useForm<ServiceFormData>({
    defaultValues: initialData ? {
      ...DEFAULT_FORM_DATA,
      ...initialData,
      layout_preferences: initialData.layout_preferences || DEFAULT_FORM_DATA.layout_preferences
    } : DEFAULT_FORM_DATA
  });

  // Sincronizar formulario cuando cargan los datos iniciales
  useEffect(() => {
    if (initialData) {
      const safeData = {
        ...DEFAULT_FORM_DATA,
        ...initialData,
        slug: initialData.slug || '',
        image_url: initialData.image_url || '',
        video_url: initialData.video_url || '',
        content_html: initialData.content_html || '',
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || '',
        requires_deposit: initialData.requires_deposit || false,
        deposit_amount: initialData.deposit_amount || 0,
        layout_preferences: initialData.layout_preferences || DEFAULT_FORM_DATA.layout_preferences
      };

      reset(safeData);

      if (initialData.slug) {
        setSlugLocked(true);
      } else {
        setSlugLocked(true);
      }
    }
  }, [initialData, reset]);

  const formValues = watch();

  const fetchCategories = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
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

  useEffect(() => {
    if (editor && initialData?.content_html && !editor.isDestroyed) {
      if (editor.getHTML() !== initialData.content_html) {
        editor.commands.setContent(initialData.content_html);
      }
    }
  }, [initialData, editor]);

  const [exitAfterSave, setExitAfterSave] = useState(true);

  const onSubmit = async (data: ServiceFormData) => {
    setSaving(true);
    try {
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/${serviceId}`;
      const method = isNew ? 'POST' : 'PATCH';

      if (!data.category_id) {
        toast.error(t('dashboard.services.category_required'));
        setSaving(false);
        return;
      }

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
        const savedData = await res.json();
        toast.success(isNew ? t('dashboard.services.service_created') : t('dashboard.services.service_updated'));

        if (exitAfterSave) {
          router.push('/dashboard/services');
        } else if (isNew && savedData.id) {
          // Si era nuevo y pulsó "Guardar cambios", redirigimos a la edición del nuevo ID
          router.push(`/dashboard/services/${savedData.id}/edit`);
        }
      } else {
        const errorData = await res.json();
        toast.error(t('dashboard.services.save_error', { error: errorData.detail || 'No se pudo guardar el servicio.' }));
      }
    } catch (err) {
      toast.error(t('dashboard.services.connection_error'));
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
        toast.success(t('dashboard.services.service_deleted'));
        router.push('/dashboard/services');
      } else {
        toast.error(t('dashboard.services.error_deleting_service'));
      }
    } catch (err) {
      toast.error(t('dashboard.services.connection_error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const { isGenerating: isGeneratingAI } = useAIImage();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA]">
      {/* ─── PANEL IZQUIERDO: Configuración (100% móvil, 30% desktop) ─────────────────────────────── */}
      <aside className="w-full md:w-[30%] md:min-w-[350px] md:max-w-[450px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0 z-20">
        <form id="service-editor-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">

          {/* Cabecera del Panel */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fcf8e5] flex items-center justify-center">
                {isGeneratingAI ? (
                  <Loader2 size={16} strokeWidth={1.75} className="text-[#b08e23] animate-spin" />
                ) : (
                  <Sparkles size={16} strokeWidth={1.75} className="text-[#b08e23]" />
                )}
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-800 leading-tight">
                  {isNew ? t('dashboard.services.new_service') : t('dashboard.services.edit_service')}
                </h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {isGeneratingAI ? t('dashboard.services.generating_image') : t('dashboard.services.visual_cms')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || isGeneratingAI || (!isDirty && !isNew)}
                onClick={() => setExitAfterSave(false)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:grayscale shadow-sm"
                title={isGeneratingAI ? t('dashboard.services.no_save_ai_generating') : ""}
              >
                {saving && !exitAfterSave ? '...' : t('dashboard.services.save_changes')}
              </button>
              <button
                type="submit"
                disabled={saving || isGeneratingAI || (!isDirty && !isNew)}
                onClick={() => setExitAfterSave(true)}
                className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:grayscale shadow-sm"
                title={isGeneratingAI ? t('dashboard.services.no_save_ai_generating') : ""}
              >
                {saving && exitAfterSave ? t('dashboard.services.saving') : t('dashboard.services.save_exit')}
              </button>
            </div>
          </div>

          {/* Pestañas de Navegación */}
          <div className="flex px-6 pt-4 gap-4 border-b border-stone-100 shrink-0">
            <button type="button" onClick={() => setActiveTab('general')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'general' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('dashboard.services.tab_general')}</button>
            <button type="button" onClick={() => setActiveTab('content')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'content' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('dashboard.services.tab_content')}</button>
            <button type="button" onClick={() => setActiveTab('design')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'design' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('dashboard.services.tab_design')}</button>
            <button type="button" onClick={() => setActiveTab('seo')} className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'seo' ? 'border-[#d4af37] text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{t('dashboard.services.tab_seo')}</button>
          </div>

          {/* Cuerpo del Formulario */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-stone-50/30">

            {/* PESTAÑA: GENERAL */}
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <GeneralTab
                register={register}
                control={control}
                setValue={setValue}
                formValues={formValues}
                categories={categories}
                refreshCategories={fetchCategories}
                slugLocked={slugLocked}
                setSlugLocked={setSlugLocked}
                setShowAIModal={setShowAIModal}
              />
            </div>

            {/* PESTAÑA: CONTENIDO (Tiptap) */}
            <div className={activeTab === 'content' ? 'block' : 'hidden'}>
              <ContentTab
                editor={editor}
                setShowAIModal={setShowAIModal}
              />
            </div>

            {/* PESTAÑA: DISEÑO (Mini-Elementor) */}
            <div className={activeTab === 'design' ? 'block' : 'hidden'}>
              <DesignTab
                formValues={formValues}
                register={register}
                control={control}
                setValue={setValue}
                setMediaPickerSlot={setMediaPickerSlot}
              />
            </div>

            {/* PESTAÑA: SEO */}
            <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
              <SeoTab
                formValues={formValues}
                register={register}
                setValue={setValue}
                editor={editor}
              />
            </div>

          </div>

          {/* Footer con botones de acción */}
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 shrink-0">
            <div className="flex gap-3">
              {!isNew && (
                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={() => setShowDeleteModal(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-red-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shrink-0 disabled:opacity-30 disabled:grayscale"
                  title={t('dashboard.services.delete_service')}
                >
                  <Trash2 size={18} />
                </button>
              )}
              <Link
                href="/dashboard/services"
                onClick={(e) => {
                  if (isGeneratingAI) {
                    e.preventDefault();
                    toast.warning(t('dashboard.services.wait_ai_warning'));
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm ${isGeneratingAI ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
              >
                <ArrowLeft size={15} strokeWidth={2} />
                {t('dashboard.services.cancel')}
              </Link>
            </div>
          </div>
        </form>
      </aside>

      {/* ─── PANEL DERECHO: Live Preview (Oculto en móvil, 70% desktop) ────────────────────────────────── */}
      <div className="hidden md:block flex-1 h-full overflow-y-auto bg-stone-100/60 relative">

        {/* Barra Superior del Preview */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
            <Eye size={14} strokeWidth={1.75} className="text-stone-500" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-stone-500">
            {t('dashboard.services.live_preview')}: {formValues.slug ? `/tratamientos/${formValues.slug}` : t('dashboard.services.pending_url')}
          </span>
          <div className="ml-auto flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          </div>
        </div>

        {/* CONTENEDOR DEL PREVIEW (Simulación del Frontend) */}
        <div className="w-full bg-white min-h-full shadow-xl overflow-hidden">

          {/* Bloque 1: Hero Section */}
          <section className="relative w-full min-h-[50vh] flex flex-col md:flex-row">

            {/* Layout para modo SPLIT (Nuevo diseño Editorial) */}
            <div className="flex flex-col md:flex-row min-h-full relative w-full">
              {/* Columna Izquierda: Visual (Sticky 9:16) */}
              <div className={`w-full md:w-[45%] lg:w-[43%] md:h-[calc(100vh-48px)] md:sticky md:top-0 overflow-hidden bg-white flex items-center justify-end ${formValues.layout_preferences.headerStyle === 'split_video' ? 'py-[25px] pr-[25px]' : ''}`}>
                {formValues.layout_preferences.headerStyle === 'split_video' && formValues.video_url ? (
                  <div className="relative h-full aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] bg-white">
                    <video
                      src={formValues.video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.video_url}` : formValues.video_url}
                      className="w-full h-full object-cover"
                      autoPlay loop muted playsInline
                    />
                  </div>
                ) : formValues.image_url ? (
                  <img
                    src={formValues.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.image_url}` : formValues.image_url}
                    alt="Cover"
                    className={`w-full h-full object-cover ${formValues.layout_preferences.headerStyle === 'split_video' ? 'aspect-[9/16] rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]' : 'aspect-[9/16] md:aspect-auto'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon size={64} strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Columna Derecha: Contenido (Scroll) */}
              <div className="w-full md:w-[55%] lg:w-[57%] flex flex-col pt-12 pb-24 px-6 md:pl-10 md:pr-12 lg:pl-16 lg:pr-24">
                <div className="max-w-2xl">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37] mb-4 block">
                    {t('dashboard.services.specialized_treatment')}
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 mb-8 leading-[1.1]">
                    {formValues.name || t('dashboard.services.treatment_title')}
                  </h1>

                  {/* Pricing & Time Card */}
                  <div className="flex flex-wrap gap-4 items-center mb-10 p-6 bg-stone-50 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="px-6 border-r border-stone-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{t('dashboard.services.duration')}</p>
                      <p className="text-lg font-bold text-stone-800">{formValues.duration_minutes} min</p>
                    </div>
                    <div className="px-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{t('dashboard.services.investment_from')}</p>
                      <p className="text-lg font-bold text-stone-800">{formValues.price} €</p>
                    </div>
                    <div className="ml-auto">
                      <button disabled className="px-6 py-3 rounded-2xl font-bold text-white shadow-lg" style={{ backgroundColor: formValues.layout_preferences.accentColor }}>
                        {t('dashboard.services.book_now')}
                      </button>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-lg md:text-xl text-stone-500 font-sans leading-relaxed mb-12 italic">
                    "{formValues.description || t('dashboard.services.short_desc_placeholder')}"
                  </p>

                  {/* Content Rich Text (Sync with Tiptap) */}
                  <div
                    className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:leading-relaxed prose-a:text-[#d4af37] prose-img:rounded-3xl"
                    dangerouslySetInnerHTML={{ __html: formValues.content_html || `<p class="text-stone-300 italic">${t('dashboard.services.rich_content_placeholder')}</p>` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {mediaPickerSlot && (
        <MediaPickerModal
          onClose={() => setMediaPickerSlot(null)}
          mediaType={mediaPickerSlot}
          onImageSelected={(url) => {
            if (mediaPickerSlot === 'image') {
              setValue('image_url', url, { shouldDirty: true });
            } else if (mediaPickerSlot === 'video') {
              setValue('video_url', url, { shouldDirty: true });
            }
            setMediaPickerSlot(null);
          }}
        />
      )}

      {showDeleteModal && (
        <FeedbackModal
          type="confirm"
          title={t('dashboard.services.delete_modal_title')}
          message={t('dashboard.services.delete_modal_desc')}
          onClose={() => setShowDeleteModal(false)}
          onConfirmHandler={handleDelete}
          confirmText={isDeleting ? t('dashboard.services.deleting') : t('dashboard.services.confirm_delete')}
          cancelText={t('dashboard.services.cancel')}
        />
      )}

      {showAIModal && (
        <AIGeneratorModal
          targetType={showAIModal}
          serviceName={formValues.name}
          onClose={() => setShowAIModal(null)}
          onGenerate={(content) => {
            if (showAIModal === 'short_description') {
              setValue('description', content, { shouldDirty: true });
            } else {
              editor?.commands.setContent(content);
              setValue('content_html', content, { shouldDirty: true });
            }
          }}
        />
      )}

    </div>
  );
}
