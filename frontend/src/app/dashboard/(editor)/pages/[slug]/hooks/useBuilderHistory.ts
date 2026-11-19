"use client";

import { useState, useEffect, useCallback, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import type { SectionBlock } from '../types';

interface UseBuilderHistoryProps {
  sectionsRef: MutableRefObject<SectionBlock[]>;
  setSections: Dispatch<SetStateAction<SectionBlock[]>>;
  saveTimeoutRef: MutableRefObject<Record<string, NodeJS.Timeout>>;
  slug: string | string[];
  api: string;
}

export function useBuilderHistory({
  sectionsRef,
  setSections,
  saveTimeoutRef,
  slug,
  api,
}: UseBuilderHistoryProps) {
  const [history, setHistory] = useState<SectionBlock[][]>([]);

  const recordHistory = useCallback(() => {
    const snapshot = JSON.parse(JSON.stringify(sectionsRef.current));
    setHistory(prev => {
      const next = [...prev, snapshot];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
  }, [sectionsRef]);

  const handleUndo = useCallback(async () => {
    if (history.length === 0) return;

    // 1. Cancelar cualquier guardado pendiente en cola de debounce
    Object.keys(saveTimeoutRef.current).forEach(key => {
      if (saveTimeoutRef.current[key]) {
        clearTimeout(saveTimeoutRef.current[key]);
        delete saveTimeoutRef.current[key];
      }
    });

    // 2. Extraer el estado anterior
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));

    const currentSections = sectionsRef.current;
    const currentIds = currentSections.map(s => s.id);
    const prevIds = previous.map(s => s.id);
    const toDeleteIds = currentIds.filter(id => !prevIds.includes(id));

    // 3. Restaurar estado de inmediato en UI y ref
    setSections(previous);
    sectionsRef.current = previous;
    toast.info('Acción deshecha (Ctrl + Z)');

    // 4. Sincronizar inmediatamente en base de datos
    try {
      await Promise.all([
        ...toDeleteIds.map(id => fetch(`${api}/cms/blocks/${id}`, { method: 'DELETE' })),
        ...previous.map(sec => {
          if (!currentIds.includes(sec.id)) {
            return fetch(`${api}/cms/blocks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                page_slug: slug,
                block_type: 'section',
                content_data: sec.content_data,
                order_index: sec.order_index,
              }),
            });
          }
          return fetch(`${api}/cms/blocks/${sec.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block_type: 'section', content_data: sec.content_data }),
          });
        }),
      ]);
    } catch {
      toast.error('Error al sincronizar estado deshecho');
    }
  }, [history, sectionsRef, setSections, saveTimeoutRef, api, slug]);

  // Atajo de teclado global Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  return {
    history,
    setHistory,
    canUndo: history.length > 0,
    recordHistory,
    handleUndo,
  };
}
