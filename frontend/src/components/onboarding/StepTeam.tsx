"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Crown,
  Calendar
} from 'lucide-react';

export interface TeamMemberItem {
  full_name: string;
  email?: string;
  role: string;
  send_invite?: boolean;
}

interface StepTeamProps {
  teamMembers: TeamMemberItem[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMemberItem[]>>;
  planType: string;
}

const ROLES = [
  { id: 'specialist', label: 'Especialista / Terapeuta', desc: 'Atiende citas y gestiona fichas de sus clientes' },
  { id: 'receptionist', label: 'Recepción / Atención', desc: 'Gestiona la agenda completa, cobros en TPV y clientes' },
  { id: 'admin', label: 'Co-Administrador', desc: 'Acceso total a gestión, finanzas y configuración' }
];

export const StepTeam: React.FC<StepTeamProps> = ({
  teamMembers,
  setTeamMembers,
  planType
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('specialist');
  const [accessMode, setAccessMode] = useState<'invite' | 'calendar_only'>('invite');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const maxSpecialists = planType === 'gold' ? 10 : 4;
  const remainingSlots = Math.max(0, maxSpecialists - 1 - teamMembers.length);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (!fullName.trim()) return;
    if (remainingSlots <= 0) return;

    if (accessMode === 'invite' && !email.trim()) {
      return;
    }

    setTeamMembers(prev => [
      ...prev,
      {
        full_name: fullName.trim(),
        email: accessMode === 'invite' ? email.trim() : undefined,
        role: role,
        send_invite: accessMode === 'invite'
      }
    ]);

    setFullName('');
    setEmail('');
    setRole('specialist');
    setIsRoleDropdownOpen(false);
  };

  const handleRemove = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const currentRoleObj = ROLES.find(r => r.id === role) || ROLES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Encabezado */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] block">
            Paso Opcional · Plan {planType.toUpperCase()}
          </span>
          <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200/60">
            {remainingSlots} huecos disponibles
          </span>
        </div>
        <h3 className="font-serif text-lg text-stone-900 font-bold">
          Equipo y Especialistas del Centro
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Registra a los profesionales que atenderán a tus clientes. Tu cuenta ya está dada de alta como Administrador y Especialista titular de la agenda.
        </p>
      </div>

      {/* Formulario de Alta con Selector de Acceso */}
      <div className="bg-[#FAF9F5]/90 border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
        
        {/* Toggle Modo de Acceso: Con Invitación vs Solo Agenda */}
        <div className="flex items-center gap-2 p-1 bg-stone-200/50 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setAccessMode('invite')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
              accessMode === 'invite'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail size={13} className={accessMode === 'invite' ? 'text-[#d4af37]' : ''} />
            Acceso con Invitación por Email
          </button>
          <button
            type="button"
            onClick={() => setAccessMode('calendar_only')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none ${
              accessMode === 'calendar_only'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar size={13} className={accessMode === 'calendar_only' ? 'text-[#d4af37]' : ''} />
            Solo Columna en Agenda
          </button>
        </div>

        {/* Inputs de Datos */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          
          {/* Nombre */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
              placeholder="Ej. Dra. Laura Soler"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-850 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            />
          </div>

          {/* Luxury Custom Dropdown Rol */}
          <div className="sm:col-span-4 space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              Rol en el Software
            </label>
            
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-3 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all flex items-center justify-between shadow-2xs hover:border-stone-300"
            >
              <span className="truncate">{currentRoleObj.label}</span>
              <ChevronDown size={14} className={`text-stone-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Desplegable Flotante de Lujo */}
            {isRoleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-stone-950 border border-stone-800 rounded-2xl shadow-luxury p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {ROLES.map((r) => {
                  const isSel = r.id === role;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                        isSel ? 'bg-[#d4af37]/15 text-white' : 'text-stone-300 hover:bg-stone-900'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSel ? 'text-[#e6c86e]' : 'text-stone-200'}`}>
                          {r.label}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-normal">
                          {r.desc}
                        </p>
                      </div>
                      {isSel && <Check size={14} className="text-[#d4af37] shrink-0 mt-0.5" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón Añadir */}
          <div className="sm:col-span-3 flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!fullName.trim() || remainingSlots === 0 || (accessMode === 'invite' && !email.trim())}
              className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-sm"
            >
              <Plus size={14} />
              Añadir
            </button>
          </div>

          {/* Email si modo invitación */}
          {accessMode === 'invite' && (
            <div className="sm:col-span-12 space-y-1 animate-in fade-in duration-200 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Mail size={12} className="text-[#d4af37]" />
                Correo Electrónico Corporativo *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                placeholder="laura.soler@tudominio.com"
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-850 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
              />
              <p className="text-[10px] text-stone-400 leading-tight">
                Al finalizar el asistente, ProBookia enviará automáticamente una invitación a este correo para que establezca su contraseña.
              </p>
            </div>
          )}

          {accessMode === 'calendar_only' && (
            <div className="sm:col-span-12 p-2.5 rounded-xl bg-stone-100/80 border border-stone-200/60 text-stone-500 text-[10.5px] leading-relaxed">
              💡 Este profesional aparecerá como columna en el calendario y en la lista de reservas de los clientes, sin necesidad de cuenta de correo ni acceso digital al panel.
            </div>
          )}

        </div>

      </div>

      {/* Lista de Profesionales */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block">
          Equipo Configurado ({teamMembers.length + 1} de {maxSpecialists} profesionales)
        </label>

        {/* Tarjeta Fija del Titular */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-950 text-white border border-stone-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center font-bold text-xs shrink-0">
              <Crown size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xs text-white">Tú (Titular de la Clínica)</p>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#e6c86e] border border-[#d4af37]/30">
                  Administrador General
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                1er Especialista operativo configurado automáticamente en tu agenda
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-lg">
            Activo
          </span>
        </div>

        {/* Lista de miembros añadidos */}
        {teamMembers.map((member, index) => {
          const roleLabel = ROLES.find(r => r.id === member.role)?.label || member.role;
          const isInvite = Boolean(member.email);

          return (
            <div 
              key={index}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs hover:border-stone-300 transition-all animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 font-serif font-black text-xs flex items-center justify-center shrink-0 border border-stone-200">
                  {member.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-xs text-stone-900 truncate">
                      {member.full_name}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {roleLabel}
                    </span>
                    {isInvite ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Mail size={10} /> {member.email}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">
                        Solo Agenda
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-stone-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 ml-2"
                title="Eliminar especialista"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
