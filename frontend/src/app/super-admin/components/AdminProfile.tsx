"use client"

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  Award, 
  ShieldCheck, 
  Loader2, 
  Layers, 
  Activity, 
  KeyRound, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';

interface AdminProfileProps {
  user: any;
  setUser: (user: any) => void;
}

export default function AdminProfile({ user, setUser }: AdminProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'identity' | 'security'>('overview');
  
  // States for forms
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar_url || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 1. Update Profile (Identity/Avatar)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const loadingToast = toast.loading('Actualizando perfil de soporte...');
    try {
      const { error, data } = await supabase.auth.updateUser({
        data: {
          full_name: profileName,
          avatar_url: profileAvatar
        }
      });
      if (error) throw error;
      
      setUser({
        ...user,
        full_name: data.user?.user_metadata?.full_name || '',
        avatar_url: data.user?.user_metadata?.avatar_url || ''
      });
      toast.success('Perfil administrativo de soporte actualizado con éxito', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil de soporte', { id: loadingToast });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 2. Update Password (Credentials)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Por favor, introduce una contraseña válida.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setUpdatingPassword(true);
    const loadingToast = toast.loading('Actualizando contraseña de Super Admin...');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Contraseña de Super Admin actualizada con éxito', { id: loadingToast });
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la contraseña', { id: loadingToast });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <section className="flex-1 bg-[#FAFAFA] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Breadcrumb e Header de la Pestaña */}
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 border-b border-stone-150 pb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Mi Cuenta Administrativa
            </h2>
            <p className="text-xs font-sans text-stone-400 mt-1 uppercase tracking-widest font-semibold">
              Consola global de seguridad y personalización de soporte técnico
            </p>
          </div>
          <div className="bg-[#fcf8e5] text-[#d4af37] border border-[#d4af37]/20 px-4 py-2 rounded-2xl text-xs font-bold font-sans shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Acceso Super Admin
          </div>
        </div>

        {/* Barra de Sub-Pestañas Superior Estilo SaaS Premium */}
        <div className="bg-white rounded-2xl border border-stone-200/30 overflow-hidden shadow-sm flex">
          {[
            { id: 'overview', label: 'Resumen', icon: Layers },
            { id: 'identity', label: 'Identidad del Perfil', icon: User },
            { id: 'security', label: 'Seguridad y Acceso', icon: Lock }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 px-4 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all border-b-2 ${
                  isActive 
                    ? 'border-[#d4af37] text-stone-900 bg-stone-50/40 font-extrabold' 
                    : 'border-transparent text-stone-400 hover:text-stone-700 bg-transparent font-medium'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido Dinámico de Sub-Pestañas */}
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW / RESUMEN */}
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tarjeta de Cuenta Premium */}
              <div className="md:col-span-1 bg-white rounded-3xl border border-stone-200/30 p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden h-fit">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
                
                {/* Gran Avatar con Anillo Dorado de Lujo */}
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-[#d4af37]/45 p-1 bg-stone-50 shadow-inner mb-5 relative group">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Avatar Super Admin" 
                      className="w-full h-full object-cover rounded-[1.25rem] transition-transform duration-300 group-hover:scale-105" 
                      onError={(e) => { (e.target as any).src = ''; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-[1.25rem] bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center font-bold text-2xl font-serif">
                      SA
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold font-serif text-stone-900 leading-tight">
                  {user?.full_name || 'Administrador Global'}
                </h3>
                <span className="text-xxs font-black text-stone-400 uppercase tracking-widest mt-1 block">
                  {user?.email}
                </span>

                <div className="w-full border-t border-stone-100 my-6 pt-5 space-y-4 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Rol de Sistema</span>
                    <span className="bg-stone-900 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      SUPERADMIN
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Nivel de Consola</span>
                    <span className="text-stone-800 font-bold font-mono">Tier 5 (Master)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Estado de Sesión</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Mosaico Bento de Privilegios y Alerta de Seguridad */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-stone-200/30 p-8 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-900"></div>
                  
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#d4af37]" /> Privilegios Globales Habilitados
                    </h3>
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                      Capacidades operacionales asociadas a tu rol de administración global
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100/50 flex gap-4">
                      <span className="w-10 h-10 rounded-xl bg-white border border-stone-250 flex items-center justify-center text-stone-700 shrink-0 shadow-sm">
                        🏢
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-stone-850">Impersonación de Clínicas</h4>
                        <p className="text-[10px] text-stone-500 leading-relaxed">
                          Habilidad para ingresar en modo soporte a cualquier inquilino del SaaS para solventar incidencias en vivo.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100/50 flex gap-4">
                      <span className="w-10 h-10 rounded-xl bg-white border border-stone-250 flex items-center justify-center text-stone-700 shrink-0 shadow-sm">
                        🛡️
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-stone-850">Ajustes del Core</h4>
                        <p className="text-[10px] text-stone-500 leading-relaxed">
                          Control de indexación global en buscadores de la landing corporativa y configuraciones estructurales.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100/50 flex gap-4">
                      <span className="w-10 h-10 rounded-xl bg-white border border-stone-250 flex items-center justify-center text-stone-700 shrink-0 shadow-sm">
                        📊
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-stone-850">Finanzas Globales</h4>
                        <p className="text-[10px] text-stone-500 leading-relaxed">
                          Acceso total al MRR estimado, ARPU del SaaS, y pasarela de cobros en Stripe de los clientes.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100/50 flex gap-4">
                      <span className="w-10 h-10 rounded-xl bg-white border border-stone-250 flex items-center justify-center text-stone-700 shrink-0 shadow-sm">
                        ⚙️
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-stone-850">Seguridad Total</h4>
                        <p className="text-[10px] text-stone-500 leading-relaxed">
                          Derechos absolutos para restablecer credenciales y administrar la infraestructura B2B.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Banner de Recomendación Premium (Quiet Luxury Alert) */}
                <div className="bg-[#fcf8e5]/40 border border-[#d4af37]/20 rounded-3xl p-6 flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center shrink-0 text-sm font-semibold">
                    !
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-stone-900 font-serif">Aviso de Seguridad de Soporte</h4>
                    <p className="text-[10px] text-stone-600 leading-relaxed">
                      Al actuar como personal técnico para las clínicas asociadas, tu nombre y foto de perfil de soporte se usarán para identificarte en registros de auditoría y soporte directo. Mantén estos datos actualizados para proyectar una imagen profesional y de confianza.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY / IDENTIDAD */}
          {activeSubTab === 'identity' && (
            <div className="bg-white rounded-3xl border border-stone-200/30 p-8 md:p-10 shadow-sm relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
              
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-stone-100">
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">Datos de Identidad</h3>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold mt-0.5">
                    Modificar nombre y avatar visible de soporte
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Avatar de Soporte" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = ''; }} />
                    ) : (
                      <span className="text-[#d4af37] font-serif font-bold text-lg">SA</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-stone-850 block truncate">{profileName || 'Administrador Global'}</span>
                    <span className="text-[10px] text-stone-400 font-medium truncate block">{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">Nombre de Soporte Técnico</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ej. Juan - Soporte Clínico"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all"
                  />
                  <span className="text-[9px] text-stone-400 font-sans block">Este nombre aparecerá cuando asistas a clínicas de forma impersonada.</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">URL de Imagen de Perfil (Avatar)</label>
                  <input 
                    type="text" 
                    value={profileAvatar} 
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="https://ejemplo.com/tu-avatar.jpg"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-4 py-3 text-xs font-mono outline-none transition-all"
                  />
                  <span className="text-[9px] text-stone-400 font-sans block">Introduce un enlace HTTP directo a una imagen PNG/JPG.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={updatingProfile}
                  className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando Cambios...
                    </>
                  ) : (
                    'Actualizar Datos'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY / SEGURIDAD */}
          {activeSubTab === 'security' && (
            <div className="bg-white rounded-3xl border border-stone-200/30 p-8 md:p-10 shadow-sm relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-900"></div>
              
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-stone-100">
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">Cambiar Contraseña</h3>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold mt-0.5">
                    Actualizar las credenciales maestras de acceso a la Consola SaaS
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4">
                  <KeyRound className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Credenciales del Super-Admin</h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed mt-1">
                      Al actualizar la contraseña maestra, tu sesión se mantendrá activa pero los futuros inicios de sesión en dispositivos nuevos requerirán la nueva clave. Se actualizará en tiempo real en los servidores globales de Supabase Auth.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">Nueva Contraseña Maestra</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all animate-none"
                  />
                  <span className="text-[9px] text-stone-400 font-sans block">Por favor, usa una clave segura con números, letras y caracteres especiales.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={updatingPassword}
                  className="w-full bg-[#d4af37] hover:bg-[#b08e23] text-stone-950 hover:text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando Clave...
                    </>
                  ) : (
                    'Establecer Nueva Contraseña'
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
