'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

// Subcomponentes modulares
import CopilotHeader from './CopilotHeader';
import CopilotMessages from './CopilotMessages';
import CopilotInputBar from './CopilotInputBar';
import { useCopilotSpeech } from './useCopilotSpeech';
import { useCopilotFiles } from './useCopilotFiles';
import MediaPickerModal from '@/components/MediaPickerModal';

// Helper para leer cookies del lado del cliente
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AICopilotWidget() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { role, userName: authUserName, loading: loadingRole } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';

  // ── Estado de UI ──────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [chatWidth, setChatWidth] = useState(384);
  const [chatHeight, setChatHeight] = useState(460);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const isResizing = useRef(false);

  // ── Estado de Límites y Plan ──────────────────────────────────────────────
  const [planType, setPlanType] = useState<string | null>(null);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const [hasOwnKey, setHasOwnKey] = useState<boolean>(false);
  const [isTrialExhausted, setIsTrialExhausted] = useState<boolean>(false);
  const [dailyActionsUsed, setDailyActionsUsed] = useState<number>(0);
  const [dailyActionsLimit, setDailyActionsLimit] = useState<number>(0);

  // ── Historial de Mensajes ─────────────────────────────────────────────────
  const getWelcomeMessage = () =>
    language === 'fr'
      ? 'Bonjour, je suis votre Copilote ProBookia. Dites-moi où vous souhaitez naviguer ou quel traitement vous souhaitez créer.'
      : language === 'en'
        ? 'Hello, I am your ProBookia Copilot. Tell me where you want to navigate or what service you want to create.'
        : 'Hola, soy tu Co-Piloto ProBookia. Dime a qué sección del panel deseas ir o qué tratamiento quieres crear hoy.';

  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: getWelcomeMessage() }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';

  // ── Custom Hooks ──────────────────────────────────────────────────────────
  const { speakText, unlockAudioContext } = useCopilotSpeech({ isMuted, voiceGender, audioLanguage });
  const {
    attachedFile, setAttachedFile,
    isUploading, fileInputRef,
    handleFileChange, canAttachFiles,
  } = useCopilotFiles({ language, planType, hasOwnKey });

  const handleMediaSelected = async (url: string) => {
    setShowMediaPicker(false);
    const filename = decodeURIComponent(url.split('/').pop() || 'archivo');
    const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(filename);
    const isCsvOrText = /\.(csv|txt|json)$/i.test(filename);
    
    if (isImage) {
      setAttachedFile({
        name: filename,
        content: url,
        type: 'image',
        url: url
      });
      toast.success(
        language === 'fr'
          ? 'Image jointe depuis la galerie.'
          : language === 'en'
            ? 'Image attached from gallery.'
            : `Imagen "${filename}" adjuntada desde la galería.`
      );
    } else {
      try {
        const userSession = localStorage.getItem('user');
        let tId = getCookie('tenant_id') || '';
        let authToken = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tId) tId = parsed.tenant_id || '';
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error(e);
          }
        }
        
        const headers: Record<string, string> = {};
        if (tId) headers['X-Tenant-ID'] = tId;
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/media/download/${encodeURIComponent(filename)}`;
        const res = await fetch(downloadUrl, { headers });
        if (!res.ok) throw new Error('Error al descargar el archivo.');
        
        const blob = await res.blob();
        if (blob.size > 150 * 1024) {
          toast.error(
            language === 'fr'
              ? 'Le fichier est trop volumineux pour l\'assistant (max 150 Ko).'
              : language === 'en'
                ? 'File is too large for the assistant to process (max 150 KB).'
                : `El archivo "${filename}" es demasiado grande para procesar (máximo 150 KB).`
          );
          return;
        }
        
        if (isCsvOrText) {
          const text = await blob.text();
          setAttachedFile({
            name: filename,
            content: text,
            type: 'text'
          });
          toast.success(
            language === 'fr'
              ? 'Document joint avec succès.'
              : language === 'en'
                ? 'Document attached successfully.'
                : `Documento "${filename}" adjuntado y cargado en el chat.`
          );
        } else {
          setAttachedFile({
            name: filename,
            content: `[Enlace seguro al documento: ${downloadUrl}]`,
            type: 'text'
          });
          toast.success(
            language === 'fr'
              ? 'Lien du document joint.'
              : language === 'en'
                ? 'Document link attached.'
                : `Enlace de "${filename}" adjuntado para el asistente.`
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('No se pudo adjuntar el documento debido a un error de lectura.');
      }
    }
  };

  // ── Fetch Límites de Plan ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchPlanAndTrial() {
      try {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let authToken = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) tenantId = parsed.tenant_id || '';
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error('Error parsing user session in AI Widget:', e);
          }
        }
        if (!tenantId) { console.warn('Tenant ID missing in AI Widget initialization'); return; }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`, {
          headers: { 'X-Tenant-ID': tenantId, 'Authorization': authToken ? `Bearer ${authToken}` : '' }
        });
        if (res.ok) {
          const d = await res.json();
          const plan = d.plan_type?.toLowerCase() || 'free';
          setPlanType(plan);
          const ownKey = d.limits?.ai_allowed && d.limits?.ai_requires_byok;
          setHasOwnKey(!!ownKey);
          const used = d.ai_trial_queries_used ?? 0;
          const remaining = Math.max(0, 10 - used);
          setTrialRemaining(remaining);
          setDailyActionsUsed(d.ai_daily_actions_used ?? 0);
          setDailyActionsLimit(d.limits?.ai_smart_actions_daily ?? 0);
          if (plan === 'free' && !ownKey && remaining <= 0) setIsTrialExhausted(true);
        }
      } catch (err) {
        console.error('Error al obtener límites de plan en AI Widget:', err);
      }
    }
    fetchPlanAndTrial();
  }, []);

  // ── Listener de cuota (CustomEvent desde CopilotHeader) ───────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.msg;
      if (msg) toast.info(msg);
    };
    window.addEventListener('copilot-quota-info', handler);
    return () => window.removeEventListener('copilot-quota-info', handler);
  }, []);

  // ── Persistencia de preferencias ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGender = localStorage.getItem('probookia_copilot_voice_gender') as 'female' | 'male';
      if (savedGender) setVoiceGender(savedGender);
      const savedWidth = localStorage.getItem('probookia_copilot_width');
      const savedHeight = localStorage.getItem('probookia_copilot_height');
      if (savedWidth) setChatWidth(Number(savedWidth));
      if (savedHeight) setChatHeight(Number(savedHeight));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('probookia_copilot_voice_gender', voiceGender);
  }, [voiceGender]);

  // ── Precalentar voces del navegador ───────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Sincronizar mensaje de bienvenida con cambio de idioma ────────────────
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', content: getWelcomeMessage() }];
      }
      return prev;
    });
  }, [language]);

  // ── Historial en sessionStorage ───────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('probookia_copilot_history');
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) { console.warn('Error al cargar historial del copilot:', e); }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      try { sessionStorage.setItem('probookia_copilot_history', JSON.stringify(messages)); }
      catch (e) { console.warn('Error al guardar historial del copilot:', e); }
    }
  }, [messages]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // ── Redimensionamiento ────────────────────────────────────────────────────
  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const paddingRight = 24;
    const paddingBottom = 90;
    const newWidth = Math.max(300, Math.min(window.innerWidth - 32, window.innerWidth - e.clientX - paddingRight));
    const newHeight = Math.max(300, Math.min(window.innerHeight - 32, window.innerHeight - e.clientY - paddingBottom));
    setChatWidth(newWidth);
    setChatHeight(newHeight);
    localStorage.setItem('probookia_copilot_width', String(newWidth));
    localStorage.setItem('probookia_copilot_height', String(newHeight));
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  // ── Limpiar historial ─────────────────────────────────────────────────────
  const handleClearHistory = () => {
    try {
      sessionStorage.removeItem('probookia_copilot_history');
      setMessages([{ role: 'model', content: getWelcomeMessage() }]);
      toast.success(
        language === 'fr' ? 'Historique de conversation réinitialisé.'
          : language === 'en' ? 'Conversation history reset.'
            : 'Historial de conversación reiniciado.'
      );
    } catch (e) { console.warn('Error al borrar historial:', e); }
  };

  // ── Toggle Voz ────────────────────────────────────────────────────────────
  const handleToggleVoiceGender = () => {
    const next = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(next);
    toast.success(
      next === 'male'
        ? (language === 'fr' ? 'Voix masculine activée' : language === 'en' ? 'Male voice activated' : 'Voz masculina activada')
        : (language === 'fr' ? 'Voix féminine activée' : language === 'en' ? 'Female voice activated' : 'Voz femenina activada')
    );
  };

  // ── Enviar Mensaje ────────────────────────────────────────────────────────
  const handleSend = async (textToSend?: string) => {
    unlockAudioContext();
    let queryText = textToSend || input.trim();
    if (!queryText && !attachedFile && !textToSend) return;
    if (isLoading || isUploading) return;

    if (attachedFile && !textToSend) {
      if (attachedFile.type === 'text') {
        queryText = `[Archivo adjunto: "${attachedFile.name}"]\nContenido:\n"""\n${attachedFile.content}\n"""\n\n${queryText}`;
      } else if (attachedFile.type === 'image' && attachedFile.url) {
        queryText = `[Imagen adjunta: "${attachedFile.name}"]\nURL de la imagen: ${attachedFile.url}\n\n${queryText}`;
      }
      setAttachedFile(null);
    }

    if (!textToSend) setInput('');

    const userSession = localStorage.getItem('user');
    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    if (userSession) {
      const parsed = JSON.parse(userSession);
      if (!tenantId) tenantId = parsed.tenant_id || '';
      authToken = parsed.access_token || parsed.token || '';
    }

    if (!tenantId) {
      toast.error('Sesión no válida: Identificador de inquilino (Tenant ID) ausente.');
      return;
    }

    const updatedMessages = [...messages, { role: 'user', content: queryText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tenant/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify({
            message: queryText,
            history: updatedMessages.slice(1).map((msg) => ({ role: msg.role, content: msg.content })),
            user_name: firstName,
            user_role: role,
            language,
            voice_gender: voiceGender,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.detail === 'AI_TRIAL_EXHAUSTED') {
          setIsTrialExhausted(true);
          setTrialRemaining(0);
          const exhaustMsg = language === 'fr'
            ? 'Votre essai gratuit a expiré. Veuillez passer au Plan Gold.'
            : language === 'en'
              ? 'Your free trial has expired. Please upgrade to Plan Gold.'
              : 'Tu prueba gratuita de Co-Piloto de IA ha expirado. Por favor, actualiza al Plan Gold.';
          setMessages((prev) => [...prev, { role: 'model', content: exhaustMsg }]);
          speakText(exhaustMsg);
          setIsLoading(false);
          return;
        }
        throw new Error(errData.detail || 'Error al conectar con el servidor.');
      }

      const data = await response.json();

      if (typeof data.trial_remaining === 'number') {
        setTrialRemaining(data.trial_remaining);
        if (planType === 'free' && data.trial_remaining <= 0 && !hasOwnKey) {
          setIsTrialExhausted(true);
        } else if ((planType === 'basic' || planType === 'pro') && !hasOwnKey) {
          setDailyActionsUsed(Math.max(0, dailyActionsLimit - data.trial_remaining));
        }
      }

       let responseText = data.response;
      let targetRoute: string | null = null;
      try {
        const parsed = JSON.parse(data.response);
        if (parsed?.action === 'navigate' && parsed.route) {
          responseText = parsed.message || `Con gusto. Dirigiéndonos a ${parsed.route}...`;
          targetRoute = parsed.route;
        }
      } catch (_) { /* Not a navigation JSON instruction */ }

      // También chequear si viene en formato [NAVIGATE: route?hint=selector] en el texto plano
      const navigateRegex = /\[NAVIGATE:\s*([^\]]+)\]/gi;
      const matches = [...responseText.matchAll(navigateRegex)];
      if (matches.length > 0) {
        targetRoute = matches[0][1].trim();
        responseText = responseText.replace(navigateRegex, '').trim();
      }

      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);

      const shouldRefresh = data.updated_fields?.length > 0;
      speakText(responseText, data.audio_response_base64, () => {
        if (targetRoute) {
          router.push(targetRoute);
          setIsOpen(false);
          toast.success(language === 'fr' ? 'Navigation réussie' : language === 'en' ? 'Navigation successful' : 'Navegación completada con éxito.');
        } else if (shouldRefresh) {
          router.refresh();
          if (typeof window !== 'undefined') window.location.reload();
        }
      });

    } catch (err: any) {
      console.error('Error in Copilot chat:', err);
      const errMsg = err.message || 'Error en el asistente. Inténtalo de nuevo.';
      setMessages((prev) => [...prev, { role: 'model', content: errMsg }]);
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

  const isAuthorized = role ? ['admin', 'administrador', 'recepcion', 'especialista'].includes(role.toLowerCase()) : false;
  if (loadingRole || !isAuthorized) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={
      isOpen
        ? 'fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 max-sm:!z-[80]'
        : 'fixed bottom-[110px] md:bottom-6 right-0 md:right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300'
    }>

      {/* ── PANEL ABIERTO ── */}
      {isOpen && (
        <div
          style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
          className="bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-luxury-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out relative select-none mr-4 md:mr-0 max-sm:!w-full max-sm:!h-full max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh]"
        >
          {/* Handles de Redimensionamiento */}
          <div
            onMouseDown={startResize}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden"
            title="Redimensionar chat"
          >
            <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/40 group-hover/resize:border-primary transition-colors rounded-tl" />
          </div>
          <div onMouseDown={startResize} className="absolute top-0 left-0 bottom-0 w-1.5 cursor-ew-resize z-40 hover:bg-primary/20 transition-all duration-300 max-sm:hidden" />
          <div onMouseDown={startResize} className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-40 hover:bg-primary/20 transition-all duration-300 max-sm:hidden" />

          {/* Cabecera */}
          <CopilotHeader
            language={language}
            planType={planType}
            hasOwnKey={hasOwnKey}
            trialRemaining={trialRemaining}
            dailyActionsUsed={dailyActionsUsed}
            dailyActionsLimit={dailyActionsLimit}
            voiceGender={voiceGender}
            onToggleVoiceGender={handleToggleVoiceGender}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onClearHistory={handleClearHistory}
            onClose={() => setIsOpen(false)}
            isTrialExhausted={isTrialExhausted}
            onUpgrade={() => { setIsOpen(false); router.push('/dashboard/settings?tab=billing'); }}
          />

          {/* Historial de Mensajes */}
          <CopilotMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />

          {/* Barra de Entrada */}
          <CopilotInputBar
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            isLoading={isLoading}
            isUploading={isUploading}
            attachedFile={attachedFile}
            onRemoveFile={() => setAttachedFile(null)}
            onAttachClick={() => {
              if (canAttachFiles) {
                setShowMediaPicker(true);
              } else {
                toast.error(
                  language === 'fr'
                    ? 'La pièce jointe est réservée aux plans Pro/Gold.'
                    : language === 'en'
                      ? 'Attaching files is restricted to Pro/Gold plans.'
                      : 'La función de adjuntar archivos está restringida a los planes Pro y Gold.'
                );
              }
            }}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            canAttachFiles={canAttachFiles}
            planType={planType}
            hasOwnKey={hasOwnKey}
            language={language}
            audioLanguage={audioLanguage}
            onVoiceTranscribed={(txt) =>
              handleSend(language === 'fr' ? `🎙️ [Voix]: "${txt}"` : language === 'en' ? `🎙️ [Voice]: "${txt}"` : `🎙️ [Voz]: "${txt}"`)
            }
            onUnlockAudio={unlockAudioContext}
          />
        </div>
      )}

      {/* ── BURBUJA FLOTANTE ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); unlockAudioContext(); }}
          className="h-14 w-14 rounded-full bg-stone-900 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-primary/40 z-10 group overflow-hidden hover:bg-stone-800 max-md:translate-x-[35%] max-md:hover:translate-x-0 max-md:rounded-l-2xl max-md:rounded-r-none"
          title="Copiloto de Navegación IA"
        >
          <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkles size={22} className="text-primary animate-pulse" strokeWidth={1.8} />
        </button>
      )}

      {showMediaPicker && (
        <MediaPickerModal
          onClose={() => setShowMediaPicker(false)}
          onImageSelected={handleMediaSelected}
          mediaType="all"
          tenantId={getCookie('tenant_id') || undefined}
          token={(() => {
            const userSession = localStorage.getItem('user');
            if (userSession) {
              try {
                const parsed = JSON.parse(userSession);
                return parsed.access_token || parsed.token || undefined;
              } catch (_) {}
            }
            return undefined;
          })()}
        />
      )}

    </div>
  );
}
