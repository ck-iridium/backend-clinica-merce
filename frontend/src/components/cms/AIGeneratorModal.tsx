import { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIGeneratorModalProps {
  onClose: () => void;
  onGenerate: (content: string) => void;
  targetType: 'short_description' | 'rich_content';
  serviceName: string;
}

export default function AIGeneratorModal({ onClose, onGenerate, targetType, serviceName }: AIGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('premium');
  const [isLoading, setIsLoading] = useState(false);
  
  // Límites de plan
  const [limits, setLimits] = useState<{ ai_allowed: boolean; ai_requires_byok: boolean } | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(true);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`);
        if (res.ok) {
          const limitsData = await res.json();
          setLimits({
            ai_allowed: limitsData.limits.ai_allowed,
            ai_requires_byok: limitsData.limits.ai_requires_byok
          });
        }
      } catch (err) {
        console.error("Error al obtener límites de plan:", err);
      } finally {
        setLoadingLimits(false);
      }
    }
    fetchLimits();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() && !serviceName.trim()) {
      toast.error('Por favor, indica al menos el nombre del servicio o algunos detalles.');
      return;
    }

    setIsLoading(true);
    
    // Construimos el contexto para enviar a la IA
    const contextPrompt = `Servicio: ${serviceName || 'Tratamiento sin nombre'}\nContexto: ${prompt}`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrompt,
          type: targetType,
          tone: tone
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Error al generar el contenido');
      }

      const data = await res.json();
      
      // La IA puede devolver un texto o HTML, dependiendo de nuestro prompt
      let finalContent = data.content;
      
      // Si el target es short_description, queremos texto plano sin HTML
      if (targetType === 'short_description') {
        // Limpiamos etiquetas HTML de forma sencilla
        finalContent = finalContent.replace(/<[^>]*>?/gm, '');
      }
      
      onGenerate(finalContent);
      toast.success('¡Contenido generado con éxito!');
      onClose();
    } catch (error: any) {
      console.error("AI Error:", error);
      if (error.message === "AI_LIMIT_BYOK_REQUIRED") {
        toast.error("Requiere clave de API propia o mejorar su suscripción.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingLimits) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border border-stone-100 mx-4 h-[380px] flex flex-col justify-center items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 animate-pulse" />
          <div className="w-48 h-6 bg-stone-50 animate-pulse rounded-lg" />
          <div className="w-72 h-4 bg-stone-50 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const isBlocked = limits && !limits.ai_allowed;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border border-stone-100 mx-4 animate-in zoom-in-95 duration-300"
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 w-10 h-10 rounded-full flex items-center justify-center bg-stone-50 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          disabled={isLoading}
        >
          <X size={18} strokeWidth={2} />
        </button>

        {isBlocked ? (
          /* Bloqueo Exclusivo Quiet Luxury / BYOK */
          <div className="flex flex-col items-center text-center py-4 px-2">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-[#d4af37] mb-5 shadow-lg shadow-stone-200">
              <Sparkles size={26} strokeWidth={1.5} className="animate-pulse" />
            </div>
            
            <h3 className="text-2xl font-serif font-bold text-stone-800 leading-tight mb-2">
              Asistente de Redacción
            </h3>
            
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed mb-8 font-sans">
              La generación automática de contenido inteligente requiere una suscripción activa al <span className="font-bold text-stone-700">Plan Gold</span>. 
              <br/><br/>
              Si se encuentra en planes inferiores (Free, Basic o Pro), puede habilitar esta función configurando su propia <span className="font-bold text-stone-700">Clave de API</span> en los Ajustes de su negocio.
            </p>

            <div className="flex flex-col w-full gap-3 max-w-sm">
              <a 
                href="/dashboard/settings"
                className="flex items-center justify-center h-12 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                Configurar Clave de API Propia
              </a>
              <a 
                href="/dashboard/settings"
                className="flex items-center justify-center h-12 rounded-xl bg-[#d4af37] hover:bg-stone-900 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Mejorar Plan de Suscripción
              </a>
            </div>
          </div>
        ) : (
          /* Flujo de Generación Permitido */
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-[#d4af37]">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-800 leading-tight">Generar con IA</h3>
                <p className="text-sm text-stone-500 font-medium">
                  {targetType === 'short_description' ? 'Descripción Corta' : 'Contenido Detallado'}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Contexto / Ideas Clave
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="¿Qué quieres destacar? (ej: resultados inmediatos, hidratación profunda, ideal para eventos...)"
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 outline-none transition-all resize-none min-h-[120px] text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Tono de Comunicación
                </label>
                <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                  <SelectTrigger className="w-full h-[52px] px-5 rounded-2xl border-stone-200 bg-white shadow-none font-medium">
                    <SelectValue placeholder="Selecciona un tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium (Sophisticated & Elegant)</SelectItem>
                    <SelectItem value="cercano">Cercano (Friendly & Warm)</SelectItem>
                    <SelectItem value="clinico">Clínico (Professional & Precise)</SelectItem>
                    <SelectItem value="comercial">Comercial (Direct & Persuasive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-10">
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full relative overflow-hidden group h-[56px] rounded-2xl flex items-center justify-center bg-stone-900 hover:bg-[#d4af37] text-white font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>La IA está redactando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 size={18} />
                    <span>Generar Contenido Mágico</span>
                  </div>
                )}
                
                {/* Shimmer effect */}
                {!isLoading && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

