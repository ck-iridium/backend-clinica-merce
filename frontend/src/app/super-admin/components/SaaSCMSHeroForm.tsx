"use client";

import React, { useState, useRef } from 'react';
import { 
  ChevronRight, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Plus, 
  UploadCloud, 
  Eye, 
  CheckCircle2,
  Layers,
  FolderOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface HeroTabItem {
  id: string;
  label: string;
  image_url: string;
}

interface SaaSCMSHeroFormProps {
  heroTitle: string;
  heroSubtitle: string;
  heroTabs: HeroTabItem[];
  activeTabId?: string;
  onChangeTitle: (val: string) => void;
  onChangeSubtitle: (val: string) => void;
  onAddTab: () => void;
  onUpdateTabLabel: (id: string, label: string) => void;
  onUpdateTabImage: (id: string, imageUrl: string) => void;
  onDeleteTab: (id: string) => void;
  onSelectImageFromGallery: (tabId: string) => void;
  onSetActiveTab: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  token?: string;
}

export default function SaaSCMSHeroForm({
  heroTitle,
  heroSubtitle,
  heroTabs,
  activeTabId,
  onChangeTitle,
  onChangeSubtitle,
  onAddTab,
  onUpdateTabLabel,
  onUpdateTabImage,
  onDeleteTab,
  onSelectImageFromGallery,
  onSetActiveTab,
  onSubmit,
  saving,
  token
}: SaaSCMSHeroFormProps) {
  const [uploadingTabId, setUploadingTabId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleFileUpload = async (tabId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen (PNG, JPG, WebP o SVG)');
      return;
    }

    setUploadingTabId(tabId);
    const toastId = toast.loading('Subiendo captura 16:9...');

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!res.ok) throw new Error('Error al subir el archivo');

      const data = await res.json();
      onUpdateTabImage(tabId, data.url);
      onSetActiveTab(tabId);
      toast.success('Captura 16:9 subida y actualizada con éxito', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Error al subir la imagen. Inténtalo de nuevo.', { id: toastId });
    } finally {
      setUploadingTabId(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 1. TÍTULO PRINCIPAL */}
      <div>
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">
          Título Principal (Hero Title)
        </label>
        <Input
          type="text"
          required
          value={heroTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="h-11 font-serif text-sm font-semibold"
          placeholder="Ej. El único software que tu clínica volverá a necesitar."
        />
      </div>

      {/* 2. SUBTÍTULO DESCRIPTIVO */}
      <div>
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">
          Subtítulo Descriptivo (Hero Subtitle)
        </label>
        <textarea
          required
          rows={3}
          value={heroSubtitle}
          onChange={(e) => onChangeSubtitle(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white/90 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed shadow-xs transition-all focus-visible:outline-none focus-visible:border-[#D4AF37] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/25"
          placeholder="Probookia unifica tu agenda, cobros, fichas médicas y marketing en una sola pantalla..."
        />
      </div>

      {/* 3. PESTAÑAS INTERACTIVAS (FORMATO 16:9) */}
      <div className="space-y-3.5 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-[11px] font-bold text-stone-850 uppercase tracking-wider">
              Pestañas Interactivas (Formato 16:9)
            </label>
            <span className="text-[10px] text-stone-400 font-medium">
              Array dinámico de funcionalidades estilo Pabau
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTab}
            className="h-8 text-xs font-semibold gap-1.5 border-[#D4AF37]/40 text-stone-800 hover:bg-[#FAF9F6] hover:border-[#D4AF37]"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Añadir Pestaña</span>
          </Button>
        </div>

        {heroTabs.length === 0 ? (
          <div className="p-6 bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-center space-y-2">
            <Layers className="w-6 h-6 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500 font-medium">No hay pestañas configuradas.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddTab}
              className="text-xs"
            >
              Crear primera pestaña
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {heroTabs.map((tab, idx) => {
              const isActive = activeTabId === tab.id;
              const isUploading = uploadingTabId === tab.id;
              const fileInputRef = React.createRef<HTMLInputElement>();

              return (
                <div
                  key={tab.id || idx}
                  className={`relative bg-white/95 border rounded-2xl p-4 space-y-3.5 transition-all duration-200 shadow-2xs ${
                    isActive
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/15'
                      : 'border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={() => onSetActiveTab(tab.id)}
                      className="flex items-center gap-2 text-left group"
                      title="Haz clic para previsualizar esta pestaña en la derecha"
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-800 group-hover:text-[#D4AF37] transition-colors">
                        Pestaña {idx + 1}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#D4AF37] bg-[#fcf8e5] px-2 py-0.5 rounded-full">
                          <Eye className="w-2.5 h-2.5" /> En Vista Previa
                        </span>
                      )}
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTab(tab.id)}
                      disabled={heroTabs.length <= 1}
                      className="h-7 w-7 p-0 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title={heroTabs.length <= 1 ? 'Debe haber al menos una pestaña' : 'Eliminar pestaña'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Campo 1: Nombre de la Etiqueta */}
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Nombre de la Etiqueta
                    </label>
                    <Input
                      type="text"
                      required
                      value={tab.label}
                      onChange={(e) => {
                        onUpdateTabLabel(tab.id, e.target.value);
                        onSetActiveTab(tab.id);
                      }}
                      className="h-9 text-xs font-medium"
                      placeholder="Ej: Agenda & Reservas, Fichas Clínicas LOPD..."
                    />
                  </div>

                  {/* Campo 2: Uploader de Imagen 16:9 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                        Captura de Pantalla (Formato 16:9)
                      </label>
                      <span className="text-[9px] font-mono text-stone-400">16:9 Aspect Ratio</span>
                    </div>

                    {tab.image_url ? (
                      /* Preview con acciones de cambio */
                      <div className="relative group/img w-full aspect-video rounded-xl overflow-hidden border border-stone-200/80 bg-stone-50 shadow-2xs">
                        <img
                          src={tab.image_url}
                          alt={tab.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-xs bg-white text-stone-900 hover:bg-stone-100 gap-1"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Subir Otra</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectImageFromGallery(tab.id)}
                            className="h-8 text-xs bg-white/90 border-white text-stone-900 hover:bg-white gap-1"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Galería</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateTabImage(tab.id, '')}
                            className="h-8 w-8 p-0 bg-rose-600/90 text-white hover:bg-rose-700"
                            title="Quitar imagen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Dropzone para subir imagen */
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileUpload(tab.id, file);
                        }}
                        className={`relative w-full aspect-video rounded-xl border border-dashed border-stone-300 bg-stone-50/70 hover:bg-[#FAF9F6] hover:border-[#D4AF37]/60 flex flex-col items-center justify-center p-4 text-center transition-all ${
                          isUploading ? 'opacity-70 pointer-events-none' : ''
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                            <span className="text-[11px] font-semibold text-stone-600">Subiendo captura...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-400 mb-2">
                              <ImageIcon className="w-5 h-5 text-stone-300" />
                            </div>
                            <p className="text-[11px] font-bold text-stone-700 mb-0.5">
                              Arrastra aquí tu captura 16:9
                            </p>
                            <p className="text-[9px] text-stone-400 mb-2.5">
                              PNG, JPG, WebP (Recomendado 1920x1080 o similar)
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-7 text-[10px] font-bold px-2.5"
                              >
                                Seleccionar Archivo
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onSelectImageFromGallery(tab.id)}
                                className="h-7 text-[10px] font-bold px-2 text-[#b89528] hover:bg-[#fcf8e5]"
                              >
                                Abrir Galería
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Hidden input for file selection */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(tab.id, file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. BOTÓN SUBMIT */}
      <div className="pt-3">
        <Button
          type="submit"
          variant="luxury"
          size="lg"
          disabled={saving}
          className="w-full text-xs font-semibold gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando y publicando Hero...</span>
            </>
          ) : (
            <>
              <span>Guardar y Publicar Hero</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
