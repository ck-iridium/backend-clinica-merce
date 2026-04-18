import React from 'react';
import { Lock, CalendarOff } from 'lucide-react';
import { EmptySlot } from './EmptySlot';
import { AppointmentCard } from './AppointmentCard';

interface DayColumnProps {
  date: Date;
  appointments: any[];
  blocks: any[];
  isClosed: boolean;
  isWorkingDay?: boolean;
  closedReason?: string | null;
  closedBlock?: any;
  hours: number[];
  startHour: number;
  heightPerHour: number;
  viewType?: 'desktop' | 'mobile';
  
  // Callbacks
  onSlotClick: (hour: number, minute: number) => void;
  onApptClick: (appt: any) => void;
  onBlockClick: (block: any) => void;
  onApptMouseEnter?: (e: React.MouseEvent, appt: any) => void;
  onApptMouseMove?: (e: React.MouseEvent) => void;
  onApptMouseLeave?: () => void;
  
  // Logic helpers (pasados desde el hook de datos)
  checkIsLunch: (h: number, m: number) => boolean;
  checkIsDisabled: (h: number, m: number) => boolean;
  
  // Maps para resolución de nombres
  clientMap: Map<string, any>;
  serviceMap: Map<string, any>;
}

/**
 * DayColumn Component (v2)
 * Renderiza una columna completa de la agenda para un día específico.
 * Incluye slots vacíos, bloqueos de tiempo y citas.
 */
export function DayColumn({
  date,
  appointments,
  blocks,
  isClosed,
  isWorkingDay = true,
  closedReason,
  closedBlock,
  hours,
  startHour,
  heightPerHour,
  viewType = 'desktop',
  onSlotClick,
  onApptClick,
  onBlockClick,
  onApptMouseEnter,
  onApptMouseMove,
  onApptMouseLeave,
  checkIsLunch,
  checkIsDisabled,
  clientMap,
  serviceMap
}: DayColumnProps) {

  return (
    <div className={`relative flex-1 border-r border-stone-200 last:border-r-0 group h-full min-h-full ${!isWorkingDay ? 'bg-stone-50/30' : ''}`}>
      
      {/* Overlay de DÍA LIBRE / NO LABORABLE */}
      {!isWorkingDay && (
        <div 
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center p-4 text-center pointer-events-auto cursor-not-allowed"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4 0px, #f5f5f4 10px, #ffffff 10px, #ffffff 20px)',
            opacity: 0.95
          }}
        >
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm border border-stone-100">
            <CalendarOff size={32} className="text-stone-300" strokeWidth={1.5} />
          </div>
          <span className="text-stone-400 font-black uppercase tracking-[0.3em] text-[11px]">
            Día Libre
          </span>
          <p className="text-[9px] text-stone-300 mt-2 font-bold uppercase tracking-wider">Centro Cerrado</p>
        </div>
      )}

      {/* Estado Cerrado (Overlay) */}
      {isClosed && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (closedBlock) onBlockClick(closedBlock);
          }}
          className="absolute inset-0 z-[60] bg-stone-100/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center cursor-pointer border-[3px] border-stone-300 pointer-events-auto hover:bg-stone-200/80 transition-all group/closed"
        >
          <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover/closed:scale-110 transition-transform">
            <Lock size={viewType === 'mobile' ? 32 : 24} className="text-[#d9777f]" strokeWidth={2} />
          </div>
          <span className="text-stone-800 font-black uppercase tracking-widest text-xs">
            {closedReason || 'CERRADO'}
          </span>
          <p className="text-[10px] text-stone-400 mt-2 font-bold opacity-0 group-hover/closed:opacity-100 transition-opacity">
            Hacer click para gestionar bloqueo
          </p>
        </div>
      )}

      {/* Grid de Slots Vacíos (Elástico) */}
      <div className="absolute inset-0 z-0 flex flex-col h-full">
        {hours.map((h, i) => (
          <div key={`h-container-${h}`} className="flex-1 flex flex-col border-b border-stone-300 last:border-b-0">
            {[0, 15, 30, 45].map(m => (
              <EmptySlot
                key={`slot-${h}-${m}`}
                hour={h}
                minute={m}
                isLunch={checkIsLunch(h, m)}
                isDisabled={isClosed || !isWorkingDay || checkIsDisabled(h, m)}
                onClick={onSlotClick}
                viewType={viewType}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bloqueos de Tiempo (Porcentual) */}
      {!isClosed && isWorkingDay && blocks.map(block => {
        let tS = block.start_time;
        let tE = block.end_time;
        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
        if (tE.endsWith('Z')) tE = tE.slice(0, -1);
        
        const start = new Date(tS);
        const end = new Date(tE);
        
        // Cálculo porcentual
        const dayStartMins = startHour * 60;
        const totalMins = hours.length * 60;
        const currentStartMins = (start.getHours() * 60) + start.getMinutes();
        const diffMins = Math.max(currentStartMins - dayStartMins, 0);
        
        const topPercent = (diffMins / totalMins) * 100;
        const duration = (end.getTime() - start.getTime()) / 60000;
        const heightPercent = (duration / totalMins) * 100;
        
        const isFullDay = duration >= 600;

        return (
          <div 
            key={block.id}
            onClick={() => onBlockClick(block)}
            className={`absolute w-full left-0 z-10 cursor-pointer hover:border-stone-400 transition-all flex items-center justify-center overflow-hidden border-y-2 last:border-b-0 ${isFullDay ? 'border-stone-800 border-x-[3px]' : 'border-stone-200 border-x-0'}`}
            style={{ 
                top: `${topPercent}%`, 
                height: `${heightPercent}%`, 
                backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4, #f5f5f4 10px, #eeeeee 10px, #eeeeee 20px)' 
            }}
          >
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter opacity-60 text-center px-1">
              {block.reason || 'HORARIO BLOQUEADO'}
            </span>
          </div>
        );
      })}

      {/* Citas (Porcentual) */}
      {!isClosed && isWorkingDay && appointments.map(appt => {
        let tS = appt.start_time;
        let tE = appt.end_time;
        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
        if (tE.endsWith('Z')) tE = tE.slice(0, -1);

        const start = new Date(tS);
        const end = new Date(tE);

        // Cálculo porcentual
        const dayStartMins = startHour * 60;
        const totalMins = hours.length * 60;
        const currentStartMins = (start.getHours() * 60) + start.getMinutes();
        const diffMins = Math.max(currentStartMins - dayStartMins, 0);

        const topPercent = (diffMins / totalMins) * 100;
        const duration = (end.getTime() - start.getTime()) / 60000;
        const heightPercent = (duration / totalMins) * 100;

        return (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            client={clientMap.get(appt.client_id)}
            service={serviceMap.get(appt.service_id)}
            onClick={(e, appt) => onApptClick(appt)}
            onMouseEnter={onApptMouseEnter}
            onMouseMove={onApptMouseMove}
            onMouseLeave={onApptMouseLeave}
            isMobile={viewType === 'mobile'}
            style={{ 
                top: `${topPercent}%`, 
                height: `${heightPercent}%`, 
                width: '100%', 
                left: 0 
            }}
          />
        );
      })}
    </div>
  );
}
