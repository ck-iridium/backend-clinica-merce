"use client";

import { ChevronDown } from 'lucide-react';

export default function ScrollIndicator() {
  const scrollToContent = () => {
    const contentElement = document.getElementById('treatment-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button 
      onClick={scrollToContent}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden z-30 group"
    >
      <div className="flex flex-col items-center gap-2 bg-stone-900/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 animate-bounce group-hover:bg-stone-900/60 transition-all">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Descubrir</span>
        <ChevronDown size={14} className="text-white" />
      </div>
    </button>
  );
}
