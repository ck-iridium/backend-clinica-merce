import React from 'react';

interface EmptySlotProps {
  hour: number;
  minute: number;
  isLunch: boolean;
  isDisabled: boolean;
  onClick: (hour: number, minute: number) => void;
  viewType?: 'desktop' | 'mobile';
}

/**
 * EmptySlot Component (v2)
 * Representa un tramo de 15 minutos en la agenda donde se puede crear una cita.
 */
export function EmptySlot({
  hour,
  minute,
  isLunch,
  isDisabled,
  onClick,
  viewType = 'desktop'
}: EmptySlotProps) {
  const isLastSlotOfHour = minute === 45;
  const borderClass = !isLastSlotOfHour ? (viewType === 'desktop' ? 'border-b border-dashed border-stone-200' : 'border-b border-dashed border-stone-200') : '';
  
  const bgImage = isLunch 
    ? 'repeating-linear-gradient(45deg, #fafaf9, #fafaf9 5px, #f5f5f4 5px, #f5f5f4 10px)' 
    : 'none';

  const baseClasses = viewType === 'desktop' 
    ? `w-full h-1/4 transition-all relative ${borderClass} ${isDisabled ? 'bg-stone-50/60 cursor-not-allowed' : 'hover:bg-[#fdf2f3]/50 cursor-pointer'}`
    : `w-full h-1/4 transition-all relative ${borderClass} ${isDisabled ? 'bg-stone-50/60 cursor-not-allowed' : 'active:bg-[#fdf2f3] cursor-pointer'}`;

  return (
    <div
      onClick={() => !isDisabled && onClick(hour, minute)}
      className={baseClasses}
      style={{ backgroundImage: bgImage }}
    >
      {!isDisabled && viewType === 'desktop' && (
        <span className="opacity-0 hover:opacity-100 text-[#d9777f] font-black text-[9px] absolute top-0.5 left-1 transition-opacity">+</span>
      )}
      
      {isLunch && ((viewType === 'desktop' && minute === 0) || (viewType === 'mobile' && minute === 15)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest leading-none">
            {viewType === 'mobile' ? 'Cerrado / Lunch' : 'Descanso'}
          </span>
        </div>
      )}
    </div>
  );
}
