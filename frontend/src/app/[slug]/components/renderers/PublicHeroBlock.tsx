import React from 'react';
import Link from 'next/link';

interface PublicHeroBlockProps {
  data: Record<string, any>;
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
}

export function PublicHeroBlock({ data, isBoxed = false, sectionVerticalAlign }: PublicHeroBlockProps) {
  const isVideo =
    data.image_url &&
    (data.image_url.includes('.mp4') ||
      data.image_url.includes('.webm') ||
      data.image_url.includes('video_'));
  const heroAlign = data.alignment || 'center';
  const heroAlignContainer =
    heroAlign === 'left' ? 'text-left items-start mr-auto' :
    heroAlign === 'right' ? 'text-right items-end ml-auto' :
    'text-center items-center mx-auto';
  const heroSubAlign =
    heroAlign === 'left' ? 'mr-auto ml-0' :
    heroAlign === 'right' ? 'ml-auto mr-0' :
    'mx-auto';
  const heroOuterAlign =
    heroAlign === 'left' ? 'justify-start px-8 md:px-16' :
    heroAlign === 'right' ? 'justify-end px-8 md:px-16' :
    'justify-center px-6';

  // Alineación vertical del contenido: prioridad bloque, fallback sección, default centro
  const rawVAlign = data.vertical_alignment || data.vertical_align;
  let heroVerticalItems = 'items-center';
  let paddingY = 'py-14 md:py-20';

  if (rawVAlign === 'top' || rawVAlign === 'items-start') {
    heroVerticalItems = 'items-start';
    paddingY = 'pt-16 md:pt-24 pb-10';
  } else if (rawVAlign === 'bottom' || rawVAlign === 'items-end') {
    heroVerticalItems = 'items-end';
    paddingY = 'pb-14 md:pb-20 pt-10';
  } else if (rawVAlign === 'center' || rawVAlign === 'items-center') {
    heroVerticalItems = 'items-center';
    paddingY = 'py-14 md:py-20';
  } else if (sectionVerticalAlign) {
    if (sectionVerticalAlign === 'items-start') {
      heroVerticalItems = 'items-start';
      paddingY = 'pt-16 md:pt-24 pb-10';
    } else if (sectionVerticalAlign === 'items-end') {
      heroVerticalItems = 'items-end';
      paddingY = 'pb-14 md:pb-20 pt-10';
    } else {
      heroVerticalItems = 'items-center';
      paddingY = 'py-14 md:py-20';
    }
  }

  return (
    <div
      className={`relative w-full min-h-[500px] md:min-h-[620px] flex ${heroVerticalItems} ${heroOuterAlign} overflow-hidden ${
        isBoxed ? 'rounded-3xl md:rounded-[2.5rem] my-4 md:my-6 shadow-luxury' : 'rounded-none shadow-luxury'
      }`}
    >
      {data.image_url ? (
        isVideo ? (
          <video
            src={data.image_url}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={data.image_url}
            alt={data.heading || 'Hero'}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        <div className="absolute inset-0 bg-stone-900" />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className={`relative z-10 ${heroAlignContainer} max-w-4xl space-y-4 ${paddingY}`}>
        {(data.heading || data.title) && (
          <h1 className="font-serif text-4xl md:text-6xl font-extrabold text-white leading-tight">
            {data.heading || data.title}
          </h1>
        )}
        {(data.subheading || data.subtitle || data.description) && (
          <p className={`text-stone-200 text-lg md:text-xl font-sans max-w-2xl ${heroSubAlign} leading-relaxed`}>
            {data.subheading || data.subtitle || data.description}
          </p>
        )}
        {(data.cta_text || data.button_text) && (
          <div className="pt-4">
            <Link
              href={data.cta_url || data.button_url || data.url || '#'}
              className="inline-block bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95"
            >
              {data.cta_text || data.button_text}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
