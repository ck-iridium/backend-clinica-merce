'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AttachedFile } from './useCopilotFiles';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface UseCopilotChatOptions {
  language: string;
  firstName: string;
  role: string;
  stopSpeaking: () => void;
  unlockAudioContext: () => void;
  speakText: (text: string, audioBase64?: string | null) => void;
  attachedFile: AttachedFile | null;
  setAttachedFile: (file: AttachedFile | null) => void;
  isUploading: boolean;
  setIsTrialExhausted: (val: boolean) => void;
  setTrialRemaining: (val: number) => void;
  updateLimitsAfterResponse: (data: any) => void;
}

export function useCopilotChat({
  language,
  firstName,
  role,
  stopSpeaking,
  unlockAudioContext,
  speakText,
  attachedFile,
  setAttachedFile,
  isUploading,
  setIsTrialExhausted,
  setTrialRemaining,
  updateLimitsAfterResponse,
}: UseCopilotChatOptions) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');

  const getWelcomeMessage = useCallback(() => {
    return language === 'fr'
      ? 'Bonjour, je suis votre Copilote ProBookia. Dites-moi où vous souhaitez naviguer ou quel traitement vous souhaitez créer.'
      : language === 'en'
      ? 'Hello, I am your ProBookia Copilot. Tell me where you want to navigate or what service you want to create.'
      : 'Hola, soy tu Co-Piloto ProBookia. Dime a qué sección del panel deseas ir o qué tratamiento quieres crear hoy.';
  }, [language]);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: getWelcomeMessage() },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Sincronizar estado abierto con la UI global
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

  // 2. Listener de cuota (CustomEvent desde CopilotHeader)
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.msg;
      if (msg) toast.info(msg);
    };
    window.addEventListener('copilot-quota-info', handler);
    return () => window.removeEventListener('copilot-quota-info', handler);
  }, []);

  // 3. Persistencia de preferencias de voz en localStorage
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
    } catch {}
  }, [voiceGender]);

  // 4. Precalentar voces del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        console.warn('Precalentamiento de voces no disponible:', e);
      }
    }
  }, []);

  // 5. Sincronizar mensaje de bienvenida con cambio de idioma
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', content: getWelcomeMessage() }];
      }
      return prev;
    });
  }, [language, getWelcomeMessage]);

  // 6. Cargar y guardar historial en sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('probookia_copilot_history');
      if (saved) setMessages(JSON.parse(saved));
    } catch (e) {
      console.warn('Error al cargar historial del copilot:', e);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem('probookia_copilot_history', JSON.stringify(messages));
      } catch (e) {
        console.warn('Error al guardar historial del copilot:', e);
      }
    }
  }, [messages]);

  // 7. Evento global para abrir Copiloto desde banners y botones
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-probookia-copilot', handleOpen);
    return () => window.removeEventListener('open-probookia-copilot', handleOpen);
  }, []);

  // 8. Detección de Bienvenida Onboarding
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

      const onboardingWelcomeMsg =
        language === 'fr'
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

  // 9. Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 10. Limpiar historial
  const handleClearHistory = () => {
    try {
      stopSpeaking();
      sessionStorage.removeItem('probookia_copilot_history');
      setMessages([{ role: 'model', content: getWelcomeMessage() }]);
      toast.success(
        language === 'fr'
          ? 'Historique de conversation réinitialisé.'
          : language === 'en'
          ? 'Conversation history reset.'
          : 'Historial de conversación reiniciado.'
      );
    } catch (e) {
      console.warn('Error al borrar historial:', e);
    }
  };

  // 11. Toggle Voz
  const handleToggleVoiceGender = () => {
    const next = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(next);
    toast.success(
      next === 'male'
        ? language === 'fr'
          ? 'Voix masculine activée'
          : language === 'en'
          ? 'Male voice activated'
          : 'Voz masculina activada'
        : language === 'fr'
        ? 'Voix féminine activée'
        : language === 'en'
        ? 'Female voice activated'
        : 'Voz femenina activada'
    );
  };

  // 12. Enviar Mensaje
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
            mode: 'ops',
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403 && errData.detail === 'AI_TRIAL_EXHAUSTED') {
          setIsTrialExhausted(true);
          setTrialRemaining(0);
          const exhaustMsg =
            language === 'fr'
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
      } catch (_) {}

      // Comandos [NAVIGATE: route?hint=selector] en texto plano
      const navigateRegex = /\[NAVIGATE:\s*([^\]]+)\]/i;
      const navMatch = typeof responseText === 'string' ? responseText.match(navigateRegex) : null;
      if (navMatch && navMatch[1]) {
        targetRoute = navMatch[1].trim();
        responseText = responseText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, '').trim();
      }

      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);

      const shouldRefresh = data.updated_fields?.length > 0;
      speakText(responseText, data.audio_response_base64);

      if (targetRoute) {
        try {
          const hintMatch = targetRoute.match(/[?&]hint=([^&]+)/);
          if (hintMatch && hintMatch[1]) {
            localStorage.removeItem(`coach_dismissed_${hintMatch[1]}`);
          }
        } catch (e) {
          console.warn('Error clearing coach tooltip dismissal:', e);
        }

        router.push(targetRoute);
        toast.success(
          language === 'fr'
            ? 'Navigation réussie'
            : language === 'en'
            ? 'Navigation successful'
            : 'Navegación completada con éxito.'
        );
      }

      const hasImageAttached =
        /\[(?:Imagen adjunta|Image jointe|Attached image):/i.test(responseText) ||
        /URL de la imagen:\s*https?:\/\//i.test(responseText);
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

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isMuted,
    setIsMuted,
    voiceGender,
    messages,
    messagesEndRef,
    handleToggleVoiceGender,
    handleClearHistory,
    handleSend,
    handleKeyDown,
  };
}
