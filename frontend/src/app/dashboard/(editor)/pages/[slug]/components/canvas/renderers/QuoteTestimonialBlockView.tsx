import React from 'react';

interface QuoteTestimonialBlockViewProps {
  data: Record<string, any>;
}

export function QuoteTestimonialBlockView({ data }: QuoteTestimonialBlockViewProps) {
  const quote = data.quote || 'Nuestra prioridad es la armonía natural y el cuidado de cada detalle para realzar tu belleza única.';
  const author = data.author || 'Dra. Mercè Guasch';
  const role = data.role || 'Directora Médica & Especialista';
  const rating = data.rating ?? 5;
  const avatarUrl = data.avatar_url;

  return (
    <div className="w-full py-8 px-4 flex justify-center">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-stone-200/80 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.06)] relative text-center">
        {/* Marca de cita decorativa dorada */}
        <div className="w-12 h-12 rounded-full bg-amber-50 text-[#d4af37] border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Estrellas de valoración si aplica */}
        {rating > 0 && (
          <div className="flex justify-center gap-1 mb-4 text-[#d4af37]">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-[#d4af37]' : 'fill-stone-200 text-stone-200'}`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Texto de la Cita */}
        <p className="font-serif text-lg md:text-2xl text-stone-800 italic leading-relaxed mb-6 font-medium">
          “{quote}”
        </p>

        {/* Autor & Avatar */}
        <div className="flex items-center justify-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={author}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]/40 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-900 text-[#d4af37] font-serif font-bold text-sm flex items-center justify-center border border-stone-800 shadow-xs">
              {author.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <span className="font-serif font-bold text-sm text-stone-900 block leading-tight">
              {author}
            </span>
            <span className="text-[11px] font-sans text-[#d4af37] block mt-0.5 uppercase tracking-wider font-semibold">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
