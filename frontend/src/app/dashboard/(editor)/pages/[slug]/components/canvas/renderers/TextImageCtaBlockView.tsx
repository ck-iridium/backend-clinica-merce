import React from 'react';

interface TextImageCtaBlockViewProps {
  data: Record<string, any>;
}

export function TextImageCtaBlockView({ data }: TextImageCtaBlockViewProps) {
  const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
  const fitMode = data.object_fit || 'cover';
  const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : '380px';
  const layout = data.layout || (data.alignment === 'right' ? 'image_right' : data.alignment === 'center' ? 'image_top' : 'image_left');
  const isStacked = layout === 'image_top';

  const layoutClass = 
    layout === 'image_right' 
      ? 'flex flex-col md:flex-row-reverse gap-8 md:gap-14 items-center'
      : layout === 'image_top'
      ? 'flex flex-col gap-8 items-center max-w-4xl mx-auto'
      : 'flex flex-col md:flex-row gap-8 md:gap-14 items-center';

  const imageContainerClass = isStacked
    ? 'w-full max-w-3xl mx-auto'
    : 'w-full md:w-1/2';

  const textContainerClass = isStacked
    ? 'w-full max-w-2xl mx-auto text-center items-center'
    : 'w-full md:w-1/2 text-left items-start';

  return (
    <div className="w-full py-8">
      <div className={`w-full max-w-7xl mx-auto ${layoutClass}`}>
        {/* Lado Imagen */}
        <div className={`${imageContainerClass} shrink-0 rounded-[2rem] overflow-hidden shadow-luxury border border-stone-150 p-3 bg-white`}>
          {data.image_url ? (
            <div className="relative overflow-hidden rounded-2xl w-full">
              {isVideo ? (
                <video
                  src={data.image_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full"
                  style={{ objectFit: fitMode, height: heightStyle }}
                />
              ) : (
                <img
                  src={data.image_url}
                  alt={data.caption || data.heading || ''}
                  className="w-full"
                  style={{ objectFit: fitMode, height: heightStyle }}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full min-h-[220px] border-2 border-dashed border-stone-250 hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center bg-stone-50/50 py-10 px-4 text-center group">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-400 group-hover:text-primary flex items-center justify-center mb-2 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <span className="text-xs text-stone-600 font-bold uppercase tracking-wider">Fotografía Editorial</span>
              <span className="text-[10px] text-stone-400 font-sans mt-0.5">Pendiente de seleccionar en propiedades</span>
            </div>
          )}
          {data.caption && (
            <p className="text-xs text-stone-400 font-sans italic text-center mt-2.5">{data.caption}</p>
          )}
        </div>

        {/* Lado Texto */}
        <div className={`${textContainerClass} flex flex-col justify-center space-y-4`}>
          {(data.heading || data.title) && (
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-800 leading-tight">
              {data.heading || data.title}
            </h3>
          )}
          {(data.subheading || data.description || data.text) && (
            <p className="text-stone-600 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line">
              {data.subheading || data.description || data.text}
            </p>
          )}
          {(data.cta_text || data.button_text) && (
            <div className={`pt-2 ${isStacked ? 'flex justify-center' : ''}`}>
              <span className="inline-block bg-primary hover:bg-primary/95 text-white text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-xs transition-all duration-300 cursor-default">
                {data.cta_text || data.button_text}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
