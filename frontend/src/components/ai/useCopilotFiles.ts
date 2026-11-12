'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface AttachedFile {
  name: string;
  content: string;
  type: 'text' | 'image';
  url?: string;
}

interface UseCopilotFilesOptions {
  language: string;
  planType: string | null;
  hasOwnKey: boolean;
}

// Helper para leer cookies del lado del cliente
function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useCopilotFiles({ language, planType, hasOwnKey }: UseCopilotFilesOptions) {
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAttachFiles = planType === 'gold' || planType === 'pro' || hasOwnKey;

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    if (!canAttachFiles) {
      toast.error(
        language === 'fr'
          ? 'Le téléchargement de documents nécessite un plan Pro ou Gold.'
          : language === 'en'
            ? 'Uploading files requires a Pro or Gold plan.'
            : 'Subir archivos requiere una suscripción Pro o Gold.'
      );
      return;
    }

    // Límite de seguridad: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        language === 'fr'
          ? 'Le fichier dépasse la limite de sécurité de 5 Mo.'
          : language === 'en'
            ? 'File exceeds the 5MB security limit.'
            : 'El archivo supera el límite de seguridad de 5MB.'
      );
      return;
    }

    const fileType = file.type || '';
    const isImage = fileType.startsWith('image/');

    if (isImage) {
      setIsUploading(true);
      try {
        let fileName = file.name || 'captura.png';
        if (!fileName || fileName === 'image.png' || fileName === 'blob') {
          const ext = fileType.split('/')[1] || 'png';
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
          fileName = `captura_${timeStr}.${ext}`;
        }

        const fileToUpload = new File([file], fileName, { type: fileType || 'image/png' });
        const formData = new FormData();
        formData.append('file', fileToUpload);

        // Identificador de inquilino y token de autorización para soporte multi-tenant
        let tenantId = getClientCookie('tenant_id') || getClientCookie('impersonate_tenant_id') || '';
        let authToken = '';
        if (typeof window !== 'undefined') {
          try {
            const userSession = localStorage.getItem('user');
            if (userSession) {
              const parsed = JSON.parse(userSession);
              if (!tenantId) tenantId = parsed.tenant_id || '';
              authToken = parsed.access_token || parsed.token || '';
            }
          } catch {}
        }

        const headers: Record<string, string> = {};
        if (tenantId) headers['X-Tenant-ID'] = tenantId;
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload/`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || errData.error || 'Error al subir la imagen.');
        }

        const data = await res.json();
        setAttachedFile({
          name: fileName,
          content: data.url,
          type: 'image',
          url: data.url,
        });
        toast.success(
          language === 'fr'
            ? 'Image / capture d\'écran jointe avec succès.'
            : language === 'en'
              ? 'Screenshot / image attached successfully.'
              : 'Captura de pantalla adjuntada al chat correctamente.'
        );
      } catch (err: any) {
        console.error('[useCopilotFiles Error]:', err);
        toast.error(
          err.message ||
          (language === 'fr'
            ? 'Échec du téléchargement de l\'image.'
            : language === 'en'
              ? 'Failed to upload image.'
              : 'Fallo al subir la imagen.')
        );
      } finally {
        setIsUploading(false);
      }
    } else {
      // Archivos de texto: CSV, JSON, TXT
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setAttachedFile({
          name: file.name,
          content: text,
          type: 'text',
        });
        toast.success(`"${file.name}" adjuntado.`);
      };
      reader.onerror = () => {
        toast.error(
          language === 'fr'
            ? 'Erreur lors de la lecture du fichier.'
            : language === 'en'
              ? 'Error reading file.'
              : 'Error al leer el archivo.'
        );
      };
      reader.readAsText(file);
    }
  }, [canAttachFiles, language]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    // Limpiar el input para permitir re-selección del mismo archivo
    if (e.target) e.target.value = '';
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = (e as React.ClipboardEvent).clipboardData || (window as any).clipboardData;
    if (!clipboardData) return false;

    // 1. Revisar si hay elementos en items (capturas de pantalla con Print Screen o Recortes)
    const items = clipboardData.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const ext = item.type.split('/')[1] || 'png';
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const imageFile = new File([blob], `captura_${timeStr}.${ext}`, { type: item.type });
            await processFile(imageFile);
            return true;
          }
        }
      }
    }

    // 2. Fallback comprobando clipboardData.files
    const files = clipboardData.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          await processFile(file);
          return true;
        }
      }
    }

    return false;
  }, [processFile]);

  return {
    attachedFile,
    setAttachedFile,
    isUploading,
    fileInputRef,
    handleFileChange,
    handlePaste,
    processFile,
    canAttachFiles,
  };
}
