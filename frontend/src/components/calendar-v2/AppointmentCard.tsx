import React from 'react';

/**
 * Propiedades del componente AppointmentCard.
 * Diseñado para ser agnóstico del estado global del calendario.
 */
interface AppointmentCardProps {
  appointment: any;
  client: any;
  service: any;
  onClick: (e: React.MouseEvent, appt: any) => void;
  onMouseEnter?: (e: React.MouseEvent, appt: any) => void;
  onMouseMove?: (e: React.MouseEvent, appt: any) => void;
  onMouseLeave?: () => void;
  isMobile?: boolean;
  style: React.CSSProperties;
}

/**
 * Encapsulación de la lógica de colores por estado de la cita.
 */
const getStatusColors = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 border-emerald-400';
    case 'cancelled': return 'bg-red-50 border-red-500 opacity-70';
    case 'no_show': return 'bg-stone-100 border-stone-400 grayscale opacity-60';
    case 'web_pending': return 'bg-orange-50 border-orange-400';
    case 'confirmed': return 'bg-[#fdf2f3] border-[#d9777f]';
    case 'pending':
    default: return 'bg-[#fdf2f3] border-[#d9777f]';
  }
};

/**
 * AppointmentCard Component (v2)
 * Renderiza la tarjeta de una cita tanto para vista Desktop como Mobile.
 */
export function AppointmentCard({
  appointment,
  client,
  service,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  isMobile = false,
  style
}: AppointmentCardProps) {
  const colors = getStatusColors(appointment.status);
  const heightPx = typeof style.height === 'number' ? style.height : parseInt(style.height as string || '0');

  // RENDER MÓVIL (Basado en la lógica del bloque md:hidden)
  if (isMobile) {
    return (
      <div 
        onClick={(e) => onClick(e, appointment)}
        className={`absolute w-[95%] left-[2.5%] ml-auto mr-auto border-[1.5px] rounded-xl shadow-sm px-3 py-2 z-20 overflow-hidden active:scale-[0.98] transition-all flex flex-col justify-start ${colors}`}
        style={style}
      >
        <div className={`font-extrabold text-[11px] sm:text-xs tracking-tight leading-none mb-[2px] ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'text-current line-through opacity-70' : 'text-stone-800'}`}>
          {appointment.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
          {client?.name || 'Cliente Desconocido'}
        </div>
        {heightPx >= 45 && (
          <div className={`text-[9px] font-semibold truncate leading-tight opacity-90`}>
            {service?.name || 'Servicio...'}
          </div>
        )}
      </div>
    );
  }

  // RENDER DESKTOP (Basado en la lógica del bloque md:block)
  return (
    <div 
      onClick={(e) => onClick(e, appointment)}
      onMouseEnter={(e) => onMouseEnter?.(e, appointment)}
      onMouseMove={(e) => onMouseMove?.(e, appointment)}
      onMouseLeave={onMouseLeave}
      className={`absolute w-[92%] left-[4%] ml-auto mr-auto border-l-[4px] rounded-r-lg shadow-sm px-2 py-1 z-20 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-start ${colors}`}
      style={style}
    >
      <div className={`font-extrabold text-[10px] sm:text-xs truncate leading-tight mb-0.5 ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'text-current line-through' : 'text-stone-800'}`}>
        {appointment.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
        {client?.name || 'Cliente Desconocido'}
      </div>
      {heightPx >= 36 && (
        <div className={`text-[9px] font-semibold truncate leading-tight ${appointment.status === 'completed' ? 'text-emerald-700' : (appointment.status === 'pending' ? 'text-[#b35e65]' : 'text-current opacity-80')}`}>
          {service?.name || 'Servicio...'}
        </div>
      )}
    </div>
  );
}
