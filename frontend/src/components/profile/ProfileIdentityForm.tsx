"use client"

import React from 'react';
import { User, Mail, Save, Loader2 } from 'lucide-react';

interface ProfileIdentityFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  savingIdentity: boolean;
  handleUpdateIdentity: (e: React.FormEvent) => void;
  isNameChanged: boolean;
}

export default function ProfileIdentityForm({
  fullName,
  setFullName,
  email,
  savingIdentity,
  handleUpdateIdentity,
  isNameChanged
}: ProfileIdentityFormProps) {
  return (
    <section className="bg-white rounded-[3rem] border border-stone-100 shadow-sm p-10 relative">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 rounded-3xl bg-[#fdf2f3] flex items-center justify-center text-[#d9777f] shadow-sm">
          <User size={26} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Información General</h3>
          <p className="text-stone-400 text-sm">Gestiona cómo te ven los demás miembros del equipo.</p>
        </div>
      </div>

      <form onSubmit={handleUpdateIdentity} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 px-1">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-[1.2rem] px-5 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#fdf2f3] focus:border-[#d9777f] transition-all outline-none font-medium text-stone-800"
              placeholder="Escribe tu nombre..."
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 px-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input
                type="email"
                value={email || ''}
                disabled
                className="w-full bg-stone-50/50 border border-stone-100 rounded-[1.2rem] pl-14 pr-5 py-4 text-sm text-stone-400 cursor-not-allowed outline-none font-medium italic"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={savingIdentity || !isNameChanged}
            className="bg-stone-900 text-white hover:bg-[#d9777f] px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-stone-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3 group"
          >
            {savingIdentity ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
            Guardar Perfil
          </button>
        </div>
      </form>
    </section>
  );
}
