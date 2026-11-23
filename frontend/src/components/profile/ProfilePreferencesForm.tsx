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
    <section className="bg-white rounded-3xl sm:rounded-[3rem] border border-stone-100 shadow-sm p-6 sm:p-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-40 translate-x-10 -translate-y-10"></div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-8 sm:mb-12">
        <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm shrink-0">
          <Bell size={26} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-semibold text-stone-800">Preferencias</h3>
          <p className="text-stone-400 text-sm">Controla cómo y cuándo quieres recibir actualizaciones.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div 
          className="group flex items-center justify-between p-4 sm:p-6 rounded-3xl border border-stone-100 hover:bg-stone-50/50 hover:border-stone-200/70 transition-all cursor-pointer gap-4" 
          onClick={() => setReceiveEmailAppointments(!receiveEmailAppointments)}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white flex items-center justify-center text-stone-400 group-hover:text-[#FF6B00] shadow-sm transition-all shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-800">Citas por Email</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 leading-tight">Recibir avisos de reservas y cancelaciones en tiempo real.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={receiveEmailAppointments}
            onClick={(e) => {
              e.stopPropagation();
              setReceiveEmailAppointments(!receiveEmailAppointments);
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
              receiveEmailAppointments ? 'bg-[#FF6B00]' : 'bg-stone-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                receiveEmailAppointments ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div 
          className="group flex items-center justify-between p-4 sm:p-6 rounded-3xl border border-stone-100 hover:bg-stone-50/50 hover:border-stone-200/70 transition-all cursor-pointer gap-4" 
          onClick={() => setReceiveAgendaReminders(!receiveAgendaReminders)}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white flex items-center justify-center text-stone-400 group-hover:text-[#FF6B00] shadow-sm transition-all shrink-0">
              <MonitorSmartphone size={20} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-800">Recordatorios Diarios</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 leading-tight">Resumen matutino con la agenda completa del día.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={receiveAgendaReminders}
            onClick={(e) => {
              e.stopPropagation();
              setReceiveAgendaReminders(!receiveAgendaReminders);
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
              receiveAgendaReminders ? 'bg-[#FF6B00]' : 'bg-stone-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                receiveAgendaReminders ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mt-8 p-6 bg-orange-50/60 rounded-[2rem] border border-orange-200/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-[#FF6B00]">
            <Sparkles size={18} />
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Usa el botón <strong>Guardar Cambios</strong> en la columna izquierda para aplicar tus modificaciones de notificación.
          </p>
        </div>
      </div>
    </section>
  );
}
