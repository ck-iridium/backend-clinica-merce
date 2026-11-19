import React from 'react';
import Link from 'next/link';

interface PublicHeroBlockProps {
  data: Record<string, any>;
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
  contentWidth?: 'boxed' | 'fullwidth' | 'fullwidth_boxed';
}

export function PublicHeroBlock({ data, isBoxed = false, sectionVerticalAlign, contentWidth }: PublicHeroBlockProps) {
  const isVideo =
    data.image_url &&
    (data.image_url.includes('.mp4') ||
      data.image_url.includes('.webm') ||
      data.image_url.includes('video_'));
  const heroAlign = data.alignment || 'center';
  const heroTextAlign =
    heroAlign === 'left' ? 'text-left items-start mr-auto' :
    heroAlign === 'right' ? 'text-right items-end ml-auto' :
    'text-center items-center mx-auto';
  const heroSubAlign =
    heroAlign === 'left' ? 'mr-auto ml-0' :
    heroAlign === 'right' ? 'ml-auto mr-0' :
    'mx-auto';

  // Alineación vertical del contenido: prioridad bloque, fallback sección, default centro
  const rawVAlign = data.vertical_alignment || data.vertical_align;
  let heroVerticalItems = 'justify-center';
  let paddingY = 'py-14 md:py-20';

  if (rawVAlign === 'top' || rawVAlign === 'items-start') {
    heroVerticalItems = 'justify-start';
    paddingY = 'pt-16 md:pt-24 pb-10';
  } else if (rawVAlign === 'bottom' || rawVAlign === 'items-end') {
    heroVerticalItems = 'justify-end';
    paddingY = 'pb-14 md:pb-20 pt-10';
  } else if (rawVAlign === 'center' || rawVAlign === 'items-center') {
    heroVerticalItems = 'justify-center';
    paddingY = 'py-14 md:py-20';
  } else if (sectionVerticalAlign) {
    if (sectionVerticalAlign === 'items-start') {
      heroVerticalItems = 'justify-start';
      paddingY = 'pt-16 md:pt-24 pb-10';
    } else if (sectionVerticalAlign === 'items-end') {
      heroVerticalItems = 'justify-end';
      paddingY = 'pb-14 md:pb-20 pt-10';
    } else {
      heroVerticalItems = 'justify-center';
      paddingY = 'py-14 md:py-20';
    }
  }

  const isBoxedSection = contentWidth === 'boxed' || isBoxed;
  const isFullWidthText = contentWidth === 'fullwidth';
  const textContainerWidth = isFullWidthText
    ? 'w-full px-8 md:px-16'
    : isBoxedSection
    ? 'w-full px-6 md:px-12'
    : 'max-w-7xl mx-auto px-6 w-full';

  return (
    <div
      className={`relative w-full min-h-[500px] md:min-h-[620px] flex flex-col ${heroVerticalItems} overflow-hidden ${
        isBoxedSection ? 'rounded-3xl md:rounded-[2.5rem] my-4 md:my-6 shadow-luxury' : 'rounded-none shadow-luxury'
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

      {/* Contenedor de contenido alineado con la rejilla (max-w-7xl mx-auto px-6 en fullwidth_boxed) */}
      <div className={`relative z-10 ${textContainerWidth} flex flex-col ${paddingY} pointer-events-none`}>
        <div className={`max-w-3xl w-full space-y-4 flex flex-col ${heroTextAlign} pointer-events-auto`}>
          {(data.heading || data.title) && (
            <h1 className="font-serif text-4xl md:text-6xl font-extrabold text-white leading-tight">
              {data.heading || data.title}
            </h1>
          )}
          {(data.subheading || data.subtitle || data.description) && (
            <p className={`text-stone-200 text-lg md:text-xl font-sans leading-relaxed ${heroSubAlign}`}>
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
    </div>
  );
}
