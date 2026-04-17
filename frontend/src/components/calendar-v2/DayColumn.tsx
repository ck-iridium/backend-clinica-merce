import React from 'react';
import { Lock } from 'lucide-react';
import { EmptySlot } from './EmptySlot';
import { AppointmentCard } from './AppointmentCard';

interface DayColumnProps {
  date: Date;
  appointments: any[];
  blocks: any[];
  isClosed: boolean;
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
  onApptMouseLeave,
  checkIsLunch,
  checkIsDisabled,
  clientMap,
  serviceMap
}: DayColumnProps) {

  return (
    <div className={`relative flex-1 border-r border-stone-200 last:border-r-0 group`}>
      
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

      {/* Grid de Slots Vacíos */}
      <div className="absolute inset-0 z-0">
        {hours.map((h, i) => (
          <div key={`h-container-${h}`} className="absolute w-full" style={{ top: `${i * heightPerHour}px`, height: `${heightPerHour}px` }}>
            {[0, 15, 30, 45].map(m => (
              <EmptySlot
                key={`slot-${h}-${m}`}
                hour={h}
                minute={m}
                isLunch={checkIsLunch(h, m)}
                isDisabled={isClosed || checkIsDisabled(h, m)}
                onClick={onSlotClick}
                viewType={viewType}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bloqueos de Tiempo (Striped Blocks) */}
      {!isClosed && blocks.map(block => {
        let tS = block.start_time;
        let tE = block.end_time;
        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
        if (tE.endsWith('Z')) tE = tE.slice(0, -1);
        
        const start = new Date(tS);
        const end = new Date(tE);
        const top = ((start.getHours() - startHour) * heightPerHour) + (start.getMinutes() / 60) * heightPerHour;
        const duration = (end.getTime() - start.getTime()) / 60000;
        const height = (duration / 60) * heightPerHour;
        const isFullDay = duration >= 600;

        if (viewType === 'mobile') {
          return (
            <div 
              key={block.id}
              onClick={() => onBlockClick(block)}
              className="absolute w-[95%] left-[2.5%] ml-auto mr-auto bg-stone-100 rounded-xl border border-stone-200 border-dashed opacity-80 flex items-center justify-center z-10 hover:bg-stone-200 transition-colors cursor-pointer overflow-hidden"
              style={{ top: `${top}px`, height: `${height}px`, backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4, #f5f5f4 10px, #eeeeee 10px, #eeeeee 20px)' }}
            >
              <div className="flex items-center gap-1.5 text-stone-500">
                <Lock size={12} strokeWidth={2.5} />
                {height >= 30 && <span className="text-[10px] font-bold uppercase tracking-wider text-center">{block.reason || 'Bloqueo'}</span>}
              </div>
            </div>
          );
        }

        return (
          <div 
            key={block.id}
            onClick={() => onBlockClick(block)}
            className={`absolute w-full left-0 z-10 cursor-pointer hover:border-stone-400 transition-all flex items-center justify-center overflow-hidden border-y-2 last:border-b-0 ${isFullDay ? 'border-stone-800 border-x-[3px]' : 'border-stone-200 border-x-0'}`}
            style={{ top: `${top}px`, height: `${height}px`, backgroundImage: 'repeating-linear-gradient(45deg, #f5f5f4, #f5f5f4 10px, #eeeeee 10px, #eeeeee 20px)' }}
          >
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter opacity-60 text-center px-1">
              {block.reason || 'HORARIO BLOQUEADO'}
            </span>
          </div>
        );
      })}

      {/* Citas (Appointment Cards) */}
      {!isClosed && appointments.map(appt => {
        let tS = appt.start_time;
        let tE = appt.end_time;
        if (tS.endsWith('Z')) tS = tS.slice(0, -1);
        if (tE.endsWith('Z')) tE = tE.slice(0, -1);

        const start = new Date(tS);
        const end = new Date(tE);
        const top = Math.max(((start.getHours() - startHour) * heightPerHour) + (start.getMinutes() / 60) * heightPerHour, 0);
        const duration = (end.getTime() - start.getTime()) / 60000;
        // Ajuste altura: 15min = 0.25h. Si heightPerHour es 80, 15min = 20px. 
        // Eliminamos el Math.max arbitrario de 30px para que encaje perfecto.
        const height = (duration / 60) * heightPerHour;

        return (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            client={clientMap.get(appt.client_id)}
            service={serviceMap.get(appt.service_id)}
            onClick={onApptClick}
            onMouseEnter={onApptMouseEnter}
            onMouseMove={onApptMouseEnter}
            onMouseLeave={onApptMouseLeave}
            isMobile={viewType === 'mobile'}
            style={{ top: `${top}px`, height: `${height}px`, width: '100%', left: 0 }}
          />
        );
      })}
    </div>
  );
}
