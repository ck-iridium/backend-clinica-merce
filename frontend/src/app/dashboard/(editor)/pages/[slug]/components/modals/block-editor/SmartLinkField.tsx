"use client";
import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, X } from 'lucide-react';
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
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="text-[11px] font-extrabold uppercase text-primary hover:text-amber-700 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60 shadow-2xs group"
          title="Abrir selector inteligente de enlaces"
        >
          <Sparkles size={12} className="text-primary group-hover:rotate-12 transition-transform" />
          <span>Selector Inteligente</span>
        </button>
      </div>

      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center">
          <LinkIcon size={14} />
        </div>

        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Borrar enlace"
          >
            <X size={13} />
          </button>
        ) : null}
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
