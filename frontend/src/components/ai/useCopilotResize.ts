'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const DEFAULT_WIDTH = 460;
const DEFAULT_HEIGHT = 630;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 440;

export function useCopilotResize() {
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  const [isResizingActive, setIsResizingActive] = useState(false);
  
  const isResizing = useRef(false);
  const currentDimensions = useRef({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  // 1. Cargar preferencias guardadas en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWidth = localStorage.getItem('probookia_copilot_width');
        const savedHeight = localStorage.getItem('probookia_copilot_height');
        if (savedWidth) {
          const w = Number(savedWidth);
          if (w >= MIN_WIDTH) {
            setChatWidth(Math.max(MIN_WIDTH, w));
            currentDimensions.current.width = Math.max(MIN_WIDTH, w);
          } else {
            setChatWidth(DEFAULT_WIDTH);
            currentDimensions.current.width = DEFAULT_WIDTH;
          }
        }
        if (savedHeight) {
          const h = Number(savedHeight);
          if (h >= MIN_HEIGHT) {
            setChatHeight(Math.max(MIN_HEIGHT, h));
            currentDimensions.current.height = Math.max(MIN_HEIGHT, h);
          } else {
            setChatHeight(DEFAULT_HEIGHT);
            currentDimensions.current.height = DEFAULT_HEIGHT;
          }
        }
      } catch (e) {
        console.warn('useCopilotResize: No se pudo leer dimensiones guardadas:', e);
      }
    }
  }, []);

  useEffect(() => {
    currentDimensions.current = { width: chatWidth, height: chatHeight };
  }, [chatWidth, chatHeight]);

  // 2. Manejador suave de arrastre a 60fps
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const paddingRight = 24;
    const paddingBottom = 24;
    const newWidth = Math.max(MIN_WIDTH, Math.min(window.innerWidth - 32, window.innerWidth - e.clientX - paddingRight));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(window.innerHeight - 32, window.innerHeight - e.clientY - paddingBottom));
    
    currentDimensions.current = { width: newWidth, height: newHeight };
    setChatWidth(newWidth);
    setChatHeight(newHeight);
  }, []);

  // 3. Detener arrastre y persistir en localStorage únicamente al soltar
  const stopResize = useCallback(() => {
    if (!isResizing.current) return;
    isResizing.current = false;
    setIsResizingActive(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    try {
      localStorage.setItem('probookia_copilot_width', String(currentDimensions.current.width));
      localStorage.setItem('probookia_copilot_height', String(currentDimensions.current.height));
    } catch (_) {}
  }, [handleResize]);

  // 4. Iniciar arrastre
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    setIsResizingActive(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  }, [handleResize, stopResize]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [handleResize, stopResize]);

  return {
    chatWidth,
    chatHeight,
    setChatWidth,
    setChatHeight,
    isResizingActive,
    startResize,
    handleResize,
    stopResize
  };
}
