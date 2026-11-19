import React from 'react';

export function PublicPageEmptyState({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-[2px] bg-primary rounded-full mb-10" />

      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-4">
        Página en construcción
      </span>

      <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-800 leading-tight mb-6">
        {pageTitle}
      </h1>

      <p className="text-stone-400 font-sans text-base md:text-lg max-w-md leading-relaxed mb-10">
        Esta página está lista y publicada. En breve encontrarás aquí toda la información que estamos preparando para ti.
      </p>

      <a
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-primary transition-colors duration-300 group"
      >
        <svg
          className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al inicio
      </a>

      <div className="w-16 h-[2px] bg-stone-100 rounded-full mt-10" />
    </div>
  );
}
