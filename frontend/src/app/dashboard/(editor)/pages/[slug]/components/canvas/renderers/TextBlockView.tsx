import React from 'react';

interface TextBlockViewProps {
  data: Record<string, any>;
}

export function TextBlockView({ data }: TextBlockViewProps) {
  const alignClass = 
    data.alignment === 'center' ? 'text-center' :
    data.alignment === 'right' ? 'text-right' :
    data.alignment === 'justify' ? 'text-justify' :
    'text-left';

  return (
    <div
      className={`prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed py-2 ${alignClass}`}
      dangerouslySetInnerHTML={{ __html: data.html || '<p>Sin contenido</p>' }}
    />
  );
}
