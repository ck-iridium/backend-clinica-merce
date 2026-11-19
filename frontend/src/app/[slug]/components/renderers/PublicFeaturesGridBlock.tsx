import React from 'react';

interface PublicFeaturesGridBlockProps {
  data: Record<string, any>;
}

export function PublicFeaturesGridBlock({ data }: PublicFeaturesGridBlockProps) {
  const heading = data.heading || 'Pilares de Excelencia';
  const subheading = data.subheading;
  const items: any[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];
  const colClass =
    items.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : items.length === 4
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="w-full py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            {heading && (
              <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
                {heading}
              </h3>
            )}
            {subheading && (
              <p className="text-stone-500 text-base font-sans mt-3">
                {subheading}
              </p>
            )}
            <div className="w-12 h-0.5 bg-primary mx-auto mt-5" />
          </div>
        )}
        <div className={`grid ${colClass} gap-8`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-stone-150 shadow-luxury hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-primary border border-amber-200/70 flex items-center justify-center font-serif font-black text-base mb-6 shadow-2xs">
                0{idx + 1}
              </div>
              <h4 className="font-serif font-bold text-xl text-stone-900 mb-3">
                {item.title || 'Nuevo Pilar'}
              </h4>
              <p className="text-stone-600 text-sm font-sans leading-relaxed">
                {item.description || 'Descripción del beneficio o ventaja.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
