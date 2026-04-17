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
    case 'completed': 
      return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    case 'cancelled': 
      return 'bg-red-50 border-red-200 text-red-900 opacity-70';
    case 'no_show': 
      return 'bg-stone-50 border-stone-200 text-stone-900 grayscale opacity-60';
    case 'web_pending': 
      return 'bg-amber-50 border-amber-200 text-amber-900';
    case 'confirmed': 
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'pending':
    default: 
      return 'bg-orange-50 border-orange-200 text-orange-900';
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
  const heightValue = style.height?.toString() || '0';
  const isPercentage = heightValue.endsWith('%');
  const heightNum = parseFloat(heightValue);

  // Umbrales de visibilidad adaptados
  // En modelo proporcional, un bloque de 15min es ~2.5% de una jornada de 10h.
  const showService = isPercentage ? heightNum >= 4 : heightNum >= 30;
  const showNote = isPercentage ? heightNum >= 7 : heightNum >= 55; // ~45 min
  const showStatus = isPercentage ? heightNum >= 5.5 : heightNum >= 45; // ~30-45 min
  const useSmallText = isPercentage ? heightNum < 3 : heightNum < 25;

  // RENDER MÓVIL (Basado en la lógica del bloque md:hidden)
  if (isMobile) {
    return (
      <div 
        onClick={(e) => onClick(e, appointment)}
        className={`absolute w-[95%] left-[2.5%] ml-auto mr-auto border-[1.5px] rounded-xl shadow-sm px-3 py-2 z-20 overflow-hidden active:scale-[0.98] transition-all flex flex-col justify-start ${colors}`}
        style={style}
      >
        <div className={`font-extrabold text-[12px] tracking-tight leading-none mb-[2px] ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'text-current line-through opacity-70' : 'text-stone-800'}`}>
          {appointment.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
          {client?.name || 'Cliente Desconocido'}
        </div>
        {showService && (
          <div className={`text-[10px] font-semibold truncate leading-tight opacity-90`}>
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
      className={`absolute w-full left-0 border-l-[4px] border-y shadow-sm px-2.5 pt-2 pb-1 z-20 overflow-hidden hover:brightness-95 hover:scale-[1.02] hover:shadow-md hover:z-30 transition-all cursor-pointer flex flex-col justify-start
        ${appointment.status === 'confirmed' ? 'border-l-blue-500' : 
          appointment.status === 'pending' || appointment.status === 'web_pending' ? 'border-l-orange-500' :
          appointment.status === 'completed' ? 'border-l-emerald-500' :
          'border-l-stone-200/50'
        } border-y-stone-200/50 ${colors}`}
      style={style}
    >
      <div className={`font-black truncate leading-tight mb-0.5 ${useSmallText ? 'text-[11px]' : 'text-[13px]'} ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'text-current line-through' : 'text-stone-900'}`}>
        {appointment.status === 'web_pending' && <span className="text-orange-600 mr-1">[WEB]</span>}
        {client?.name || 'Cliente'}
      </div>
      
      {showService && (
        <div className={`text-[11px] font-bold truncate leading-none mb-1 ${appointment.status === 'completed' ? 'text-emerald-700' : (appointment.status === 'confirmed' ? 'text-blue-700' : (appointment.status === 'pending' ? 'text-orange-700' : 'text-stone-500'))}`}>
          {service?.name || 'Sin Servicio'}
        </div>
      )}

      {showNote && appointment.note && (
        <div className="text-[10px] font-medium italic opacity-60 truncate leading-none mt-0.5">
          "{appointment.note}"
        </div>
      )}

      {showStatus && (
        <div className="flex items-center gap-1 mt-auto pb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${appointment.status === 'confirmed' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
            {appointment.status === 'confirmed' ? 'Confirmada' : (appointment.status === 'web_pending' ? 'Web Pendiente' : 'Pendiente')}
          </span>
        </div>
      )}
    </div>
  );
}
