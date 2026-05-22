'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorderButton from './VoiceRecorderButton';
import { toast } from 'sonner';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    if (!textToSend) {
      setInput('');
    }

    // 1. Añadir mensaje de usuario a la UI
    const updatedMessages = [...messages, { role: 'user', content: queryText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const userSession = localStorage.getItem('user');
      let tenantId = '';
      let authToken = '';
      if (userSession) {
        const parsed = JSON.parse(userSession);
        tenantId = parsed.tenant_id || '';
        authToken = parsed.token || '';
      }

      // 2. Realizar llamada POST al endpoint de chat
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

      // 3. Añadir respuesta de la IA a la UI
      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);

      // 4. Leer respuesta en voz alta
      speakText(data.response);

      // 5. Notificar actualización de campos para recargar vista previa
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

  // Enviar mensaje de Voz (Base64)
  const handleAudioRecorded = async (base64Audio: string, mimeType: string) => {
    if (isLoading) return;

    // 1. Añadir marcador de mensaje de voz enviado
    const userVoiceMessage: Message = {
      role: 'user',
      content: '🎙️ [Comando de voz enviado]',
    };
    const updatedMessages = [...messages, userVoiceMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const userSession = localStorage.getItem('user');
      let tenantId = '';
      let authToken = '';
      if (userSession) {
        const parsed = JSON.parse(userSession);
        tenantId = parsed.tenant_id || '';
        authToken = parsed.token || '';
      }

      // 2. Realizar llamada POST al endpoint de voz multimodal
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tenant/ai/voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
          body: JSON.stringify({
            audio_base64: base64Audio,
            mime_type: mimeType,
            history: updatedMessages.slice(1, -1).map((msg) => ({
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
        throw new Error(errData.detail || 'Error al procesar el audio.');
      }

      const data = await response.json();

      // 3. Añadir respuesta de la IA
      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);

      // 4. Leer respuesta en voz alta (Text-To-Speech)
      speakText(data.response);

      // 5. Notificar campos modificados para recargar iframe
      if (data.updated_fields && data.updated_fields.length > 0) {
        toast.success('¡Operación de voz ejecutada e iframe actualizado!');
        if (onFieldsUpdated) {
          onFieldsUpdated(data.updated_fields);
        }
      }
    } catch (error: any) {
      console.error('Error en Voz IA:', error);
      let errMsg = 'Lo siento, ha ocurrido un error al procesar tu comando de voz.';
      if (error.message === 'AI_BYOK') {
        errMsg =
          'Configura tu propia API Key de Google Gemini en Ajustes > Configuración de IA para utilizar los comandos de voz.';
      } else if (error instanceof Error) {
        errMsg = `Error: ${error.message}`;
      }
      setMessages((prev) => [...prev, { role: 'model', content: errMsg }]);
      speakText(errMsg);
      toast.error('Error al procesar el comando de voz.');
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
    <div className="flex flex-col h-full bg-[#fdfbf7] border-r border-stone-200/60 shadow-inner">
      {/* Cabecera del Asistente */}
      <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-stone-200/50 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4af37] to-[#1c1917] text-white shadow-md">
            <Sparkles size={18} className="text-[#fdfbf7]" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-stone-800 tracking-tight">Co-Piloto ProBookia</h2>
            <p className="text-[11px] font-medium text-stone-400">AI Webmaster en línea</p>
          </div>
        </div>
        
        {/* Controles de Cabecera (Silencio y Reinicio) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              toast.info(nextMuted ? 'Síntesis de voz silenciada' : 'Síntesis de voz activada');
            }}
            className={`p-2 rounded-xl transition-all ${
              isMuted
                ? 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                : 'text-[#d4af37] hover:text-[#b38f2b] hover:bg-amber-50/50'
            }`}
            title={isMuted ? 'Activar lectura en voz alta' : 'Silenciar lectura'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
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
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-all"
            title="Reiniciar chat"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Cuerpo del Chat (Mensajes) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-stone-200">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm border ${
                  isUser
                    ? 'bg-stone-900 border-stone-800 text-white'
                    : 'bg-white border-[#d4af37]/30 text-[#d4af37]'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className={`px-4.5 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans whitespace-pre-line transition-all duration-300 ${
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
          <div className="flex gap-3 max-w-[85%] mr-auto animate-in fade-in duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#d4af37]/30 text-[#d4af37] shadow-sm">
              <Bot size={14} className="animate-spin text-[#d4af37]" />
            </div>
            <div className="px-4.5 py-3 rounded-2xl rounded-tl-none bg-white border border-stone-200/50 text-stone-400 text-[13px] italic flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1">Procesando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envío */}
      <div className="p-4 bg-white border-t border-stone-200/50 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          {/* Botón de Grabación por Voz con Captura Real */}
          <VoiceRecorderButton disabled={isLoading} onAudioRecorded={handleAudioRecorded} />

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Pregúntame algo o envíame un comando de voz..."
              className="w-full bg-stone-50 hover:bg-stone-50/50 focus:bg-white text-stone-800 placeholder-stone-400 text-[13.5px] rounded-xl border border-stone-200/60 pl-4 pr-11 py-3 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all duration-300"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 p-2 rounded-lg bg-stone-900 hover:bg-[#d4af37] text-white disabled:opacity-30 disabled:hover:bg-stone-900 transition-all duration-300 active:scale-95"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
