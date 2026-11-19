import React from 'react';

interface ButtonBlockViewProps {
  data: Record<string, any>;
}

export function ButtonBlockView({ data }: ButtonBlockViewProps) {
  const align = data.alignment === 'left' ? 'justify-start' : data.alignment === 'right' ? 'justify-end' : 'justify-center';
  const cls = data.style === 'gold_outline'
    ? 'border border-[#d4af37] text-[#d4af37] bg-transparent'
    : data.style === 'dark_solid'
    ? 'bg-stone-900 text-white'
    : 'bg-[#d4af37] text-white';

  return (
    <div className={`w-full py-3 flex ${align}`}>
      <span className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-default shadow-sm ${cls}`}>
        {data.text || 'Acción'}
      </span>
    </div>
  );
}
