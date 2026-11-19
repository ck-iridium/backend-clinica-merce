import React from 'react';

interface TitleBlockViewProps {
  data: Record<string, any>;
}

export function TitleBlockView({ data }: TitleBlockViewProps) {
  const Tag = (data.title_tag || 'h2') as keyof JSX.IntrinsicElements;
  const align = data.alignment === 'left' ? 'text-left' : data.alignment === 'right' ? 'text-right' : 'text-center';
  
  // Fuentes preestablecidas
  const fontClass = 
    data.font_family === 'inter' ? 'font-sans' :
    data.font_family === 'cormorant' ? 'font-serif italic tracking-wide' :
    data.font_family === 'cinzel' ? 'font-serif uppercase tracking-[0.2em]' :
    data.font_family === 'montserrat' ? 'font-sans tracking-wide font-bold' :
    'font-serif';
    
  // Grosor
  const weightClass = 
    data.font_weight === 'normal' ? 'font-normal' :
    data.font_weight === 'medium' ? 'font-medium' :
    data.font_weight === 'semibold' ? 'font-semibold' :
    data.font_weight === 'bold' ? 'font-bold' :
    data.font_weight === 'extrabold' ? 'font-black' :
    'font-extrabold';

  // Tamaño
  const sizeClass = 
    data.font_size === 'small' ? 'text-xl md:text-2xl' :
    data.font_size === 'large' ? 'text-3xl md:text-5xl' :
    data.font_size === 'xlarge' ? 'text-4xl md:text-6xl' :
    'text-2xl md:text-4xl';

  // Transformación
  const transformClass = 
    data.text_transform === 'uppercase' ? 'uppercase tracking-widest' :
    data.text_transform === 'italic' ? 'italic' :
    '';

  // Color dinámico según paleta del inquilino o personalizado
  const isCustomColor = data.text_color?.startsWith('#');
  const colorClass = isCustomColor
    ? ''
    : data.text_color === 'gold' || data.text_color === 'primary'
    ? 'text-primary'
    : data.text_color === 'white'
    ? 'text-white'
    : data.text_color === 'stone-400'
    ? 'text-stone-400'
    : 'text-stone-900';

  const customStyle: React.CSSProperties = isCustomColor ? { color: data.text_color } : {};
  const dividerStyle: React.CSSProperties = isCustomColor ? { backgroundColor: data.text_color } : {};

  return (
    <div className={`py-6 w-full ${align}`}>
      <Tag
        style={customStyle}
        className={`${fontClass} ${weightClass} ${sizeClass} ${transformClass} ${colorClass} leading-tight`}
      >
        {data.title || 'Título de sección'}
      </Tag>
      {data.show_divider !== false && (
        <div
          style={dividerStyle}
          className={`w-12 h-[2px] bg-primary mt-4 rounded-full ${align === 'text-center' ? 'mx-auto' : align === 'text-right' ? 'ml-auto' : ''}`}
        />
      )}
      {data.subtitle && (
        <p className="text-stone-500 text-sm md:text-base mt-3 font-sans max-w-xl mx-auto leading-relaxed">
          {data.subtitle}
        </p>
      )}
    </div>
  );
}
