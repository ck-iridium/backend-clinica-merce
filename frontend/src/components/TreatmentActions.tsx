"use client";

import { useState, useEffect } from 'react';
import { Share2, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TreatmentActionsProps {
  serviceName: string;
}

export default function TreatmentActions({ serviceName }: TreatmentActionsProps) {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: serviceName,
          url: currentUrl,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Enlace copiado al portapapeles");
      } catch (err) {
        toast.error("No se pudo copiar el enlace");
      }
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hola, me interesa este tratamiento: ${serviceName} - ${currentUrl}`)}`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 pt-12 border-t border-stone-100">
      <Link href="/tratamientos" className="flex items-center gap-2 text-stone-400 hover:text-[#d4af37] transition-colors text-xs font-black uppercase tracking-widest group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Ver otros Tratamientos
      </Link>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          Compartir
        </button>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-stone-400 hover:text-green-600 transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
