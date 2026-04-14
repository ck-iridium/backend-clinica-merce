"use client"
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

export interface FeedbackConfig {
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface FeedbackModalProps extends FeedbackConfig {
  onClose: () => void;
  onConfirmHandler: () => void;
}

export default function FeedbackModal({ 
  type, 
  title, 
  message, 
  onClose, 
  onConfirmHandler,
  confirmText = 'Continuar',
  cancelText = 'Cancelar'
}: FeedbackModalProps) {
  
  const iconMap = {
    success: { 
      icon: <CheckCircle2 size={42} strokeWidth={1.2} />, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100', 
      button: 'bg-stone-800 hover:bg-stone-900' 
    },
    error: { 
      icon: <XCircle size={42} strokeWidth={1.2} />, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50', 
      border: 'border-rose-100', 
      button: 'bg-stone-800 hover:bg-stone-900' 
    },
    confirm: { 
      icon: <AlertCircle size={42} strokeWidth={1.2} />, 
      color: 'text-[#d9a05b]', 
      bg: 'bg-[#fdf8f3]', 
      border: 'border-[#f3e9df]', 
      button: 'bg-[#bf7d6b] hover:bg-[#a66a5a] shadow-lg shadow-[#bf7d6b]/20' 
    },
    info: { 
      icon: <Info size={42} strokeWidth={1.2} />, 
      color: 'text-sky-500', 
      bg: 'bg-sky-50', 
      border: 'border-sky-100', 
      button: 'bg-stone-800 hover:bg-stone-900' 
    }
  };

  const theme = iconMap[type];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-4 pointer-events-auto">
      {/* Backdrop con Blur y bloqueo total */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md transition-opacity duration-300" 
        onClick={(e) => {
          e.stopPropagation();
          if (type !== 'confirm') onClose();
        }}
      ></div>
      
      {/* Modal Box: Isla Blanca Premium con radio 0.75rem (rounded-xl) */}
      <div 
        className="relative w-full max-w-md bg-white rounded-xl p-10 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-stone-100 transform animate-in zoom-in-95 fade-in duration-300 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon Container Soft con radio 0.75rem unificado */}
          <div className={`w-24 h-24 rounded-xl flex items-center justify-center mb-8 rotate-3 ${theme.color} ${theme.bg} border ${theme.border} shadow-sm`}>
            {theme.icon}
          </div>
          
          <h2 className="text-3xl font-serif font-light text-stone-800 mb-4 tracking-tight leading-none">
            {title}
          </h2>
          
          <p className="text-stone-400 font-medium mb-10 text-base leading-relaxed max-w-[280px]">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            {type === 'confirm' && (
               <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="order-2 sm:order-1 text-sm font-bold text-stone-400 hover:text-stone-600 transition-all border-b-2 border-transparent hover:border-stone-200 py-1"
               >
                 {cancelText}
               </button>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); type === 'confirm' ? onConfirmHandler() : onClose(); }}
              className={`order-1 sm:order-2 px-10 py-4 rounded-full font-bold text-white transition-all active:scale-95 text-sm uppercase tracking-widest ${theme.button}`}
            >
              {type === 'confirm' ? confirmText : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
