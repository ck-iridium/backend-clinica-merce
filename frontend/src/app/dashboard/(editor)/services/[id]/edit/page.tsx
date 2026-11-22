"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/app/contexts/LanguageContext';

const ServiceEditor = dynamic(() => import('@/components/cms/ServiceEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4 text-stone-400">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
          Cargando Editor...
        </p>
      </div>
    </div>
  )
});

export default function ServiceEditorEditPage() {
  const params = useParams();
  const serviceId = params?.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (serviceId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${serviceId}`)
        .then(res => res.json())
        .then(data => {
          setInitialData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando servicio:", err);
          setLoading(false);
        });
    }
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4 text-stone-400">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
            {language === 'fr' 
              ? "Chargement de l'éditeur..." 
              : language === 'en' 
                ? "Loading Editor..." 
                : "Cargando Editor..."}
          </p>
        </div>
      </div>
    );
  }

  return <ServiceEditor initialData={initialData} serviceId={serviceId} />;
}

