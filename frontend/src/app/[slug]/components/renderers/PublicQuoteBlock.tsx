import React from 'react';

interface PublicQuoteBlockProps {
  data: Record<string, any>;
}

export function PublicQuoteBlock({ data }: PublicQuoteBlockProps) {
  const quote =
    data.quote ||
    'Nuestra prioridad es la armonía natural y el cuidado de cada detalle para realzar tu belleza única.';
  const author = data.author || 'Dra. Mercè Guasch';
  const role = data.role || 'Directora Médica & Especialista';
  const rating = data.rating ?? 5;
  const avatarUrl = data.avatar_url;

  return (
    <div className="w-full py-10 px-4 flex justify-center">
      <div className="w-full max-w-3xl bg-white/95 rounded-3xl p-8 md:p-12 border border-stone-200/80 shadow-luxury text-center relative">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-primary border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        {rating > 0 && (
          <div className="flex justify-center gap-1 mb-4 text-primary">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-primary' : 'fill-stone-200 text-stone-200'}`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
        <p className="font-serif text-xl md:text-2xl text-stone-800 italic leading-relaxed mb-6">
          “{quote}”
        </p>
        <div className="flex items-center justify-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={author}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-900 text-primary font-serif font-bold text-sm flex items-center justify-center border border-stone-800 shadow-xs">
              {author.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <span className="font-serif font-bold text-sm text-stone-900 block leading-tight">{author}</span>
            <span className="text-[11px] font-sans text-primary uppercase tracking-wider font-semibold block mt-0.5">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
