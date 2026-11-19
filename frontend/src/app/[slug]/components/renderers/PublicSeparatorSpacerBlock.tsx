import React from 'react';

interface PublicSeparatorSpacerBlockProps {
  data: Record<string, any>;
}

export function PublicSeparatorSpacerBlock({ data }: PublicSeparatorSpacerBlockProps) {
  const spacing = data.spacing || 'medium';
  const style = data.style || 'line_gold';
  const pyClass = spacing === 'small' ? 'py-4' : spacing === 'large' ? 'py-16' : 'py-8';

  return (
    <div className={`w-full ${pyClass} flex items-center justify-center px-6`}>
      {style === 'line_gold' && (
        <div className="w-full max-w-xl flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="w-2 h-2 rotate-45 border border-primary bg-amber-50" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      )}
      {style === 'line_subtle' && <div className="w-full max-w-2xl h-px bg-stone-200" />}
      {style === 'spacer_only' && <div className="w-full h-1" />}
    </div>
  );
}
