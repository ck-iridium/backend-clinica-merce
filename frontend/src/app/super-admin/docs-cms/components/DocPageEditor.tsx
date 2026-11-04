"use client";

import React from 'react';
import { FileText, Trash2, Save, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/cms/RichTextEditor';
import { DocPage, DocSection, LangTab } from '../types';

interface DocPageEditorProps {
  selectedPage: DocPage | null;
  sections: DocSection[];
  activeTab: LangTab;
  setActiveTab: (tab: LangTab) => void;
  pageTitle: Record<string, string>;
  setPageTitle: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pageContent: Record<string, string>;
  setPageContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pageSlug: string;
  setPageSlug: (slug: string) => void;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  token?: string;
}

export default function DocPageEditor({
  selectedPage,
  sections,
  activeTab,
  setActiveTab,
  pageTitle,
  setPageTitle,
  pageContent,
  setPageContent,
  pageSlug,
  setPageSlug,
  selectedSectionId,
  setSelectedSectionId,
  saving,
  onSave,
  onDelete,
  token,
}: DocPageEditorProps) {
  if (!selectedPage) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/50 p-6 md:p-8 shadow-sm">
        <div className="text-center py-32 max-w-sm mx-auto">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-stone-100">
            <FileText className="w-8 h-8 text-stone-300" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#d4af37] mb-2 font-serif">Editor CMS Activo</h3>
          <p className="text-stone-400 text-sm">
            Selecciona o crea una guía de ayuda para editar su contenido global en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/50 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Top Header info & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-150 pb-5">
        <div className="min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] block mb-1">
            Página seleccionada
          </span>
          <h2 className="font-serif text-2xl font-black text-stone-850 truncate">
            {pageTitle[activeTab] || pageSlug}
          </h2>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            className="p-3 rounded-2xl border-red-200 text-red-500 hover:bg-red-50 transition-all h-11 w-11 flex items-center justify-center"
            title="Eliminar página"
          >
            <Trash2 size={16} />
          </Button>

          <Button
            type="button"
            variant="luxury"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 h-11 text-xs font-black uppercase tracking-wider transition-all duration-300"
          >
            <Save size={14} />
            <span>{saving ? 'Guardando...' : 'Guardar Página'}</span>
          </Button>
        </div>
      </div>

      {/* Meta URL & Section Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
            Slug de la URL
          </label>
          <Input
            type="text"
            value={pageSlug}
            onChange={e => setPageSlug(e.target.value)}
            placeholder="ej: que-es-probookia"
            className="w-full text-xs font-mono text-stone-700"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
            Sección contenedora
          </label>
          <Select
            value={selectedSectionId}
            onValueChange={setSelectedSectionId}
          >
            <SelectTrigger className="h-10 text-xs bg-white border-stone-200">
              <SelectValue placeholder="Seleccionar sección" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
              {sections.map(sec => (
                <SelectItem key={sec.id} value={sec.id} className="text-xs">
                  {sec.title?.es || sec.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex border-b border-stone-150">
        {(['es', 'en', 'fr'] as const).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveTab(lang)}
            className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === lang 
                ? 'border-[#d4af37] text-stone-855 bg-stone-50/50' 
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <Globe size={13} className={activeTab === lang ? 'text-[#d4af37]' : 'text-stone-400'} />
            <span>{lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Français'}</span>
          </button>
        ))}
      </div>

      {/* Title by Language */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
          Título de la Página ({activeTab.toUpperCase()})
        </label>
        <Input
          type="text"
          value={pageTitle[activeTab] || ''}
          onChange={e => setPageTitle({ ...pageTitle, [activeTab]: e.target.value })}
          placeholder={`Escribe el título en ${activeTab === 'es' ? 'español' : activeTab === 'en' ? 'inglés' : 'francés'}...`}
          className="w-full text-sm text-stone-850 font-bold"
        />
      </div>

      {/* Rich Text Editor by Language */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1.5">
          Contenido Enriquecido ({activeTab.toUpperCase()})
        </label>
        <RichTextEditor
          key={`${selectedPage.id}-${activeTab}`}
          value={pageContent[activeTab] || ''}
          onChange={html => setPageContent({ ...pageContent, [activeTab]: html })}
          tenantId="00000000-0000-0000-0000-000000000000"
          token={token}
        />
      </div>

    </div>
  );
}

