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
  if (part === 'guides') {
    return (
      <div className="absolute w-full pointer-events-none" style={{ height: `${hours.length * heightPerHour}px` }}>
        {hours.map((h, i) => (
          <div 
            key={`guide-${h}`} 
            className="absolute w-full border-t border-stone-300" 
            style={{ top: `${i * heightPerHour}px`, height: `${heightPerHour}px` }}
          />
        ))}
      </div>
    );
  }

  // Render Hour Axis
  if (viewType === 'desktop') {
    return (
      <div className="border-r border-stone-200 bg-stone-50/20 relative z-10 pointer-events-none">
        {hours.map((h, i) => (
          <div 
            key={`axis-${h}`} 
            className="text-center text-[10px] font-bold text-stone-400" 
            style={{ height: `${heightPerHour}px`, position: 'absolute', top: `${i * heightPerHour - 6}px`, width: '100%' }}
          >
            {h.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[50px] shrink-0 border-r border-stone-200 bg-white relative pointer-events-none">
      {hours.map((h, i) => (
        <div 
          key={`maxis-${h}`} 
          className="text-right pr-2 text-[10px] font-bold text-stone-400 z-30" 
          style={{ height: `${heightPerHour}px`, position: 'absolute', top: `${i * heightPerHour - 6}px`, width: '100%' }}
        >
          {h.toString().padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}

