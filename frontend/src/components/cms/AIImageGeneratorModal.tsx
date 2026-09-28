import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Smartphone, 
  Square, 
  Monitor, 
  SlidersHorizontal, 
  Layers, 
  X, 
  ChevronRight,
  Camera,
  Crown,
  Leaf,
  Focus,
  Maximize2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAIImage } from '@/app/contexts/AIImageContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface AIImageGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (imageUrl: string) => void;
  serviceName?: string;
  description?: string;
  contentHtml?: string;
}

export default function AIImageGeneratorModal({ 
  open, 
  onClose, 
  onGenerate, 
  serviceName,
  description,
  contentHtml
}: AIImageGeneratorModalProps) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState(serviceName ? (language === 'fr' ? `Soin: ${serviceName}` : `Tratamiento: ${serviceName}`) : '');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [shotType, setShotType] = useState('closeup_beauty');
  const [visualStyle, setVisualStyle] = useState('luxury');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceType, setReferenceType] = useState('style');
  const [excludeText, setExcludeText] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);

  // Timer para medir el tiempo de generación
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationTime(0);
      interval = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Helper para procesar y optimizar archivos de imagen (Upload, Drop, Paste)
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(
        language === 'fr' 
          ? "Le fichier doit être une image (JPG, PNG, WEBP, etc.)" 
          : language === 'en' 
            ? "The file must be an image (JPG, PNG, WEBP, etc.)" 
            : "El archivo debe ser una imagen (JPG, PNG, WEBP, etc.)"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimización: Redimensionar a max 1024px para agilizar la subida y el proceso de IA
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1024;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con calidad optimizada
        const optimizedB64 = canvas.toDataURL('image/jpeg', 0.85);
        setReferenceImage(optimizedB64);
        toast.success(
          language === 'fr' 
            ? "📸 Image optimisée et chargée" 
            : language === 'en' 
              ? "📸 Image optimized and loaded" 
              : "📸 Imagen optimizada y cargada"
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Event Listener para Pegar (Ctrl+V)
  useEffect(() => {
    if (!open) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open, processImageFile]);

  const handleOptimizePrompt = async () => {
    if (!serviceName) {
      toast.error(
        language === 'fr' 
          ? "Données de service manquantes pour optimiser le prompt." 
          : language === 'en' 
            ? "Missing service data to optimize the prompt." 
            : "Faltan datos del servicio para optimizar el prompt."
      );
      return;
    }

    setIsOptimizing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/optimize-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: serviceName,
          description: description || "",
          content_html: contentHtml || ""
        })
      });

      if (!res.ok) throw new Error(
        language === 'fr' 
          ? "Erreur lors de l'optimisation du prompt" 
          : language === 'en' 
            ? "Error optimizing prompt" 
            : "Error al optimizar el prompt"
      );
      
      const data = await res.json();
      setPrompt(data.prompt);
      toast.success(
        language === 'fr' 
          ? "✨ Prompt optimisé avec succès" 
          : language === 'en' 
            ? "✨ Prompt successfully optimized" 
            : "✨ Prompt optimizado con éxito"
      );
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const { startGeneration, setOnFinish } = useAIImage();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Registrar el callback para cuando termine en segundo plano
    setOnFinish((url: string) => {
      onGenerate(url);
    });

    // Iniciar generación (esto es async pero no lo esperamos aquí para cerrar el modal)
    startGeneration({
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio,
      shot_type: shotType,
      visual_style: visualStyle,
      reference_image: referenceImage,
      exclude_text: excludeText,
      reference_type: referenceType
    });

    onClose();
    toast.info(
      language === 'fr' 
        ? "🚀 Génération démarrée en arrière-plan" 
        : language === 'en' 
          ? "🚀 Generation started in background" 
          : "🚀 Generación iniciada en segundo plano"
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isGenerating && onClose()}>
      <DialogContent 
        className="p-0 border border-stone-200/80 max-w-lg rounded-3xl shadow-2xl bg-white overflow-hidden max-h-[92vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 sm:p-7 pb-5 bg-gradient-to-b from-[#d4af37]/10 via-[#d4af37]/5 to-transparent border-b border-stone-100 relative">
          <div className="flex items-center gap-3.5 pr-10">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-xs shrink-0">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                {language === 'fr' 
                  ? "Studio Photo IA" 
                  : language === 'en' 
                    ? "AI Photo Studio" 
                    : "Estudio Fotográfico IA"}
              </DialogTitle>
              <DialogDescription className="text-stone-400 text-xs sm:text-sm font-sans mt-0.5 leading-relaxed">
                {language === 'fr' 
                  ? "Décrivez ce que vous souhaitez voir. L'IA créera une photo premium dans le style 'Quiet Luxury' de la clinique." 
                  : language === 'en' 
                    ? "Describe what you want to see. The AI will create a premium photo matching the clinic's 'Quiet Luxury' style." 
                    : "Describe lo que quieres ver. La IA creará una foto premium con el estilo 'Quiet Luxury' de la clínica."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                {language === 'fr' 
                  ? "Description de la scène *" 
                  : language === 'en' 
                    ? "Scene Description *" 
                    : "Descripción de la Escena *"}
              </label>
              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || isGenerating || !serviceName}
                className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-all disabled:opacity-50 shadow-2xs"
              >
                {isOptimizing ? (
                  <Loader2 size={12} className="animate-spin text-[#D4AF37]" />
                ) : (
                  <Sparkles size={12} className="text-[#D4AF37]" />
                )}
                {language === 'fr' 
                  ? "Autocompléter avec IA" 
                  : language === 'en' 
                    ? "Auto-complete with AI" 
                    : "Autocompletar con IA"}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                language === 'fr' 
                  ? "Décrivez ce que vous voulez voir ou utilisez le remplissage automatique..." 
                  : language === 'en' 
                    ? "Describe what you want to see or use auto-complete..." 
                    : "Describe lo que quieres ver o usa el autocompletado..."
              }
              className="w-full px-4 py-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all text-sm font-medium text-stone-800 resize-none min-h-[110px] leading-relaxed placeholder:text-stone-400"
              disabled={isGenerating || isOptimizing}
            />
          </div>

          <div className="flex flex-col gap-4">
            <details className="group border border-stone-200/70 rounded-2xl p-4 bg-stone-50/40 transition-all">
              <summary className="text-[11px] font-bold text-stone-600 uppercase tracking-wider cursor-pointer hover:text-stone-900 transition-all flex items-center justify-between list-none">
                <span className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-500 group-open:rotate-90 transition-transform">
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </div>
                  <SlidersHorizontal size={13} className="text-stone-400" />
                  <span>
                    {language === 'fr' 
                      ? "Options de style avancées (Optionnel)" 
                      : language === 'en' 
                        ? "Advanced Style Options (Optional)" 
                        : "Opciones de Estilo Avanzadas (Opcional)"}
                  </span>
                </span>
                <span className="text-[10px] text-stone-400 lowercase font-medium group-open:hidden">
                  {shotType === 'closeup_beauty' ? 'Primer plano' : shotType} · {visualStyle}
                </span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Camera size={12} className="text-stone-400" />
                    <span>{language === 'fr' ? "Prise de vue" : language === 'en' ? "Shot Type" : "Toma"}</span>
                  </label>
                  <Select disabled={isGenerating} value={shotType} onValueChange={setShotType}>
                    <SelectTrigger className="w-full h-10 rounded-xl border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-[#D4AF37]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-stone-200/80 shadow-luxury bg-white/95 backdrop-blur-md">
                      <SelectItem value="closeup_beauty" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Camera size={13} className="text-stone-500" />
                          <span>
                            {language === 'fr' 
                              ? "Gros Plan / Macro Beauty" 
                              : language === 'en' 
                                ? "Closeup / Macro Beauty" 
                                : "Primer Plano / Macro Beauty"}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="closeup" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Focus size={13} className="text-stone-500" />
                          <span>{language === 'fr' ? "Macro Technique" : language === 'en' ? "Technical Macro" : "Macro Técnico"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="scene" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles size={13} className="text-stone-500" />
                          <span>{language === 'fr' ? "Scène / Ambiance" : language === 'en' ? "Scene / Ambiance" : "Escena / Ambiente"}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Crown size={12} className="text-stone-400" />
                    <span>{language === 'fr' ? "Style" : language === 'en' ? "Style" : "Estilo"}</span>
                  </label>
                  <Select disabled={isGenerating} value={visualStyle} onValueChange={setVisualStyle}>
                    <SelectTrigger className="w-full h-10 rounded-xl border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-[#D4AF37]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-stone-200/80 shadow-luxury bg-white/95 backdrop-blur-md">
                      <SelectItem value="clean" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles size={13} className="text-stone-500" />
                          <span>{language === 'fr' ? "Épuré" : language === 'en' ? "Clean" : "Limpio"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="luxury" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Crown size={13} className="text-[#D4AF37]" />
                          <span>{language === 'fr' ? "Luxe" : language === 'en' ? "Luxury" : "Lujo"}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="zen" className="text-xs font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Leaf size={13} className="text-emerald-600" />
                          <span>{language === 'fr' ? "Zen" : language === 'en' ? "Zen" : "Zen"}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </details>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">
                {language === 'fr' 
                  ? "Format (Aspect Ratio) *" 
                  : language === 'en' 
                    ? "Format (Aspect Ratio) *" 
                    : "Formato (Aspect Ratio) *"}
              </label>
              <Select disabled={isGenerating} value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-full h-11 rounded-xl border-stone-200/80 bg-stone-50/60 hover:bg-stone-50 focus:bg-white text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    {aspectRatio === '9:16' && <Smartphone size={14} className="text-[#D4AF37] shrink-0" strokeWidth={2} />}
                    {aspectRatio === '1:1' && <Square size={13} className="text-[#D4AF37] shrink-0" strokeWidth={2} />}
                    {aspectRatio === '16:9' && <Monitor size={14} className="text-[#D4AF37] shrink-0" strokeWidth={2} />}
                    <span>
                      {aspectRatio === '9:16' 
                        ? (language === 'fr' ? "Vertical (9:16 - Mobile)" : language === 'en' ? "Vertical (9:16 - Mobile)" : "Vertical (9:16 - Móvil)")
                        : aspectRatio === '1:1'
                          ? (language === 'fr' ? "Carré (1:1 - Couvertures)" : language === 'en' ? "Square (1:1 - Covers)" : "Cuadrada (1:1 - Portadas)")
                          : (language === 'fr' ? "Horizontal (16:9 - En-têtes)" : language === 'en' ? "Horizontal (16:9 - Headers)" : "Horizontal (16:9 - Cabeceras)")}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-stone-200/80 shadow-luxury bg-white/95 backdrop-blur-md">
                  <SelectItem value="9:16" className="text-xs font-medium cursor-pointer py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                        <Smartphone size={13} strokeWidth={2} />
                      </div>
                      <span className="font-semibold text-stone-800">
                        {language === 'fr' ? "Vertical (9:16 - Mobile)" : language === 'en' ? "Vertical (9:16 - Mobile)" : "Vertical (9:16 - Móvil)"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1:1" className="text-xs font-medium cursor-pointer py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                        <Square size={12} strokeWidth={2} />
                      </div>
                      <span className="font-semibold text-stone-800">
                        {language === 'fr' ? "Carré (1:1 - Couvertures)" : language === 'en' ? "Square (1:1 - Covers)" : "Cuadrada (1:1 - Portadas)"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="16:9" className="text-xs font-medium cursor-pointer py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                        <Monitor size={13} strokeWidth={2} />
                      </div>
                      <span className="font-semibold text-stone-800">
                        {language === 'fr' ? "Horizontal (16:9 - En-têtes)" : language === 'en' ? "Horizontal (16:9 - Headers)" : "Horizontal (16:9 - Cabeceras)"}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de Calidad */}
            <div className="flex items-center justify-between p-4 bg-stone-50/70 rounded-2xl border border-stone-200/70">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-800">
                  {language === 'fr' ? "Éviter les textes" : language === 'en' ? "Avoid Texts" : "Evitar Textos"}
                </span>
                <span className="text-[11px] text-stone-400 font-medium leading-tight">
                  {language === 'fr' 
                    ? "Supprime automatiquement les filigranes et les polices" 
                    : language === 'en' 
                      ? "Automatically removes watermarks and typography" 
                      : "Elimina automáticamente marcas de agua y tipografías"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={excludeText} 
                  onChange={(e) => setExcludeText(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
              </label>
            </div>

            {/* Componente de Imagen de Referencia */}
            <div className="pt-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-stone-400" />
                <span>
                  {language === 'fr' 
                    ? "Image de référence (Optionnel)" 
                    : language === 'en' 
                      ? "Reference Image (Optional)" 
                      : "Imagen de Referencia (Opcional)"}
                </span>
              </label>
              
              {!referenceImage ? (
                <div 
                  onClick={() => document.getElementById('ref-image-input')?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageFile(file);
                  }}
                  className="w-full py-5 border-2 border-dashed border-stone-200/80 hover:border-[#d4af37] bg-stone-50/50 hover:bg-[#d4af37]/5 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-stone-700 transition-all cursor-pointer group"
                >
                  <ImageIcon size={22} className="mb-1 text-stone-400 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all" />
                  <span className="text-[11px] font-semibold">
                    {language === 'fr' 
                      ? "Cliquez, glissez ou collez (Ctrl+V) une image" 
                      : language === 'en' 
                        ? "Click, drag or paste (Ctrl+V) an image" 
                        : "Clic, arrastra o pega (Ctrl+V) una imagen"}
                  </span>
                  <input 
                    id="ref-image-input"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-300 p-1">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-md shrink-0">
                      <img src={referenceImage} alt="Referencia" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setReferenceImage(null)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-all shadow-md border-2 border-white z-10"
                        title={language === 'fr' ? "Supprimer l'image" : language === 'en' ? "Remove image" : "Quitar imagen"}
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                      <label className="text-[10px] font-bold text-[#b08e23] uppercase mb-1.5 flex items-center gap-1.5 tracking-wider">
                        <Layers size={13} className="text-[#b08e23]" />
                        <span>{language === 'fr' ? "Mode de référence" : language === 'en' ? "Reference Mode" : "Modo de Referencia"}</span>
                      </label>
                      <Select disabled={isGenerating} value={referenceType} onValueChange={setReferenceType}>
                        <SelectTrigger className="w-full h-9 rounded-xl border-stone-200 bg-white text-[11px] font-bold text-stone-800 shadow-2xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-stone-200/80 shadow-luxury bg-white/95 backdrop-blur-md">
                          <SelectItem value="style" className="py-2.5 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-800 text-xs">
                                {language === 'fr' ? "Hériter de l'esthétique" : language === 'en' ? "Inherit Aesthetics" : "Heredar Estética"}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {language === 'fr' ? "Nouveau modèle, même lumière" : language === 'en' ? "New model, same light" : "Nueva modelo, misma luz"}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="composition" className="py-2.5 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-800 text-xs">
                                {language === 'fr' ? "Calquer la composition" : language === 'en' ? "Trace Composition" : "Calcar Composición"}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {language === 'fr' ? "Même modèle et pose" : language === 'en' ? "Same model and pose" : "Misma modelo y pose"}
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/50 flex flex-row items-center justify-end gap-2.5 rounded-b-3xl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl px-5 font-bold text-xs text-stone-600 hover:bg-stone-100 h-10 border-stone-200"
          >
            {language === 'fr' ? "Annuler" : language === 'en' ? "Cancel" : "Cancelar"}
          </Button>
          <Button
            type="button"
            variant="luxury"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="rounded-xl px-6 font-bold text-xs text-stone-950 shadow-luxury h-10 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin text-stone-950" />
                {language === 'fr' ? "Traitement" : language === 'en' ? "Processing" : "Procesando"} ({generationTime}s)...
              </>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={2} />
                {language === 'fr' ? "Générer l'image" : language === 'en' ? "Generate Image" : "Generar Imagen"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
