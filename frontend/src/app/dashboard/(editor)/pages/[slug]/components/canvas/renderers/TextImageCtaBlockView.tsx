import React from 'react';

interface TextImageCtaBlockViewProps {
  data: Record<string, any>;
}

export function TextImageCtaBlockView({ data }: TextImageCtaBlockViewProps) {
  const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
  const fitMode = data.object_fit || 'cover';
  const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : '380px';
  const layout = data.layout || (data.alignment === 'right' ? 'image_right' : data.alignment === 'center' ? 'image_top' : 'image_left');
  const isStacked = layout === 'image_top' || layout === 'image_bottom';

  const layoutClass = 
    layout === 'image_right' 
      ? 'flex flex-col md:flex-row-reverse gap-8 md:gap-14 items-center'
      : layout === 'image_top'
      ? 'flex flex-col gap-8 items-center max-w-4xl mx-auto'
      : layout === 'image_bottom'
      ? 'flex flex-col-reverse gap-8 items-center max-w-4xl mx-auto'
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
        <div className={`${imageContainerClass} shrink-0 rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100 p-3 bg-white`}>
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
            <div className="w-full h-full min-h-[220px] border-2 border-dashed border-stone-200 hover:border-[#d4af37]/40 rounded-[2rem] flex flex-col items-center justify-center bg-stone-50/50 py-10 px-4 text-center">
              <span className="text-2xl mb-1">🖼️</span>
              <span className="text-xs text-stone-500 font-black uppercase tracking-wider">Imagen del Bloque</span>
            </div>
          )}
          {data.caption && (
            <p className="text-xs text-stone-400 font-sans italic text-center mt-2.5">{data.caption}</p>
          )}
        </div>

        {/* Lado Texto */}
        <div className={`${textContainerClass} flex flex-col justify-center space-y-4`}>
          {data.heading && (
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-850 leading-tight">
              {data.heading}
            </h3>
          )}
          {data.subheading && (
            <p className="text-stone-600 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line">
              {data.subheading}
            </p>
          )}
          {data.cta_text && (
            <div className={`pt-2 ${isStacked ? 'flex justify-center' : ''}`}>
              <span className="inline-block bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-md cursor-default">
                {data.cta_text}
              </span>
            </div>
          )}
          {!data.heading && !data.subheading && !data.cta_text && (
            <div className="py-8 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Bloque Editorial de Texto
              </span>
              <p className="text-xs text-stone-300 mt-1">Haz clic en editar para configurar el contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
