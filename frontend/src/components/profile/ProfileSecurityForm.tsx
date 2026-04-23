"use client"

import React from 'react';
import { Key, Loader2, MonitorSmartphone, LogOut, AlertCircle } from 'lucide-react';

interface ProfileSecurityFormProps {
  password: string;
  setPassword: (val: string) => void;
  savingPassword: boolean;
  handleUpdatePassword: (e: React.FormEvent) => void;
  browserInfo: string;
  handleLogout: () => void;
}

export default function ProfileSecurityForm({
  password,
  setPassword,
  savingPassword,
  handleUpdatePassword,
  browserInfo,
  handleLogout
}: ProfileSecurityFormProps) {
  return (
    <section className="bg-white rounded-[3rem] border border-stone-100 shadow-sm p-10">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 rounded-3xl bg-stone-900 flex items-center justify-center text-white shadow-lg">
          <Key size={26} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Seguridad</h3>
          <p className="text-stone-400 text-sm">Protege tu acceso y gestiona tus conexiones.</p>
        </div>
      </div>

      <div className="space-y-10">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 px-1">Cambiar Contraseña</label>
            <div className="flex gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-[1.2rem] px-5 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-stone-400 transition-all outline-none font-medium"
              />
              <button
                type="submit"
                disabled={savingPassword || !password}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {savingPassword ? <Loader2 className="animate-spin" size={18} /> : "Actualizar"}
              </button>
            </div>
          </div>
        </form>

        <div className="pt-10 border-t border-stone-50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-800 flex items-center gap-2">
              <MonitorSmartphone size={16} /> Sesión Activa
            </h4>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse">En Línea</span>
          </div>

          <div className="flex items-center justify-between p-6 bg-stone-50 border border-stone-100 rounded-3xl group/session hover:bg-white hover:border-[#D4AF37]/30 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-400 shadow-sm border border-stone-100 group-hover/session:text-[#D4AF37] transition-colors">
                <MonitorSmartphone size={24} />
              </div>
              <div>
                <p className="font-bold text-stone-800">{browserInfo}</p>
                <p className="text-xs text-stone-400">Dirección IP protegida • Conectado ahora</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-rose-500 hover:text-white hover:bg-rose-500 px-6 py-3 rounded-2xl text-xs font-bold transition-all border border-rose-100 group-hover/session:shadow-lg group-hover/session:shadow-rose-100"
            >
              <LogOut size={16} />
              Finalizar
            </button>
          </div>
          <p className="mt-6 flex items-start gap-3 text-xs text-stone-400 px-2 italic">
            <AlertCircle size={16} className="text-[#D4AF37] shrink-0" />
            Si detectas actividad sospechosa, cambia tu contraseña inmediatamente para invalidar todas las sesiones en otros dispositivos.
          </p>
        </div>
      </div>
    </section>
  );
}
