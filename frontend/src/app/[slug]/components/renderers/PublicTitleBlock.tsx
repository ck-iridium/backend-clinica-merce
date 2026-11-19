import React from 'react';

interface PublicTitleBlockProps {
  data: Record<string, any>;
}

export function PublicTitleBlock({ data }: PublicTitleBlockProps) {
  const Tag = (data.title_tag || 'h2') as keyof JSX.IntrinsicElements;
  const alignment = data.alignment || 'center';
  const alignClass =
    alignment === 'left' ? 'text-left' :
    alignment === 'right' ? 'text-right' :
    'text-center';

  const fontClass =
    data.font_family === 'inter' ? 'font-sans' :
    data.font_family === 'cormorant' ? 'font-serif italic tracking-wide' :
    data.font_family === 'cinzel' ? 'font-serif uppercase tracking-[0.2em]' :
    data.font_family === 'montserrat' ? 'font-sans tracking-wide font-bold' :
    'font-serif';

  const weightClass =
    data.font_weight === 'normal' ? 'font-normal' :
    data.font_weight === 'medium' ? 'font-medium' :
    data.font_weight === 'semibold' ? 'font-semibold' :
    data.font_weight === 'bold' ? 'font-bold' :
    data.font_weight === 'extrabold' ? 'font-black' :
    'font-extrabold';

  const sizeClass =
    data.font_size === 'small' ? 'text-xl md:text-2xl' :
    data.font_size === 'large' ? 'text-3xl md:text-5xl' :
    data.font_size === 'xlarge' ? 'text-4xl md:text-6xl' :
    'text-2xl md:text-4xl';

  const transformClass =
    data.text_transform === 'uppercase' ? 'uppercase tracking-widest' :
    data.text_transform === 'italic' ? 'italic' :
    '';

  const isCustomColor = data.text_color?.startsWith('#');
  const colorClass =
    isCustomColor ? '' :
    data.text_color === 'gold' ? 'text-primary' :
    data.text_color === 'white' ? 'text-white' :
    data.text_color === 'stone-400' ? 'text-stone-400' :
    'text-stone-900';

  return (
    <div className={`w-full ${alignClass} py-3`}>
      <Tag
        style={isCustomColor ? { color: data.text_color } : undefined}
        className={`${fontClass} ${weightClass} ${sizeClass} ${transformClass} ${colorClass} leading-tight`}
      >
        {data.title}
      </Tag>
      {data.show_divider !== false && (
        <div
          className={`w-12 h-[2px] bg-primary mt-4 rounded-full ${
            alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''
          }`}
        />
      )}
      {data.subtitle && (
        <p className="text-stone-400 text-sm mt-3 font-sans max-w-lg mx-auto">
          {data.subtitle}
        </p>
      )}
    </div>
  );
}
