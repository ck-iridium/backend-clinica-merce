import React from 'react';
import Link from 'next/link';

interface PublicButtonBlockProps {
  data: Record<string, any>;
}

export function PublicButtonBlock({ data }: PublicButtonBlockProps) {
  const btnAlign = data.alignment || 'left';
  const alignClass =
    btnAlign === 'left' ? 'justify-start' :
    btnAlign === 'right' ? 'justify-end' :
    'justify-center';

  const isCustomBg = data.custom_bg?.startsWith('#');
  const styleClass =
    data.style === 'gold_outline'
      ? 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
      : data.style === 'dark_solid'
      ? 'bg-stone-900 text-white hover:bg-stone-800'
      : 'bg-primary text-white hover:bg-primary/90';

  return (
    <div className={`w-full flex ${alignClass} py-3`}>
      <Link
        href={data.url || '#'}
        style={isCustomBg ? { backgroundColor: data.custom_bg } : undefined}
        className={`px-7 py-3.5 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95 ${styleClass}`}
      >
        {data.text || 'Acción'}
      </Link>
    </div>
  );
}
