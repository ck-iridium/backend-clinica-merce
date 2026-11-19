"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { SectionBlock } from '../types';

interface UseBuilderPersistenceProps {
  api: string;
}

export function useBuilderPersistence({ api }: UseBuilderPersistenceProps) {
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Bloqueo de salida involuntaria si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || saving) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  // Persistencia con debounce por sección (800ms)
  const saveSectionToBackend = useCallback((section: SectionBlock) => {
    const sectionId = section.id;
    if (saveTimeoutRef.current[sectionId]) {
      clearTimeout(saveTimeoutRef.current[sectionId]);
    }
    setHasUnsavedChanges(true);
    setSaving(true);
    saveTimeoutRef.current[sectionId] = setTimeout(async () => {
      try {
        const res = await fetch(`${api}/cms/blocks/${sectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block_type: 'section', content_data: section.content_data }),
        });
        if (!res.ok) throw new Error();
        const now = new Date();
        setLastSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setHasUnsavedChanges(false);
      } catch {
        toast.error('Error al sincronizar sección con Supabase');
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [api]);

  // Guardado manual de todo el estado (botón "Guardar")
  const handleSaveAll = useCallback(async (sections: SectionBlock[]) => {
    setSaving(true);
    try {
      await Promise.all(
        sections.map(sec =>
          fetch(`${api}/cms/blocks/${sec.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block_type: 'section', content_data: sec.content_data }),
          })
        )
      );
      const now = new Date();
      setLastSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setHasUnsavedChanges(false);
      toast.success('¡Página guardada correctamente!');
    } catch {
      toast.error('Error al guardar la página');
    } finally {
      setSaving(false);
    }
  }, [api]);

  return {
    saving,
    setSaving,
    lastSavedAt,
    setLastSavedAt,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveTimeoutRef,
    saveSectionToBackend,
    handleSaveAll,
  };
}
