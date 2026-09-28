"use client";

import { Calendar, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ClientActivityCardsProps {
  appointments: any[];
  vouchers: any[];
  services: any[];
  dateLocale: string;
  totalDebt: number;
}

export function ClientActivityCards({
  appointments,
  vouchers,
  services,
  dateLocale,
  totalDebt
}: ClientActivityCardsProps) {
  const activeVouchersCount = vouchers.filter(v => new Date(v.expiration_date) >= new Date() && v.used_sessions < v.total_sessions).length;
  const lastAppointment = appointments[0];

  return (
    <div className="space-y-6">
      {totalDebt > 0 && (
        <Card className="p-6 rounded-2xl border-rose-200/80 bg-rose-50/40 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 flex items-center justify-center text-rose-600 mb-2 shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">Deuda Pendiente</h3>
          <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{totalDebt}€</p>
          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed max-w-[220px]">El cliente tiene importes de bonos pendientes por liquidar.</p>
        </Card>
      )}

      <Card className="p-6 sm:p-7 rounded-[2rem] border-stone-200/70 bg-white/80 backdrop-blur-xl shadow-sm space-y-5">
        <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">Actividad Reciente</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-stone-100 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-2">Última cita realizada</span>
            {lastAppointment ? (
              <div>
                <p className="font-bold text-stone-750 text-sm">
                  {services.find(s => s.id === lastAppointment.service_id)?.name || 'Servicio'}
                </p>
                <p className="text-[11px] font-semibold text-stone-400 mt-1 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(lastAppointment.start_time).toLocaleDateString(dateLocale, { dateStyle: 'medium' })}
                </p>
              </div>
            ) : (
              <p className="text-stone-400 text-xs italic">Aún no hay citas completadas.</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-stone-100 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-2">Bonos vigentes</span>
            <div>
              <p className="text-2xl font-black text-stone-800">
                {activeVouchersCount}
              </p>
              <span className="text-[10px] text-stone-400 font-semibold block mt-1">Bonos activos y con sesiones libres</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
