'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorderButton from './VoiceRecorderButton';
import { toast } from 'sonner';

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
  onFieldsUpdated?: (fields: string[]) => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Web Speech API - Síntesis de voz (Text To Speech)
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancelar lecturas activas previas para evitar superposición
    window.speechSynthesis.cancel();

    // Crear enunciado de lectura
    const utterance = new SpeechSynthesisUtterance(text);

    // Seleccionar preferentemente una voz en español premium/femenina si está disponible
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(
      (v) => v.lang.startsWith('es-ES') && v.name.toLowerCase().includes('google')
    );
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) =>
          v.lang.startsWith('es-ES') ||
          v.lang.startsWith('es-MX') ||
          v.lang.startsWith('es-')
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = selectedVoice?.lang || 'es-ES';
    utterance.rate = 0.98; // Tono ligeramente pausado y sofisticado
    utterance.pitch = 1.05; // Tono premium agradable

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

      // 4. Añadir respuesta de la IA a la UI
      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);

      // 5. Leer respuesta en voz alta
      speakText(data.response);

      // 6. Notificar actualización de campos para recargar vista previa
      if (data.updated_fields && data.updated_fields.length > 0) {
        toast.success('¡Cambios aplicados en tiempo real por el Asistente!');
        if (onFieldsUpdated) {
          onFieldsUpdated(data.updated_fields);
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
            <h2 className="text-[14.5px] font-bold text-stone-900 tracking-tight font-serif">Co-Piloto ProBookia</h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">AI Webmaster en línea</p>
          </div>
        </div>
        
        {/* Controles de Cabecera (Silencio y Reinicio) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              toast.info(nextMuted ? 'Síntesis de voz silenciada' : 'Síntesis de voz activada');
            }}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isMuted
                ? 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                : 'text-[#d4af37] hover:text-[#b38f2b] hover:bg-amber-50/50'
            }`}
            title={isMuted ? 'Activar lectura en voz alta' : 'Silenciar lectura'}
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
                  content:
                    'Conversación reiniciada. ¿En qué puedo asistirte ahora con tu landing page o agenda?',
                },
              ]);
              toast.info('Conversación reiniciada');
            }}
            className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-all duration-300"
            title="Reiniciar chat"
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
              className={`flex gap-3.5 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm border transition-all duration-300 overflow-hidden ${
                  isUser
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
                  className={`px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans whitespace-pre-line transition-all duration-300 ${
                    isUser
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
              <span className="ml-1 text-[12.5px] font-medium text-stone-400">Procesando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envío */}
      <div className="p-5 bg-white border-t border-stone-200/60 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón de Grabación por Voz NATIVA (SpeechRecognition) */}
          <VoiceRecorderButton disabled={isLoading} onVoiceTranscribed={(text) => handleSend(`🎙️ [Voz]: "${text}"`)} />

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Pregúntame algo o envíame un comando de voz..."
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
    </div>
  );
}
