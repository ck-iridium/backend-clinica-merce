import React from 'react';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeaturesGridBlockViewProps {
  data: Record<string, any>;
}

export function FeaturesGridBlockView({ data }: FeaturesGridBlockViewProps) {
  const heading = data.heading || 'Pilares de Excelencia';
  const subheading = data.subheading || 'Compromiso con el rigor médico y el confort exclusivo';
  const items: FeatureItem[] = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : [
        { title: 'Diagnóstico 3D', description: 'Evaluación facial personalizada antes de cada tratamiento.' },
        { title: 'Tecnología Médica', description: 'Aparatología de vanguardia con certificación internacional.' },
        { title: 'Atención Exclusiva', description: 'Seguimiento clínico continuo en un ambiente de máxima discreción.' },
      ];

  const colClass = items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : items.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="w-full py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            {heading && (
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight">
                {heading}
              </h3>
            )}
            {subheading && (
              <p className="text-stone-500 text-sm md:text-base font-sans mt-2">
                {subheading}
              </p>
            )}
            <div className="w-12 h-0.5 bg-primary mx-auto mt-4" />
          </div>
        )}

        <div className={`grid ${colClass} gap-6`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-primary border border-primary/30 flex items-center justify-center font-serif font-black text-sm mb-4 shadow-2xs">
                0{idx + 1}
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900 mb-2">
                {item.title}
              </h4>
              <p className="text-stone-600 text-xs md:text-sm font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
