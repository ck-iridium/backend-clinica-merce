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
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 group md:hidden"
    >
      <div className="relative w-[28px] h-[50px] rounded-full border border-white/20 backdrop-blur-md bg-stone-900/40 flex justify-center overflow-hidden shadow-2xl">
        {/* La "Gota de Luz" Dorada */}
        <div className="w-[4px] h-[8px] bg-primary rounded-full mt-2 animate-liquid-drop shadow-[0_0_10px_hsl(var(--primary))]"></div>
        
        {/* Sutil resplandor interno */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      </div>

      <style jsx global>{`
        @keyframes liquid-drop {
          0% { transform: translateY(-15px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(35px); opacity: 0; }
        }
        .animate-liquid-drop {
          animation: liquid-drop 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </button>
  );
}
