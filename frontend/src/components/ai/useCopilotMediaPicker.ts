'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AttachedFile } from './useCopilotFiles';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface UseCopilotMediaPickerOptions {
  language: string;
  setAttachedFile: (file: AttachedFile | null) => void;
}

export function useCopilotMediaPicker({ language, setAttachedFile }: UseCopilotMediaPickerOptions) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const getTenantId = () => getCookie('tenant_id') || undefined;

  const getAuthToken = () => {
    const userSession = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        return parsed.access_token || parsed.token || undefined;
      } catch (_) {}
    }
    return undefined;
  };

  const handleMediaSelected = async (url: string) => {
    setShowMediaPicker(false);
    const filename = decodeURIComponent(url.split('/').pop() || 'archivo');
    const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(filename);
    const isCsvOrText = /\.(csv|txt|json)$/i.test(filename);

    if (isImage) {
      setAttachedFile({
        name: filename,
        content: url,
        type: 'image',
        url: url,
      });
      toast.success(
        language === 'fr'
          ? 'Image jointe depuis la galerie.'
          : language === 'en'
          ? 'Image attached from gallery.'
          : `Imagen "${filename}" adjuntada desde la galería.`
      );
    } else {
      try {
        let tId = getTenantId() || '';
        let authToken = getAuthToken() || '';
        const userSession = localStorage.getItem('user');
        if (userSession && !tId) {
          try {
            const parsed = JSON.parse(userSession);
            tId = parsed.tenant_id || '';
          } catch (e) {
            console.error(e);
          }
        }

        const headers: Record<string, string> = {};
        if (tId) headers['X-Tenant-ID'] = tId;
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/media/download/${encodeURIComponent(filename)}`;
        const res = await fetch(downloadUrl, { headers });
        if (!res.ok) throw new Error('Error al descargar el archivo.');

        const blob = await res.blob();
        if (blob.size > 150 * 1024) {
          toast.error(
            language === 'fr'
              ? "Le fichier est trop volumineux pour l'assistant (max 150 Ko)."
              : language === 'en'
              ? 'File is too large for the assistant to process (max 150 KB).'
              : `El archivo "${filename}" es demasiado grande para procesar (máximo 150 KB).`
          );
          return;
        }

        if (isCsvOrText) {
          const text = await blob.text();
          setAttachedFile({
            name: filename,
            content: text,
            type: 'text',
          });
          toast.success(
            language === 'fr'
              ? 'Document joint avec succès.'
              : language === 'en'
              ? 'Document attached successfully.'
              : `Documento "${filename}" adjuntado y cargado en el chat.`
          );
        } else {
          setAttachedFile({
            name: filename,
            content: `[Enlace seguro al documento: ${downloadUrl}]`,
            type: 'text',
          });
          toast.success(
            language === 'fr'
              ? 'Lien du document joint.'
              : language === 'en'
              ? 'Document link attached.'
              : `Enlace de "${filename}" adjuntado para el asistente.`
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('No se pudo adjuntar el documento debido a un error de lectura.');
      }
    }
  };

  return {
    showMediaPicker,
    setShowMediaPicker,
    handleMediaSelected,
    tenantId: getTenantId(),
    authToken: getAuthToken(),
  };
}
