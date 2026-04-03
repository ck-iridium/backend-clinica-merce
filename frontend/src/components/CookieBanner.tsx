"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-1000 print:hidden">
      <div className="max-w-4xl mx-auto bg-stone-900 text-white rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative border border-stone-800 backdrop-blur-md bg-stone-900/90">
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia y ofrecerte lo mejor de nuestra clínica. Al navegar, aceptas nuestra <Link href="/cookies" className="underline hover:text-[#d9777f] transition-colors font-bold decoration-stone-600 decoration-2 underline-offset-4">Política de Cookies</Link>.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="w-full md:w-auto bg-[#d9777f] hover:bg-[#c7656e] text-white font-black px-8 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#d9777f]/20 uppercase tracking-widest text-[10px]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
