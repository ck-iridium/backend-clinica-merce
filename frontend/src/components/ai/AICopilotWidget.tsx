'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Send, Bot, User, Volume2, VolumeX, MessageSquare, RotateCcw, Paperclip, FileText } from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorderButton from './VoiceRecorderButton';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

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
  const { role, userName: authUserName, loading: loadingRole } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Selector de Voz y Redimensionamiento
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [chatWidth, setChatWidth] = useState(384);
  const [chatHeight, setChatHeight] = useState(460);
  const isResizing = useRef(false);

  // Estados para archivos adjuntos seguros
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    content: string;
    type: 'text' | 'image';
    url?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = role ? ['admin', 'administrador', 'recepcion', 'especialista'].includes(role.toLowerCase()) : false;
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

  // Redimensionamiento dinámico
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const paddingRight = 24;
    const paddingBottom = 90;
    
    const newWidth = Math.max(300, Math.min(windowWidth - 32, windowWidth - e.clientX - paddingRight));
    const newHeight = Math.max(300, Math.min(windowHeight - 32, windowHeight - e.clientY - paddingBottom));
    
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

  // Cargar preferencias persistidas al montar (Hydration Safe)
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

  // Guardar cambios de voz
  useEffect(() => {
    localStorage.setItem('probookia_copilot_voice_gender', voiceGender);
  }, [voiceGender]);

  // Limpiar listeners de drag si el componente se desmonta
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  // Precalentar voces del navegador al montar
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Sincronizar mensaje de bienvenida con el idioma global del Dashboard
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [
          {
            role: 'model',
            content: language === 'fr' 
              ? 'Bonjour, je suis votre Copilote ProBookia. Dites-moi où vous souhaitez naviguer ou quel traitement vous souhaitez créer.'
              : language === 'en'
                ? 'Hello, I am your ProBookia Copilot. Tell me where you want to navigate or what service you want to create.'
                : 'Hola, soy tu Co-Piloto ProBookia. Dime a qué sección del panel deseas ir o qué tratamiento quieres crear hoy.',
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Cargar historial persistido al montar (Hydration Safe)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('probookia_copilot_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Error al cargar historial del copilot:", e);
    }
  }, []);

  // Guardar historial al actualizar mensajes
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem('probookia_copilot_history', JSON.stringify(messages));
      } catch (e) {
        console.warn("Error al guardar historial del copilot:", e);
      }
    }
  }, [messages]);

  // Reiniciar historial
  const handleClearHistory = () => {
    try {
      sessionStorage.removeItem('probookia_copilot_history');
      setMessages([
        {
          role: 'model',
          content: language === 'fr' 
            ? 'Bonjour, je suis votre Copilote ProBookia. Dites-moi où vous souhaitez naviguer ou quel traitement vous souhaitez créer.'
            : language === 'en'
              ? 'Hello, I am your ProBookia Copilot. Tell me where you want to navigate or what service you want to create.'
              : 'Hola, soy tu Co-Piloto ProBookia. Dime a qué sección del panel deseas ir o qué tratamiento quieres crear hoy.',
        },
      ]);
      toast.success(
        language === 'fr' 
          ? 'Historique de conversation réinitialisé.' 
          : language === 'en' 
            ? 'Conversation history reset.' 
            : 'Historial de conversación reiniciado.'
      );
    } catch (e) {
      console.warn("Error al borrar historial:", e);
    }
  };

  // Auto-scroll inside messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Pre-unlock the Audio Context synchronously on user gesture to prevent browser autoplay blocks
  const unlockAudioContext = () => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
      silentAudio.play().catch(() => {
        // Ignorar rechazo de autoplay, la llamada misma registra la interacción en el navegador
      });
    } catch (e) {
      // Ignorar errores
    }
  };

  // Speak response out loud if not muted with proper native premium voice
  const speakText = (text: string, audioBase64?: string | null, onEndCallback?: () => void) => {
    if (isMuted || typeof window === 'undefined') {
      if (onEndCallback) onEndCallback();
      return;
    }

    if (audioBase64) {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        const audio = new Audio("data:audio/mp3;base64," + audioBase64);
        audio.onended = () => {
          if (onEndCallback) onEndCallback();
        };
        audio.onerror = () => {
          console.warn("Fallo en la reproducción del audio nativo en copilot widget, fallback a síntesis");
          fallbackSpeak(text, onEndCallback);
        };
        audio.play().catch(err => {
          console.warn("Fallo al reproducir audio nativo de Gemini, usando fallback de síntesis del navegador:", err);
          fallbackSpeak(text, onEndCallback);
        });
        return;
      } catch (err) {
        console.warn("Fallo al decodificar audio de Gemini:", err);
      }
    }

    fallbackSpeak(text, onEndCallback);
  };

  const fallbackSpeak = (text: string, onEndCallback?: () => void) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = audioLanguage.split('-')[0].toLowerCase();
      const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

      let selectedVoice = null;
      if (langVoices.length > 0) {
        selectedVoice = langVoices.find((v) => {
          const name = v.name.toLowerCase();
          if (voiceGender === 'male') {
            return name.includes('male') || name.includes('david') || name.includes('george') || 
                   name.includes('paul') || name.includes('daniel') || name.includes('microsoft');
          } else {
            return name.includes('female') || name.includes('zira') || name.includes('helena') || 
                   name.includes('hortense') || name.includes('samantha') || name.includes('elene') || 
                   name.includes('google') || name.includes('hazel') || name.includes('natural');
          }
        });
        if (!selectedVoice) {
          selectedVoice = langVoices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = audioLanguage;
      }

      utterance.rate = 0.98; // Tono sofisticado, pausado y natural
      utterance.pitch = voiceGender === 'male' ? 0.90 : 1.12; // Masculino o femenino y elegante

      if (onEndCallback) {
        let called = false;
        const triggerCallback = () => {
          if (!called) {
            called = true;
            onEndCallback();
          }
        };
        utterance.onend = triggerCallback;
        utterance.onerror = triggerCallback;
        
        // Safety backup timer: ~180ms per word + 1s padding
        const wordCount = text.split(/\s+/).length;
        const backupDelay = Math.max(2000, wordCount * 180 + 1000);
        setTimeout(triggerCallback, backupDelay);
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fail:', e);
      if (onEndCallback) onEndCallback();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de tamaño de 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera el límite de seguridad de 5MB.');
      return;
    }

    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    
    if (isImage) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload/`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Error al subir la imagen.');
        }

        const data = await res.json();
        setAttachedFile({
          name: file.name,
          content: data.url,
          type: 'image',
          url: data.url,
        });
        toast.success('Imagen subida y adjuntada correctamente.');
      } catch (err) {
        console.error(err);
        toast.error('Fallo al subir la imagen.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Archivos basados en texto (CSV, JSON, TXT)
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setAttachedFile({
          name: file.name,
          content: text,
          type: 'text',
        });
        toast.success(`Archivo "${file.name}" adjuntado.`);
      };
      reader.onerror = () => {
        toast.error('Error al leer el archivo.');
      };
      reader.readAsText(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    unlockAudioContext();
    let queryText = textToSend || input.trim();
    if (!queryText && !attachedFile && !textToSend) return;
    if (isLoading || isUploading) return;

    // Si hay un archivo adjunto, agregarlo a la consulta de forma segura e inteligente
    if (attachedFile && !textToSend) {
      if (attachedFile.type === 'text') {
        queryText = `[Archivo adjunto: "${attachedFile.name}"]\nContenido:\n"""\n${attachedFile.content}\n"""\n\n${queryText}`;
      } else if (attachedFile.type === 'image' && attachedFile.url) {
        queryText = `[Imagen adjunta: "${attachedFile.name}"]\nURL de la imagen: ${attachedFile.url}\n\n${queryText}`;
      }
      setAttachedFile(null); // Limpiar tras capturar
    }

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
            user_name: firstName,
            language: language,
            voice_gender: voiceGender,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await response.json();
      let responseText = data.response;

      // 4. Check for structural JSON navigation instruction
      let targetRoute: string | null = null;
      try {
        const parsed = JSON.parse(data.response);
        if (parsed && parsed.action === 'navigate' && parsed.route) {
          responseText = parsed.message || `Con gusto. Dirigiéndonos a ${parsed.route}...`;
          targetRoute = parsed.route;
        }
      } catch (e) {
        // Not a navigation instruction, handle as regular text
      }

      // 5. Append AI Message
      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);

      // 6. Speak response, then perform transitions (navigation or reload) ONLY after speaking completes
      const shouldRefresh = data.updated_fields && data.updated_fields.length > 0;

      speakText(responseText, data.audio_response_base64, () => {
        if (targetRoute) {
          router.push(targetRoute);
          setIsOpen(false);
          toast.success(language === 'fr' ? 'Navigation réussie' : language === 'en' ? 'Navigation successful' : 'Navegación completada con éxito.');
        } else if (shouldRefresh) {
          router.refresh();
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      });

    } catch (err: any) {
      console.error('Error in Copilot chat:', err);
      const errMsg = 'Error en el asistente. Inténtalo de nuevo.';
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

  if (loadingRole || !isAuthorized) return null;

  return (
    <div className={
      isOpen
        ? "fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 max-sm:!z-[9999]"
        : "fixed bottom-[110px] md:bottom-6 right-0 md:right-6 z-[9999] flex flex-col items-end gap-3 font-sans transition-all duration-300"
    }>
      
      {/* ── PANEL DE COPILOTO (CREMA, ANTRACITA Y DORADO) ── */}
      {isOpen && (
        <div 
          style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
          className="bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-luxury-card shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out relative select-none mr-4 md:mr-0 max-sm:!w-full max-sm:!h-full max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh]"
        >
          {/* Resize Handles (Premium visual indicators and cursors) */}
          <div
            onMouseDown={startResize}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden"
            title="Redimensionar chat"
          >
            <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/40 group-hover/resize:border-primary transition-colors rounded-tl" />
          </div>
          
          <div
            onMouseDown={startResize}
            className="absolute top-0 left-0 bottom-0 w-1.5 cursor-ew-resize z-40 hover:bg-primary/20 transition-all duration-300 max-sm:hidden"
          />
          <div
            onMouseDown={startResize}
            className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-40 hover:bg-primary/20 transition-all duration-300 max-sm:hidden"
          />

          {/* Cabecera Premium (Antracita + Oro) - 2 FILAS */}
          <div className="bg-stone-900 text-white border-b border-stone-800 shrink-0 flex flex-col">
            {/* Fila 1: Título y Cerrar */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center border border-primary/40 shadow-inner">
                  <Sparkles size={18} className="text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold tracking-wide">Co-Piloto AI</h3>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest block leading-none mt-0.5">
                    {language === 'fr' ? 'Navigation Intelligente' : language === 'en' ? 'Smart Navigation' : 'Navegación Inteligente'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all shrink-0 active:scale-95 border border-stone-800"
                title={language === 'fr' ? "Fermer l'assistant" : language === 'en' ? 'Close Assistant' : 'Cerrar Asistente'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Fila 2: Controles Auxiliares más grandes y accesibles */}
            <div className="px-5 py-2.5 bg-stone-950/40 flex items-center justify-between gap-3 text-xs">
              {/* Selector de Género de Voz Premium */}
              <button
                onClick={() => {
                  const next = voiceGender === 'female' ? 'male' : 'female';
                  setVoiceGender(next);
                  toast.success(next === 'male' 
                    ? (language === 'fr' ? 'Voix masculine activée' : language === 'en' ? 'Male voice activated' : 'Voz masculina activada')
                    : (language === 'fr' ? 'Voix féminine activée' : language === 'en' ? 'Female voice activated' : 'Voz femenina activada')
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
                  voiceGender === 'male'
                    ? 'border-primary bg-primary/20 text-primary font-bold shadow-lg shadow-primary/10'
                    : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
                title={language === 'fr' ? 'Changer de voix (Féminin/Masculin)' : language === 'en' ? 'Change voice (Female/Male)' : 'Cambiar voz (Femenina/Masculina)'}
              >
                {voiceGender === 'female' 
                  ? (language === 'fr' ? '👩 Voix Féminine' : language === 'en' ? '👩 Female Voice' : '👩 Voz Femenina')
                  : (language === 'fr' ? '👨 Voix Masculine' : language === 'en' ? '👨 Male Voice' : '👨 Voz Masculina')
                }
              </button>

              <div className="flex items-center gap-2">
                {/* Botón de Silencio */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
                    isMuted 
                      ? 'border-red-500/40 bg-red-500/10 text-red-400' 
                      : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-primary hover:border-stone-700'
                  }`}
                  title={isMuted 
                    ? (language === 'fr' ? 'Activer la voix' : language === 'en' ? 'Unmute Voice' : 'Activar Voz')
                    : (language === 'fr' ? 'Couper la voix' : language === 'en' ? 'Mute Voice' : 'Silenciar Voz')
                  }
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                {/* Botón Reiniciar Chat */}
                <button
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl border border-stone-800 bg-stone-900/50 text-stone-400 hover:text-red-400 hover:border-stone-700 transition-all shrink-0 active:scale-95"
                  title={language === 'fr' ? 'Réinitialiser la conversation' : language === 'en' ? 'Reset Conversation' : 'Reiniciar Conversación'}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Mensajes (Quiet Luxury Crema) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5] hide-scroll select-text">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'model';
              return (
                <div key={index} className={`flex gap-3 max-w-[92%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
                  {isAI ? (
                    <div className="w-10 h-10 rounded-full bg-stone-900 border border-primary/30 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <Bot size={18} className="text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-primary/30 flex items-center justify-center text-stone-900 shrink-0 shadow-sm mt-0.5">
                      <User size={18} className="text-stone-900" />
                    </div>
                  )}
                  
                  <div className={`p-3.5 rounded-luxury-card text-xs leading-relaxed shadow-sm transition-all duration-300 whitespace-pre-wrap ${
                    isAI
                      ? 'bg-white text-stone-800 border border-stone-200/50 rounded-tl-none font-medium'
                      : 'bg-stone-900 text-white rounded-tr-none font-bold'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[92%] self-start animate-pulse">
                <div className="w-10 h-10 rounded-full bg-stone-900 border border-primary/30 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <Bot size={18} className="text-primary" />
                </div>
                <div className="p-3 bg-white border border-stone-200/50 rounded-luxury-card rounded-tl-none text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Vista previa de archivo adjunto seguro */}
          {attachedFile && (
            <div className="px-3.5 py-2 bg-stone-50 border-t border-stone-200/60 flex items-center justify-between gap-2 shrink-0 select-text">
              <div className="flex items-center gap-2 text-stone-700 min-w-0">
                {attachedFile.type === 'image' && attachedFile.url ? (
                  <img src={attachedFile.url} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" alt="Preview" />
                ) : (
                  <FileText size={16} className="text-primary shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-stone-700 truncate max-w-[180px]">
                    {attachedFile.name}
                  </span>
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                    {attachedFile.type === 'image' 
                      ? (language === 'fr' ? 'Image pour service/catégorie' : language === 'en' ? 'Image for service/category' : 'Imagen para servicio/categoría')
                      : (language === 'fr' ? 'Document sécurisé (CSV/TXT/JSON)' : language === 'en' ? 'Secure document (CSV/TXT/JSON)' : 'Documento seguro (CSV/TXT/JSON)')
                    }
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-all shrink-0"
                title={language === 'fr' ? 'Retirer le fichier' : language === 'en' ? 'Remove file' : 'Quitar archivo'}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Formulario de Entrada (Reutiliza el Micro e Input como TEXTAREA para Shift+Enter) - 2 FILAS */}
          <div className="flex flex-col shrink-0">
            {/* Fila 1 (Superior): Controles Multimedia y de Entrada Rápida (Micro y Adjuntar) */}
            <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0">
              {/* Input de archivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.csv,.json,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />

              {/* Botón de Adjuntar Archivo Grande y Elegante */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shrink-0 ${
                  isUploading 
                    ? 'animate-pulse border-primary bg-primary/10 text-primary' 
                    : 'border-stone-200/80 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800'
                }`}
                title={
                  language === 'fr' 
                    ? 'Joindre un fichier sécurisé (CSV, TXT, JSON, Image)' 
                    : language === 'en' 
                      ? 'Attach secure file (CSV, TXT, JSON, Image)' 
                      : 'Adjuntar archivo seguro (CSV, TXT, JSON, Imagen)'
                }
              >
                <Paperclip size={15} />
                <span>
                  {isUploading 
                    ? (language === 'fr' ? 'Téléchargement...' : language === 'en' ? 'Uploading...' : 'Subiendo...')
                    : (language === 'fr' ? 'Joindre un fichier' : language === 'en' ? 'Attach File' : 'Adjuntar Archivo')
                  }
                </span>
              </button>

              {/* Botón de Voz Nativo */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Préférez-vous parler ?' : language === 'en' ? 'Prefer to speak?' : '¿Prefieres hablar?'}
                </span>
                <VoiceRecorderButton
                  onVoiceTranscribed={(txt) => handleSend(language === 'fr' ? `🎙️ [Voix]: "${txt}"` : language === 'en' ? `🎙️ [Voice]: "${txt}"` : `🎙️ [Voz]: "${txt}"`)}
                  disabled={isLoading || isUploading}
                  lang={audioLanguage}
                  onStartClick={unlockAudioContext}
                />
              </div>
            </div>

            {/* Fila 2 (Inferior): Entrada de Texto Principal y Enviar */}
            <div className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2.5 shrink-0 select-text">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isUploading}
                rows={2}
                placeholder={language === 'fr' ? 'Écrire un message...' : language === 'en' ? 'Type a message...' : 'Escribe tu mensaje...'}
                className="flex-1 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-all font-medium resize-none min-h-[48px] max-h-32 overflow-y-auto leading-relaxed"
              />
              
              {/* Botón Enviar */}
              <button
                onClick={() => handleSend()}
                disabled={isLoading || isUploading || (!input.trim() && !attachedFile)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 text-white transition-all duration-300 border border-stone-800 shadow-md shrink-0 active:scale-95 ${
                  isLoading || isUploading || (!input.trim() && !attachedFile) 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:bg-primary hover:text-stone-900 hover:border-primary'
                }`}
                title={language === 'fr' ? 'Envoyer le message' : language === 'en' ? 'Send Message' : 'Enviar Mensaje'}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BURBUJA FLOTANTE FIJA ── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            unlockAudioContext();
          }}
          className="h-14 w-14 rounded-full bg-stone-900 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-primary/40 z-10 group overflow-hidden hover:bg-stone-800 max-md:translate-x-[35%] max-md:hover:translate-x-0 max-md:rounded-l-2xl max-md:rounded-r-none"
          title="Copiloto de Navegación IA"
        >
          {/* Efecto de Brillo Circular en hover */}
          <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkles size={22} className="text-primary animate-pulse" strokeWidth={1.8} />
        </button>
      )}

    </div>
  );
}
