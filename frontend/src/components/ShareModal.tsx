"use client";

import { useEffect, useState } from 'react';
import { X, Copy, Check, Mail } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  url: string;
}

export default function ShareModal({ isOpen, onClose, serviceName, url }: ShareModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('common.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  // Enlaces de compartir optimizados
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(serviceName)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(serviceName)}&body=${encodeURIComponent(`Hola, te comparto este tratamiento exclusivo de Clínica Mercè: ${serviceName}\n\nEnlace: ${url}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo translúcido con desenfoque de lujo */}
      <div 
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Tarjeta del Modal (Estética Bento / Quiet Luxury) */}
      <div className="relative w-full max-w-md overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-stone-100/60 z-10 transform scale-100 transition-transform duration-300 animate-in fade-in zoom-in-95">
        
        {/* Botón de Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-950 transition-colors p-1.5 hover:bg-stone-50 rounded-full"
        >
          <X size={18} />
        </button>

        {/* Cabecera */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl text-stone-900 mb-2">
            {t('common.share_title')}
          </h3>
          <p className="font-sans text-xs text-stone-400 max-w-[280px] mx-auto leading-relaxed">
            {t('common.share_subtitle')}
          </p>
        </div>

        {/* Mosaico de Opciones de Redes (Estilo Bento Grid muy sutil) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/70 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 bg-green-50 rounded-xl text-green-600 transition-colors group-hover:bg-green-100/70">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.008 14.07 1.01 11.478 1.01 6.046 1.01 1.62 5.379 1.617 10.806c-.001 1.69.444 3.34 1.29 4.81l-.969 3.537 3.709-.969zm13.724-5.67c-.324-.162-1.92-.949-2.217-1.058-.297-.108-.513-.162-.73.162-.216.324-.837 1.058-1.026 1.275-.189.217-.378.243-.702.081-.324-.162-1.37-.504-2.611-1.611-.965-.86-1.617-1.923-1.806-2.247-.189-.325-.02-.5-.181-.661-.147-.146-.324-.379-.486-.569-.163-.189-.216-.324-.324-.54-.108-.217-.054-.407-.027-.57.027-.162.216-.513.324-.676.108-.162.144-.27.216-.405.072-.135.036-.254-.009-.379-.045-.125-.513-1.246-.703-1.706-.185-.445-.37-.383-.513-.39l-.438-.01c-.152 0-.401.057-.611.287-.21.23-.8.78-.8 1.901 0 1.12.81 2.202.922 2.261.113.06 1.594 2.435 3.862 3.414.54.233 1.015.373 1.36.483.54.172 1.03.148 1.417.09.431-.064 1.92-.787 2.19-1.505.27-.717.27-1.328.189-1.455-.08-.126-.297-.215-.621-.377z" />
              </svg>
            </div>
            <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide">
              {t('common.share_whatsapp')}
            </span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/70 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 transition-colors group-hover:bg-blue-100/70">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </div>
            <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide">
              {t('common.share_facebook')}
            </span>
          </a>

          {/* Twitter (X) */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/70 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 bg-stone-100 rounded-xl text-stone-900 transition-colors group-hover:bg-stone-200/50">
              {/* Icono X minimalista */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide">
              {t('common.share_twitter')}
            </span>
          </a>

          {/* E-mail */}
          <a
            href={emailUrl}
            className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100/70 rounded-2xl transition-all duration-300 group"
          >
            <div className="p-2 bg-stone-100 rounded-xl text-stone-600 transition-colors group-hover:bg-stone-200/50">
              <Mail size={20} />
            </div>
            <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide">
              {t('common.share_email')}
            </span>
          </a>
        </div>

        {/* Input con opción de Copiar Enlace destacado en la base */}
        <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-2xl border border-stone-100/40">
          <input 
            type="text" 
            value={url} 
            readOnly 
            className="flex-1 bg-transparent border-none text-[10px] text-stone-400 font-mono focus:outline-none focus:ring-0 pl-3 select-all"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 py-2 px-4 bg-stone-900 hover:bg-stone-950 text-white rounded-xl transition-all duration-300 font-sans text-xs font-semibold tracking-wide active:scale-95 group"
          >
            {copied ? (
              <>
                <Check size={14} className="text-[#d4af37] animate-bounce" />
                <span className="text-[#d4af37]">{t('common.copied')}</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-stone-400 group-hover:text-white transition-colors" />
                <span>{t('common.copy_link')}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
