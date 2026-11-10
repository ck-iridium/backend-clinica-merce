"use client"

import React, { useState } from 'react';
import { Users, Plus, Trash2, ShieldCheck, UserCheck } from 'lucide-react';

export interface TeamMemberItem {
  full_name: string;
  email?: string;
  role: string;
}

interface StepTeamProps {
  teamMembers: TeamMemberItem[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMemberItem[]>>;
  planType: string;
}

const ROLES = [
  { id: 'specialist', label: 'Especialista / Terapeuta' },
  { id: 'receptionist', label: 'Recepción / Atención' },
  { id: 'admin', label: 'Co-Administrador' }
];

export const StepTeam: React.FC<StepTeamProps> = ({
  teamMembers,
  setTeamMembers,
  planType
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('specialist');

  const maxSpecialists = planType === 'gold' ? 10 : 4;

  const handleAdd = () => {
    if (!fullName.trim()) return;
    if (teamMembers.length >= maxSpecialists - 1) { // 1 already reserved for admin owner
      return;
    }
    setTeamMembers(prev => [
      ...prev,
      {
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        role: role
      }
    ]);
    setFullName('');
    setEmail('');
    setRole('specialist');
  };

  const handleRemove = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const remainingSlots = Math.max(0, maxSpecialists - 1 - teamMembers.length);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] block">
          Paso Opcional · Plan {planType.toUpperCase()}
        </span>
        <h3 className="font-serif text-lg text-stone-900 font-bold">
          Equipo y Especialistas
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Añade a los profesionales que atenderán citas en tu negocio. Aparecerán de forma inmediata en las columnas de la agenda y en la selección de citas de tus clientes.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-[#FAF9F5]/80 border border-stone-200/80 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
              placeholder="Ej. Dra. Laura Soler"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!fullName.trim() || remainingSlots === 0}
              className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>

          <div className="sm:col-span-12 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Correo Electrónico (Opcional, para acceso futuro)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@clinica.com"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Lista de miembros */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Profesionales a incorporar ({teamMembers.length})
          </label>
          <span className="text-[10px] text-stone-400 font-medium">
            Huecos disponibles en tu plan: <strong className="text-stone-700">{remainingSlots}</strong>
          </span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="border border-dashed border-stone-200 rounded-2xl p-6 text-center bg-stone-50/50">
            <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-xs text-stone-500 font-medium">
              Tu cuenta ya incluye tu perfil administrador como especialista principal.
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Si trabajas solo o prefieres añadir al resto del equipo más adelante, pulsa <strong>Siguiente</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:border-[#d4af37]/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 text-[#d4af37] flex items-center justify-center font-serif font-bold text-xs shrink-0">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      {member.full_name}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-[#d4af37] border border-[#d4af37]/20 font-sans font-medium">
                        {ROLES.find(r => r.id === member.role)?.label.split('/')[0] || member.role}
                      </span>
                    </h4>
                    {member.email && (
                      <p className="text-[10px] text-stone-400 truncate max-w-[180px]">{member.email}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
        <UserCheck className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-500 leading-relaxed">
          Cada especialista dispondrá de su propia columna en la Vista Diaria y su propio calendario sincronizado en tiempo real.
        </p>
      </div>
    </div>
  );
};

