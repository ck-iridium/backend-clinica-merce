import { useState } from 'react';
import { Image as ImageIcon, Pipette, Sparkles, Video, Trash2, Loader2, RotateCcw } from 'lucide-react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { processVideo } from '@/lib/videoProcessor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from 'react-hook-form';
import type { ServiceFormData } from '@/components/cms/ServiceEditor';
import AIImageGeneratorModal from '@/components/cms/AIImageGeneratorModal';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface DesignTabProps {
  formValues: ServiceFormData;
  register: UseFormRegister<ServiceFormData>;
  control: Control<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  setMediaPickerSlot: (slot: 'image' | 'video' | null) => void;
  brandAccentColor?: string;
}

export default function DesignTab({ formValues, register, control, setValue, setMediaPickerSlot, brandAccentColor = '#d4af37' }: DesignTabProps) {
  const { t } = useLanguage();
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'video') => {
    if (type === 'video' && file.type.startsWith('video/')) {
      setIsProcessingVideo(true);
      setProcessingProgress(0);
      try {
        const optimizedBlob = await processVideo(file, (progress) => {
          setProcessingProgress(progress);
        });

        const uploadData = new FormData();
        uploadData.append('file', optimizedBlob, `video_${Date.now()}.mp4`);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
          method: 'POST',
          body: uploadData
        });

        if (res.ok) {
          const data = await res.json();
          setValue('video_url', data.url, { shouldDirty: true });
          toast.success(t('dashboard.services.video_uploaded'));
        } else {
          toast.error(t('dashboard.services.error_uploading_video'));
        }
      } catch (err) {
        console.error(err);
        toast.error(t('dashboard.services.error_processing_video'));
      } finally {
        setIsProcessingVideo(false);
        setProcessingProgress(0);
      }
    } else if (type === 'image' && file.type.startsWith('image/')) {
      setIsProcessingImage(true);
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
          method: 'POST',
          body: uploadData
        });

        if (res.ok) {
          const data = await res.json();
          setValue('image_url', data.url, { shouldDirty: true });
          toast.success(t('dashboard.services.image_uploaded'));
        } else {
          toast.error(t('dashboard.services.error_uploading_image'));
        }
      } catch (err) {
        console.error(err);
        toast.error(t('dashboard.services.error_uploading_image'));
      } finally {
        setIsProcessingImage(false);
      }
    } else {
      toast.error(type === 'image' ? t('dashboard.services.invalid_image_format') : t('dashboard.services.invalid_video_format'));
    }
  };

  const onDragOver = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(true);
    else setIsDraggingVideo(true);
  };

  const onDragLeave = (type: 'image' | 'video') => {
    if (type === 'image') setIsDraggingImage(false);
    else setIsDraggingVideo(false);
  };

  const onDrop = async (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    if (type === 'image') setIsDraggingImage(false);
    else setIsDraggingVideo(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleMediaUpload(file, type);
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN: IMAGEN PRINCIPAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em]">{t('dashboard.services.main_image_label')}</label>
          <button
            type="button"
            onClick={() => setShowAIImageModal(true)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:bg-yellow-50/50 px-2.5 py-1.5 rounded-lg border border-yellow-100 transition-all shadow-sm"
          >
            <Sparkles size={12} strokeWidth={2.5} />
            {t('dashboard.services.generate_ia')}
          </button>
        </div>

        <div
          onDragOver={(e) => onDragOver(e, 'image')}
          onDragLeave={() => onDragLeave('image')}
          onDrop={(e) => onDrop(e, 'image')}
          className={cn(
            "relative transition-all duration-300",
            isDraggingImage && "scale-[1.02] z-10"
          )}
        >
          {isProcessingImage ? (
            <div className="flex flex-col items-center justify-center p-8 w-full border-2 border-dashed border-[#d4af37] bg-[#fcf8e5] rounded-2xl min-h-[140px]">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" strokeWidth={1.5} />
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 animate-pulse">{t('dashboard.services.uploading')}</p>
            </div>
          ) : formValues.image_url ? (
            <div className={cn(
              "relative group rounded-2xl overflow-hidden border border-stone-200 aspect-video shadow-sm transition-all",
              isDraggingImage && "border-[#d4af37] border-2 border-dashed bg-[#fcf8e5]"
            )}>
              <img src={getFullUrl(formValues.image_url)} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => setMediaPickerSlot('image')}
                  className="px-4 py-2 bg-white text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  {t('dashboard.services.change')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('image_url', '', { shouldDirty: true })}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
                  title={t('dashboard.services.remove_image')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMediaPickerSlot('image')}
              className={cn(
                "w-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-stone-400 transition-all group",
                isDraggingImage ? "border-[#d4af37] bg-[#fcf8e5]" : "border-stone-200 hover:bg-stone-50 hover:border-[#d4af37]"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                <ImageIcon size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                {isDraggingImage ? t('dashboard.services.drag_drop_release') : t('dashboard.services.select_image_label')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN: VÍDEO DE PORTADA (HOVER) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em]">{t('dashboard.services.hover_video_label')}</label>
        </div>

        <div
          onDragOver={(e) => onDragOver(e, 'video')}
          onDragLeave={() => onDragLeave('video')}
          onDrop={(e) => onDrop(e, 'video')}
          className={cn(
            "relative w-full min-h-[180px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
            isDraggingVideo ? "border-[#d4af37] bg-[#fcf8e5] scale-[1.02] shadow-lg" : "border-stone-200 bg-white hover:border-[#d4af37] hover:bg-stone-50"
          )}
        >
          {isProcessingVideo ? (
            <div className="flex flex-col items-center justify-center p-8 w-full">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <Loader2 className="w-full h-full text-[#d4af37] animate-spin opacity-20" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-[#d4af37]">{processingProgress}%</span>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-500 animate-pulse">{t('dashboard.services.optimizing_video')}</p>
            </div>
          ) : formValues.video_url ? (
            <div className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-video shadow-sm">
              <video
                src={getFullUrl(formValues.video_url)}
                className="w-full h-full object-cover"
                muted loop autoPlay playsInline
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => setMediaPickerSlot('video')}
                  className="px-4 py-2 bg-white text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  {t('dashboard.services.change_video')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('video_url', '', { shouldDirty: true })}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
                  title={t('dashboard.services.remove_video')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMediaPickerSlot('video')}
              className="w-full py-12 flex flex-col items-center justify-center text-stone-400 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                <Video size={24} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                {isDraggingVideo ? t('dashboard.services.drag_drop_release') : t('dashboard.services.select_video_label')}
              </span>
              <p className="text-[10px] mt-2 opacity-60">{t('dashboard.services.video_optimize_help')}</p>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-8">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em] mb-3">{t('dashboard.services.header_style_label')}</label>
          <Controller
            name="layout_preferences.headerStyle"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-[45px] rounded-xl border-stone-200 bg-white dark:bg-white text-stone-900 dark:text-stone-900 text-sm font-semibold shadow-sm focus:ring-stone-200 border dark:border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-stone-200">
                  <SelectItem value="split_image" className="text-sm py-2.5">{t('dashboard.services.header_style_static_image')}</SelectItem>
                  <SelectItem value="split_video" className="text-sm py-2.5">{t('dashboard.services.header_style_vertical_video')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em] mb-4">{t('dashboard.services.accent_color_label')}</label>
          <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
            <button
              type="button"
              onClick={() => setValue('layout_preferences.accentColor', brandAccentColor, { shouldDirty: true })}
              className={`w-9 h-9 rounded-full border-2 transition-all ${formValues.layout_preferences.accentColor === brandAccentColor ? 'border-stone-800 scale-110 shadow-lg' : 'border-transparent hover:scale-105 shadow-sm'}`}
              style={{ backgroundColor: brandAccentColor }}
              title={brandAccentColor === '#d4af37' ? t('dashboard.services.corporate_gold') : t('dashboard.services.corporate_color') || 'Color Corporativo'}
            />
            <div className="w-px h-6 bg-stone-200 mx-1" />
            <div className="relative group" title={t('dashboard.services.custom_color')}>
              <input
                type="color"
                value={formValues.layout_preferences.accentColor || brandAccentColor}
                onChange={(e) => setValue('layout_preferences.accentColor', e.target.value, { shouldDirty: true })}
                className="w-9 h-9 rounded-full cursor-pointer border-2 border-stone-100 overflow-hidden p-0 bg-transparent opacity-0 absolute inset-0 z-10"
              />
              <div
                className="w-9 h-9 rounded-full border-2 border-stone-200 flex items-center justify-center bg-white shadow-sm transition-all group-hover:shadow-md"
                style={{ borderColor: formValues.layout_preferences.accentColor && formValues.layout_preferences.accentColor !== brandAccentColor ? formValues.layout_preferences.accentColor : '#e5e7eb' }}
              >
                <Pipette size={14} className="text-stone-400" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-stone-500 font-bold uppercase ml-1">{formValues.layout_preferences.accentColor || brandAccentColor}</span>
            
            {formValues.layout_preferences.accentColor && formValues.layout_preferences.accentColor !== brandAccentColor && (
              <button
                type="button"
                onClick={() => setValue('layout_preferences.accentColor', brandAccentColor, { shouldDirty: true })}
                className="ml-auto p-2 text-stone-400 hover:text-[#d4af37] hover:bg-stone-50 rounded-xl transition-all"
                title={t('dashboard.services.reset_default')}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <AIImageGeneratorModal
        open={showAIImageModal}
        onClose={() => setShowAIImageModal(false)}
        serviceName={formValues.name}
        description={formValues.description}
        contentHtml={formValues.content_html}
        onGenerate={(url) => {
          setValue('image_url', url, { shouldDirty: true });
        }}
      />
    </div>
  );
}
