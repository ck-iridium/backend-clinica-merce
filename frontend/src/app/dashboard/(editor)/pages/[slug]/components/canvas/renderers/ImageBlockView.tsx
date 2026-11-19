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
          className={`${isFull ? 'w-full rounded-none' : 'rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100/80 p-3 bg-white'}`}
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
        <div className="w-full h-full min-h-[160px] border-2 border-dashed border-stone-200 hover:border-[#d4af37]/40 rounded-[2rem] flex flex-col items-center justify-center bg-transparent hover:bg-stone-50 transition-all duration-300 py-10 px-4 text-center select-none">
          <span className="text-2xl mb-1.5">🖼️</span>
          <span className="text-xs text-stone-500 font-black uppercase tracking-wider">Bloque Imagen Vacío</span>
          <span className="text-[10px] text-stone-400 font-sans mt-1">Configura este bloque en las propiedades</span>
        </div>
      )}
    </div>
  );
}
