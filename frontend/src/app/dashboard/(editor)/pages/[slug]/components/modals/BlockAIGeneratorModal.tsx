"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { AtomicBlock } from '../../types';
import { getBlockDefinition } from '../../utils/blockRegistry';
import { toast } from 'sonner';

interface BlockAIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    block: AtomicBlock;
    sectionId: string;
    columnId: string;
  } | null;
  onApply: (
    blockId: string,
    sectionId: string,
    columnId: string,
    newContent: Record<string, any>
  ) => void;
}

export default function BlockAIGeneratorModal({
  isOpen,
  onClose,
  target,
  onApply,
}: BlockAIGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'premium' | 'clinico' | 'cercano'>('premium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const block = target?.block;
  const blockType = block?.block_type || '';
  const blockDef = getBlockDefinition(blockType);
  const blockLabel = blockDef?.label || 'Bloque';

  const supportsImage = ['atomic_image', 'hero', 'text_image_cta'].includes(blockType);

  // Reset al abrir o cambiar de bloque
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setGeneratedData(null);
      setActiveTab(blockType === 'atomic_image' ? 'image' : 'text');
    }
  }, [isOpen, blockType]);

  // Limpieza de reconocimiento de voz al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  if (!isOpen || !target || !block) return null;

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error('El reconocimiento por voz no es compatible con este navegador.');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (e: any) => {
        const text = e.results[0]?.[0]?.transcript || '';
        if (text) {
          setPrompt(prev => prev ? `${prev} ${text}` : text);
          toast.success('Voz reconocida');
        }
        setIsListening(false);
      };
      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Sugerencias rápidas por tipo de bloque
  const getSuggestions = () => {
    switch (blockType) {
      case 'accordion_faq':
        return [
          'Cuidados posteriores y recuperación',
          'Dolor, anestesia y confort',
          'Duración y sesiones necesarias',
          'Contraindicaciones y seguridad médica'
        ];
      case 'atomic_title':
      case 'title_heading':
        return [
          'Titular Quiet Luxury y evocador',
          'Enfoque médico y seguridad clínica',
          'Tecnología de vanguardia no invasiva',
          'Resultados naturales y rejuvenecimiento'
        ];
      case 'atomic_text':
        return [
          'Texto editorial y sensorial de bienvenida',
          'Explicación clínica sencilla del tratamiento',
          'Beneficios en armonía facial y corporal',
          'Propuesta de valor y bienestar integral'
        ];
      case 'features_grid':
        return [
          '3 pilares de excelencia médica',
          'Tecnología de última generación y confort',
          'Diagnóstico previo personalizado y seguridad',
          'Protocolos exclusivos para pacientes VIP'
        ];
      case 'hero':
        return [
          'Titular impactante de bienvenida exclusiva',
          'Medicina estética y bienestar regenerativo',
          'Llamada a consulta de valoración médica'
        ];
      case 'quote_testimonial':
        return [
          'Testimonio natural de paciente agradecida',
          'Cita inspiradora de la Dirección Médica',
          'Experiencia sensorial y confianza'
        ];
      case 'text_image_cta':
        return [
          'Innovación médica y confort sensorial',
          'Tratamiento exclusivo con cita previa',
          'Resultados progresivos sin tiempo de baja'
        ];
      case 'atomic_image':
        return [
          'Cabina médica minimalista con luz cálida difusa',
          'Primer plano de cuidado facial en atmósfera serena',
          'Textura de sérum dorado en superficie de mármol'
        ];
      default:
        return [
          'Redactar con estilo Quiet Luxury 2026',
          'Tono médico profesional y confiable'
        ];
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Escribe o dicta lo que deseas que la IA genere.');
      return;
    }

    setIsGenerating(true);
    setGeneratedData(null);
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      if (activeTab === 'image') {
        // Generación de imagen fotorrealista con IA
        const res = await fetch(`${API}/ai/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            aspect_ratio: blockType === 'hero' ? '16:9' : '1:1',
            shot_type: 'commercial',
            visual_style: 'luxury'
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Error al generar la imagen con IA');
        }

        const data = await res.json();
        setGeneratedData({ image_url: data.url });
        toast.success('¡Fotografía fotorrealista generada con éxito!');
      } else {
        // Generación de textos/estructuras con IA
        const res = await fetch(`${API}/ai/generate-block-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            block_type: blockType,
            prompt: prompt.trim(),
            tone,
            current_data: block.content_data || {},
            language: 'es'
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Error al generar contenido');
        }

        const data = await res.json();
        setGeneratedData(data.content_data);
        toast.success('¡Contenido generado por la IA!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al conectar con el motor de IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedData) return;
    onApply(target.block.id, target.sectionId, target.columnId, generatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.22)] w-full max-w-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden border border-stone-200">
        
        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-4 border-b border-stone-150 flex items-start justify-between shrink-0 bg-gradient-to-b from-stone-50/70 to-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">
                Copilot IA · Quiet Luxury
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight flex items-center gap-2">
              <span>{blockDef?.icon || '🪄'}</span>
              <span>Generar {blockLabel}</span>
            </h2>
            <p className="text-stone-400 text-xs mt-0.5 font-sans">
              Indica qué deseas transmitir y la IA adaptará el bloque al estándar de tu clínica.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-sm font-bold transition-all"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* ── Pestañas si soporta imagen ── */}
        {supportsImage && blockType !== 'atomic_image' && (
          <div className="px-7 py-2.5 bg-stone-50/80 border-b border-stone-150 flex gap-2 shrink-0">
            <button
              onClick={() => { setActiveTab('text'); setGeneratedData(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'text'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              📝 Redactar Textos
            </button>
            <button
              onClick={() => { setActiveTab('image'); setGeneratedData(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'image'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🎨 Generar Fotografía IA
            </button>
          </div>
        )}

        {/* ── Cuerpo Scrollable ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
          
          {/* Selector de Tono (solo en modo texto) */}
          {activeTab === 'text' && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                Tono de Redacción
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'premium', label: 'Quiet Luxury', sub: 'Elegante y refinado' },
                  { id: 'clinico', label: 'Médico Científico', sub: 'Riguroso y técnico' },
                  { id: 'cercano', label: 'Cálido y Empático', sub: 'Tranquilizador' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      tone === t.id
                        ? 'border-[#d4af37] bg-amber-50/30 text-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-[11px] font-bold block">{t.label}</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias Rápidas de 1 Clic */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
              Sugerencias Rápidas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {getSuggestions().map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sug)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-stone-100 hover:bg-amber-50 border border-stone-200/80 hover:border-[#d4af37]/60 text-stone-600 hover:text-stone-900 transition-all font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input de Prompt con Micrófono de Voz */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                {activeTab === 'image' ? 'Describe la Fotografía que Deseas' : 'Instrucciones para la IA'}
              </span>
              {isListening && (
                <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Escuchando por micrófono...
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === 'image'
                    ? 'Ej: Primer plano de tratamiento facial de hidro-dermoabrasión con iluminación tenue en clínica de lujo...'
                    : 'Ej: Redacta las 4 preguntas más frecuentes de pacientes que van a hacerse ácido hialurónico por primera vez...'
                }
                rows={3}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 pr-14 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all resize-none font-sans"
              />

              {/* Botón de Dictado por Voz */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md animate-bounce'
                    : 'bg-white border border-stone-200 text-stone-500 hover:text-[#d4af37] hover:border-[#d4af37]'
                }`}
                title={isListening ? 'Detener micrófono' : 'Dictar por voz'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a3 3 0 00-3 3v6a3 3 0 006 0v-6a3 3 0 00-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Botón Ejecutar Generación */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Generando con IA...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>{activeTab === 'image' ? 'Crear Fotografía IA' : 'Generar Contenido'}</span>
                </>
              )}
            </button>
          </div>

          {/* Previsualización del Resultado Generado */}
          {generatedData && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/20 border border-[#d4af37]/40 space-y-3 animate-in fade-in zoom-in-98 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                  <span>✓</span>
                  <span>Vista Previa del Resultado</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {blockLabel}
                </span>
              </div>

              {/* Vista previa según tipo */}
              <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 text-stone-800 text-xs space-y-2 max-h-56 overflow-y-auto font-sans">
                {generatedData.title && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Título:</span>
                    <p className="font-serif font-bold text-sm text-stone-900">{generatedData.title}</p>
                  </div>
                )}
                {generatedData.subtitle && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Subtítulo:</span>
                    <p className="text-stone-600">{generatedData.subtitle}</p>
                  </div>
                )}
                {generatedData.heading && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Encabezado:</span>
                    <p className="font-serif font-bold text-base text-stone-900">{generatedData.heading}</p>
                  </div>
                )}
                {generatedData.subheading && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Subtítulo:</span>
                    <p className="text-stone-600">{generatedData.subheading}</p>
                  </div>
                )}
                {generatedData.content_html && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Texto Editorial:</span>
                    <div 
                      className="prose prose-sm text-stone-700 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: generatedData.content_html }} 
                    />
                  </div>
                )}
                {generatedData.faqs && Array.isArray(generatedData.faqs) && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">
                      Preguntas Frecuentes ({generatedData.faqs.length}):
                    </span>
                    {generatedData.faqs.map((f: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-stone-50 border border-stone-150">
                        <p className="font-bold text-stone-900">{f.question}</p>
                        <p className="text-stone-600 mt-0.5">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                {generatedData.items && Array.isArray(generatedData.items) && (
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">
                      Tarjetas ({generatedData.items.length}):
                    </span>
                    {generatedData.items.map((it: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-stone-50 border border-stone-150">
                        <p className="font-bold text-stone-900">{it.title}</p>
                        <p className="text-stone-600 mt-0.5">{it.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {generatedData.quote && (
                  <div>
                    <p className="italic text-stone-700">“{generatedData.quote}”</p>
                    <p className="font-bold text-stone-900 mt-1">{generatedData.author_name} — <span className="text-stone-500 font-normal">{generatedData.author_role}</span></p>
                  </div>
                )}
                {generatedData.image_url && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Fotografía Generada:</span>
                    <img 
                      src={generatedData.image_url} 
                      alt="Generada con IA" 
                      className="w-full h-44 object-cover rounded-xl border border-stone-200" 
                    />
                  </div>
                )}
              </div>

              {/* Botones de Confirmación */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  🔄 Probar otra versión
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 bg-[#d4af37] hover:bg-[#c39e26] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                >
                  ✓ Aplicar al Bloque
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
