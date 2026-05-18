"use client";

import { useState, useEffect } from 'react';
import { Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import ShareModal from './ShareModal';

interface TreatmentActionsProps {
  serviceName: string;
}

export default function TreatmentActions({ serviceName }: TreatmentActionsProps) {
  const { t } = useLanguage();
  const [currentUrl, setCurrentUrl] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 pt-12 border-t border-stone-100">
      <Link href="/tratamientos" className="flex items-center gap-2 text-stone-400 hover:text-[#d4af37] transition-colors text-xs font-black uppercase tracking-widest group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        {t('common.back_to_treatments')}
      </Link>
      
      <button 
        onClick={() => setIsShareOpen(true)}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-widest group/share"
      >
        <Share2 size={12} className="text-stone-400 group-hover/share:text-stone-950 transition-colors" />
        {t('common.share')}
      </button>

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        serviceName={serviceName}
        url={currentUrl}
      />
    </div>
  );
}
