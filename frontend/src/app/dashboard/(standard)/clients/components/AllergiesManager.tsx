"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X, Plus, AlertTriangle } from 'lucide-react';

interface AllergiesProps {
  value: string; // Comma-separated string, e.g. "Látex, Níquel"
  onChange: (val: string) => void;
  suggestions?: string[]; // Keys or strings for common allergies
  disabled?: boolean;
}

export function AllergiesManager({
  value,
  onChange,
  suggestions = [],
  disabled = false
}: AllergiesProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');

  // Parse active tags
  const tags = value
    ? value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    : [];

  const updateTags = (newTags: string[]) => {
    onChange(newTags.join(', '));
  };

  const addTag = (tagText: string) => {
    const cleanText = tagText.trim();
    if (!cleanText) return;
    
    // Prevent duplicate case-insensitive
    const alreadyExists = tags.some(
      t => t.toLowerCase() === cleanText.toLowerCase()
    );
    if (!alreadyExists) {
      updateTags([...tags, cleanText]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    updateTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleBlur = () => {
    addTag(inputValue);
  };

  return (
    <div className="space-y-3.5">
      {/* Current Active Tags */}
      <div className="flex flex-wrap gap-2.5 min-h-[38px] p-2 bg-stone-50 border border-stone-100 rounded-2xl items-center">
        {tags.length === 0 ? (
          <span className="text-xs text-stone-400 italic px-2">
            {t('dashboard.clients.allergies.no_allergies_listed') || 'Sin alergias o precauciones registradas.'}
          </span>
        ) : (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-250/60 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 animate-in fade-in zoom-in-95"
            >
              <AlertTriangle size={10} className="text-amber-600 shrink-0" />
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-800 hover:bg-amber-100/50 transition-colors"
                  title={t('dashboard.clients.allergies.remove_tag') || 'Eliminar'}
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Input field to write custom tags */}
      {!disabled && (
        <div className="space-y-1">
          <input
            id="allergy-custom-input"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={t('dashboard.clients.allergies.input_placeholder') || "Escribe una alergia y pulsa Enter o coma..."}
            className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-300 transition-all placeholder:text-stone-400"
          />
        </div>
      )}

      {/* Suggestion Pills */}
      {!disabled && suggestions.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-400">
            {t('dashboard.clients.allergies.quick_suggestions') || 'Sugerencias rápidas:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestionKey, idx) => {
              const label = t(suggestionKey) || suggestionKey;
              const isAlreadyAdded = tags.some(
                t => t.toLowerCase() === label.toLowerCase()
              );
              
              if (isAlreadyAdded) return null;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTag(label)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-600 rounded-full text-xs font-medium transition-all hover:bg-stone-50 shadow-sm active:scale-95 shrink-0"
                >
                  <Plus size={10} className="text-stone-400" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
