'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, User, Bot, RefreshCw, Volume2, VolumeX, AudioLines,
  Palette, LayoutGrid, SlidersHorizontal, PlusCircle, Wand2, LucideIcon 
} from 'lucide-react';
import VoiceRecorderButton from './VoiceRecorderButton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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

// Constantes de persistencia para el Asistente AI Webmaster
const CHAT_STORAGE_KEY_PREFIX = 'probookia_webmaster_chat_';
const MAX_SAVED_MESSAGES = 30; // Ventana rodante para no sobrecargar el almacenamiento
const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas de caducidad por inactividad

// Obtener tenantId activo considerando modo soporte (Super Admin) o sesión directa
function getActiveTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  const impersonated = getCookie('impersonate_tenant_id');
  if (impersonated) return impersonated;
  const directCookie = getCookie('tenant_id');
  if (directCookie) return directCookie;
  try {
    const session = localStorage.getItem('user');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.tenant_id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const WEBMASTER_WELCOME = '¡Hola! Soy tu AI Webmaster & Director Creativo. Estoy conectado directamente con el escaparate público de tu negocio (en la vista previa a tu derecha). Puedo rediseñar secciones, optimizar textos para SEO, cambiar tu paleta de marca o generar fotografías de alta gama con tu clave de API. ¿Qué cambio visual deseas aplicar a tu web hoy?';

interface WebmasterCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  prompt: string;
}

const WEBMASTER_COMMANDS: WebmasterCommand[] = [
  {
    id: 'palette',
    title: 'Paleta Quiet Luxury',
    subtitle: 'Champagne, marfil y antracita',
    icon: Palette,
    prompt: 'Aplica una paleta de marca Quiet Luxury de alta gama a la web: color de acento dorado champagne #D4AF37, fondo marfil refinado, tipografía Playfair Display en títulos e Inter en cuerpo, y bordes redondeados.'
  },
  {
    id: 'seo_hero',
    title: 'Optimizar Hero & SEO',
    subtitle: 'Titular de alta conversión',
    icon: Sparkles,
    prompt: 'Optimiza el titular principal, subtítulo y botón de llamada a la acción del Hero para mejorar el posicionamiento SEO y la captación de reservas de alto poder adquisitivo.'
  },
  {
    id: 'bento',
    title: 'Layout Bento Grid',
    subtitle: 'Mosaico modular 2026',
    icon: LayoutGrid,
    prompt: 'Configura el estilo visual de la portada en formato Bento Grid modular asimétrico (layout_style="bento_grid") y ajusta el megamenú a formato bento con previsualización inmediata.'
  },
  {
    id: 'carousel',
    title: 'Carrusel Cinemático',
    subtitle: 'Diapositivas a pantalla completa',
    icon: SlidersHorizontal,
    prompt: 'Configura el escaparate en formato carrusel cinemático (layout_style="cards_slider") y revisa que las diapositivas del Hero tengan precios elegantes y llamadas a la acción directas.'
  },
  {
    id: 'new_page',
    title: 'Crear Página y Menú',
    subtitle: 'Nueva sección en la barra superior',
    icon: PlusCircle,
    prompt: 'Crea una nueva página web autónoma llamada "Filosofía y Espacio" con redacción editorial de alta costura y vincúlala de forma automática al menú superior de navegación (Navbar).'
  },
  {
    id: 'photo',
    title: 'Foto Editorial IA',
    subtitle: 'Generar con mi clave API',
    icon: Wand2,
    prompt: 'Genera una fotografía comercial editorial de alta costura para nuestro catálogo de tratamientos utilizando mi clave de API conectada en Ajustes.'
  },
];

