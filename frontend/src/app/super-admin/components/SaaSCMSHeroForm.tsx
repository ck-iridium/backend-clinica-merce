"use client";

import { ChevronRight } from 'lucide-react';

interface SaaSCMSHeroFormProps {
  heroTitle: string;
  heroSubtitle: string;
  onChangeTitle: (val: string) => void;
  onChangeSubtitle: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export default function SaaSCMSHeroForm({
  heroTitle,
  heroSubtitle,
  onChangeTitle,
  onChangeSubtitle,
  onSubmit,
  saving
}: SaaSCMSHeroFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
          Título Principal (Hero Title)
        </label>
        <input
          type="text"
          required
          value={heroTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-800"
          placeholder="Ej. La elegancia de tu negocio..."
        />
      </div>

      <div>
        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
          Subtítulo Descriptivo (Hero Subtitle)
        </label>
        <textarea
          required
          rows={5}
          value={heroSubtitle}
          onChange={(e) => onChangeSubtitle(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-medium text-stone-500 leading-relaxed"
          placeholder="Describe los puntos fuertes..."
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>{saving ? 'Guardando...' : 'Guardar y Publicar'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
