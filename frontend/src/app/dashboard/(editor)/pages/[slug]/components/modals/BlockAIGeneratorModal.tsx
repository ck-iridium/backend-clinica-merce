"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { AtomicBlock } from '../../types';
import { getBlockDefinition, getBlockIcon } from '../../utils/blockRegistry';
import { toast } from 'sonner';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window === 'undefined') return headers;
  let tenantId = getCookie('tenant_id') || '';
  let authToken = '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!tenantId) tenantId = parsed.tenant_id || '';
      authToken = parsed.access_token || parsed.token || '';
    }
  } catch {}
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

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
  const [tone, setTone] = useState<'cercano' | 'premium' | 'clinico'>('cercano');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Límites y cuotas de IA
  const [limitsData, setLimitsData] = useState<{
    planType: string;
    hasOwnKey: boolean;
    dailyActionsUsed: number;
    dailyActionsLimit: number;
    imagesMonthlyLimit: number;
    imagesRemaining: number;
    imagesUsed: number;
    isTrial: boolean;
  } | null>(null);

  const block = target?.block;
  const blockType = block?.block_type || '';
  const blockDef = getBlockDefinition(blockType);
  const blockLabel = blockDef?.label || 'Bloque';

  const supportsImage = ['atomic_image', 'hero', 'text_image_cta'].includes(blockType);

  const fetchLimits = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API}/settings/limits`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const d = await res.json();
        const plan = (d.plan_type || 'free').toLowerCase();
        const ownKey = !!d.has_own_key;
        const dailyLimit = d.limits?.ai_smart_actions_daily ?? (plan === 'basic' ? 15 : 35);
        const dailyUsed = d.ai_daily_actions_used ?? 0;
        const isTrial = plan === 'free';
        const imgLimit = d.limits?.ai_images_monthly ?? (isTrial ? 5 : 30);
        const imgRemaining = d.limits?.ai_images_remaining ?? (isTrial ? 5 : 30);
        const imgUsed = isTrial ? (d.ai_trial_images_used ?? 0) : (d.ai_monthly_images_used ?? 0);

        setLimitsData({
          planType: plan,
          hasOwnKey: ownKey,
          dailyActionsUsed: dailyUsed,
          dailyActionsLimit: dailyLimit,
          imagesMonthlyLimit: imgLimit,
          imagesRemaining: imgRemaining,
          imagesUsed: imgUsed,
          isTrial,
        });
      }
    } catch (err) {
      console.error('Error fetching limits in BlockAIGeneratorModal:', err);
    }
  };

  // Reset al abrir o cambiar de bloque
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setGeneratedData(null);
      setActiveTab(blockType === 'atomic_image' ? 'image' : 'text');
      fetchLimits();
    }
  }, [isOpen, blockType]);

  // Cuota de texto
  const isTextUnlimited = limitsData?.hasOwnKey || limitsData?.planType === 'gold';
  const textLimit = limitsData?.dailyActionsLimit ?? (limitsData?.planType === 'basic' ? 15 : 35);
  const textRemaining = isTextUnlimited
    ? 999999
    : Math.max(0, textLimit - (limitsData?.dailyActionsUsed ?? 0));
  const isTextExhausted = !isTextUnlimited && textRemaining <= 0;

  // Cuota de fotos
  const isImageUnlimited = !!limitsData?.hasOwnKey;
  const isTrial = limitsData?.isTrial ?? false;
  const imageLimit = limitsData?.imagesMonthlyLimit ?? (isTrial ? 5 : 30);
  const imageRemaining = isImageUnlimited ? 999999 : (limitsData?.imagesRemaining ?? (isTrial ? 5 : 30));
  const isImageExhausted = !isImageUnlimited && imageRemaining <= 0;

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

  // Placeholder dinámico e intuitivo según el tipo de bloque
  const getPlaceholder = () => {
    if (activeTab === 'image') {
      return 'Ej: Fotografía editorial y luminosa, espacio elegante, plano detalle estético, luz natural suave, 8k...';
    }
    switch (blockType) {
      case 'accordion_faq':
        return 'Ej: Redacta 4 preguntas frecuentes sobre cómo reservar, cancelaciones, duración y qué incluye el servicio...';
      case 'atomic_title':
      case 'title_heading':
        return 'Ej: Un titular inspirador para presentar nuestros servicios estrella e invitar a visitarnos...';
      case 'atomic_text':
        return 'Ej: Escribe un texto explicando la comodidad de nuestro servicio, la atención personalizada y el cuidado del cliente...';
      case 'features_grid':
        return 'Ej: 3 ventajas principales de elegirnos: puntualidad, productos de alta calidad y trato 100% personalizado...';
      case 'hero':
        return 'Ej: Frase impactante de bienvenida para la portada que invite a descubrir nuestro espacio y reservar cita...';
      case 'quote_testimonial':
        return 'Ej: Testimonio de una clienta encantada con su resultado y la atención recibida...';
      case 'text_image_cta':
        return 'Ej: Presentación de nuestra experiencia exclusiva, destacando el bienestar y un botón para reservar cita...';
      default:
        return 'Indica de qué quieres hablar, qué servicios destacar o qué mensaje deseas transmitir...';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Escribe o dicta lo que deseas que la IA genere.');
      return;
    }

    if (activeTab === 'text' && isTextExhausted) {
      toast.error(`Has alcanzado tu límite diario de ${textLimit} acciones. Conecta tu API Key en Ajustes para continuar.`);
      return;
    }

    if (activeTab === 'image' && isImageExhausted) {
      toast.error(`Has agotado tu cupo de ${imageLimit} fotografías. Conecta tu API Key en Ajustes para continuar.`);
      return;
    }

    setIsGenerating(true);
    setGeneratedData(null);
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const authHeaders = getAuthHeaders();

    try {
      if (activeTab === 'image') {
        // Generación de imagen fotorrealista con IA
        const res = await fetch(`${API}/ai/generate-image`, {
          method: 'POST',
          headers: authHeaders,
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
        fetchLimits();
      } else {
        // Generación de textos/estructuras con IA
        const res = await fetch(`${API}/ai/generate-block-content`, {
          method: 'POST',
          headers: authHeaders,
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
        fetchLimits();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al conectar con el motor de IA');
      fetchLimits();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedData) return;
    let finalData = { ...generatedData };
    if (blockType === 'atomic_text') {
      const htmlVal = finalData.html || finalData.content_html || '';
      finalData.html = htmlVal;
      finalData.content_html = htmlVal;
    } else if (blockType === 'text_image_cta') {
      const h = finalData.heading || finalData.title || '';
      const sub = finalData.subheading || finalData.description || '';
      const cta = finalData.cta_text || finalData.button_text || '';
      if (h) {
        finalData.heading = h;
        finalData.title = h;
      }
      if (sub) {
        finalData.subheading = sub;
        finalData.description = sub;
      }
      if (cta) {
        finalData.cta_text = cta;
        finalData.button_text = cta;
      }
    } else if (blockType === 'quote_testimonial') {
      const a = finalData.author || finalData.author_name || 'Cliente Satisfecho';
      const r = finalData.role || finalData.author_role || 'Clienta habitual';
      finalData.author = a;
      finalData.author_name = a;
      finalData.role = r;
      finalData.author_role = r;
      if (typeof finalData.rating !== 'number') finalData.rating = 5;
    }
    onApply(target.block.id, target.sectionId, target.columnId, finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.22)] w-full max-w-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden border border-stone-200">
        
        {/* ── Header ── */}
        <div className="px-7 pt-6 pb-4 border-b border-stone-150 flex items-start justify-between shrink-0 bg-gradient-to-b from-stone-50/70 to-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-[10px] font-black uppercase tracking-wider mb-2">
              <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
              <span>Copilot IA · Diseñador de Bloques</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0">
                {getBlockIcon(blockType as any)}
              </div>
              <span>Generar {blockLabel}</span>
            </h2>
            <p className="text-stone-400 text-xs mt-0.5 font-sans">
              Indica qué deseas transmitir y la IA adaptará el bloque al estilo de tu negocio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-all"
            aria-label="Cerrar modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Pestañas si soporta imagen ── */}
        {supportsImage && blockType !== 'atomic_image' && (
          <div className="px-7 py-2.5 bg-stone-50/80 border-b border-stone-150 flex items-center justify-between gap-2 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('text'); setGeneratedData(null); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'text'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                <span>Redactar Textos</span>
              </button>
              <button
                onClick={() => { setActiveTab('image'); setGeneratedData(null); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'image'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span>Generar Fotografía IA</span>
              </button>
            </div>

            {/* Chip de saldo en barra de pestañas */}
            <div className="text-[11px] font-medium text-stone-500 hidden sm:flex items-center gap-1.5">
              {activeTab === 'text' ? (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                  isTextExhausted ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-stone-600 border-stone-200'
                }`}>
                  <span>⚡</span>
                  <span>{isTextUnlimited ? 'Ilimitadas (∞)' : `${textRemaining}/${textLimit} hoy`}</span>
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                  isImageExhausted ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-stone-600 border-stone-200'
                }`}>
                  <span>📸</span>
                  <span>{isImageUnlimited ? '∞ con tu clave' : isTrial ? `${imageRemaining}/${imageLimit} prueba` : `${imageRemaining}/${imageLimit} este mes`}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Cuerpo Scrollable ── */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">

          {/* Bloqueo suave / aviso de cuota si se agota */}
          {activeTab === 'text' && isTextExhausted && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-stone-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>Límite diario de {textLimit} acciones inteligentes alcanzado</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Has consumido tu cuota diaria de textos inteligentes. Se reiniciará mañana a las 00:00 UTC. Si no deseas tener límites diarios, puedes conectar tu propia API Key en Ajustes o actualizar tu suscripción.
              </p>
              <div className="pt-0.5">
                <a
                  href="/dashboard/settings?tab=advanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[11px] font-bold hover:bg-stone-800 transition-all shadow-2xs"
                >
                  <span>Conectar mi propia API Key en Ajustes</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'image' && isImageExhausted && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-stone-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>Bolsa de {imageLimit} fotografías {isTrial ? 'de prueba agotada' : 'mensuales alcanzada'}</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Has utilizado todas las fotos incluidas con la clave de ProBookia. Conecta tu propia API Key (Google Gemini u OpenAI) en Ajustes &gt; Avanzado para generar fotografías comerciales ilimitadas sin coste de plataforma.
              </p>
              <div className="pt-0.5">
                <a
                  href="/dashboard/settings?tab=advanced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[11px] font-bold hover:bg-stone-800 transition-all shadow-2xs"
                >
                  <span>Conectar API Key en Ajustes</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          )}
          
          {/* Selector de Tono (solo en modo texto) */}
          {activeTab === 'text' && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                Tono de Redacción
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cercano', label: 'Cercano & Tuteo', sub: 'De tú a tú, fresco y sin tecnicismos' },
                  { id: 'premium', label: 'Quiet Luxury', sub: 'Elegante y refinado' },
                  { id: 'clinico', label: 'Profesional & Técnico', sub: 'Riguroso y con autoridad' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      tone === t.id
                        ? 'border-orange-500 bg-orange-50/40 text-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className={`text-[11px] font-bold block ${tone === t.id ? 'text-orange-600' : ''}`}>{t.label}</span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                placeholder={getPlaceholder()}
                rows={4}
                disabled={(activeTab === 'text' && isTextExhausted) || (activeTab === 'image' && isImageExhausted)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 pr-14 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none font-sans leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
              />

              {/* Botón de Dictado por Voz */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={(activeTab === 'text' && isTextExhausted) || (activeTab === 'image' && isImageExhausted)}
                className={`absolute bottom-3.5 right-3.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md animate-bounce'
                    : 'bg-white border border-stone-200 text-stone-500 hover:text-orange-500 hover:border-orange-500 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed'
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
              disabled={
                isGenerating ||
                !prompt.trim() ||
                (activeTab === 'text' && isTextExhausted) ||
                (activeTab === 'image' && isImageExhausted)
              }
              className="flex items-center gap-2 bg-gradient-to-tr from-[#ff5500] to-[#ff7a18] hover:from-[#ff4500] hover:to-[#ff6a00] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generando con IA...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
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
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Vista Previa del Resultado</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {blockLabel}
                </span>
              </div>

              {/* Vista previa según tipo */}
              <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 text-stone-800 text-xs space-y-2.5 max-h-56 overflow-y-auto font-sans">
                {(generatedData.heading || generatedData.title) && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Título:</span>
                    <p className="font-serif font-bold text-sm text-stone-900">{generatedData.heading || generatedData.title}</p>
                  </div>
                )}
                {(generatedData.subheading || generatedData.description) && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Descripción / Subtítulo:</span>
                    <p className="text-stone-600 leading-relaxed">{generatedData.subheading || generatedData.description}</p>
                  </div>
                )}
                {(generatedData.html || generatedData.content_html) && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold mb-1">Párrafo de Texto:</span>
                    <div 
                      className="prose prose-sm text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-150" 
                      dangerouslySetInnerHTML={{ __html: generatedData.html || generatedData.content_html }} 
                    />
                  </div>
                )}
                {(generatedData.cta_text || generatedData.button_text) && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Botón de Acción:</span>
                    <span className="inline-block mt-0.5 px-3 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold">
                      {generatedData.cta_text || generatedData.button_text}
                    </span>
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
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold mb-1">Testimonio:</span>
                    <p className="italic text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-150">“{generatedData.quote}”</p>
                    <p className="font-bold text-stone-900 mt-1.5 text-xs">
                      {generatedData.author || generatedData.author_name}
                      {(generatedData.role || generatedData.author_role) && (
                        <span className="text-stone-500 font-normal"> — {generatedData.role || generatedData.author_role}</span>
                      )}
                    </p>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Probar otra versión</span>
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#d4af37] hover:bg-[#c39e26] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Aplicar al Bloque</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
