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
        className={`fixed bottom-20 left-4 right-4 md:left-[96px] md:right-8 lg:hidden bg-stone-950 border border-white/10 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-40 transition-all duration-300 ${
          bounceCart ? 'scale-105 border-[#d4af37]/50' : 'scale-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-white/10 rounded-xl">
            <ShoppingCart size={16} className="text-[#d4af37]" />
            <span className="absolute -top-1 -right-1 bg-[#d4af37] text-stone-950 text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none font-mono">
              {cartCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              {t('dashboard.pos.total_to_charge') || 'Total a cobrar'}
            </span>
            <span className="text-lg font-bold font-mono text-[#d4af37]">
              {totalAmount.toFixed(2)}€
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="bg-white hover:bg-stone-100 text-stone-950 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <span>{t('dashboard.pos.view_ticket') || 'Ver Ticket'}</span>
          <ArrowUp size={14} className="animate-bounce" />
        </button>
      </div>

      {/* Cajón superpuesto a pantalla completa para móvil (Portal a document.body) */}
      {isCartDrawerOpen && mounted && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-stone-950 text-white lg:hidden overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto">{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}
