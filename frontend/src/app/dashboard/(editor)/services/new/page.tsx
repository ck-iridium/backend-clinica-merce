"use client";

import dynamic from 'next/dynamic';

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

export default function ServiceEditorNewPage() {
  return <ServiceEditor />;
}

