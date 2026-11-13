'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

// Subcomponentes modulares
import CopilotHeader from './CopilotHeader';
import CopilotMessages from './CopilotMessages';
import CopilotInputBar from './CopilotInputBar';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';
import ChromaticOrb from './ChromaticOrb';
import { useCopilotSpeech } from './useCopilotSpeech';
import { useCopilotFiles } from './useCopilotFiles';
import { useCopilotResize } from './useCopilotResize';
import { useCopilotLimits } from './useCopilotLimits';
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
  const pathname = usePathname();
  const { language } = useLanguage();
  const { role, userName: authUserName, userAvatar, loading: loadingRole } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';

  // ── Hooks Modulares de Límites y Redimensionamiento ──────────────────────
  const {
    chatWidth,
    chatHeight,
    isResizingActive,
    startResize,
    handleResize,
    stopResize
  } = useCopilotResize();

  const {
    planType,
    trialRemaining,
    setTrialRemaining,
    hasOwnKey,
    isTrialExhausted,
    setIsTrialExhausted,
    dailyActionsUsed,
    dailyActionsLimit,
    updateLimitsAfterResponse
  } = useCopilotLimits();

  // ── Estado de UI del Widget ───────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [showMediaPicker, setShowMediaPicker] = useState(false);

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

  // ── Custom Hooks de Voz y Archivos ────────────────────────────────────────
  const { speakText, stopSpeaking, unlockAudioContext, isSpeaking } = useCopilotSpeech({ isMuted, voiceGender, audioLanguage });
  const {
    attachedFile, setAttachedFile,
    isUploading, fileInputRef,
    handleFileChange, handlePaste, canAttachFiles,
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

  // ── Sincronizar estado abierto con la UI global (ocultar banners obstructivos en móvil) ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('copilot-open-change', { detail: { isOpen } }));
      if (isOpen) {
        document.body.setAttribute('data-copilot-open', 'true');
      } else {
        document.body.removeAttribute('data-copilot-open');
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.removeAttribute('data-copilot-open');
      }
    };
  }, [isOpen]);

  // ── Listener de cuota (CustomEvent desde CopilotHeader) ───────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.msg;
      if (msg) toast.info(msg);
    };
    window.addEventListener('copilot-quota-info', handler);
    return () => window.removeEventListener('copilot-quota-info', handler);
  }, []);

  // ── Persistencia de preferencias de voz ───────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedGender = localStorage.getItem('probookia_copilot_voice_gender') as 'female' | 'male';
        if (savedGender) setVoiceGender(savedGender);
      } catch (e) {
        console.warn('No se pudo acceder a localStorage para preferencias:', e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('probookia_copilot_voice_gender', voiceGender);
    } catch (e) {}
  }, [voiceGender]);

  // ── Precalentar voces del navegador ───────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        console.warn('Precalentamiento de voces no disponible:', e);
      }
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

  // ── Evento global para abrir Copiloto desde banners y botones ─────────────
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-probookia-copilot', handleOpen);
    return () => window.removeEventListener('open-probookia-copilot', handleOpen);
  }, []);

  // ── Detección de Bienvenida Onboarding ────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasWelcomeParam = urlParams.get('welcome') === 'true';
    let hasJustOnboarded = false;
    try {
      hasJustOnboarded = sessionStorage.getItem('probookia_just_onboarded') === 'true';
    } catch {}

    if (hasWelcomeParam || hasJustOnboarded) {
      try {
        sessionStorage.removeItem('probookia_just_onboarded');
        if (hasWelcomeParam) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      } catch {}

      const onboardingWelcomeMsg = language === 'fr'
        ? `🎉 Félicitations${firstName ? ` ${firstName}` : ''} ! Nous avons préparé votre site web avec des photographies de haute qualité et des services types adaptés à votre secteur. Vous pouvez les modifier à tout moment ou me dicter vos tarifs ici pour que je les mette à jour pour vous.`
        : language === 'en'
          ? `🎉 Congratulations${firstName ? ` ${firstName}` : ''}! We've built your website with high-end photography and sample services tailored to your industry. You can edit them anytime or paste your real pricing right here and I'll update everything for you.`
          : `🎉 ¡Enhorabuena${firstName ? ` ${firstName}` : ''}! Hemos dejado lista la web de tu negocio con fotografías de alta resolución y servicios de ejemplo para tu sector.\n\nPuedes editarlos uno a uno desde el catálogo o dictarme tus tarifas reales aquí y las actualizaré por ti al instante.\n\n¿Quieres que adaptemos algo o prefieres ver cómo ha quedado tu escaparate en vivo?`;

      setMessages([{ role: 'model', content: onboardingWelcomeMsg }]);
      
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [firstName, language]);

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

  // ── Limpiar historial ─────────────────────────────────────────────────────
  const handleClearHistory = () => {
    try {
      stopSpeaking();
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
    stopSpeaking();
    unlockAudioContext();
    let queryText = textToSend || input.trim();
    if (!queryText && !attachedFile) return;
    if (isLoading || isUploading) return;

    if (attachedFile) {
      if (attachedFile.type === 'text') {
        queryText = `[Archivo adjunto: "${attachedFile.name}"]\nContenido:\n"""\n${attachedFile.content}\n"""\n\n${queryText}`;
      } else if (attachedFile.type === 'image' && attachedFile.url) {
        queryText = `[Imagen adjunta: "${attachedFile.name}"]\nURL de la imagen: ${attachedFile.url}\n\n${queryText}`;
      }
      setAttachedFile(null);
    }

    setInput('');

    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    try {
      const userSession = localStorage.getItem('user');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        if (!tenantId) tenantId = parsed.tenant_id || '';
        authToken = parsed.access_token || parsed.token || '';
      }
    } catch (e) {
      console.warn('Error accediendo a sesión de usuario en Copilot:', e);
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

      updateLimitsAfterResponse(data);

      let responseText = data.response || '';
      let targetRoute: string | null = data.redirect_url || null;
      try {
        const parsed = JSON.parse(data.response);
        if (parsed?.action === 'navigate' && parsed.route) {
          responseText = parsed.message || `Con gusto. Dirigiéndonos a ${parsed.route}...`;
          targetRoute = parsed.route;
        }
      } catch (_) { /* Not a navigation JSON instruction */ }

      // También chequear si viene en formato [NAVIGATE: route?hint=selector] en el texto plano
      const navigateRegex = /\[NAVIGATE:\s*([^\]]+)\]/i;
      const navMatch = typeof responseText === 'string' ? responseText.match(navigateRegex) : null;
      if (navMatch && navMatch[1]) {
        targetRoute = navMatch[1].trim();
        responseText = responseText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, '').trim();
      }

      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);

      const shouldRefresh = data.updated_fields?.length > 0;

      // Hablar de forma asíncrona sin bloquear la interfaz
      speakText(responseText, data.audio_response_base64);

      if (targetRoute) {
        // Si la ruta contiene un hint, removemos el estado de "desestimado" para que el tooltip vuelva a mostrarse
        try {
          const hintMatch = targetRoute.match(/[?&]hint=([^&]+)/);
          if (hintMatch && hintMatch[1]) {
            localStorage.removeItem(`coach_dismissed_${hintMatch[1]}`);
          }
        } catch (e) {
          console.warn('Error clearing coach tooltip dismissal:', e);
        }

        router.push(targetRoute);
        // Mantener el chat abierto para que la voz no se corte ni se cierre la ventana de conversación mientras navega
        toast.success(
          language === 'fr' ? 'Navigation réussie' : 
          language === 'en' ? 'Navigation successful' : 
          'Navegación completada con éxito.'
        );
      }

      // Si la respuesta del agente incluye actualizacion o nueva imagen generada
      const hasImageAttached = /\[(?:Imagen adjunta|Image jointe|Attached image):/i.test(responseText) || /URL de la imagen:\s*https?:\/\//i.test(responseText);
      const shouldRefreshServicesOrMedia = shouldRefresh || hasImageAttached;

      if (shouldRefreshServicesOrMedia) {
        if (typeof window !== 'undefined') {
          const imgMatch = responseText.match(/URL de la imagen:\s*(https?:\/\/[^\s\n\)]+)/i);
          const attachedUrl = imgMatch ? imgMatch[1].trim() : null;
          window.dispatchEvent(new CustomEvent('services-updated', { detail: { image_url: attachedUrl } }));
          window.dispatchEvent(new CustomEvent('media-updated', { detail: { image_url: attachedUrl } }));
        }
        router.refresh();
      }

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

  const localFallbackRole = typeof window !== 'undefined' ? (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u).role : null;
    } catch { return null; }
  })() : null;

  const effectiveRole = (role || localFallbackRole || 'admin')?.toLowerCase();
  const isAuthorized = effectiveRole ? ['admin', 'administrador', 'recepcion', 'recepción', 'especialista', 'owner', 'titular'].includes(effectiveRole) : false;

  // Ocultar completamente el widget flotante si no está autorizado o si ya estamos dentro de /dashboard/ai-webmaster
  if ((loadingRole && !role && !localFallbackRole) || !isAuthorized || pathname === '/dashboard/ai-webmaster') return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay invisible mientras se redimensiona para no perder eventos al pasar sobre iframes u otros elementos */}
      {isResizingActive && (
        <div
          className="fixed inset-0 z-[99999] cursor-nwse-resize select-none bg-transparent"
          onMouseMove={(e) => handleResize(e.nativeEvent)}
          onMouseUp={stopResize}
        />
      )}

      <div className={
        isOpen
          ? 'fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 max-sm:!z-[100000]'
          : 'fixed bottom-[96px] md:bottom-6 right-4 md:right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300 pointer-events-auto'
      }>

        {/* ── PANEL ABIERTO ── */}
        {isOpen && (
          <div
            style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
            onPaste={handlePaste}
            className={`bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative select-none mr-4 md:mr-0 max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] max-sm:!w-full max-sm:!h-full max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh] ${
              isResizingActive ? 'transition-none pointer-events-auto' : 'transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6'
            }`}
          >
            {/* Handles de Redimensionamiento */}
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden touch-none"
              title="Arrastra para redimensionar"
            >
              <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/60 group-hover/resize:border-[#d4af37] transition-colors rounded-tl" />
            </div>
            <div 
              onMouseDown={startResize} 
              className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize z-40 hover:bg-[#d4af37]/20 transition-colors max-sm:hidden touch-none" 
              title="Arrastra para cambiar ancho"
            />
            <div 
              onMouseDown={startResize} 
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-40 hover:bg-[#d4af37]/20 transition-colors max-sm:hidden touch-none" 
              title="Arrastra para cambiar alto"
            />

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
            onClose={() => { setIsOpen(false); stopSpeaking(); }}
            isTrialExhausted={isTrialExhausted}
            onUpgrade={() => { setIsOpen(false); stopSpeaking(); router.push('/dashboard/settings?tab=billing'); }}
          />

          {/* Visualizador de Ondas de Voz ("Voice Waves" al hablar el agente) */}
          <VoiceWaveVisualizer
            isSpeaking={isSpeaking}
            onStop={stopSpeaking}
            language={language}
          />

          {/* Historial de Mensajes */}
          <CopilotMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onSendMessage={handleSend}
            userAvatarUrl={userAvatar}
            userName={authUserName}
          />

          {/* Barra de Entrada */}
          <CopilotInputBar
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
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
              handleSend(language === 'fr' ? `[Voix]: "${txt}"` : language === 'en' ? `[Voice]: "${txt}"` : `[Voz]: "${txt}"`)
            }
            onUnlockAudio={unlockAudioContext}
          />
        </div>
      )}

      {/* ── BURBUJA FLOTANTE (ESFERA OBSIDIANA CON INFINITO NARANJA DETALLADO) ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); unlockAudioContext(); }}
          className="h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-stone-950 p-1 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(255,106,0,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-800 ring-1 ring-white/10 hover:ring-orange-500/40 group select-none"
          title="Co-Piloto AI"
          aria-label="Abrir Co-Piloto AI"
        >
          {/* Halo ambiental externo sutil oscuro con toque naranja en hover */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500/25 via-transparent to-amber-500/15 blur-md opacity-25 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />

          {/* Esfera de Cristal Obsidiana con Infinito Naranja Fino y Animado */}
          <ChromaticOrb size="lg" className="w-full h-full" isSpeaking={isSpeaking} />

          {/* Tooltip flotante Quiet Luxury (Desktop) */}
          <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-stone-950/95 backdrop-blur-md border border-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span>Co-Piloto AI</span>
          </div>
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
    </>
  );
}
