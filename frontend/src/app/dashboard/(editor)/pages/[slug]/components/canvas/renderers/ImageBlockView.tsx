import React from 'react';

interface ImageBlockViewProps {
  data: Record<string, any>;
}

export function ImageBlockView({ data }: ImageBlockViewProps) {
  const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
  const isFull = data.alignment === 'full_width';
  const fitMode = data.object_fit || 'cover';
  const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : (fitMode !== 'none' ? '380px' : 'auto');

  return (
    <div className={`w-full py-4 flex ${data.alignment === 'left' ? 'justify-start' : data.alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
      {data.image_url ? (
        <div
          className={`${isFull ? 'w-full rounded-none' : 'rounded-[2rem] overflow-hidden shadow-luxury border border-stone-150 p-3 bg-white'}`}
          style={{ maxWidth: isFull ? '100%' : (data.max_width || '100%') }}
        >
          <div className="relative overflow-hidden rounded-2xl w-full">
            {isVideo ? (
              <video 
                src={data.image_url} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full" 
                style={{ 
                  objectFit: fitMode,
                  height: heightStyle
                }} 
              />
            ) : (
              <img 
                src={data.image_url} 
                alt={data.caption || ''} 
                className="w-full"
                style={{ 
                  objectFit: fitMode,
                  height: heightStyle
                }} 
              />
            )}
          </div>
          {data.caption && (
            <p className="text-xs text-stone-400 font-sans italic text-center mt-2.5">{data.caption}</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto min-h-[180px] border-2 border-dashed border-stone-250 hover:border-primary/50 rounded-3xl flex flex-col items-center justify-center bg-stone-50/50 hover:bg-white transition-all duration-300 py-10 px-6 text-center select-none group">
          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 text-stone-400 group-hover:text-primary group-hover:border-primary/40 group-hover:scale-105 flex items-center justify-center transition-all duration-300 shadow-2xs mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block font-sans">
            Imagen o Vídeo
          </span>
          <span className="text-[11px] text-stone-400 font-sans mt-1">
            Haz clic en el lápiz para seleccionar o subir multimedia desde la galería
          </span>
        </div>
      )}
    </div>
  );
}
