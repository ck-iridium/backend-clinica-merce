'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, ArrowUp } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface POSMobileBarProps {
  cartCount: number;
  totalAmount: number;
  bounceCart: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  mounted: boolean;
  children: React.ReactNode;
}

export function POSMobileBar({
  cartCount,
  totalAmount,
  bounceCart,
  isCartDrawerOpen,
  setIsCartDrawerOpen,
  mounted,
  children,
}: POSMobileBarProps) {
  const { t } = useLanguage();

  if (cartCount === 0) return null;

  return (
    <>
      {/* Barra flotante inferior para dispositivos móviles */}
      <div
        className={`fixed bottom-20 left-4 right-4 md:left-[96px] md:right-8 lg:hidden bg-stone-950/95 backdrop-blur-xl border border-stone-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between z-40 transition-all duration-300 ${
          bounceCart ? 'scale-105 border-[#D4AF37]/60 shadow-[0_0_25px_rgba(212,175,55,0.25)]' : 'scale-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-white/10 rounded-xl border border-white/10">
            <ShoppingCart size={18} className="text-[#D4AF37]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-stone-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none font-mono shadow-sm">
              {cartCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              {t('dashboard.pos.total_to_charge') || 'Total a cobrar'}
            </span>
            <span className="text-xl font-bold font-mono text-[#D4AF37] leading-tight">
              {totalAmount.toFixed(2)}€
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="bg-white hover:bg-stone-100 active:scale-95 text-stone-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wider shadow-md"
        >
          <span>{t('dashboard.pos.view_ticket') || 'Ver Ticket'}</span>
          <ArrowUp size={14} className="animate-bounce" />
        </button>
      </div>

      {/* Cajón superpuesto a pantalla completa para móvil (Portal a document.body) */}
      {isCartDrawerOpen && mounted && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-stone-950/98 backdrop-blur-2xl text-white lg:hidden overflow-y-auto p-5 sm:p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto pt-2 pb-12">{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}
