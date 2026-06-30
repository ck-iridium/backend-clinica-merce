"use client"

import { useState, useEffect } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function ImpersonationBanner() {
  const [active, setActive] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const isImpersonating = getCookie('is_impersonating') === 'true';
    if (isImpersonating) {
      setActive(true);
      const tenantName = getCookie('impersonate_tenant_name') || 'Clínica';
      setName(decodeURIComponent(tenantName));
    }
  }, []);

  const handleExit = () => {
    // Clear cookies by setting past date
    document.cookie = "is_impersonating=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "impersonate_tenant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "impersonate_tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "impersonate_tenant_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "tenant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "tenant_slug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to super admin panel
    window.location.href = '/super-admin';
  };

  if (!active) return null;

  return (
    <div className="w-full bg-[#1c1917] text-white border-b border-stone-850 py-3.5 px-6 flex justify-between items-center transition-all duration-300 animate-in slide-in-from-top z-[9999] sticky top-0">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-ping shrink-0" />
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-stone-200">
          <ShieldAlert size={14} className="text-[#d4af37] shrink-0" />
          <span className="font-bold uppercase tracking-wider text-[#d4af37] text-[10px]">
            Modo Soporte Activo
          </span>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span>Visualizando la clínica:</span>
          <strong className="text-white font-serif tracking-wide">{name}</strong>
        </div>
      </div>

      <button 
        onClick={handleExit}
        className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#b08e23] text-stone-950 font-sans font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
      >
        <LogOut size={12} strokeWidth={2.5} />
        Salir y Volver
      </button>
    </div>
  );
}
