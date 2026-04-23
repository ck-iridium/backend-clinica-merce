"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { supabase } from '@/lib/supabase';
import { getUserProfile, updateUserProfile } from '@/app/actions/profile';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, Mail, Shield, Bell, Key, MonitorSmartphone, 
  LogOut, Camera, Save, Loader2, AlertCircle, 
  ChevronRight, Sparkles, CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [receiveEmailAppointments, setReceiveEmailAppointments] = useState(true);
  const [receiveAgendaReminders, setReceiveAgendaReminders] = useState(true);
  
  // Loading states
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [browserInfo, setBrowserInfo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browserName = "Navegador";
      if (ua.match(/chrome|chromium|crios/i)) browserName = "Chrome";
      else if (ua.match(/firefox|fxios/i)) browserName = "Firefox";
      else if (ua.match(/safari/i)) browserName = "Safari";
      const os = ua.match(/Windows/i) ? "Windows" : ua.match(/Mac/i) ? "macOS" : "Dispositivo";
      setBrowserInfo(`${browserName} en ${os}`);
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);
        const { success, profile: profileData } = await getUserProfile(session.user.id);
        if (success && profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setReceiveEmailAppointments(profileData.receive_email_appointments ?? true);
          setReceiveAgendaReminders(profileData.receive_agenda_reminders ?? true);
        }
      } catch (err) {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleUpdateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingIdentity(true);
    try {
      const { success } = await updateUserProfile(profile.id, { full_name: fullName });
      if (success) {
        toast.success("Perfil actualizado con éxito");
        setProfile({ ...profile, full_name: fullName });
      }
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe ser más larga");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) toast.error(error.message);
      else {
        toast.success("Contraseña actualizada");
        setPassword('');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!profile) return;
    setSavingPrefs(true);
    try {
      const { success } = await updateUserProfile(profile.id, { 
        receive_email_appointments: receiveEmailAppointments,
        receive_agenda_reminders: receiveAgendaReminders
      });
      if (success) toast.success("Preferencias guardadas");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user || !profile) return;
    const file = e.target.files[0];
    const filePath = `${user.id}/avatar-${Date.now()}`;
    setUploadingAvatar(true);
    try {
      await supabase.storage.from('avatars').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateUserProfile(profile.id, { avatar_url: publicUrl });
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Foto de perfil actualizada");
    } catch (err) {
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading || loadingRole) {
    return (
      <div className="p-10 max-w-5xl mx-auto space-y-10">
        <Skeleton className="h-20 w-1/3 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Skeleton className="h-[400px] rounded-[2.5rem]" />
          <div className="md:col-span-2 space-y-10">
            <Skeleton className="h-[300px] rounded-[2.5rem]" />
            <Skeleton className="h-[300px] rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-20">
      
      {/* ── Header Elegante ── */}
      <div className="mb-12 relative">
        <div className="absolute -left-10 top-0 w-20 h-20 bg-stone-100 rounded-full blur-3xl opacity-60"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Gestión de Identidad</p>
        <h1 className="text-5xl md:text-6xl font-serif font-medium text-stone-900 tracking-tight">
          Mi Perfil <span className="text-stone-300 font-light ml-2">Digital</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ── COLUMNA IZQUIERDA: Identidad Visual ── */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <div className="bg-white rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] via-[#f3c7cb] to-[#D4AF37] opacity-60"></div>
            
            {/* Avatar con Efecto Aura */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[#fdf2f3] rounded-full blur-2xl opacity-50 scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-stone-100 to-stone-50 shadow-inner overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-stone-50 flex items-center justify-center border border-white shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <User size={60} className="text-stone-200" strokeWidth={1} />
                  )}
                </div>
              </div>
              <label className="absolute bottom-1 right-1 w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:bg-[#d9777f] hover:scale-110 transition-all duration-300 border-4 border-white">
                {uploadingAvatar ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-stone-800 tracking-tight">{profile?.full_name || 'Sin Nombre'}</h2>
              <p className="text-stone-400 font-medium text-sm flex items-center justify-center gap-2">
                <Mail size={14} className="text-stone-300" />
                {user?.email}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="px-5 py-2.5 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-2 shadow-sm">
                <Shield size={16} className="text-[#D4AF37]" />
                <span className="text-xs font-bold text-stone-600 tracking-tighter uppercase">{role}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <Sparkles className="absolute top-4 right-4 text-white/10 w-20 h-20" />
             <h4 className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Estado de Cuenta</h4>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                   <CheckCircle2 className="text-emerald-400" size={24} />
                </div>
                <div>
                   <p className="font-bold text-lg leading-tight">Activo</p>
                   <p className="text-xs text-stone-500">Miembro desde {new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Ajustes Granulares ── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* SECCIÓN 1: Identidad */}
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
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-[1.2rem] pl-14 pr-5 py-4 text-sm text-stone-400 cursor-not-allowed outline-none font-medium italic"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={savingIdentity || fullName === profile?.full_name}
                  className="bg-stone-900 text-white hover:bg-[#d9777f] px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-stone-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3 group"
                >
                  {savingIdentity ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                  Guardar Perfil
                </button>
              </div>
            </form>
          </section>

          {/* SECCIÓN 2: Seguridad */}
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
                       onClick={() => { localStorage.removeItem('user'); router.push('/login'); }}
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

          {/* SECCIÓN 3: Notificaciones */}
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
              <div className="group flex items-center justify-between p-6 rounded-3xl border border-stone-50 hover:bg-stone-50/50 hover:border-stone-100 transition-all cursor-pointer" onClick={() => { setReceiveEmailAppointments(!receiveEmailAppointments); handleUpdatePreferences(); }}>
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
                    onChange={(e) => { setReceiveEmailAppointments(e.target.checked); handleUpdatePreferences(); }} 
                  />
                  <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d9777f] shadow-inner"></div>
                </label>
              </div>

              <div className="group flex items-center justify-between p-6 rounded-3xl border border-stone-50 hover:bg-stone-50/50 hover:border-stone-100 transition-all cursor-pointer" onClick={() => { setReceiveAgendaReminders(!receiveAgendaReminders); handleUpdatePreferences(); }}>
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
                    onChange={(e) => { setReceiveAgendaReminders(e.target.checked); handleUpdatePreferences(); }} 
                  />
                  <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d9777f] shadow-inner"></div>
                </label>
              </div>

              <div className="mt-8 p-6 bg-[#D4AF37]/5 rounded-[2rem] border border-[#D4AF37]/10 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <Sparkles size={18} />
                 </div>
                 <p className="text-[11px] text-stone-500 leading-relaxed">
                    Las preferencias se guardan automáticamente al interactuar con los selectores. No es necesario realizar acciones adicionales.
                 </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
