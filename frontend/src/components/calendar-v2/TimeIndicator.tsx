'use client';

import React, { useState, useEffect } from 'react';

interface TimeIndicatorProps {
  startHour: number;
  heightPerHour: number;
  viewType: 'desktop' | 'mobile';
}

/**
 * TimeIndicator Component
 * Renderiza una línea roja con un círculo e indicador de hora actual.
 * Se actualiza cada 60 segundos.
 */
export function TimeIndicator({
  startHour,
  heightPerHour,
  viewType
}: TimeIndicatorProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Actualizar cada minuto
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Cálculo de la posición top en píxeles
  // (Hora Actual - Hora Inicio) * Alto + (Minutos / 60) * Alto
  const topOffset = (currentHour - startHour) * heightPerHour + (currentMinutes / 60) * heightPerHour;

  // No renderizar si estamos fuera del rango visible de la agenda
  // (Aunque generalmente la agenda cubre 09:00 - 20:00, el indicador desaparece si es de noche)
  if (currentHour < startHour || currentHour >= startHour + 12) { // Asumimos un máximo de 12h visibles
    // En una implementación real, esto debería compararse con endHour dinámico
    // pero por ahora silenciamos si está muy fuera.
    return null;
  }

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className="absolute left-0 right-0 pointer-events-none z-40 transition-all duration-1000 ease-linear"
      style={{ top: `${topOffset}px` }}
    >
      {/* Línea horizontal */}
      <div className="w-full h-[1.5px] bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.3)] relative">
        
        {/* Marcador Izquierdo (Punto + Hora) */}
        <div 
          className="absolute flex flex-col items-center"
          style={{ 
            left: viewType === 'desktop' ? '92px' : '54px', // Ajustado al ancho del eje de tiempo
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Hora flotante estilo Booksy */}
          <span className="absolute -top-5 bg-white px-1.5 py-0.5 rounded-md text-[10px] font-black text-[#ef4444] border border-red-50 shadow-sm leading-none whitespace-nowrap">
            {timeString}
          </span>
          
          {/* Círculo indicador */}
          <div className="w-3 h-3 bg-[#ef4444] rounded-full border-2 border-white shadow-md" />
        </div>
      </div>
    </div>
  );
}
