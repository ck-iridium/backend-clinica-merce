'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorderButton from './VoiceRecorderButton';
import { toast } from 'sonner';
import FeedbackModal from '../FeedbackModal';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

// Utilidad simple para leer cookies en el cliente
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

interface AIChatContainerProps {
  onFieldsUpdated?: (fields: string[], redirectUrl?: string) => void;
}

export default function AIChatContainer({ onFieldsUpdated }: AIChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        '¡Hola! Soy tu Asistente IA Webmaster. Puedo ayudarte a gestionar la clínica de forma conversacional: consulta las citas del día, edita el precio de tus tratamientos o actualiza el diseño visual y textos de tu web pública. ¿Qué deseas hacer hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const chatLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const { userName: authUserName } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    slug: string;
    target: string;
  } | null>(null);

  // Cargar foto de perfil real del usuario
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
        console.warn("No se pudo cargar el avatar del usuario:", e);
      }
    };
    fetchAvatar();
  }, []);

  // Sincronizar mensaje de bienvenida con el idioma global del Dashboard
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [
          {
            role: 'model',
            content: t('ai_chat.welcome_message') || '¡Hola! Soy tu Asistente IA Webmaster. Puedo ayudarte a gestionar la clínica de forma conversacional: consulta las citas del día, edita el precio de tus tratamientos o actualiza el diseño visual y textos de tu web pública. ¿Qué deseas hacer hoy?',
          },
        ];
      }
      return prev;
    });
  }, [language, t]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Precalentar voces del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Web Speech API - Síntesis de voz (Text To Speech) parametrizable y multilingüe
  const speakText = (text: string, audioBase64?: string | null) => {
    if (isMuted || typeof window === 'undefined') return;

    if (audioBase64) {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        const audio = new Audio("data:audio/mp3;base64," + audioBase64);
        audio.play().catch(err => {
          console.warn("Fallo al reproducir audio nativo de Gemini, usando fallback de síntesis del navegador:", err);
          fallbackSpeak(text);
        });
        return;
      } catch (err) {
        console.warn("Fallo al decodificar audio de Gemini:", err);
      }
    }

    fallbackSpeak(text);
  };

  const fallbackSpeak = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancelar lecturas activas previas para evitar superposición
    window.speechSynthesis.cancel();

    // Crear enunciado de lectura
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // 1. Filtrar voces por el idioma activo (es, fr, en, etc.)
    const langPrefix = chatLanguage.split('-')[0].toLowerCase();
    const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

    // 2. Intentar buscar por género preferido (Femenina o Masculina)
    let selectedVoice = null;
    if (langVoices.length > 0) {
      if (voiceGender === 'female') {
        selectedVoice = langVoices.find((v) => {
          const name = v.name.toLowerCase();
          return name.includes('female') || name.includes('zira') || name.includes('helena') ||
            name.includes('hortense') || name.includes('samantha') || name.includes('elene') ||
            name.includes('google') || name.includes('hazel') || name.includes('natural');
        });
      } else {
        selectedVoice = langVoices.find((v) => {
          const name = v.name.toLowerCase();
          return name.includes('male') || name.includes('david') || name.includes('paul') ||
            name.includes('daniel') || name.includes('george') || name.includes('microsoft');
        });
      }

      // Fallback al primer idioma disponible si no coincide el género exacto
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

    utterance.rate = 0.98; // Tono sofisticado premium
    utterance.pitch = voiceGender === 'female' ? 1.12 : 0.88; // Tono agudo/grave según género

    window.speechSynthesis.speak(utterance);
  };

  // Enviar mensaje de Texto
  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input.trim();
    if (!queryText || isLoading) return;

    // 1. Obtener y validar credenciales antes de proceder
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

    if (!tenantId) {
      toast.error('Sesión no válida: Identificador de inquilino (Tenant ID) ausente. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!textToSend) {
      setInput('');
    }

    // 2. Añadir mensaje de usuario a la UI
    const updatedMessages = [...messages, { role: 'user', content: queryText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 3. Realizar llamada POST al endpoint de chat
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
            history: updatedMessages.slice(1).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            voice_gender: voiceGender,
            user_name: firstName,
            language: language,
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

      // Interceptar solicitud de confirmación de eliminación (escudo anti-destrucción)
      let finalResponseText = data.response;
      try {
        const parsed = JSON.parse(data.response);
        if (parsed && parsed.action === 'request_confirmation') {
          setConfirmModal({
            show: true,
            title: language === 'fr' ? 'Confirmer la suppression' : language === 'en' ? 'Confirm Deletion' : 'Confirmar Eliminación',
            message: parsed.message || '¿Estás seguro de que deseas eliminar este elemento?',
            slug: parsed.slug,
            target: parsed.target
          });
          finalResponseText = language === 'fr'
            ? `⚠️ Demande de confirmation de suppression en attente...`
            : language === 'en'
              ? `⚠️ Pending deletion confirmation...`
              : `⚠️ Solicitud de confirmación de eliminación pendiente...`;
        }
      } catch (e) {
        // No es un JSON, usar de forma normal
      }

      // 4. Añadir respuesta de la IA a la UI
      setMessages((prev) => [...prev, { role: 'model', content: finalResponseText }]);

      // 5. Leer respuesta en voz alta
      speakText(finalResponseText, data.audio_response_base64);

      // 6. Notificar actualización de campos para recargar vista previa
      if (data.updated_fields && data.updated_fields.length > 0) {
        toast.success('¡Cambios aplicados en tiempo real por el Asistente!');
        if (onFieldsUpdated) {
          onFieldsUpdated(data.updated_fields, data.redirect_url);
        }
      }
    } catch (error: any) {
      console.error('Error en Chat IA:', error);
      let errMsg = 'Lo siento, ha ocurrido un error al procesar tu solicitud.';
      if (error.message === 'AI_BYOK') {
        errMsg =
          'Tu plan de suscripción requiere que configures tu propia API Key de Google Gemini en Ajustes > Configuración de IA para utilizar el Asistente.';
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



  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFAF6] border-r border-stone-200/80 shadow-inner">
      {/* Cabecera del Asistente - Premium Styling */}
      <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/60 shadow-sm shrink-0 h-[72px]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-850 text-white shadow-md border border-stone-800/20">
            <Sparkles size={18} className="text-[#d4af37] animate-pulse" />
          </div>
          <div>
            <h2 className="text-[14.5px] font-bold text-stone-900 tracking-tight font-serif">{t('ai_chat.title') || 'Co-Piloto ProBookia'}</h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{t('ai_chat.subtitle') || 'AI Webmaster en línea'}</p>
          </div>
        </div>

        {/* Controles de Cabecera (Voz, Silencio y Reinicio) */}
        <div className="flex items-center gap-2">
          {/* Selector de Género */}
          <select
            value={voiceGender}
            onChange={(e) => {
              setVoiceGender(e.target.value as 'female' | 'male');
              toast.success(language === 'fr' ? 'Voix configurée' : language === 'en' ? 'Voice configured' : 'Voz configurada');
            }}
            className="text-[11px] font-semibold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] cursor-pointer transition-all duration-300"
            title={language === 'fr' ? 'Sélectionner le genre de voix' : language === 'en' ? 'Select voice gender' : 'Seleccionar género de voz'}
          >
            <option value="female">{language === 'fr' ? '👩 Voix Féminine' : language === 'en' ? '👩 Female Voice' : '👩 Voz Femenina'}</option>
            <option value="male">{language === 'fr' ? '👨 Voix Masculine' : language === 'en' ? '👨 Male Voice' : '👨 Voz Masculina'}</option>
          </select>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              toast.info(nextMuted
                ? (language === 'fr' ? 'Synthèse vocale coupée' : language === 'en' ? 'Text-to-speech muted' : 'Síntesis de voz silenciada')
                : (language === 'fr' ? 'Synthèse vocale activée' : language === 'en' ? 'Text-to-speech activated' : 'Síntesis de voz activada')
              );
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 ${isMuted
                ? 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                : 'text-[#d4af37] hover:text-[#b38f2b] hover:bg-amber-50/50'
              }`}
            title={isMuted ? (language === 'fr' ? 'Activer la lecture' : language === 'en' ? 'Unmute reading' : 'Activar lectura en voz alta') : (language === 'fr' ? 'Désactiver la lecture' : language === 'en' ? 'Mute reading' : 'Silenciar lectura')}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setMessages([
                {
                  role: 'model',
                  content: language === 'fr'
                    ? 'Conversation réinitialisée. En quoi puis-je vous aider maintenant avec votre page d\'accueil ou votre agenda ?'
                    : language === 'en'
                      ? 'Conversation reset. How can I assist you now with your landing page or schedule?'
                      : 'Conversación reiniciada. ¿En qué puedo asistirte ahora con tu landing page o agenda?',
                },
              ]);
              toast.info(language === 'fr' ? 'Conversation réinitialisée' : language === 'en' ? 'Conversation reset' : 'Conversación reiniciada');
            }}
            className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-all duration-300"
            title={language === 'fr' ? 'Réinitialiser la conversation' : language === 'en' ? 'Reset chat' : 'Reiniciar chat'}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Cuerpo del Chat (Mensajes) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm border transition-all duration-300 overflow-hidden ${isUser
                    ? 'bg-stone-900 border-stone-850 text-white'
                    : 'bg-white border-[#d4af37]/30 text-[#d4af37]'
                  }`}
              >
                {isUser ? (
                  userAvatar ? (
                    <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover" />
                  ) : (
                    <User size={13} />
                  )
                ) : (
                  <Bot size={13} />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className={`px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans whitespace-pre-line transition-all duration-300 ${isUser
                      ? 'bg-stone-900 text-white rounded-tr-none'
                      : 'bg-white border border-stone-200/50 text-stone-800 rounded-tl-none'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3.5 max-w-[85%] mr-auto animate-in fade-in duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#d4af37]/30 text-[#d4af37] shadow-sm">
              <Bot size={13} className="animate-spin text-[#d4af37]" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-none bg-white border border-stone-200/50 text-stone-400 text-[13px] italic flex items-center gap-2 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1 text-[12.5px] font-medium text-stone-400">{t('general.loading') || 'Procesando...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envío */}
      <div className="p-5 bg-white border-t border-stone-200/60 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón de Grabación por Voz NATIVA (SpeechRecognition) */}
          <VoiceRecorderButton disabled={isLoading} lang={chatLanguage} onVoiceTranscribed={(text) => handleSend(`🎙️ [Voz]: "${text}"`)} />

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={t('ai_chat.input_placeholder') || 'Pregúntame algo o envíame un comando de voz...'}
              className="w-full bg-stone-50 hover:bg-stone-50/50 focus:bg-white text-stone-800 placeholder-stone-400 text-[13.5px] rounded-xl border border-stone-200/60 pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all duration-300 shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 p-2 rounded-lg bg-stone-900 hover:bg-[#d4af37] text-white disabled:opacity-30 disabled:hover:bg-stone-900 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      {confirmModal && confirmModal.show && (
        <FeedbackModal
          type="confirm"
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={language === 'fr' ? 'Oui, supprimer' : language === 'en' ? 'Yes, delete' : 'Sí, confirmar borrado'}
          cancelText={language === 'fr' ? 'Annuler' : language === 'en' ? 'Cancel' : 'Cancelar'}
          onClose={() => setConfirmModal(null)}
          onConfirmHandler={async () => {
            const slug = confirmModal.slug;
            setConfirmModal(null);
            setIsLoading(true);

            // Obtener tenantId y token
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
              // 1. Obtener información del servicio por slug
              const getServiceRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/slug/${slug}`,
                {
                  headers: {
                    'X-Tenant-ID': tenantId,
                    Authorization: authToken ? `Bearer ${authToken}` : '',
                  }
                }
              );
              if (!getServiceRes.ok) {
                throw new Error(language === 'fr' ? 'Service introuvable.' : language === 'en' ? 'Service not found.' : 'No se pudo encontrar el servicio para eliminar.');
              }
              const serviceData = await getServiceRes.json();
              const serviceId = serviceData.id;

              // 2. Ejecutar DELETE seguro
              const deleteRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/${serviceId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'X-Tenant-ID': tenantId,
                    Authorization: authToken ? `Bearer ${authToken}` : '',
                  }
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
                  content: language === 'fr'
                    ? `Succès: Le service avec le slug '${slug}' a été supprimé.`
                    : language === 'en'
                      ? `Success: The service with slug '${slug}' has been deleted.`
                      : `Éxito: El servicio con slug '${slug}' ha sido eliminado correctamente.`
                }
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
          }}
        />
      )}
    </div>
  );
}
