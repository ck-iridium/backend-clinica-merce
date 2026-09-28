"use client"
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, XCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  const isDestructive = 
    type === 'confirm' && 
    /eliminar|borrar|anular|cancelar|delete|remover/i.test(`${title} ${message} ${confirmText}`);

  const iconMap = {
    success: { 
      icon: <CheckCircle2 size={28} strokeWidth={1.5} />, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50/80', 
      border: 'border-emerald-100', 
      buttonClass: 'bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white' 
    },
    error: { 
      icon: <XCircle size={28} strokeWidth={1.5} />, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50/80', 
      border: 'border-rose-100', 
      buttonClass: 'bg-stone-900 hover:bg-stone-800 text-white' 
    },
    confirm: { 
      icon: isDestructive 
        ? <Trash2 size={26} strokeWidth={1.5} /> 
        : <AlertTriangle size={26} strokeWidth={1.5} />, 
      color: isDestructive ? 'text-rose-600' : 'text-[#b08e23]', 
      bg: isDestructive ? 'bg-rose-50/80' : 'bg-amber-50/80', 
      border: isDestructive ? 'border-rose-100' : 'border-amber-100/60', 
      buttonClass: isDestructive
        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
        : 'bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white'
    },
    info: { 
      icon: <Info size={28} strokeWidth={1.5} />, 
      color: 'text-sky-600', 
      bg: 'bg-sky-50/80', 
      border: 'border-sky-100', 
      buttonClass: 'bg-stone-900 hover:bg-stone-800 text-white' 
    }
  };

  const theme = iconMap[type];

  // Controlar montaje en el cliente para evitar errores de hidratación y poder usar document.body
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  // Renderizamos en un Portal para romper cualquier contexto de apilamiento conflictivo
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      {/* Backdrop con Blur y oscurecimiento suave */}
      <div 
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-md transition-opacity duration-300" 
        onClick={(e) => {
          e.stopPropagation();
          if (type !== 'confirm') onClose();
        }}
      />
      
      {/* Modal Box: Quiet Luxury Card */}
      <div 
        className="relative w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] border border-stone-200/60 transform animate-in zoom-in-95 fade-in duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon Container Armónico */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${theme.color} ${theme.bg} border ${theme.border} shadow-sm`}>
            {theme.icon}
          </div>
          
          <h2 className="text-2xl font-serif font-normal text-stone-900 mb-2 tracking-tight leading-snug">
            {title}
          </h2>
          
          <p className="text-stone-500 font-medium mb-8 text-sm leading-relaxed max-w-[320px]">
            {message}
          </p>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full justify-center">
            {type === 'confirm' && (
              <Button 
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-full sm:w-auto flex-1 rounded-xl border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-semibold"
              >
                {cancelText}
              </Button>
            )}
            
            <Button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (type === 'confirm') {
                  onConfirmHandler();
                } else {
                  onClose();
                }
              }}
              className={`w-full sm:w-auto flex-1 rounded-xl font-semibold transition-all duration-200 ${theme.buttonClass}`}
            >
              {type === 'confirm' ? confirmText : 'Entendido'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
