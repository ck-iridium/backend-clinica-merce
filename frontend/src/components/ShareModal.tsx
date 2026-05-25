"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  // Garantizar montaje en cliente para SSR seguro con Portals
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Cerrar al pulsar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && mounted) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, mounted]);

  if (!isOpen || !mounted) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Fondo translúcido con desenfoque de lujo */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Tarjeta del Modal (Estética Bento / Quiet Luxury) */}
      <div className="relative w-full max-w-md overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-stone-100/60 z-10 transform scale-100 transition-transform duration-300 animate-in fade-in zoom-in-95">
        
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
            <div className="p-2 bg-emerald-500 rounded-xl transition-colors group-hover:bg-emerald-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.452 5.709 1.453h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
            <div className="p-2 bg-[#1877F2] rounded-xl transition-colors group-hover:bg-[#166FE5] flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
            <div className="p-2 bg-stone-900 rounded-xl transition-colors group-hover:bg-stone-950 flex items-center justify-center text-white">
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
            <div className="p-2 bg-stone-100 rounded-xl transition-colors group-hover:bg-stone-200/50 flex items-center justify-center text-stone-600">
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
                <Check size={14} className="text-primary animate-bounce" />
                <span className="text-primary">{t('common.copied')}</span>
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
    </div>,
    document.body
  );
}
