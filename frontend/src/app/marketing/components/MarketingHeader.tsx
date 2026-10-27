'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';

interface MarketingHeaderProps {
  logoSvg: string | null;
  primaryColor: string;
  tertiaryColor: string;
  onOpenOnboarding: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

export default function MarketingHeader({
  logoSvg,
  primaryColor,
  tertiaryColor,
  onOpenOnboarding
}: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-stone-200/60 py-1 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoSvg ? (
            <div
              className="h-10 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-serif tracking-widest text-stone-950 font-bold select-none">
                PROBOOKIA
              </span>
              <span className="bg-[#D4AF37]/15 text-[#997715] text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                SUITE
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/docs"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-950 text-xs font-bold transition-colors"
          >
            <BookOpen size={14} />
            <span>Blueprint</span>
          </Link>
          <Link
            href="/login"
            className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-700 border border-stone-200/80 hover:text-stone-950 hover:bg-stone-50 transition-all duration-200 active:scale-95 shadow-2xs"
          >
            Acceso Clínicas
          </Link>
          <button
            onClick={() => onOpenOnboarding('pro')}
            style={{ backgroundColor: primaryColor || '#1c1917' }}
            className="hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-white/20 flex items-center gap-1.5"
          >
            <span>Comenzar Ahora</span>
            <ChevronRight size={13} style={{ color: tertiaryColor || '#D4AF37' }} />
          </button>
        </div>
      </div>
    </header>
  );
}
