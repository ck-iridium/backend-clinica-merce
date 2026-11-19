import React from 'react';

interface HeroBlockViewProps {
  data: Record<string, any>;
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
  contentWidth?: 'boxed' | 'fullwidth' | 'fullwidth_boxed';
}

export function HeroBlockView({ data, isBoxed = false, sectionVerticalAlign, contentWidth }: HeroBlockViewProps) {
  const heroAlign = data.alignment || 'center';
  const heroTextAlign = 
    heroAlign === 'left' ? 'text-left items-start mr-auto' : 
    heroAlign === 'right' ? 'text-right items-end ml-auto' : 
    'text-center items-center mx-auto';

  // Alineación vertical del contenido: prioridad bloque, fallback sección, default centro
  const rawVAlign = data.vertical_alignment || data.vertical_align;
  let heroVerticalItems = 'justify-center';
  let paddingY = 'py-12 md:py-20';

  if (rawVAlign === 'top' || rawVAlign === 'items-start') {
    heroVerticalItems = 'justify-start';
    paddingY = 'pt-16 md:pt-24 pb-8';
  } else if (rawVAlign === 'bottom' || rawVAlign === 'items-end') {
    heroVerticalItems = 'justify-end';
    paddingY = 'pb-14 md:pb-20 pt-8';
  } else if (rawVAlign === 'center' || rawVAlign === 'items-center') {
    heroVerticalItems = 'justify-center';
    paddingY = 'py-12 md:py-20';
  } else if (sectionVerticalAlign) {
    if (sectionVerticalAlign === 'items-start') {
      heroVerticalItems = 'justify-start';
      paddingY = 'pt-16 md:pt-24 pb-8';
    } else if (sectionVerticalAlign === 'items-end') {
      heroVerticalItems = 'justify-end';
      paddingY = 'pb-14 md:pb-20 pt-8';
    } else {
      heroVerticalItems = 'justify-center';
      paddingY = 'py-12 md:py-20';
    }
  }

  // Contenedor de contenido:
  // - En 'fullwidth': se expande con margen lateral amplio (w-full px-8 md:px-16)
  // - En 'boxed' (Todo Boxed): la sección ya es una caja centrada (w-full px-6 md:px-12)
  // - En 'fullwidth_boxed': fondo de borde a borde y CONTENIDO ALINEADO EXACTO CON EL NAVBAR (max-w-7xl mx-auto px-6 w-full)!
  const isBoxedSection = contentWidth === 'boxed' || isBoxed;
  const isFullWidthText = contentWidth === 'fullwidth';
  const textContainerWidth = isFullWidthText
    ? 'w-full px-8 md:px-16'
    : isBoxedSection
    ? 'w-full px-6 md:px-12'
    : 'max-w-7xl mx-auto px-6 w-full';

  return (
    <div className={`relative w-full min-h-[500px] md:min-h-[620px] bg-stone-900 overflow-hidden flex flex-col ${heroVerticalItems} ${
      isBoxedSection ? 'rounded-3xl md:rounded-[2.5rem] shadow-luxury my-4 md:my-6' : 'rounded-none'
    }`}>
      {data.image_url && (
        data.image_url.match(/\.(mp4|webm)/) ? (
          <video
            src={data.image_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={data.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      )}
      <div className="absolute inset-0 bg-stone-950/45" />

      {/* Contenedor alineado a la rejilla (max-w-7xl mx-auto px-6 en fullwidth_boxed) */}
      <div className={`relative z-10 ${textContainerWidth} flex flex-col ${paddingY} pointer-events-none`}>
        <div className={`max-w-3xl w-full flex flex-col ${heroTextAlign} pointer-events-auto`}>
          {data.heading && (
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              {data.heading}
            </h1>
          )}
          {data.subheading && (
            <p className="text-white/80 font-sans text-base md:text-lg mb-6 leading-relaxed">
              {data.subheading}
            </p>
          )}
          {data.cta_text && (
            <span className="inline-block bg-[#d4af37] text-white text-xs font-black uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-lg cursor-default">
              {data.cta_text}
            </span>
          )}
        </div>
      </div>
      {!data.image_url && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Hero · Sin imagen
          </span>
        </div>
      )}
    </div>
  );
}
