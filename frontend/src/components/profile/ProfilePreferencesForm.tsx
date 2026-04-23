"use client"

import React from 'react';
import { Bell, Mail, MonitorSmartphone, Sparkles } from 'lucide-react';

interface ProfilePreferencesFormProps {
  receiveEmailAppointments: boolean;
  setReceiveEmailAppointments: (val: boolean) => void;
  receiveAgendaReminders: boolean;
  setReceiveAgendaReminders: (val: boolean) => void;
}

export default function ProfilePreferencesForm({
  receiveEmailAppointments,
  setReceiveEmailAppointments,
  receiveAgendaReminders,
  setReceiveAgendaReminders
}: ProfilePreferencesFormProps) {
  return (
    <section className="bg-white rounded-[3rem] border border-stone-100 shadow-sm p-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-40 translate-x-10 -translate-y-10"></div>

      <div className="flex items-center gap-5 mb-12">
        <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
          <Bell size={26} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Preferencias</h3>
          <p className="text-stone-400 text-sm">Controla cómo y cuándo quieres recibir actualizaciones.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div 
          className="group flex items-center justify-between p-6 rounded-3xl border border-stone-50 hover:bg-stone-50/50 hover:border-stone-100 transition-all cursor-pointer" 
          onClick={() => setReceiveEmailAppointments(!receiveEmailAppointments)}
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-stone-400 group-hover:text-[#D4AF37] shadow-sm transition-all">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-800">Citas por Email</h4>
              <p className="text-xs text-stone-400 mt-0.5">Recibir avisos de reservas y cancelaciones en tiempo real.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={receiveEmailAppointments}
              onChange={(e) => setReceiveEmailAppointments(e.target.checked)}
            />
            <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>

        <div 
          className="group flex items-center justify-between p-6 rounded-3xl border border-stone-50 hover:bg-stone-50/50 hover:border-stone-100 transition-all cursor-pointer" 
          onClick={() => setReceiveAgendaReminders(!receiveAgendaReminders)}
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-stone-400 group-hover:text-[#D4AF37] shadow-sm transition-all">
              <MonitorSmartphone size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-800">Recordatorios Diarios</h4>
              <p className="text-xs text-stone-400 mt-0.5">Resumen matutino con la agenda completa del día.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={receiveAgendaReminders}
              onChange={(e) => setReceiveAgendaReminders(e.target.checked)}
            />
            <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
        </div>

        <div className="mt-8 p-6 bg-[#D4AF37]/5 rounded-[2rem] border border-[#D4AF37]/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Sparkles size={18} />
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Usa el botón <strong>Guardar Preferencias</strong> en la columna izquierda para aplicar los cambios de notificación.
          </p>
        </div>
      </div>
    </section>
  );
}
