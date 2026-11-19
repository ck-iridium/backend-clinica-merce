import React from 'react';

interface PublicAccordionFaqBlockProps {
  data: Record<string, any>;
}

export function PublicAccordionFaqBlock({ data }: PublicAccordionFaqBlockProps) {
  const heading = data.heading || 'Preguntas Frecuentes';
  const subheading = data.subheading;
  const items: any[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];

  return (
    <div className="w-full py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center mb-10">
            {heading && (
              <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
                {heading}
              </h3>
            )}
            {subheading && (
              <p className="text-stone-500 text-base font-sans mt-2">
                {subheading}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {items.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs transition-all"
              open={idx === 0}
            >
              <summary className="w-full px-7 py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-stone-50/50 list-none select-none">
                <span className="font-serif font-bold text-lg text-stone-800 group-hover:text-primary transition-colors">
                  {item.question}
                </span>
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 group-open:rotate-180 group-open:bg-amber-50 group-open:text-primary transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </summary>
              <div className="px-7 pb-6 pt-1 text-stone-600 text-sm font-sans leading-relaxed border-t border-stone-100">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
