"use client";

import React from 'react';
import { Folder, FileText, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { DocSection, DocPage } from '../types';

interface DocsTreeSidebarProps {
  sections: DocSection[];
  selectedPage: DocPage | null;
  onSelectPage: (page: DocPage) => void;
  onReorder: (type: 'section' | 'page', id: string, direction: 'up' | 'down') => void;
  onDeleteSection: (section: DocSection) => void;
  onDeletePage: (page: DocPage) => void;
}

export default function DocsTreeSidebar({
  sections,
  selectedPage,
  onSelectPage,
  onReorder,
  onDeleteSection,
  onDeletePage,
}: DocsTreeSidebarProps) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/50 p-5 shadow-sm space-y-6 max-h-[70vh] overflow-y-auto">
      <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-400">
        Estructura Global
      </h3>

      {sections.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-stone-150 rounded-2xl p-4 bg-stone-50/50">
          <Folder className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-xs font-semibold">No hay secciones globales.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((sec, sIdx) => (
            <div key={sec.id} className="border border-stone-100 rounded-2xl p-3 bg-stone-50/30 hover:bg-stone-50/60 transition-all">
              
              <div className="flex items-center justify-between gap-2 group select-none">
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="font-bold text-xs text-stone-850 truncate">
                    {sec.title?.es || sec.slug}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onReorder('section', sec.id, 'up')}
                    disabled={sIdx === 0}
                    className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-750 disabled:opacity-20"
                    title="Subir sección"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorder('section', sec.id, 'down')}
                    disabled={sIdx === sections.length - 1}
                    className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-750 disabled:opacity-20"
                    title="Bajar sección"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSection(sec)}
                    className="p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500"
                    title="Eliminar Sección"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 pl-3 border-l border-stone-200 space-y-1">
                {sec.pages?.length === 0 ? (
                  <span className="text-[10px] text-stone-400 italic block py-1 pl-1">
                    Sin páginas
                  </span>
                ) : (
                  sec.pages.map((page, pIdx) => {
                    const isSelected = selectedPage?.id === page.id;
                    return (
                      <div 
                        key={page.id} 
                        className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-[#d4af37]/10 text-[#d4af37]' 
                            : 'hover:bg-stone-100/60 text-stone-600'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectPage(page)}
                          className="flex-1 text-left flex items-center gap-1.5 min-w-0"
                        >
                          <FileText size={12} className={isSelected ? 'text-[#d4af37]' : 'text-stone-400'} />
                          <span className="text-xs truncate font-medium">
                            {page.title?.es || page.slug}
                          </span>
                        </button>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onReorder('page', page.id, 'up')}
                            disabled={pIdx === 0}
                            className="p-0.5 rounded hover:bg-stone-200 text-stone-400 disabled:opacity-20"
                            title="Subir página"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReorder('page', page.id, 'down')}
                            disabled={pIdx === sec.pages.length - 1}
                            className="p-0.5 rounded hover:bg-stone-200 text-stone-400 disabled:opacity-20"
                            title="Bajar página"
                          >
                            <ChevronDown size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePage(page)}
                            className="p-0.5 rounded hover:bg-red-50 text-stone-300 hover:text-red-400"
                            title="Eliminar Página"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

