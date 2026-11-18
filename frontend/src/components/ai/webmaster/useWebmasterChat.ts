'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useCopilotFiles } from '../useCopilotFiles';
import { 
  Message, 
  ConfirmModalState, 
  WEBMASTER_WELCOME, 
  CHAT_STORAGE_KEY_PREFIX, 
  MAX_SAVED_MESSAGES, 
  CHAT_TTL_MS, 
  getActiveTenantId, 
  getCookie 
} from './webmasterConfig';

interface UseWebmasterChatProps {
  onFieldsUpdated?: (fields: string[], redirectUrl?: string) => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  selectedSection?: { id: string; name: string; pageSlug: string; blockType?: string } | null;
}

export function useWebmasterChat({ onFieldsUpdated, initialPrompt, onPromptConsumed, selectedSection }: UseWebmasterChatProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { role, userName: authUserName } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';
  const chatLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: WEBMASTER_WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Soporte de Archivos, Capturas y Subida de Imágenes
  const {
    attachedFile,
    setAttachedFile,
    isUploading: isUploadingFile,
    fileInputRef,
    handleFileChange,
    handlePaste,
  } = useCopilotFiles({
    language,
    planType: 'gold',
    hasOwnKey: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedSavedChat = useRef(false);

  // 1. Restaurar historial guardado en localStorage al montar (aislado por tenant y con TTL de 24h)
  useEffect(() => {
    const tenantId = getActiveTenantId();
    if (!tenantId) {
      hasLoadedSavedChat.current = true;
      return;
    }

    const storageKey = `${CHAT_STORAGE_KEY_PREFIX}${tenantId}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const isNotExpired = data?.updatedAt && Date.now() - data.updatedAt < CHAT_TTL_MS;
        if (isNotExpired && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.warn('Error al restaurar sesión de chat persistente:', e);
    } finally {
      hasLoadedSavedChat.current = true;
    }
  }, []);

  // 2. Persistir automáticamente cambios en la conversación (ventana rodante de hasta 30 mensajes)
  useEffect(() => {
    if (!hasLoadedSavedChat.current) return;
    const tenantId = getActiveTenantId();
    if (!tenantId) return;

    const storageKey = `${CHAT_STORAGE_KEY_PREFIX}${tenantId}`;

    if (messages.length > 1) {
      try {
        const trimmed = messages.slice(-MAX_SAVED_MESSAGES);
        const payload = {
          tenantId,
          updatedAt: Date.now(),
          messages: trimmed,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (e) {
        console.warn('Error al guardar historial del chat en localStorage:', e);
      }
    }
  }, [messages]);

  // 3. Cargar foto de perfil real del usuario
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const session = localStorage.getItem('user');
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.id) {
            const { getUserProfile } = await import('@/app/actions/profile');
            const res = await getUserProfile(parsed.id);
            if (res.success && res.profile?.avatar_url) {
              setUserAvatar(res.profile.avatar_url);
            }
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar el avatar del usuario:', e);
      }
    };
    fetchAvatar();
  }, []);

  // 4. Sincronizar mensaje de bienvenida si cambia el idioma y no hay historial previo
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', content: WEBMASTER_WELCOME }];
      }
      return prev;
    });
  }, [language]);

  // 5. Auto scroll al final de la lista
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // 6. Precalentar voces del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        console.warn('Precalentamiento de voces no disponible:', e);
      }
    }
  }, []);

  // 7. Web Speech API - Síntesis de voz (Text To Speech) parametrizable y multilingüe
  const fallbackSpeak = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      const langPrefix = chatLanguage.split('-')[0].toLowerCase();
      const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

      let selectedVoice = null;
      if (langVoices.length > 0) {
        if (voiceGender === 'female') {
          selectedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('female') ||
              name.includes('zira') ||
              name.includes('helena') ||
              name.includes('hortense') ||
              name.includes('samantha') ||
              name.includes('elene') ||
              name.includes('google') ||
              name.includes('hazel') ||
              name.includes('natural')
            );
          });
        } else {
          selectedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes('male') ||
              name.includes('david') ||
              name.includes('paul') ||
              name.includes('daniel') ||
              name.includes('george') ||
              name.includes('microsoft')
            );
          });
        }

        if (!selectedVoice) {
          selectedVoice = langVoices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = chatLanguage;
      }

      utterance.rate = 0.98;
      utterance.pitch = voiceGender === 'female' ? 1.12 : 0.88;

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, chatLanguage, voiceGender]
  );

  const speakText = useCallback(
    (text: string, audioBase64?: string | null) => {
      if (isMuted || typeof window === 'undefined') return;

      if (audioBase64) {
        try {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          const audio = new Audio('data:audio/mp3;base64,' + audioBase64);
          audio.play().catch((err) => {
            console.warn('Fallo al reproducir audio nativo de Gemini, usando fallback:', err);
            fallbackSpeak(text);
          });
          return;
        } catch (err) {
          console.warn('Fallo al decodificar audio de Gemini:', err);
        }
      }

      fallbackSpeak(text);
    },
    [isMuted, fallbackSpeak]
  );

  // 8. Enviar mensaje de texto o comando
  const handleSend = async (textToSend?: string) => {
    let queryText = textToSend || input.trim();
    if ((!queryText && !attachedFile) || isLoading || isUploadingFile) return;

    if (attachedFile) {
      if (attachedFile.type === 'image' && attachedFile.url) {
        queryText = `[Imagen adjunta: "${attachedFile.name}"]\nURL de la imagen: ${attachedFile.url}\n\n${queryText}`.trim();
      } else if (attachedFile.type === 'text') {
        queryText = `[Archivo adjunto: "${attachedFile.name}"]\nContenido:\n"""\n${attachedFile.content}\n"""\n\n${queryText}`.trim();
      }
      setAttachedFile(null);
    }

    const tenantId = getActiveTenantId() || '';
    const userSession = localStorage.getItem('user');
    let authToken = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        authToken = parsed.access_token || parsed.token || '';
      } catch {
        // ignore
      }
    }

    if (!tenantId) {
      toast.error('Sesión no válida: Identificador de inquilino (Tenant ID) ausente. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!textToSend) {
      setInput('');
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
            message: (selectedSection && !queryText.startsWith('[SECCIÓN SELECCIONADA:'))
              ? `[SECCIÓN SELECCIONADA: "${selectedSection.name}" (tipo: ${selectedSection.blockType || 'sección'}, página: "${selectedSection.pageSlug}")] ${queryText}`
              : queryText,
            history: updatedMessages.slice(1).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            voice_gender: voiceGender,
            user_name: firstName,
            user_role: role,
            language: language,
            mode: 'webmaster',
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        if (errData.detail === 'AI_LIMIT_BYOK_REQUIRED' || response.status === 403) {
          throw new Error('AI_BYOK');
        }
        throw new Error(errData.detail || 'Error en el servidor.');
      }

      const data = await response.json();

      let finalResponseText = data.response;
      try {
        const parsed = JSON.parse(data.response);
        if (parsed && parsed.action === 'request_confirmation') {
          setConfirmModal({
            show: true,
            title: language === 'fr' ? 'Confirmer la suppression' : language === 'en' ? 'Confirm Deletion' : 'Confirmar Eliminación',
            message: parsed.message || '¿Estás seguro de que deseas eliminar este elemento?',
            slug: parsed.slug,
            target: parsed.target,
          });
          finalResponseText =
            language === 'fr'
              ? '⚠️ Demande de confirmation de suppression en attente...'
              : language === 'en'
              ? '⚠️ Pending deletion confirmation...'
              : '⚠️ Solicitud de confirmación de eliminación pendiente...';
        }
      } catch {
        // No es JSON, usar el texto directamente
      }

      // Detectar comandos [NAVIGATE: route?hint=selector]
      const navigateRegex = /\[NAVIGATE:\s*([^\]]+)\]/i;
      let cleanedResponseText = finalResponseText || '';
      const navMatch = typeof finalResponseText === 'string' ? finalResponseText.match(navigateRegex) : null;
      if (navMatch && navMatch[1]) {
        const targetRoute = navMatch[1].trim();
        router.push(targetRoute);
        cleanedResponseText = finalResponseText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, '').trim();
      }

      setMessages((prev) => [...prev, { role: 'model', content: cleanedResponseText }]);
      speakText(cleanedResponseText, data.audio_response_base64);

      if (data.redirect_url || (data.updated_fields && data.updated_fields.length > 0)) {
        if (data.updated_fields && data.updated_fields.length > 0) {
          toast.success('¡Cambios aplicados en tiempo real por el Asistente!');
        }
        if (onFieldsUpdated) {
          onFieldsUpdated(data.updated_fields || [], data.redirect_url);
        }
      }
    } catch (error: any) {
      console.error('Error en Chat IA Webmaster:', error);
      let errMsg = 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
      if (error.message === 'AI_BYOK') {
        errMsg = 'Tu plan de suscripción requiere que configures tu propia API Key de Google Gemini en Ajustes > Configuración de IA para utilizar el Asistente.';
      } else if (error instanceof Error) {
        errMsg = `Error: ${error.message}`;
      }
      setMessages((prev) => [...prev, { role: 'model', content: errMsg }]);
      speakText(errMsg);
      toast.error('Error al conectar con la IA.');
    } finally {
      setIsLoading(false);
    }
  };

  // 8.5 Inyectar y enviar prompt externo automáticamente (si viene de la Biblioteca de Bloques)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt.trim());
      if (onPromptConsumed) onPromptConsumed();
    }
  }, [initialPrompt]);

  // 9. Alternar género de voz
  const toggleVoiceGender = () => {
    const next = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(next);
    toast.success(language === 'fr' ? 'Voix configurée' : language === 'en' ? 'Voice configured' : 'Voz configurada');
  };

  // 10. Silenciar / Activar lectura
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    toast.info(
      nextMuted
        ? language === 'fr'
          ? 'Synthèse vocale coupée'
          : language === 'en'
          ? 'Text-to-speech muted'
          : 'Síntesis de voz silenciada'
        : language === 'fr'
        ? 'Synthèse vocale activée'
        : language === 'en'
        ? 'Text-to-speech activated'
        : 'Síntesis de voz activada'
    );
  };

  // 11. Reiniciar conversación
  const handleResetChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const tenantId = getActiveTenantId();
    if (tenantId) {
      try {
        localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${tenantId}`);
      } catch (e) {
        console.warn('Error al limpiar chat persistente:', e);
      }
    }
    setMessages([{ role: 'model', content: WEBMASTER_WELCOME }]);
    toast.info(language === 'fr' ? 'Conversation réinitialisée' : language === 'en' ? 'Conversation reset' : 'Conversación reiniciada');
  };

  // 10. Confirmar eliminación destructiva (Servicios)
  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    const slug = confirmModal.slug;
    setConfirmModal(null);
    setIsLoading(true);

    const userSession = localStorage.getItem('user');
    let tenantId = getCookie('tenant_id') || '';
    let authToken = '';
    if (userSession) {
      const parsed = JSON.parse(userSession);
      if (!tenantId) {
        tenantId = parsed.tenant_id || '';
      }
      authToken = parsed.access_token || parsed.token || '';
    }

    try {
      const getServiceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/slug/${slug}`,
        {
          headers: {
            'X-Tenant-ID': tenantId,
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        }
      );
      if (!getServiceRes.ok) {
        throw new Error(language === 'fr' ? 'Service introuvable.' : language === 'en' ? 'Service not found.' : 'No se pudo encontrar el servicio para eliminar.');
      }
      const serviceData = await getServiceRes.json();
      const serviceId = serviceData.id;

      const deleteRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/${serviceId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Tenant-ID': tenantId,
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        }
      );
      if (!deleteRes.ok) {
        const errJson = await deleteRes.json();
        throw new Error(errJson.detail || 'Error al eliminar el servicio.');
      }

      toast.success(language === 'fr' ? 'Service supprimé.' : language === 'en' ? 'Service deleted.' : 'Servicio eliminado con éxito.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content:
            language === 'fr'
              ? `Succès: Le service avec le slug '${slug}' a été supprimé.`
              : language === 'en'
              ? `Success: The service with slug '${slug}' has been deleted.`
              : `Éxito: El servicio con slug '${slug}' ha sido eliminado correctamente.`,
        },
      ]);
      if (onFieldsUpdated) {
        onFieldsUpdated(['services']);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error.');
      setMessages((prev) => [...prev, { role: 'model', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isMuted,
    setIsMuted,
    voiceGender,
    setVoiceGender,
    toggleVoiceGender,
    toggleMute,
    userAvatar,
    confirmModal,
    setConfirmModal,
    messagesEndRef,
    chatLanguage,
    language,
    t,
    handleSend,
    handleResetChat,
    handleConfirmDelete,
    // Soporte de Archivos e Imágenes
    attachedFile,
    onRemoveFile: () => setAttachedFile(null),
    onAttachClick: () => fileInputRef.current?.click(),
    fileInputRef,
    onFileChange: handleFileChange,
    onPaste: handlePaste,
    isUploadingFile,
  };
}