function parseOptionsAndText(content: string) {
  let raw = content || '';
  const options: { label: string; value: string }[] = [];
  const optionRegex = /\[OPTION:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
  let match;
  while ((match = optionRegex.exec(raw)) !== null) {
    options.push({ label: match[1].trim(), value: match[2].trim() });
  }
  const clean = raw.replace(optionRegex, '').trim();
  return { clean, options };
}

interface AIChatContainerProps {
  onFieldsUpdated?: (fields: string[], redirectUrl?: string) => void;
}

export default function AIChatContainer({ onFieldsUpdated }: AIChatContainerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: WEBMASTER_WELCOME,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const chatLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const { role, userName: authUserName } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    slug: string;
    target: string;
  } | null>(null);

  // Bandera para evitar sobreescribir el historial antes de haberlo cargado
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
        const isNotExpired = data?.updatedAt && (Date.now() - data.updatedAt < CHAT_TTL_MS);
        if (isNotExpired && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Si expiró o está corrupto, limpiar el almacenamiento
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

    // Solo guardar si hay conversación real (más allá del saludo inicial)
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
            content: WEBMASTER_WELCOME,
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {
        console.warn('Precalentamiento de voces no disponible:', e);
      }
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

      // 3.5. Detectar comandos [NAVIGATE: route?hint=selector]
      const navigateRegex = /\[NAVIGATE:\s*([^\]]+)\]/i;
      let cleanedResponseText = finalResponseText || '';
      const navMatch = typeof finalResponseText === 'string' ? finalResponseText.match(navigateRegex) : null;
      if (navMatch && navMatch[1]) {
        const targetRoute = navMatch[1].trim();
        router.push(targetRoute);
        cleanedResponseText = finalResponseText.replace(/\[NAVIGATE:\s*[^\]]+\]/gi, '').trim();
      }

      // 4. Añadir respuesta de la IA a la UI
      setMessages((prev) => [...prev, { role: 'model', content: cleanedResponseText }]);

      // 5. Leer respuesta en voz alta
      speakText(cleanedResponseText, data.audio_response_base64);

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
    <div className="flex flex-col h-full bg-[#FAFAFA] border-r border-stone-200/80">
      {/* Cabecera del Asistente - Quiet Luxury Styling */}
      <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/60 shadow-xs shrink-0 h-[68px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-300/40 text-[#d4af37] shadow-xs">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-stone-900 tracking-wide font-serif">Estudio AI Webmaster</h2>
            <p className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-widest mt-0.5">Director Creativo · Plan Elite</p>
          </div>
        </div>

        {/* Controles de Cabecera (Voz, Silencio y Reinicio) */}
        <div className="flex items-center gap-2">
          {/* Selector de Género de Voz */}
          <button
            onClick={() => {
              const next = voiceGender === 'female' ? 'male' : 'female';
              setVoiceGender(next);
              toast.success(language === 'fr' ? 'Voix configurée' : language === 'en' ? 'Voice configured' : 'Voz configurada');
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 flex items-center gap-1.5 ${
              voiceGender === 'male'
                ? 'border-amber-300/80 bg-amber-50/80 text-amber-900 shadow-xs'
                : 'border-stone-200/80 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-xs'
            }`}
            title={language === 'fr' ? 'Changer de voix' : language === 'en' ? 'Change voice' : 'Cambiar voz'}
          >
            <AudioLines size={13} className={voiceGender === 'male' ? 'text-amber-700' : 'text-[#d4af37]'} strokeWidth={2} />
            <span>
              {voiceGender === 'female'
                ? (language === 'fr' ? 'Voix Féminine' : language === 'en' ? 'Female Voice' : 'Voz Femenina')
                : (language === 'fr' ? 'Voix Masculine' : language === 'en' ? 'Male Voice' : 'Voz Masculina')
              }
            </span>
          </button>

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
              // Eliminar historial persistido de este tenant
              const tenantId = getActiveTenantId();
              if (tenantId) {
                try {
                  localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${tenantId}`);
                } catch (e) {
                  console.warn('Error al limpiar chat persistente:', e);
                }
              }
              setMessages([
                {
                  role: 'model',
                  content: WEBMASTER_WELCOME,
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
          const { clean, options } = parseOptionsAndText(msg.content);
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

              <div className="flex flex-col gap-1.5">
                <div
                  className={`px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans whitespace-pre-line transition-all duration-300 ${isUser
                      ? 'bg-stone-900 text-white rounded-tr-none'
                      : 'bg-white border border-stone-200/50 text-stone-800 rounded-tl-none'
                    }`}
                >
                  {clean}
                </div>

                {/* Botones de Opciones Rápidas 1-Clic */}
                {!isUser && options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    {options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSend(opt.value)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-[#d4af37] text-amber-900 hover:text-stone-950 border border-amber-300/70 transition-all duration-200 shadow-2xs active:scale-95 text-left flex items-center gap-1.5"
                      >
                        <Sparkles size={12} className="text-[#d4af37] shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
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

      {/* ── PANEL DE COMANDOS DE DISEÑO WEB 2026 (2 FILAS GLOSSY GLASS) ── */}
      <div className="px-4 py-3 bg-[#FAF9F6]/90 backdrop-blur-xl border-t border-stone-200/70 shrink-0">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b38f2b]">
              Comandos Rápidos de Estudio · 2026
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium tracking-wide">
            1-Clic · Sincronizado en Vivo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WEBMASTER_COMMANDS.map((cmd, idx) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => handleSend(cmd.prompt)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-2xl p-2.5 text-left transition-all duration-300 bg-white/90 hover:bg-white border border-stone-200/80 hover:border-[#d4af37]/70 shadow-2xs hover:shadow-[0_8px_25px_-5px_rgba(212,175,55,0.22)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              >
                {/* Reflejo / Glossy Gradient ambiental en hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-6 h-6 rounded-lg bg-amber-50/90 border border-amber-200/60 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-stone-950 transition-colors shadow-2xs">
                      <Icon size={12} strokeWidth={2.3} />
                    </div>
                    <span className="text-[9px] font-mono text-stone-300 group-hover:text-[#b38f2b] font-bold transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-stone-900 group-hover:text-stone-950 block leading-tight truncate">
                    {cmd.title}
                  </span>
                  <span className="text-[9px] text-stone-400 group-hover:text-stone-600 block leading-snug mt-0.5 truncate">
                    {cmd.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input de Envío */}
      <div className="p-4 bg-white border-t border-stone-200/60 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5 bg-stone-50 hover:bg-stone-50/80 border border-stone-200/80 focus-within:bg-white focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/15 rounded-2xl p-2 transition-all shadow-xs">
          <VoiceRecorderButton
            disabled={isLoading}
            lang={chatLanguage}
            onVoiceTranscribed={(text) => handleSend(`[Voz]: "${text}"`)}
            size="sm"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={t('ai_chat.input_placeholder') || 'Pregúntame algo o envíame un comando de voz...'}
            className="flex-1 bg-transparent border-none text-[13px] text-stone-800 placeholder-stone-400 focus:outline-none px-2 py-1 leading-relaxed"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 rounded-xl bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:hover:bg-stone-900 active:scale-95 shadow-xs shrink-0"
          >
            <Send size={14} />
          </button>
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
