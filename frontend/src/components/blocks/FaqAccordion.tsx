"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ data }: { data: any }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = data?.faqs || [
    { q: "¿Con cuánto margen debo reservar?", a: "Puedes reservar en línea con hasta 2 horas de anticipación según disponibilidad." },
    { q: "¿Puedo cancelar mi cita de forma autónoma?", a: "Sí, a través de tu email de confirmación siempre que cumplas con el aviso previo de 24 horas." }
  ];

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-24 bg-white px-6 md:px-12 flex flex-col snap-start snap-stop-always md:snap-none">
      <div className="max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
            {data?.title || 'Preguntas Frecuentes'}
          </h2>
          {data?.subtitle && (
            <p className="text-lg md:text-xl text-stone-500 mt-4 font-medium font-sans max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Accordion Rows */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            
            return (
              <div 
                key={idx}
                className="border-b border-stone-100 pb-4 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left py-4 focus:outline-none group"
                >
                  <span className="text-lg md:text-xl font-serif font-bold text-stone-850 group-hover:text-[#d4af37] transition-colors pr-4">
                    {faq.q}
                  </span>
                  <span className={`w-8 h-8 rounded-full bg-stone-50 group-hover:bg-[#d4af37]/10 flex items-center justify-center text-stone-600 group-hover:text-[#d4af37] shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 bg-[#d4af37]/10 text-[#d4af37]' : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-stone-600 leading-relaxed font-sans text-base md:text-lg pb-4 font-medium pr-10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
