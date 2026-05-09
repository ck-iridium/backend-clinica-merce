"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AIImageContextType {
  isGenerating: boolean;
  generationTime: number;
  resultUrl: string | null;
  error: string | null;
  startGeneration: (params: any) => Promise<void>;
  resetGeneration: () => void;
  targetServiceId: string | null;
  setTargetServiceId: (id: string | null) => void;
  onFinish: ((url: string) => void) | null;
  setOnFinish: (fn: ((url: string) => void) | null) => void;
  retry: () => Promise<void>;
  cancelGeneration: () => void;
}

const AIImageContext = createContext<AIImageContextType | undefined>(undefined);

export function AIImageProvider({ children }: { children: React.ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetServiceId, setTargetServiceId] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<any>(null);
  
  // Controller para abortar peticiones
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Usar Ref para evitar cierres obsoletos (stale closures) con funciones de estado
  const onFinishRef = React.useRef<((url: string) => void) | null>(null);

  const setOnFinish = useCallback((fn: ((url: string) => void) | null) => {
    console.log("AIImageContext: Registrando callback onFinish");
    onFinishRef.current = fn;
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationTime(0);
      interval = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setResultUrl(null);
    setError(null);
    setGenerationTime(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setError("Generación cancelada por el usuario.");
    setIsGenerating(false);
    toast.info("Generación cancelada.");
  }, []);

  const startGeneration = async (params: any) => {
    setIsGenerating(true);
    setResultUrl(null);
    setError(null);
    setLastParams(params);

    // Configurar AbortController y Timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timeout automático a los 90 segundos
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current === controller) {
        controller.abort();
        setError("Tiempo de espera agotado (90s). La IA está tardando demasiado.");
        setIsGenerating(false);
        toast.error("Tiempo de espera agotado.");
      }
    }, 90000);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al generar la imagen");
      }

      const data = await res.json();
      setResultUrl(data.url);
      
      if (onFinishRef.current) {
        console.log("AIImageContext: Ejecutando callback onFinish con URL:", data.url);
        onFinishRef.current(data.url);
      } else {
        console.warn("AIImageContext: No hay callback onFinish registrado!");
      }
      
      toast.success('✨ Imagen generada con éxito');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Petición abortada");
      } else {
        setError(err.message || 'Error de conexión');
        toast.error(err.message || 'Error al generar la imagen');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const retry = async () => {
    if (lastParams) {
      console.log("AIImageContext: Reintentando generación con últimos parámetros");
      await startGeneration(lastParams);
    }
  };

  // Block page leave if generating
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  return (
    <AIImageContext.Provider value={{
      isGenerating,
      generationTime,
      resultUrl,
      error,
      startGeneration,
      resetGeneration,
      targetServiceId,
      setTargetServiceId,
      onFinish: onFinishRef.current,
      setOnFinish,
      retry,
      cancelGeneration
    }}>
      {children}
    </AIImageContext.Provider>
  );
}

export function useAIImage() {
  const context = useContext(AIImageContext);
  if (context === undefined) {
    throw new Error('useAIImage must be used within an AIImageProvider');
  }
  return context;
}
