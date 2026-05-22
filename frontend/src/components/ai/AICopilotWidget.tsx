'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Send, Bot, User, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorderButton from './VoiceRecorderButton';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Simple helper to read cookies client-side
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
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: language === 'fr' 
        ? 'Bonjour, je suis votre Copilote ProBookia. Dites-moi où vous souhaitez naviguer ou quel traitement vous souhaitez créer.'
        : language === 'en'
          ? 'Hello, I am your ProBookia Copilot. Tell me where you want to navigate or what service you want to create.'
          : 'Hola, soy tu Co-Piloto ProBookia. Dime a qué sección del panel deseas ir o qué tratamiento quieres crear hoy.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';

  // Auto-scroll inside messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speak response out loud if not muted
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = audioLanguage;
      const voices = window.speechSynthesis.getVoices();
      const elegVoic = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'));
      if (elegVoic) utterance.voice = elegVoic;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fail:', e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input.trim();
    if (!queryText || isLoading) return;

    if (!textToSend) {
      setInput('');
    }

    // 1. Get Session/Tenant Details
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
      toast.error('Sesión no válida: Identificador de inquilino (Tenant ID) ausente.');
      return;
    }

    // 2. Append User Message
    const updatedMessages = [...messages, { role: 'user', content: queryText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 3. Post to AI backend
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
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await response.json();
      let responseText = data.response;

      // 4. Check for structural JSON navigation instruction
      try {
        const parsed = JSON.parse(data.response);
        if (parsed && parsed.action === 'navigate' && parsed.route) {
          responseText = parsed.message || `Con gusto. Dirigiéndonos a ${parsed.route}...`;
          
          // Execute global route navigation with micro delay
          setTimeout(() => {
            router.push(parsed.route);
            setIsOpen(false); // Close Copilot panel upon success
            toast.success(language === 'fr' ? 'Navigation réussie' : language === 'en' ? 'Navigation successful' : 'Navegación completada con éxito.');
          }, 600);
        }
      } catch (e) {
        // Not a navigation instruction, handle as regular text
      }

      // 5. Append AI Message and speak
      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);
      speakText(responseText);

    } catch (err: any) {
      console.error('Error in Copilot chat:', err);
      const errMsg = 'Error en el asistente. Inténtalo de nuevo.';
      setMessages((prev) => [...prev, { role: 'model', content: errMsg }]);
      speakText(errMsg);
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
      
      {/* ── PANEL DE COPILOTO (CREMA, ANTRACITA Y DORADO) ── */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[460px] bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out">
          
          {/* Cabecera Premium (Antracita + Oro) */}
          <div className="px-5 py-4 bg-stone-900 flex items-center justify-between text-white border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center border border-[#d4af37]/40 shadow-inner">
                <Sparkles size={14} className="text-[#d4af37] animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide">Co-Piloto AI</h3>
                <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest">Navegación Inteligente</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Botón de Silencio */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-[#d4af37] hover:bg-stone-800 transition-all"
                title={isMuted ? 'Activar Voz' : 'Silenciar Voz'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              
              {/* Botón Cerrar */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Historial de Mensajes (Quiet Luxury Crema) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5] hide-scroll">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'model';
              return (
                <div key={index} className={`flex gap-2.5 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 border border-[#d4af37]/30 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <Bot size={12} className="text-[#d4af37]" />
                    </div>
                  )}
                  
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm transition-all duration-300 ${
                    isAI
                      ? 'bg-white text-stone-850 border border-stone-200/50 rounded-tl-none font-medium'
                      : 'bg-stone-900 text-white rounded-tr-none font-bold'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] self-start animate-pulse">
                <div className="w-7 h-7 rounded-full bg-stone-900 border border-[#d4af37]/30 flex items-center justify-center text-white shrink-0">
                  <Bot size={12} className="text-[#d4af37]" />
                </div>
                <div className="p-3 bg-white border border-stone-200/50 rounded-2xl rounded-tl-none text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce delay-200" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada (Reutiliza el Micro e Input) */}
          <div className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={language === 'fr' ? 'Écrire ou parler...' : language === 'en' ? 'Type or speak...' : 'Escribe o habla...'}
              className="flex-1 bg-stone-50 border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition-all font-medium"
            />
            
            {/* Botón de Voz Nativo */}
            <VoiceRecorderButton
              onVoiceTranscribed={(txt) => handleSend(txt)}
              disabled={isLoading}
              lang={audioLanguage}
            />
            
            {/* Botón Enviar */}
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white transition-all duration-300 border border-stone-800 shadow-md ${
                isLoading || !input.trim() ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#d4af37] hover:text-stone-900 hover:border-[#d4af37] active:scale-95'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── BURBUJA FLOTANTE FIJA ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full bg-stone-900 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-[#d4af37]/40 z-10 group overflow-hidden ${
          isOpen ? 'bg-[#d4af37] border-[#d4af37] text-stone-950 rotate-90' : 'hover:bg-stone-850'
        }`}
        title="Copiloto de Navegación IA"
      >
        {/* Efecto de Brillo Circular en hover */}
        <span className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {isOpen ? (
          <X size={22} className="text-white group-hover:text-stone-900 transition-colors" strokeWidth={2.2} />
        ) : (
          <MessageSquare size={22} className="text-[#d4af37]" strokeWidth={1.8} />
        )}
      </button>

    </div>
  );
}
