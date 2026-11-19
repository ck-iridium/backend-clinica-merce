import React from 'react';

interface HeroBlockViewProps {
  data: Record<string, any>;
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
}

export function HeroBlockView({ data, isBoxed = false, sectionVerticalAlign }: HeroBlockViewProps) {
  const heroAlign = data.alignment || 'center';
  const heroOuterAlign = 
    heroAlign === 'left' ? 'justify-start' : 
    heroAlign === 'right' ? 'justify-end' : 
    'justify-center';
  const heroTextAlign = 
    heroAlign === 'left' ? 'text-left items-start' : 
    heroAlign === 'right' ? 'text-right items-end' : 
    'text-center items-center';

  // Alineación vertical del contenido: prioridad bloque, fallback sección, default centro
  const rawVAlign = data.vertical_alignment || data.vertical_align;
  let heroVerticalItems = 'items-center';
  let paddingY = 'py-12 md:py-20';

  if (rawVAlign === 'top' || rawVAlign === 'items-start') {
    heroVerticalItems = 'items-start';
    paddingY = 'pt-16 md:pt-24 pb-8';
  } else if (rawVAlign === 'bottom' || rawVAlign === 'items-end') {
    heroVerticalItems = 'items-end';
    paddingY = 'pb-14 md:pb-20 pt-8';
  } else if (rawVAlign === 'center' || rawVAlign === 'items-center') {
    heroVerticalItems = 'items-center';
    paddingY = 'py-12 md:py-20';
  } else if (sectionVerticalAlign) {
    if (sectionVerticalAlign === 'items-start') {
      heroVerticalItems = 'items-start';
      paddingY = 'pt-16 md:pt-24 pb-8';
    } else if (sectionVerticalAlign === 'items-end') {
      heroVerticalItems = 'items-end';
      paddingY = 'pb-14 md:pb-20 pt-8';
    } else {
      heroVerticalItems = 'items-center';
      paddingY = 'py-12 md:py-20';
    }
  }

  return (
    <div className={`relative w-full min-h-[500px] md:min-h-[620px] bg-stone-900 overflow-hidden flex ${heroVerticalItems} ${heroOuterAlign} ${
      isBoxed ? 'rounded-3xl md:rounded-[2.5rem] shadow-luxury my-4 md:my-6' : 'rounded-none'
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
      <div className={`relative z-10 px-8 md:px-14 ${paddingY} max-w-3xl w-full flex flex-col ${heroTextAlign}`}>
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
