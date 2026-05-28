import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
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
        className="p-0 border-none max-w-lg overflow-hidden bg-white max-h-[95vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 bg-gradient-to-r from-stone-50 to-yellow-50/30 border-b border-stone-100 relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-yellow-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <DialogTitle className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-yellow-200 flex items-center justify-center text-white shadow-md">
              <ImageIcon size={14} strokeWidth={2.5} />
            </span>
            {language === 'fr' 
              ? "Studio Photo IA" 
              : language === 'en' 
                ? "AI Photo Studio" 
                : "Estudio Fotográfico IA"}
          </DialogTitle>
          <DialogDescription className="text-stone-500 mt-2 text-sm max-w-[90%]">
            {language === 'fr' 
              ? "Décrivez ce que vous souhaitez voir. L'IA créera une photo premium dans le style 'Quiet Luxury' de la clinique." 
              : language === 'en' 
                ? "Describe what you want to see. The AI will create a premium photo matching the clinic's 'Quiet Luxury' style." 
                : "Describe lo que quieres ver. La IA creará una foto premium con el estilo 'Quiet Luxury' de la clínica."}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-5 relative">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">
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
                className="text-[10px] font-bold text-[#d4af37] hover:text-[#b08e23] flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-all disabled:opacity-50"
              >
                {isOptimizing ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Sparkles size={10} />
                )}
                {language === 'fr' 
                  ? "✨ Remplissage automatique IA" 
                  : language === 'en' 
                    ? "✨ Auto-complete with AI" 
                    : "✨ Autocompletar con IA"}
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
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all text-sm resize-none min-h-[120px]"
              disabled={isGenerating || isOptimizing}
            />
          </div>

          <div className="flex flex-col gap-4">
            <details className="group">
              <summary className="text-[10px] font-black text-stone-400 uppercase tracking-widest cursor-pointer hover:text-stone-600 transition-all flex items-center gap-2 list-none">
                <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-90 transition-transform">+</span>
                {language === 'fr' 
                  ? "Options de style avancées (Optionnel)" 
                  : language === 'en' 
                    ? "Advanced Style Options (Optional)" 
                    : "Opciones de Estilo Avanzadas (Opcional)"}
              </summary>
              <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase mb-1.5 block">
                    {language === 'fr' ? "Prise de vue" : language === 'en' ? "Shot Type" : "Toma"}
                  </label>
                  <Select disabled={isGenerating} value={shotType} onValueChange={setShotType}>
                    <SelectTrigger className="w-full h-[40px] rounded-xl border-stone-100 bg-stone-50/50 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closeup_beauty">
                        {language === 'fr' 
                          ? "Gros Plan / Macro Beauty" 
                          : language === 'en' 
                            ? "Closeup / Macro Beauty" 
                            : "Primer Plano / Macro Beauty"}
                      </SelectItem>
                      <SelectItem value="closeup">
                        {language === 'fr' ? "Macro Technique" : language === 'en' ? "Technical Macro" : "Macro Técnico"}
                      </SelectItem>
                      <SelectItem value="scene">
                        {language === 'fr' ? "Scène / Ambiance" : language === 'en' ? "Scene / Ambiance" : "Escena / Ambiente"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase mb-1.5 block">
                    {language === 'fr' ? "Style" : language === 'en' ? "Style" : "Estilo"}
                  </label>
                  <Select disabled={isGenerating} value={visualStyle} onValueChange={setVisualStyle}>
                    <SelectTrigger className="w-full h-[40px] rounded-xl border-stone-100 bg-stone-50/50 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">
                        {language === 'fr' ? "Épuré" : language === 'en' ? "Clean" : "Limpio"}
                      </SelectItem>
                      <SelectItem value="luxury">
                        {language === 'fr' ? "Luxe" : language === 'en' ? "Luxury" : "Lujo"}
                      </SelectItem>
                      <SelectItem value="zen">
                        {language === 'fr' ? "Zen" : language === 'en' ? "Zen" : "Zen"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </details>

            <div>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">
                {language === 'fr' 
                  ? "Format (Aspect Ratio) *" 
                  : language === 'en' 
                    ? "Format (Aspect Ratio) *" 
                    : "Formato (Aspect Ratio) *"}
              </label>
              <Select disabled={isGenerating} value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-full h-[46px] rounded-xl border-stone-200 bg-stone-50 focus:bg-white text-xs font-medium">
                  <SelectValue placeholder={language === 'fr' ? "Sélectionner le format" : language === 'en' ? "Select format" : "Selecciona formato"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">
                    {language === 'fr' ? "Vertical (9:16 - Mobile)" : language === 'en' ? "Vertical (9:16 - Mobile)" : "Vertical (9:16 - Móvil)"}
                  </SelectItem>
                  <SelectItem value="1:1">
                    {language === 'fr' ? "Carré (1:1 - Couvertures)" : language === 'en' ? "Square (1:1 - Covers)" : "Cuadrada (1:1 - Portadas)"}
                  </SelectItem>
                  <SelectItem value="16:9">
                    {language === 'fr' ? "Horizontal (16:9 - En-têtes)" : language === 'en' ? "Horizontal (16:9 - Headers)" : "Horizontal (16:9 - Cabeceras)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de Calidad */}
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-700">
                  {language === 'fr' ? "Éviter les textes" : language === 'en' ? "Avoid Texts" : "Evitar Textos"}
                </span>
                <span className="text-[9px] text-stone-400 font-medium leading-tight">
                  {language === 'fr' 
                    ? "Supprime automatiquement les filigranes et les polices" 
                    : language === 'en' 
                      ? "Automatically removes watermarks and typography" 
                      : "Elimina automáticamente marcas de agua y tipografías"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
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
            <div className="pt-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">
                {language === 'fr' 
                  ? "🖼️ Image de référence (Optionnel)" 
                  : language === 'en' 
                    ? "🖼️ Reference Image (Optional)" 
                    : "🖼️ Imagen de Referencia (Opcional)"}
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
                  className="w-full py-5 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-[#d4af37] hover:bg-yellow-50/20 transition-all cursor-pointer group"
                >
                  <ImageIcon size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">
                    {language === 'fr' 
                      ? "Cliquez, glissez ou collez (Ctrl+V) une image" 
                      : language === 'en' 
                        ? "Click, drag or paste (Ctrl+V) an image" 
                        : "Clic, arrastrar o pega (Ctrl+V) una imagen"}
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
                        onClick={() => setReferenceImage(null)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border-2 border-white z-10"
                        title={language === 'fr' ? "Supprimer l'image" : language === 'en' ? "Remove image" : "Quitar imagen"}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-50/30 p-3.5 rounded-2xl border border-yellow-100 shadow-sm">
                      <label className="text-[10px] font-black text-[#b08e23] uppercase mb-2 block tracking-wider">
                        {language === 'fr' ? "🎯 Mode de référence" : language === 'en' ? "🎯 Reference Mode" : "🎯 Modo de Referencia"}
                      </label>
                      <Select disabled={isGenerating} value={referenceType} onValueChange={setReferenceType}>
                        <SelectTrigger className="w-full h-[38px] rounded-xl border-white bg-white/80 backdrop-blur-sm text-[11px] font-bold text-stone-800 shadow-inner">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-100 shadow-2xl">
                          <SelectItem value="style" className="py-2.5">
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {language === 'fr' ? "Hériter de l'esthétique" : language === 'en' ? "Inherit Aesthetics" : "Heredar Estética"}
                              </span>
                              <span className="text-[9px] text-stone-400">
                                {language === 'fr' ? "Nouveau modèle, même lumière" : language === 'en' ? "New model, same light" : "Nueva modelo, misma luz"}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="composition" className="py-2.5">
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {language === 'fr' ? "Calquer la composition" : language === 'en' ? "Trace Composition" : "Calcar Composición"}
                              </span>
                              <span className="text-[9px] text-stone-400">
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
        <DialogFooter className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-stone-600 hover:bg-stone-100 transition-all disabled:opacity-50"
          >
            {language === 'fr' ? "Annuler" : language === 'en' ? "Cancel" : "Cancelar"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-to-r from-stone-900 to-stone-800 hover:from-[#d4af37] hover:to-[#b08e23] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-transparent"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {language === 'fr' ? "Traitement" : language === 'en' ? "Processing" : "Procesando"} ({generationTime}s)...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {language === 'fr' ? "Générer l'image" : language === 'en' ? "Generate Image" : "Generar Imagen"}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
