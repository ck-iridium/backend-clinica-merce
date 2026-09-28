import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
  isHighlighted?: boolean;
  style: React.CSSProperties;
}

/**
 * Encapsulación de la lógica de colores por estado de la cita (Quiet Luxury Palette).
 */
const getStatusColors = (status: string) => {
  switch (status) {
    case 'completed': 
      return 'bg-emerald-50/90 border-emerald-200/80 border-l-emerald-500 text-emerald-950';
    case 'cancelled': 
      return 'bg-stone-50/70 border-stone-200/50 border-l-stone-300 text-stone-400 opacity-60';
    case 'no_show': 
      return 'bg-rose-50/60 border-rose-200/60 border-l-rose-400 text-rose-900/80 opacity-70';
    case 'web_pending': 
    case 'pending_verification': 
      return 'bg-amber-50/90 border-amber-200/80 border-l-[#D4AF37] text-amber-950';
    case 'confirmed': 
      return 'bg-sky-50/90 border-sky-200/80 border-l-sky-500 text-sky-950';
    case 'pending':
    default: 
      return 'bg-orange-50/90 border-orange-200/80 border-l-orange-400 text-orange-950';
  }
};

/**
 * AppointmentCard Component (v2)
 * Renderiza la tarjeta de una cita tanto para vista Desktop como Mobile con bordes redondeados suaves.
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
  isHighlighted = true,
  style
}: AppointmentCardProps) {
  const { t } = useLanguage();
  const colors = getStatusColors(appointment.status);
  const heightValue = style.height?.toString() || '0';
  const isPercentage = heightValue.endsWith('%');
  const heightNum = parseFloat(heightValue);

  // Umbrales de visibilidad adaptados
  const showService = isPercentage ? heightNum >= 4 : heightNum >= 30;
  const showNote = isPercentage ? heightNum >= 7 : heightNum >= 55;
  const showStatus = isPercentage ? heightNum >= 5.5 : heightNum >= 45;
  const useSmallText = isPercentage ? heightNum < 3 : heightNum < 25;

  // RENDER MÓVIL
  if (isMobile) {
    return (
      <div 
        id={`calendar-appt-card-mobile-${appointment.id}`}
        onClick={(e) => onClick(e, appointment)}
        className={`absolute w-[94%] left-[3%] rounded-xl border border-l-[3.5px] shadow-2xs px-3 py-2 z-20 overflow-hidden active:scale-[0.98] transition-all flex flex-col justify-start backdrop-blur-xs ${colors} ${!isHighlighted ? 'opacity-20 grayscale pointer-events-none' : ''}`}
        style={style}
      >
        <div className={`font-semibold text-xs tracking-tight leading-none mb-1 flex items-center gap-1 ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'line-through opacity-70' : 'text-stone-900'}`}>
          {appointment.status === 'web_pending' && (
            <span className="text-[9px] font-black bg-amber-500/20 text-[#B38F26] px-1.5 py-0.2 rounded uppercase">
              Web
            </span>
          )}
          <span className="truncate">{client?.name || (t('dashboard.calendar.unknown_client') || 'Cliente Desconocido')}</span>
        </div>
        {showService && (
          <div className="text-[10px] font-medium text-stone-500 truncate leading-tight">
            {service?.name || (t('dashboard.calendar.service_placeholder') || 'Servicio...')}
          </div>
        )}
      </div>
    );
  }

  // RENDER DESKTOP
  return (
    <div 
      id={`calendar-appt-card-desktop-${appointment.id}`}
      onClick={(e) => onClick(e, appointment)}
      onMouseEnter={(e) => onMouseEnter?.(e, appointment)}
      onMouseMove={(e) => onMouseMove?.(e, appointment)}
      onMouseLeave={onMouseLeave}
      className={`absolute w-[calc(100%-8px)] left-[4px] border border-l-[3.5px] shadow-2xs px-2.5 py-1.5 z-20 overflow-hidden rounded-xl hover:shadow-luxury hover:-translate-y-0.5 hover:z-30 transition-all cursor-pointer flex flex-col justify-start backdrop-blur-xs ${colors} ${!isHighlighted ? 'opacity-20 grayscale pointer-events-none' : ''}`}
      style={style}
    >
      <div className={`font-semibold truncate leading-tight mb-0.5 flex items-center gap-1 ${useSmallText ? 'text-[11px]' : 'text-xs'} ${appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'line-through text-stone-400' : 'text-stone-900'}`}>
        {appointment.status === 'web_pending' && (
          <span className="text-[9px] font-bold bg-[#D4AF37]/20 text-[#99771A] px-1 py-0.2 rounded uppercase">
            Web
          </span>
        )}
        <span className="truncate">{client?.name || (t('dashboard.calendar.client') || 'Cliente')}</span>
      </div>
      
      {showService && (
        <div className="text-[11px] font-medium text-stone-500 truncate leading-none mb-1">
          {service?.name || (t('dashboard.calendar.no_service') || 'Sin Servicio')}
        </div>
      )}

      {showNote && appointment.note && (
        <div className="text-[10px] font-medium italic text-stone-400 truncate leading-none mt-0.5">
          "{appointment.note}"
        </div>
      )}

      {showStatus && (
        <div className="flex items-center gap-1.5 mt-auto pb-0.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            appointment.status === 'confirmed' ? 'bg-sky-500' : 
            appointment.status === 'completed' ? 'bg-emerald-500' :
            appointment.status === 'web_pending' ? 'bg-[#D4AF37]' :
            'bg-orange-400'
          }`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
            {appointment.status === 'confirmed' 
              ? (t('dashboard.calendar.confirmed') || 'Confirmada') 
              : appointment.status === 'completed'
              ? (t('dashboard.calendar.completed') || 'Completada')
              : (appointment.status === 'pending_verification' || appointment.status === 'web_pending' 
                ? (t('dashboard.calendar.web_pending') || 'Pendiente Web') 
                : (t('dashboard.calendar.pending') || 'Pendiente'))}
          </span>
        </div>
      )}
    </div>
  );
}
