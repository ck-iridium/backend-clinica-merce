'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useCopilotSpeech } from '../useCopilotSpeech';
import { ConciergeOptionItem, ConciergeMessage, ConciergeChip } from './types';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useConciergeChat() {
  const router = useRouter();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [remainingMessages, setRemainingMessages] = useState<number>(8);
  const [isListening, setIsListening] = useState(false);
  const [multiSelections, setMultiSelections] = useState<Record<number, Record<string, string>>>({});

  // 1. Sesión Efímera Anónima (Anti-Abuso)
  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('probookia_concierge_session');
      if (!sid) {
        sid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        sessionStorage.setItem('probookia_concierge_session', sid);
      }
      setSessionId(sid);
    }
  }, []);

  // 2. Historial de Mensajes y Mensaje de Bienvenida Quiet Luxury
  const welcomeText = language === 'fr'
    ? 'Bonjour et bienvenue. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd’hui ? Vous pouvez me poser des questions sur nos soins ou demander nos créneaux disponibles.'
    : language === 'en'
      ? 'Hello and welcome. I am your virtual assistant. How may I assist you today? You can ask me about our treatments or inquire about available appointment slots.'
      : 'Hola, te damos la bienvenida. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedes consultarme sobre cualquier tratamiento o pedirme disponibilidad de citas.';

  const [messages, setMessages] = useState<ConciergeMessage[]>([
    { role: 'model', content: welcomeText }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 3. Voz TTS y Reconocimiento de Voz
  const audioLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';
  const { speakText, stopSpeaking, unlockAudioContext, isSpeaking } = useCopilotSpeech({
    isMuted,
    voiceGender,
    audioLanguage
  });

  // 4. Auto-scroll suave
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 5. Reconocimiento de Voz del Navegador (Web Speech API)
  const recognitionRef = useRef<any>(null);

  const toggleVoiceRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Tu navegador no soporta entrada de voz directa.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();
    unlockAudioContext();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = audioLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Error iniciando reconocimiento de voz:', e);
      setIsListening(false);
    }
  }, [audioLanguage, isListening, stopSpeaking, unlockAudioContext]);

  // 6. Enviar Mensaje al Backend de Concierge
  const handleSend = async (textToSend?: string) => {
    stopSpeaking();
    unlockAudioContext();

    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    setInput('');
    const updatedMessages: ConciergeMessage[] = [...messages, { role: 'user', content: queryText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const tenantId = getCookie('tenant_id') || '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (tenantId) headers['X-Tenant-ID'] = tenantId;

      const response = await fetch(`${API_URL}/api/public/ai/concierge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: queryText,
          history: updatedMessages.slice(1).map((m) => ({ role: m.role, content: m.content })),
          session_id: sessionId,
          voice_gender: voiceGender,
          language: language || 'es',
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el asistente.');
      }

      const data = await response.json();
      const replyText = data.response || 'Disculpa, no pude procesar la consulta en este instante.';
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: replyText,
          action: data.action || undefined,
        },
      ]);

      if (typeof data.remaining_messages === 'number') {
        setRemainingMessages(data.remaining_messages);
      }

      // Sintetizar voz si no está silenciado
      speakText(replyText, data.audio_response_base64);

    } catch (err: any) {
      console.error('Error en Concierge Widget:', err);
      const errMsg = 'En este momento estoy actualizando la información de citas. Puedes consultar nuestro catálogo y reservar directamente tu cita con el botón de reserva.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: errMsg,
          action: { type: 'booking', url: '/reservar' },
        },
      ]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (opt: ConciergeOptionItem) => {
    const rawVal = (opt.action_value || opt.title || '').trim();
    if (!rawVal) return;

    // 1. Enlace telefónico directo
    if (rawVal.startsWith('tel:')) {
      window.location.href = rawVal;
      return;
    }

    // 2. Enlace externo (WhatsApp, web externa, etc.)
    if (rawVal.startsWith('http://') || rawVal.startsWith('https://')) {
      window.open(rawVal, '_blank', 'noopener,noreferrer');
      return;
    }

    // 3. Ruta interna (/tratamientos/..., /reservar, etc.)
    if (rawVal.startsWith('/')) {
      setIsOpen(false);
      stopSpeaking();
      router.push(rawVal);
      return;
    }

    // 4. Si es servicio sin ruta previa o texto conversacional, enviar al chat
    handleSend(rawVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    setMultiSelections({});
    setMessages([{ role: 'model', content: welcomeText }]);
  };

  const handleToggleVoiceGender = () => {
    const next = voiceGender === 'female' ? 'male' : 'female';
    setVoiceGender(next);
    toast.success(next === 'male' ? 'Voz masculina activada' : 'Voz femenina activada');
  };

  const chips: ConciergeChip[] = [
    { label: 'Tratamientos más populares', query: '¿Cuáles son los tratamientos más solicitados y recomendados?' },
    { label: 'Consultar huecos libres', query: '¿Qué disponibilidad de citas tenéis para esta semana?' },
    { label: 'Ubicación y horarios', query: '¿Dónde estáis ubicados y en qué horario abrís?' },
    { label: 'Precios y tarifas', query: '¿Me puedes detallar vuestros precios y servicios principales?' },
  ];

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isMuted,
    setIsMuted,
    voiceGender,
    remainingMessages,
    isListening,
    multiSelections,
    setMultiSelections,
    messages,
    messagesEndRef,
    language,
    isSpeaking,
    speakText,
    stopSpeaking,
    unlockAudioContext,
    toggleVoiceRecording,
    handleSend,
    handleOptionClick,
    handleKeyDown,
    handleClearHistory,
    handleToggleVoiceGender,
    chips,
  };
}
