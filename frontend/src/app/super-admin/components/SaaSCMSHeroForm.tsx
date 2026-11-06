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
  FolderOpen,
  Monitor,
  Smartphone
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface HeroTabItem {
  id: string;
  label: string;
  image_url: string;
  mobile_image_url?: string;
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
  onUpdateTabMobileImage: (id: string, mobileImageUrl: string) => void;
  onDeleteTab: (id: string) => void;
  onSelectImageFromGallery: (tabId: string, isMobile?: boolean) => void;
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
  onUpdateTabMobileImage,
  onDeleteTab,
  onSelectImageFromGallery,
  onSetActiveTab,
  onSubmit,
  saving,
  token
}: SaaSCMSHeroFormProps) {
  const [uploadingState, setUploadingState] = useState<{ id: string; isMobile: boolean } | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleFileUpload = async (tabId: string, file: File, isMobile: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen (PNG, JPG, WebP o SVG)');
      return;
    }

    setUploadingState({ id: tabId, isMobile });
    const toastId = toast.loading(isMobile ? 'Subiendo captura móvil...' : 'Subiendo captura escritorio 16:9...');

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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al subir el archivo');
      }

      const data = await res.json();
      if (isMobile) {
        onUpdateTabMobileImage(tabId, data.url);
        toast.success('Captura móvil actualizada con éxito', { id: toastId });
      } else {
        onUpdateTabImage(tabId, data.url);
        toast.success('Captura 16:9 actualizada con éxito', { id: toastId });
      }
      onSetActiveTab(tabId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al subir la imagen. Inténtalo de nuevo.', { id: toastId });
    } finally {
      setUploadingState(null);
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
              const isUploadingDesktop = uploadingState?.id === tab.id && !uploadingState.isMobile;
              const isUploadingMobile = uploadingState?.id === tab.id && uploadingState.isMobile;
              const inputIdDesktop = `hero-tab-file-${tab.id || idx}-desktop`;
              const inputIdMobile = `hero-tab-file-${tab.id || idx}-mobile`;

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

                  {/* Grid de 2 Columnas para Captura Escritorio y Captura Móvil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    
                    {/* A. CAPTURA ESCRITORIO (16:9) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-stone-500" />
                          <span>Escritorio (16:9)</span>
                        </label>
                        <span className="text-[8.5px] font-mono text-stone-400">16:9</span>
                      </div>

                      {tab.image_url ? (
                        <div className="relative group/img w-full aspect-video rounded-xl overflow-hidden border border-stone-200/80 bg-stone-50 shadow-2xs">
                          <img
                            src={tab.image_url}
                            alt={`${tab.label} escritorio`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => document.getElementById(inputIdDesktop)?.click()}
                              className="h-7 text-[10px] bg-white text-stone-900 hover:bg-stone-100 gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Cambiar</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectImageFromGallery(tab.id, false)}
                              className="h-7 text-[10px] bg-white/90 border-white text-stone-900 hover:bg-white gap-1 cursor-pointer"
                            >
                              <FolderOpen className="w-3 h-3" />
                              <span>Galería</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateTabImage(tab.id, '')}
                              className="h-7 w-7 p-0 bg-rose-600/90 text-white hover:bg-rose-700"
                              title="Quitar imagen escritorio"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileUpload(tab.id, file, false);
                          }}
                          className={`relative w-full aspect-video rounded-xl border border-dashed border-stone-300 bg-stone-50/70 hover:bg-[#FAF9F6] hover:border-[#D4AF37]/60 flex flex-col items-center justify-center p-3 text-center transition-all ${
                            isUploadingDesktop ? 'opacity-70 pointer-events-none' : ''
                          }`}
                        >
                          {isUploadingDesktop ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                              <span className="text-[10px] font-semibold text-stone-600">Subiendo 16:9...</span>
                            </div>
                          ) : (
                            <>
                              <Monitor className="w-4 h-4 text-stone-400 mb-1" />
                              <p className="text-[10px] font-bold text-stone-700 mb-0.5">
                                Captura 16:9
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(inputIdDesktop)?.click()}
                                  className="h-6 text-[9.5px] font-bold px-2 cursor-pointer"
                                >
                                  Subir
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onSelectImageFromGallery(tab.id, false)}
                                  className="h-6 text-[9.5px] font-bold px-1.5 text-[#b89528] hover:bg-[#fcf8e5] cursor-pointer"
                                >
                                  Galería
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <input
                        id={inputIdDesktop}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(tab.id, file, false);
                          e.target.value = '';
                        }}
                      />
                    </div>

                    {/* B. CAPTURA MÓVIL (SMARTPHONE VERTICAL) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-[#D4AF37]" />
                          <span>Móvil (Vertical)</span>
                        </label>
                        <span className="text-[8.5px] font-mono text-[#D4AF37]">Vertical</span>
                      </div>

                      {tab.mobile_image_url ? (
                        <div className="relative group/img w-full aspect-video rounded-xl overflow-hidden border border-amber-200/80 bg-stone-900 shadow-2xs">
                          <img
                            src={tab.mobile_image_url}
                            alt={`${tab.label} móvil`}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => document.getElementById(inputIdMobile)?.click()}
                              className="h-7 text-[10px] bg-white text-stone-900 hover:bg-stone-100 gap-1 cursor-pointer"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Cambiar</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectImageFromGallery(tab.id, true)}
                              className="h-7 text-[10px] bg-white/90 border-white text-stone-900 hover:bg-white gap-1 cursor-pointer"
                            >
                              <FolderOpen className="w-3 h-3" />
                              <span>Galería</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateTabMobileImage(tab.id, '')}
                              className="h-7 w-7 p-0 bg-rose-600/90 text-white hover:bg-rose-700"
                              title="Quitar captura móvil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileUpload(tab.id, file, true);
                          }}
                          className={`relative w-full aspect-video rounded-xl border border-dashed border-amber-200/90 bg-[#FAF9F6] hover:bg-[#fcf8e5]/40 hover:border-[#D4AF37] flex flex-col items-center justify-center p-3 text-center transition-all ${
                            isUploadingMobile ? 'opacity-70 pointer-events-none' : ''
                          }`}
                        >
                          {isUploadingMobile ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                              <span className="text-[10px] font-semibold text-stone-600">Subiendo móvil...</span>
                            </div>
                          ) : (
                            <>
                              <Smartphone className="w-4 h-4 text-[#D4AF37] mb-1" />
                              <p className="text-[10px] font-bold text-stone-700 mb-0.5">
                                Captura Móvil
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(inputIdMobile)?.click()}
                                  className="h-6 text-[9.5px] font-bold px-2 border-[#D4AF37]/50 text-[#997715] hover:bg-[#fcf8e5] cursor-pointer"
                                >
                                  Subir
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onSelectImageFromGallery(tab.id, true)}
                                  className="h-6 text-[9.5px] font-bold px-1.5 text-[#b89528] hover:bg-[#fcf8e5] cursor-pointer"
                                >
                                  Galería
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <input
                        id={inputIdMobile}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(tab.id, file, true);
                          e.target.value = '';
                        }}
                      />
                    </div>

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
