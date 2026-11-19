import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface AccordionFaqBlockViewProps {
  data: Record<string, any>;
}

export function AccordionFaqBlockView({ data }: AccordionFaqBlockViewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const heading = data.heading || 'Preguntas Frecuentes';
  const subheading = data.subheading || 'Resolvemos tus dudas antes de iniciar tu tratamiento';
  const items: FaqItem[] = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : [
        {
          question: '¿Cómo es la primera consulta de valoración?',
          answer: 'En tu primera visita realizamos un diagnóstico completo y diseñamos un plan de tratamiento adaptado a tus necesidades y objetivos.',
        },
        {
          question: '¿Los procedimientos requieren tiempo de recuperación?',
          answer: 'La mayoría de nuestros protocolos son no invasivos y te permitirán reincorporarte a tu rutina diaria inmediatamente.',
        },
        {
          question: '¿Qué facilidades de pago disponéis?',
          answer: 'Ofrecemos diversas facilidades de pago y planes de financiación personalizada sin intereses.',
        },
      ];

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center mb-8">
            {heading && (
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
                {heading}
              </h3>
            )}
            {subheading && (
              <p className="text-stone-500 text-sm font-sans mt-2">
                {subheading}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  <span className="font-serif font-bold text-base text-stone-800">
                    {item.question}
                  </span>
                  <div className={`w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-amber-50 text-primary' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-stone-600 text-sm font-sans leading-relaxed border-t border-stone-100 animate-in fade-in duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
