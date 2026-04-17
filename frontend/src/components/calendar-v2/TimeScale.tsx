import React from 'react';

interface TimeScaleProps {
  hours: number[];
  heightPerHour: number;
  viewType?: 'desktop' | 'mobile';
  part: 'axis' | 'guides';
}

/**
 * TimeScale Component (v2)
 * Renderiza el eje vertical de tiempo o las guías horizontales de la agenda.
 */
export function TimeScale({
  hours,
  heightPerHour,
  viewType = 'desktop',
  part
}: TimeScaleProps) {
  // Las guías horizontales ahora se manejan mediante CSS background pattern en el padre.
  if (part === 'guides') {
    return null;
  }

  // Render Hour Axis
  if (viewType === 'desktop') {
    return (
      <div className="flex flex-col h-full border-r border-stone-200 bg-stone-50/20 relative z-10 pointer-events-none w-full">
        {hours.map((h, i) => (
          <div 
            key={`axis-${h}`} 
            className="flex-1 relative"
          >
            <div className="absolute -top-[7px] left-0 w-full text-center text-[10px] font-bold text-stone-400">
              {h.toString().padStart(2, '0')}:00
            </div>
          </div>
        ))}
        {/* Marcador para la hora de cierre (final de la última celda) */}
        <div className="h-0 relative">
             <div className="absolute -top-[7px] left-0 w-full text-center text-[10px] font-bold text-stone-400 opacity-30">
                {(hours[hours.length - 1] + 1).toString().padStart(2, '0')}:00
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[50px] shrink-0 border-r border-stone-200 bg-white relative pointer-events-none flex flex-col h-full">
      {hours.map((h, i) => (
        <div 
          key={`maxis-${h}`} 
          className="flex-1 relative"
        >
          <div className="absolute -top-[7px] right-2 text-[10px] font-bold text-stone-400 z-30">
            {h.toString().padStart(2, '0')}:00
          </div>
        </div>
      ))}
    </div>
  );
}

