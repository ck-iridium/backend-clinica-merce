"use client"

import * as React from "react"
import { Bell, CalendarPlus, CheckCircle2, Tag, Globe } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const notifications = [
  {
    id: 1,
    title: "Nueva reserva online",
    description: "Lucía R. ha reservado 'Limpieza Facial Profunda'.",
    time: "Hace 5 min",
    icon: Globe,
    color: "bg-blue-50 text-blue-500",
  },
  {
    id: 2,
    title: "Cita confirmada",
    description: "Juan B. ha confirmado su asistencia por email.",
    time: "Hace 2 horas",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-500",
  },
  {
    id: 3,
    title: "Aviso de existencias",
    description: "Quedan pocos bonos de Presoterapia disponibles.",
    time: "Hace 1 día",
    icon: Tag,
    color: "bg-orange-50 text-orange-500",
  },
]

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative w-11 h-11 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
          <Bell size={18} strokeWidth={1.5} />
          {/* Badge de notificaciones */}
          <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-destructive border-[1.5px] border-card animate-pulse" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
          <h3 className="font-serif text-2xl font-semibold text-stone-800">Notificaciones</h3>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">3 Sin leer</span>
        </div>
        
        <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto bg-white custom-scrollbar">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className="p-5 flex gap-4 hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center shrink-0 shadow-sm border border-white/50 group-hover:scale-105 transition-transform`}>
                <n.icon size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-stone-800 leading-tight">{n.title}</span>
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-tighter whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-sm text-stone-400 font-medium leading-snug">
                  {n.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-stone-50/50 border-t border-stone-100 flex justify-center">
          <button className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-[#d9777f] transition-colors py-1">
            Marcar todas como leídas
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
