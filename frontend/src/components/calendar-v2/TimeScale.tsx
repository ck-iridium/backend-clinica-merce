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
            className="flex-1 relative flex items-start justify-center"
          >
            <div className="relative -top-[12px] bg-white border border-stone-200 px-2.5 py-1 rounded-lg shadow-sm z-50">
              <span className="text-[12px] font-black text-stone-600 tracking-tighter">
                {h.toString().padStart(2, '0')}:00
              </span>
            </div>
          </div>
        ))}
        {/* Marcador para la hora de cierre */}
        <div className="h-0 relative flex items-start justify-center">
             <div className="relative -top-[12px] bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg z-20 opacity-50">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                  {(hours[hours.length - 1] + 1).toString().padStart(2, '0')}:00
                </span>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[62px] shrink-0 border-r border-stone-200 bg-stone-50/10 relative pointer-events-none flex flex-col h-full z-20">
      {hours.map((h, i) => (
        <div 
          key={`maxis-${h}`} 
          className="flex-1 relative flex items-start justify-end pr-2"
        >
          <div className="relative -top-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded-lg shadow-sm z-50">
            <span className="text-[11px] font-black text-stone-600 tracking-tighter">
              {h.toString().padStart(2, '0')}:00
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

