'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  Tag,
  Home,
  Check,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import ChromaticOrb from './ChromaticOrb';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';
import { useCopilotResize } from './useCopilotResize';
import { useCopilotSpeech } from './useCopilotSpeech';

interface ConciergeOptionItem {
  id?: string;
  title: string;
  subtitle?: string;
  category?: 'location' | 'service' | 'modality' | 'time' | 'general';
  group?: string;
  badge?: string;
  action_value: string;
}

interface ConciergeAction {
  type: string;
  service_id?: string;
  service_name?: string;
  date?: string;
  time?: string;
  location_id?: string;
  location_name?: string;
  modality?: string;
  options?: string[];
  rich_options?: ConciergeOptionItem[];
  option_groups?: string[];
  url?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  action?: ConciergeAction;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function FrontEndConciergeWidget() {
  const router = useRouter();
  const { language } = useLanguage();

  // 1. Detección de Modo Oscuro / Claro del Tema del Tenant
  const [isThemeDark, setIsThemeDark] = useState(false);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkDark = () => {
        const isDark = document.documentElement.classList.contains('dark') || 
                       document.body.classList.contains('dark');
        setIsThemeDark(isDark);
      };
      checkDark();
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  // 2. Redimensionamiento Suave (Reutilización modular de useCopilotResize)
  const {
    chatWidth,
    chatHeight,
    isResizingActive,
    startResize,
    handleResize,
    stopResize
  } = useCopilotResize();

  // 3. Estados de UI del Widget
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [remainingMessages, setRemainingMessages] = useState<number>(8);
  const [isListening, setIsListening] = useState(false);
  const [multiSelections, setMultiSelections] = useState<Record<number, Record<string, string>>>({});

  // 4. Sesión Efímera Anónima (Anti-Abuso)
  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('probookia_concierge_session');
      if (!sid) {
        sid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        sessionStorage.setItem('probookia_concierge_session', sid);
      }
      setSessionId(sid);
    }
  }, []);

  // 5. Historial de Mensajes y Mensaje de Bienvenida Quiet Luxury
  const welcomeText = language === 'fr'
    ? 'Bonjour et bienvenue. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd’hui ? Vous pouvez me poser des questions sur nos soins ou demander nos créneaux disponibles.'
    : language === 'en'
      ? 'Hello and welcome. I am your virtual assistant. How may I assist you today? You can ask me about our treatments or inquire about available appointment slots.'
      : 'Hola, te damos la bienvenida. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedes consultarme sobre cualquier tratamiento o pedirme disponibilidad de citas.';

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: welcomeText }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 6. Voz TTS y Reconocimiento de Voz
  const audioLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';
  const { speakText, stopSpeaking, unlockAudioContext, isSpeaking } = useCopilotSpeech({
    isMuted,
    voiceGender,
    audioLanguage
  });

  // 7. Auto-scroll suave
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 8. Reconocimiento de Voz del Navegador (Web Speech API sin coste)
  const recognitionRef = useRef<any>(null);

  const toggleVoiceRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tu navegador no soporta entrada de voz directa.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();
    unlockAudioContext();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = audioLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Error iniciando reconocimiento de voz:', e);
      setIsListening(false);
    }
  };

  // 9. Enviar Mensaje al Backend de Concierge
  const handleSend = async (textToSend?: string) => {
    stopSpeaking();
    unlockAudioContext();

    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: queryText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const tenantId = getCookie('tenant_id') || '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (tenantId) headers['X-Tenant-ID'] = tenantId;

      const response = await fetch(`${API_URL}/api/public/ai/concierge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: queryText,
          history: updatedMessages.slice(1).map((m) => ({ role: m.role, content: m.content })),
          session_id: sessionId,
          voice_gender: voiceGender,
          language: language || 'es',
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el asistente.');
      }

      const data = await response.json();
      const replyText = data.response || 'Disculpa, no pude procesar la consulta en este instante.';
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: replyText,
          action: data.action || undefined,
        },
      ]);

      if (typeof data.remaining_messages === 'number') {
        setRemainingMessages(data.remaining_messages);
      }

      // Sintetizar voz si no está silenciado
      speakText(replyText, data.audio_response_base64);

    } catch (err: any) {
      console.error('Error en FrontEndConciergeWidget:', err);
      const errMsg = 'En este momento estoy actualizando la información de citas. Puedes consultar nuestro catálogo y reservar directamente tu cita con el botón de reserva.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: errMsg,
          action: { type: 'booking', url: '/reservar' },
        },
      ]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    setMultiSelections({});
    setMessages([{ role: 'model', content: welcomeText }]);
  };

  const chips = [
    { label: 'Tratamientos más populares', query: '¿Cuáles son los tratamientos más solicitados y recomendados?' },
    { label: 'Consultar huecos libres', query: '¿Qué disponibilidad de citas tenéis para esta semana?' },
    { label: 'Ubicación y horarios', query: '¿Dónde estáis ubicados y en qué horario abrís?' },
    { label: 'Precios y tarifas', query: '¿Me puedes detallar vuestros precios y servicios principales?' },
  ];

  return (
    <>
      {/* Overlay invisible mientras se redimensiona */}
      {isResizingActive && (
        <div
          className="fixed inset-0 z-[99999] cursor-nwse-resize select-none bg-transparent"
          onMouseMove={(e) => handleResize(e.nativeEvent)}
          onMouseUp={stopResize}
        />
      )}

      <div
        className={
          isOpen
            ? 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 font-sans'
            : 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto font-sans'
        }
      >
        {/* ── PANEL ABIERTO DEL CONCIERGE ── */}
        {isOpen && (
          <div
            style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
            className={`bg-white/95 dark:bg-stone-950/95 backdrop-blur-2xl border border-stone-200/90 dark:border-stone-800/90 rounded-[2rem] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden relative select-none mr-4 md:mr-0 min-w-[390px] sm:min-w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] max-sm:!w-full max-sm:!h-full max-sm:!min-w-0 max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh] ${
              isResizingActive
                ? 'transition-none pointer-events-auto'
                : 'transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6'
            }`}
          >
            {/* Handles de Redimensionamiento (Desktop) */}
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden touch-none"
              title="Arrastra para redimensionar"
            >
              <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/60 group-hover/resize:border-[#d4af37] transition-colors rounded-tl" />
            </div>

            {/* Cabecera del Asistente (Quiet Luxury) */}
            <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <ChromaticOrb size="md" isSpeaking={isSpeaking} theme={isThemeDark ? 'dark' : 'light'} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm tracking-tight">
                      Asistente Virtual
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-medium">Atención y Citas 24/7</p>
                </div>
              </div>

              {/* Acciones de la Cabecera */}
              <div className="flex items-center gap-1.5">
                {/* Selector Voz Femenina / Masculina */}
                <button
                  type="button"
                  onClick={() => {
                    const next = voiceGender === 'female' ? 'male' : 'female';
                    setVoiceGender(next);
                    toast.success(next === 'male' ? 'Voz masculina activada' : 'Voz femenina activada');
                  }}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 transition-colors"
                  title="Cambiar género de voz"
                >
                  {voiceGender === 'female' ? 'Voz F' : 'Voz M'}
                </button>

                {/* Mute */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                  title={isMuted ? 'Activar voz' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Limpiar */}
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                  title="Reiniciar conversación"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Cerrar */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors ml-1"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ecualizador de Ondas de Voz (cuando habla el concierge) */}
            <VoiceWaveVisualizer
              isSpeaking={isSpeaking}
              onStop={stopSpeaking}
              language={language || 'es'}
            />

            {/* Lista de Mensajes */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 select-text">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} animate-in fade-in duration-300`}
                  >
                    <div className={`flex items-end gap-2 ${msg.action ? 'w-full max-w-[96%]' : 'max-w-[88%]'}`}>
                      {isModel && (
                        <div className="mb-1 shrink-0">
                          <ChromaticOrb 
                            size="sm" 
                            isSpeaking={isSpeaking && index === messages.length - 1} 
                            theme={isThemeDark ? 'dark' : 'light'} 
                          />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm w-full ${
                          isModel
                            ? 'bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 rounded-bl-sm border border-stone-200/60 dark:border-stone-800'
                            : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 rounded-br-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Opciones Interactivas Clicables (Tarjetas 1 por fila, Grid de Horas y Selección Múltiple) */}
                        {(() => {
                          const baseOpts: ConciergeOptionItem[] = msg.action?.rich_options && msg.action.rich_options.length > 0
                            ? msg.action.rich_options
                            : (msg.action?.options || []).map((opt) => {
                                const cleanOpt = opt.trim();
                                const isTime = /^\d{1,2}:\d{2}/.test(cleanOpt);
                                return {
                                  title: cleanOpt,
                                  action_value: isTime ? (cleanOpt.toLowerCase().startsWith('a las') ? cleanOpt : `A las ${cleanOpt}`) : cleanOpt,
                                  category: isTime ? 'time' : /sede|cl[ií]nica|centro|sal[oó]n|calle|avda/i.test(cleanOpt) ? 'location' : /domicilio/i.test(cleanOpt) ? 'modality' : 'service',
                                  group: isTime ? 'Horarios disponibles' : /sede|cl[ií]nica|centro|sal[oó]n|calle|avda|domicilio/i.test(cleanOpt) ? 'Lugar de la cita' : 'Tratamiento'
                                };
                              });

                          // Normalizar grupos: "Lugar de la cita", "Horarios disponibles", etc.
                          const richOpts: ConciergeOptionItem[] = baseOpts.map((opt) => {
                            const isTime = opt.category === 'time' || /^\d{1,2}:\d{2}/.test(opt.title.trim());
                            const isLocation = opt.category === 'location' || opt.category === 'modality' || /sede|ubicaci[oó]n|lugar|domicilio/i.test(opt.group || '');

                            return {
                              ...opt,
                              category: isTime ? 'time' : opt.category,
                              group: isTime
                                ? (opt.group && opt.group !== 'Opciones' ? opt.group : 'Horarios disponibles')
                                : isLocation
                                  ? 'Lugar de la cita'
                                  : (opt.group || 'Opciones')
                            };
                          });

                          if (richOpts.length === 0) return null;

                          const distinctGroups = Array.from(new Set(richOpts.map((o) => o.group || 'Opciones')));
                          const isAllTimeGroups = distinctGroups.every((grpName) => {
                            const items = richOpts.filter((o) => (o.group || 'Opciones') === grpName);
                            return items.some((o) => o.category === 'time' || /^\d{1,2}:\d{2}/.test(o.title.trim()));
                          });
                          const isMultiGroup = distinctGroups.length > 1 && !isAllTimeGroups;
                          const currentMsgSelections = multiSelections[index] || {};

                          return (
                            <div className="mt-3.5 space-y-3.5 w-full">
                              {distinctGroups.map((grpName, grpIdx) => {
                                const itemsInGroup = richOpts.filter((o) => (o.group || 'Opciones') === grpName);
                                const isTimeGroup = itemsInGroup.some((o) => o.category === 'time' || /^\d{1,2}:\d{2}/.test(o.title.trim()));

                                return (
                                  <div key={grpIdx} className="space-y-2 w-full">
                                    {(isMultiGroup || isTimeGroup || distinctGroups.length > 1) && (
                                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#b08e23] dark:text-[#d4af37] flex items-center gap-1.5 pl-0.5">
                                        {isTimeGroup ? (
                                          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                                        ) : isMultiGroup ? (
                                          <span className="w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[10px] font-black">
                                            {grpIdx + 1}
                                          </span>
                                        ) : null}
                                        <span>{grpName}</span>
                                      </p>
                                    )}

                                    {isTimeGroup ? (
                                      /* Grid de Pastillas Horarias (Time Chips / Pills) */
                                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full pt-0.5">
                                        {itemsInGroup.map((opt, optIdx) => (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            onClick={() => {
                                              handleSend(opt.action_value || `A las ${opt.title}`);
                                            }}
                                            className="px-2.5 py-2.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-950/90 hover:border-[#d4af37] hover:bg-[#d4af37]/10 dark:hover:bg-[#d4af37]/15 hover:shadow-sm text-stone-800 dark:text-stone-100 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 group shadow-2xs"
                                          >
                                            <Clock className="w-3 h-3 text-[#d4af37] shrink-0 transition-transform group-hover:scale-110" />
                                            <span>{opt.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col gap-2 w-full">
                                        {itemsInGroup.map((opt, optIdx) => {
                                          const isSelected = isMultiGroup
                                            ? currentMsgSelections[grpName] === opt.action_value
                                            : false;

                                          return (
                                            <button
                                              key={optIdx}
                                              type="button"
                                              onClick={() => {
                                                if (isMultiGroup) {
                                                  setMultiSelections((prev) => {
                                                    const currentMap = prev[index] || {};
                                                    const currentVal = currentMap[grpName];
                                                    const nextMap = { ...currentMap };
                                                    if (currentVal === opt.action_value) {
                                                      delete nextMap[grpName];
                                                    } else {
                                                      nextMap[grpName] = opt.action_value;
                                                    }
                                                    return {
                                                      ...prev,
                                                      [index]: nextMap,
                                                    };
                                                  });
                                                } else {
                                                  handleSend(opt.action_value);
                                                }
                                              }}
                                              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                                                isSelected
                                                  ? 'bg-[#d4af37]/15 dark:bg-[#d4af37]/25 border-[#d4af37] shadow-sm ring-1 ring-[#d4af37]'
                                                  : 'bg-white dark:bg-stone-950/90 border-stone-200/80 dark:border-stone-800 hover:border-[#d4af37]/70 hover:shadow-sm hover:bg-stone-50/70 dark:hover:bg-stone-900/70'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                <div
                                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected
                                                      ? 'bg-[#d4af37] text-stone-950'
                                                      : 'bg-[#d4af37]/10 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-stone-950'
                                                  }`}
                                                >
                                                  {opt.category === 'location' ? (
                                                    <MapPin className="w-3.5 h-3.5" />
                                                  ) : opt.category === 'modality' ? (
                                                    <Home className="w-3.5 h-3.5" />
                                                  ) : (
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                  )}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-serif font-bold text-xs md:text-sm text-stone-900 dark:text-stone-100 truncate">
                                                    {opt.title}
                                                  </p>
                                                  {opt.subtitle && (
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                                                      {opt.subtitle}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2 shrink-0">
                                                {opt.badge && (
                                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg shrink-0 bg-[#d4af37]/15 text-[#916f19] dark:text-[#f3d36b] border border-[#d4af37]/35 tracking-tight shadow-xs">
                                                    {opt.badge}
                                                  </span>
                                                )}
                                                {isMultiGroup ? (
                                                  <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                      isSelected
                                                        ? 'bg-[#d4af37] border-[#d4af37] text-stone-950 scale-110'
                                                        : 'border-stone-300 dark:border-stone-700 group-hover:border-[#d4af37]'
                                                    }`}
                                                  >
                                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                  </div>
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all" />
                                                )}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Botón de Confirmación para Selección Múltiple */}
                              {isMultiGroup && (
                                <div className="pt-2">
                                  {Object.keys(currentMsgSelections).length === distinctGroups.length ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const chosen = distinctGroups
                                          .map((g) => currentMsgSelections[g])
                                          .filter(Boolean);
                                        if (chosen.length > 0) {
                                          handleSend(chosen.join(' en '));
                                        }
                                      }}
                                      className="w-full py-2.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#bfa030] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 animate-in fade-in"
                                    >
                                      <span>Confirmar selección y continuar</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <div className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-center text-[11px] font-medium">
                                      Selecciona 1 opción de cada categoría ({Object.keys(currentMsgSelections).length}/{distinctGroups.length})
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Tarjeta Interactiva de Cita Sugerida / Acción */}
                        {msg.action && msg.action.type === 'booking' && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-stone-950 border border-[#d4af37]/40 shadow-md flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#b08e23] dark:text-[#d4af37]">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>Hueco disponible seleccionado</span>
                            </div>

                            {msg.action.service_name && (
                              <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                {msg.action.service_name}
                              </p>
                            )}

                            {(msg.action.date || msg.action.time || msg.action.location_name) && (
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
                                {msg.action.location_name && (
                                  <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                                    <MapPin className="w-3 h-3 text-[#d4af37] shrink-0" />
                                    {msg.action.location_name}
                                  </span>
                                )}
                                {msg.action.date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-[#d4af37] shrink-0" />
                                    {msg.action.date}
                                  </span>
                                )}
                                {msg.action.time && (
                                  <span className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-200">
                                    <Clock className="w-3 h-3 text-[#d4af37] shrink-0" />
                                    {msg.action.time}
                                  </span>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                stopSpeaking();
                                router.push(msg.action?.url || '/reservar');
                              }}
                              className="mt-1.5 w-full bg-[#d4af37] hover:bg-[#bfa030] text-stone-950 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                            >
                              <span>Reservar Cita Ahora</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-10 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                  <span>El asistente está consultando la información...</span>
                </div>
              )}

              {/* Sugerencias Rápidas Iniciales (Chips sin emojis estilo Quiet Luxury) */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2 pl-10 pr-2">
                  <p className="text-[11px] font-medium text-stone-400 mb-2">Preguntas frecuentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(chip.query)}
                        className="text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#d4af37] dark:hover:border-[#d4af37] transition-all shadow-xs font-medium text-left"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada de Texto y Micrófono */}
            <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 shrink-0">
              <div className="flex items-end gap-2 bg-stone-100/80 dark:bg-stone-900/80 rounded-2xl p-1.5 border border-stone-200/60 dark:border-stone-800 focus-within:border-[#d4af37] transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? 'Escuchando tu voz...'
                      : 'Pregunta por un servicio, precio o cita...'
                  }
                  rows={1}
                  className="flex-1 bg-transparent border-none text-xs md:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-none px-2 py-1 max-h-24"
                />

                {/* Botón de Entrada por Voz */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                  title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Botón Enviar */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4af37] dark:hover:bg-[#d4af37] transition-all duration-300 shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BURBUJA FLOTANTE CAMALEÓNICA (Light / Dark según preset del Tenant) ── */}
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              unlockAudioContext();
            }}
            className={
              isThemeDark
                ? 'h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-stone-950 p-1 text-white shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-800 ring-1 ring-white/10 hover:ring-orange-500/50 group select-none'
                : 'h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-white/95 p-1 text-stone-900 shadow-[0_10px_35px_rgba(212,175,55,0.25)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-200/90 ring-1 ring-[#d4af37]/25 hover:ring-[#d4af37]/60 group select-none backdrop-blur-md'
            }
            title="Asistente Virtual 24/7"
            aria-label="Abrir Asistente Virtual 24/7"
          >
            {/* Halo ambiental sutil según tema */}
            <span
              className={
                isThemeDark
                  ? 'absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500/25 via-transparent to-amber-500/15 blur-md opacity-25 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none'
                  : 'absolute -inset-1 rounded-full bg-gradient-to-tr from-[#d4af37]/30 via-transparent to-orange-400/20 blur-md opacity-35 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none'
              }
            />

            {/* Esfera con el Símbolo del Infinito Naranja Fino y Animado */}
            <ChromaticOrb 
              size="lg" 
              className="w-full h-full" 
              isSpeaking={isSpeaking} 
              theme={isThemeDark ? 'dark' : 'light'} 
            />

            {/* Tooltip flotante Quiet Luxury (Desktop) */}
            <div
              className={
                isThemeDark
                  ? 'absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-stone-950/95 backdrop-blur-md border border-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2'
                  : 'absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2'
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>¿Dudas con tu cita? Asistente 24/7</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
