import React from 'react';

interface HeroBlockViewProps {
  data: Record<string, any>;
  isBoxed?: boolean;
}

export function HeroBlockView({ data, isBoxed = false }: HeroBlockViewProps) {
  const heroAlign = data.alignment || 'center';
  const heroOuterAlign = 
    heroAlign === 'left' ? 'justify-start' : 
    heroAlign === 'right' ? 'justify-end' : 
    'justify-center';
  const heroTextAlign = 
    heroAlign === 'left' ? 'text-left items-start' : 
    heroAlign === 'right' ? 'text-right items-end' : 
    'text-center items-center';

  return (
    <div className={`relative w-full min-h-[460px] md:min-h-[580px] bg-stone-900 overflow-hidden flex items-end ${heroOuterAlign} ${
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
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
      <div className={`relative z-10 p-8 md:p-14 max-w-3xl w-full flex flex-col ${heroTextAlign}`}>
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
