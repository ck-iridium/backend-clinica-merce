import React from 'react';

interface ButtonBlockViewProps {
  data: Record<string, any>;
}

export function ButtonBlockView({ data }: ButtonBlockViewProps) {
  const align = data.alignment === 'left' ? 'justify-start' : data.alignment === 'right' ? 'justify-end' : 'justify-center';
  const isOutline = data.style === 'gold_outline' || data.style === 'primary_outline';
  const isDark = data.style === 'dark_solid';
  const isCustom = data.style === 'custom' && data.custom_bg;

  const styleObj: React.CSSProperties = isCustom ? {
    backgroundColor: data.custom_bg === 'primary' ? 'var(--primary, #d4af37)' : data.custom_bg,
    color: '#ffffff',
  } : {};

  const cls = isCustom
    ? ''
    : isOutline
    ? 'border border-primary text-primary bg-transparent'
    : isDark
    ? 'bg-stone-900 text-white'
    : 'bg-primary text-white';

  return (
    <div className={`w-full py-3 flex ${align}`}>
      <span
        style={styleObj}
        className={`px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-default shadow-xs transition-all ${cls}`}
      >
        {data.text || 'Acción'}
      </span>
    </div>
  );
}
