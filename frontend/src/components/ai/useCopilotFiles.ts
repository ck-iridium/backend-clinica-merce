'use client';

import { useState, useRef } from 'react';
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

export function useCopilotFiles({ language, planType, hasOwnKey }: UseCopilotFilesOptions) {
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        toast.success(
          language === 'fr'
            ? 'Image téléchargée et jointe avec succès.'
            : language === 'en'
              ? 'Image uploaded and attached successfully.'
              : 'Imagen subida y adjuntada correctamente.'
        );
      } catch (err) {
        console.error(err);
        toast.error(
          language === 'fr'
            ? 'Échec du téléchargement de l\'image.'
            : language === 'en'
              ? 'Failed to upload image.'
              : 'Fallo al subir la imagen.'
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

    // Limpiar el input para permitir re-selección del mismo archivo
    if (e.target) e.target.value = '';
  };

  const canAttachFiles = planType === 'gold' || planType === 'pro' || hasOwnKey;

  return {
    attachedFile,
    setAttachedFile,
    isUploading,
    fileInputRef,
    handleFileChange,
    canAttachFiles,
  };
}
