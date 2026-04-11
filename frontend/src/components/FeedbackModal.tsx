"use client"
import React, { useEffect } from 'react';

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
  
  // Icon and Colors by type
  const iconMap = {
    success: { icon: '✅', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', button: 'bg-emerald-500 hover:bg-emerald-600' },
    error: { icon: '❌', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', button: 'bg-red-500 hover:bg-red-600' },
    confirm: { icon: '⚠️', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500' },
    info: { icon: 'ℹ️', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', button: 'bg-blue-500 hover:bg-blue-600' }
  };

  const theme = iconMap[type];

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" 
        onClick={type !== 'confirm' ? onClose : undefined}
      ></div>
      
      {/* Modal Box */}
      <div className={`relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl border ${theme.border} transform animate-in zoom-in-95 fade-in duration-200`}>
        
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner ${theme.bg}`}>
            {theme.icon}
          </div>
          
          <h2 className="text-2xl font-extrabold text-stone-800 mb-3">{title}</h2>
          <p className="text-stone-500 leading-relaxed font-medium mb-8 text-sm">{message}</p>
          
          <div className="flex gap-3 w-full justify-center">
            {type === 'confirm' && (
               <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-white text-stone-500 border border-stone-200 hover:bg-stone-50 active:scale-95 transition-all text-sm"
               >
                 {cancelText}
               </button>
            )}
            
            <button 
              onClick={type === 'confirm' ? onConfirmHandler : onClose}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all text-sm ${type === 'confirm' ? 'bg-red-500 hover:bg-red-600' : 'bg-stone-800 hover:bg-stone-900'}`}
            >
              {type === 'confirm' ? confirmText : 'Entendido'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
