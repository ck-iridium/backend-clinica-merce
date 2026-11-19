import React from 'react';

interface PublicImageBlockProps {
  data: Record<string, any>;
}

export function PublicImageBlock({ data }: PublicImageBlockProps) {
  const alignment = data.alignment || 'center';
  const isFullWidth = alignment === 'full_width';
  const fitMode = data.object_fit || 'cover';
  const heightStyle =
    data.height_preset === 'small' ? '250px' :
    data.height_preset === 'medium' ? '400px' :
    data.height_preset === 'large' ? '550px' :
    data.height_preset === 'screen' ? '750px' :
    (fitMode !== 'none' ? '380px' : 'auto');

  if (!data.image_url) {
    return (
      <div
        className={`w-full py-4 flex ${
          alignment === 'left' ? 'justify-start' :
          alignment === 'right' ? 'justify-end' :
          'justify-center'
        }`}
      >
        <div className="w-full max-w-xl h-56 rounded-3xl border-2 border-dashed border-stone-200/80 bg-stone-50/70 flex flex-col items-center justify-center p-6 text-stone-400 gap-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-400 flex items-center justify-center mb-1 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
            {data.caption || 'Fotografía Editorial'}
          </span>
        </div>
      </div>
    );
  }

  const isVideo =
    data.image_url.includes('.mp4') ||
    data.image_url.includes('.webm') ||
    data.image_url.includes('video_');

  return (
    <div
      className={`w-full py-4 flex ${
        alignment === 'left' ? 'justify-start' :
        alignment === 'right' ? 'justify-end' :
        'justify-center'
      }`}
    >
      <div
        className={`rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100/50 bg-white ${
          isFullWidth ? 'w-full rounded-none border-none p-0' : 'p-3'
        }`}
        style={{ maxWidth: isFullWidth ? '100%' : (data.max_width || '100%') }}
      >
        <div className="relative overflow-hidden rounded-2xl w-full">
          {isVideo ? (
            <video
              src={data.image_url}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="w-full"
              style={{
                objectFit: fitMode as any,
                height: heightStyle,
              }}
            />
          ) : (
            <img
              src={data.image_url}
              alt={data.caption || 'Imagen'}
              className="w-full"
              style={{
                objectFit: fitMode as any,
                height: heightStyle,
              }}
            />
          )}
        </div>
        {data.caption && (
          <p className="mt-3 text-xs font-semibold text-stone-500 italic text-center px-4">
            {data.caption}
          </p>
        )}
      </div>
    </div>
  );
}
