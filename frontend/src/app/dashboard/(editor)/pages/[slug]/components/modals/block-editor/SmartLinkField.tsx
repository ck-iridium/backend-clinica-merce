"use client";
import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, Search, X } from 'lucide-react';
import SmartLinkPickerModal from '@/components/cms/SmartLinkPickerModal';

interface SmartLinkFieldProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestedText?: (text: string) => void;
  categories?: any[];
  services?: any[];
  placeholder?: string;
}

export function SmartLinkField({
  label = "Enlace de Destino",
  value,
  onChange,
  onSelectSuggestedText,
  categories = [],
  services = [],
  placeholder = "/reservar o https://...",
}: SmartLinkFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="text-[10px] font-extrabold uppercase text-primary hover:text-amber-700 transition-colors flex items-center gap-1 group"
        >
          <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
          <span>Selector Inteligente</span>
        </button>
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center">
          <LinkIcon size={14} />
        </div>

        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              title="Borrar enlace"
            >
              <X size={13} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
            title="Abrir buscador inteligente"
          >
            <Search size={11} />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {isPickerOpen && (
        <SmartLinkPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(url, suggestedText) => {
            onChange(url);
            if (suggestedText && onSelectSuggestedText) {
              onSelectSuggestedText(suggestedText);
            }
            setIsPickerOpen(false);
          }}
          currentValue={value}
          categories={categories}
          services={services}
        />
      )}
    </div>
  );
}
