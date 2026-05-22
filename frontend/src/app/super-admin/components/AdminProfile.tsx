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
  KeyRound, 
  Upload 
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 1. Upload Avatar Image to FastAPI with Client-side Compression to WebP (1:1 aspect ratio)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    setUploadingAvatar(true);
    const loadingToast = toast.loading('Comprimiendo y optimizando imagen a WebP...');

    try {
      // Crear objeto de imagen
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Dimensionar a 300x300 en un canvas de alto rendimiento (relación de aspecto 1:1)
      const canvas = document.createElement('canvas');
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo inicializar el procesador de imágenes.');
      }

      // Calcular recorte de aspecto cuadrado centrado (cover)
      const srcWidth = img.width;
      const srcHeight = img.height;
      let srcX = 0;
      let srcY = 0;
      let drawSize = srcWidth;

      if (srcWidth > srcHeight) {
        drawSize = srcHeight;
        srcX = (srcWidth - srcHeight) / 2;
      } else {
        drawSize = srcWidth;
        srcY = (srcHeight - srcWidth) / 2;
      }

      ctx.drawImage(img, srcX, srcY, drawSize, drawSize, 0, 0, size, size);

      // Convertir a blob en formato moderno WebP
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.82);
      });

      if (!blob) {
        throw new Error('Error al comprimir la imagen de perfil.');
      }

      const compressedFile = new File([blob], 'avatar.webp', { type: 'image/webp' });
      const formData = new FormData();
      formData.append('file', compressedFile);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Error al subir el archivo al servidor');
      }

      const data = await res.json();
      setProfileAvatar(data.url);
      toast.success('Imagen optimizada y subida con éxito en formato WebP', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor de subida', { id: loadingToast });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 2. Update Profile (Identity/Avatar)
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

  // 3. Update Password (Credentials)
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
    <section className="flex-1 w-full h-full bg-[#FAFAFA] flex flex-col lg:flex-row p-0 overflow-hidden select-none">
      
      {/* Menú Lateral Izquierdo de Pestañas (Pegado a la barra de accesos principal de la app) */}
      <aside className="w-full lg:w-80 shrink-0 bg-white border-r border-stone-200/50 flex flex-col p-8 justify-between h-full">
        <div className="space-y-10">
          
          {/* Cabecera del Panel de Control */}
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1.5 font-sans">
              Consola SaaS
            </span>
            <h2 className="text-2.5xl font-serif font-black text-stone-900 tracking-tight leading-none">
              Mi Cuenta
            </h2>
            <p className="text-[11px] font-sans text-stone-400 mt-2 font-medium leading-relaxed">
              Configuración y credenciales de soporte técnico global.
            </p>
          </div>

          {/* Listado de Pestañas Elegantes */}
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Resumen General', description: 'Vista global y privilegios', icon: Layers },
              { id: 'identity', label: 'Identidad del Perfil', description: 'Nombre y avatar de soporte', icon: User },
              { id: 'security', label: 'Seguridad y Acceso', description: 'Credenciales del Super-Admin', icon: Lock }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeSubTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`w-full text-left p-4 flex items-start gap-4 transition-all duration-300 rounded-2xl ${
                    isActive 
                      ? 'bg-[#fcf8e5] text-stone-900 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50/50 bg-transparent'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-[#d4af37] text-white shadow-sm' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs uppercase tracking-wider block font-bold ${isActive ? 'text-stone-900 font-extrabold' : 'text-stone-500'}`}>
                      {tab.label}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5 truncate font-medium">
                      {tab.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Badge de Seguridad e Info del Rol en la parte inferior */}
        <div className="mt-10 lg:mt-0 pt-6 border-t border-stone-100 flex flex-col gap-4">
          <div className="bg-[#fcf8e5] text-[#d4af37] border border-[#d4af37]/20 px-4 py-3 rounded-2xl text-[10px] font-bold font-sans shadow-sm flex items-center justify-center gap-2 w-full uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Acceso Super Admin
          </div>
          <div className="text-center">
            <p className="text-[9px] text-stone-400 font-mono tracking-widest uppercase">
              Clínica Mercè v2.5.0
            </p>
          </div>
        </div>
      </aside>

      {/* Contenedor del Contenido Dinámico a la Derecha (Con Máximo Oxígeno y Espacios) */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] pt-8 px-8 md:px-14 lg:px-20 xl:px-24 pb-12 md:pb-16 lg:pb-24 space-y-12 min-w-0">
        
        {/* Cabecera Activa con Animación sutil */}
        <div className="space-y-2 border-b border-stone-200/40 pb-8 animate-in fade-in duration-300">
          <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block font-mono">
            {activeSubTab === 'overview' && 'Dashboard de Soporte'}
            {activeSubTab === 'identity' && 'Identidad Corporativa'}
            {activeSubTab === 'security' && 'Credenciales Globales'}
          </span>
          <h1 className="text-4xl font-serif font-bold text-stone-900 leading-tight">
            {activeSubTab === 'overview' && 'Resumen General'}
            {activeSubTab === 'identity' && 'Datos de Identidad'}
            {activeSubTab === 'security' && 'Seguridad de Consola'}
          </h1>
          <p className="text-sm font-sans text-stone-500 font-medium max-w-xl leading-relaxed">
            {activeSubTab === 'overview' && 'Monitoreo en vivo de privilegios operacionales del sistema, estado de sesión actual y metadatos de identidad del Super Administrador.'}
            {activeSubTab === 'identity' && 'Actualice su nombre público de soporte técnico y su avatar de representación. Estos datos se utilizarán para la impersonación segura de clínicas.'}
            {activeSubTab === 'security' && 'Configure la contraseña maestra del Super Administrador para accesos futuros y mantenga la cuenta con los más altos estándares de protección.'}
          </p>
        </div>

        {/* Contenido Dinámico por pestaña */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start w-full">
              
              {/* Tarjeta de Cuenta Premium */}
              <div className="xl:col-span-4 bg-white rounded-3xl border border-stone-200/30 p-10 shadow-sm flex flex-col items-center text-center relative overflow-hidden w-full transition-all duration-300 hover:shadow-luxury">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
                
                {/* Avatar con Anillo de Lujo Compacto */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#d4af37]/45 p-1 bg-stone-50 shadow-inner mb-4 relative group">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Avatar Super Admin" 
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105" 
                      onError={(e) => { (e.target as any).src = ''; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center font-bold text-2.5xl font-serif">
                      SA
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold font-serif text-stone-900 leading-tight w-full truncate px-1">
                  {user?.full_name || 'Administrador Global'}
                </h3>
                
                {/* Correo con Fuente Inteligente para Evitar Desbordes */}
                <span 
                  className="text-xs font-semibold text-stone-500 font-mono break-all leading-normal text-center w-full px-2 mt-3 select-all hover:text-stone-800 transition-colors block"
                  title={user?.email}
                >
                  {user?.email}
                </span>

                <div className="w-full border-t border-stone-100 mt-8 pt-6 space-y-4 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Rol de Sistema</span>
                    <span className="bg-stone-900 text-white px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      SUPERADMIN
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Nivel de Consola</span>
                    <span className="text-stone-800 font-bold font-mono">Tier 5 (Master)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-bold uppercase tracking-wider">Estado de Sesión</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Grid de Privilegios y Alertas de Seguridad */}
              <div className="xl:col-span-8 space-y-8 w-full">
                
                {/* Bento Grid de Privilegios */}
                <div className="bg-white rounded-3xl border border-stone-200/30 p-10 shadow-sm space-y-8 relative overflow-hidden transition-all duration-300 hover:shadow-luxury">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-900"></div>
                  
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#d4af37]" /> Privilegios Globales Habilitados
                    </h3>
                    <p className="text-xs text-stone-400 font-sans mt-1">
                      Capacidades operacionales asociadas a tu rol de administración global.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 transition-all duration-300 hover:bg-white hover:shadow-sm">
                      <span className="w-12 h-12 rounded-xl bg-white border border-stone-200/40 flex items-center justify-center text-stone-700 shrink-0 shadow-sm text-xl">
                        🏢
                      </span>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Impersonación de Clínicas</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                          Habilidad para ingresar en modo soporte a cualquier inquilino del SaaS para solventar incidencias en vivo.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 transition-all duration-300 hover:bg-white hover:shadow-sm">
                      <span className="w-12 h-12 rounded-xl bg-white border border-stone-200/40 flex items-center justify-center text-stone-700 shrink-0 shadow-sm text-xl">
                        🛡️
                      </span>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Ajustes del Core</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                          Control de indexación global en buscadores de la landing corporativa y configuraciones estructurales.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 transition-all duration-300 hover:bg-white hover:shadow-sm">
                      <span className="w-12 h-12 rounded-xl bg-white border border-stone-200/40 flex items-center justify-center text-stone-700 shrink-0 shadow-sm text-xl">
                        📊
                      </span>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Finanzas Globales</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                          Acceso total al MRR estimado, ARPU del SaaS, y pasarela de cobros en Stripe de los clientes.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 transition-all duration-300 hover:bg-white hover:shadow-sm">
                      <span className="w-12 h-12 rounded-xl bg-white border border-stone-200/40 flex items-center justify-center text-stone-700 shrink-0 shadow-sm text-xl">
                        ⚙️
                      </span>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Seguridad Total</h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                          Derechos absolutos para restablecer credenciales y administrar la infraestructura B2B.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Banner de Recomendación Premium */}
                <div className="bg-[#fcf8e5]/40 border border-[#d4af37]/20 rounded-3xl p-8 flex gap-5 items-start w-full">
                  <span className="w-10 h-10 rounded-full bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center shrink-0 text-md font-bold shadow-sm">
                    !
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs font-bold text-stone-900 font-serif uppercase tracking-wider">Aviso de Seguridad de Soporte</h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                      Al actuar como personal técnico para las clínicas asociadas, tu nombre y foto de perfil de soporte se usarán para identificarte en registros de auditoría y soporte directo. Mantén estos datos actualizados para proyectar una imagen profesional y de confianza.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: IDENTITY */}
          {activeSubTab === 'identity' && (
            <div className="bg-white rounded-3xl border border-stone-200/30 p-10 md:p-12 shadow-sm relative overflow-hidden max-w-xl w-full">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-stone-100">
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
                
                {/* Campo de Nombre */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">Nombre de Soporte Técnico</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ej. Juan - Soporte Clínico"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-5 py-4 text-xs font-medium outline-none transition-all animate-none"
                  />
                  <span className="text-[10px] text-stone-400 font-sans block mt-1">Este nombre aparecerá cuando asistas a clínicas de forma impersonada.</span>
                </div>

                {/* Subidor de Imagen de Avatar Interactivo */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">Imagen de Perfil (Avatar)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-200/50 w-full">
                    
                    {/* Visualizador Compacto */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#d4af37]/45 bg-white shadow-sm shrink-0 flex items-center justify-center relative">
                      {uploadingAvatar ? (
                        <div className="w-full h-full bg-[#fcf8e5] text-[#d4af37] flex flex-col items-center justify-center gap-1.5">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar de Soporte" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#d4af37] font-serif font-bold text-2xl font-sans">SA</span>
                      )}
                    </div>

                    {/* Controles de carga */}
                    <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                        <label className={`bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer inline-flex items-center gap-2 ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarUpload} 
                            className="sr-only" 
                            disabled={uploadingAvatar}
                          />
                          <Upload className="w-4 h-4" />
                          <span>Subir Archivo</span>
                        </label>
                        
                        {profileAvatar && (
                          <button
                            type="button"
                            onClick={() => setProfileAvatar('')}
                            className="border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 font-sans leading-normal">
                        Soporta imágenes PNG, JPG o WEBP. Conexión automática con el servidor FastAPI de la clínica.
                      </p>
                    </div>
                  </div>

                  {/* Respaldo manual por URL si el usuario lo necesita */}
                  <div className="space-y-2 pt-4 border-t border-stone-100 w-full">
                    <label className="text-[10px] font-bold text-stone-450 block uppercase tracking-wider">O introduce una URL manual</label>
                    <input 
                      type="text" 
                      value={profileAvatar} 
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      placeholder="https://ejemplo.com/tu-avatar.jpg"
                      className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-5 py-4 text-xs font-mono outline-none transition-all animate-none"
                    />
                  </div>
                </div>

                {/* Botón de Enviar */}
                <button 
                  type="submit" 
                  disabled={updatingProfile || uploadingAvatar}
                  className="w-full bg-stone-950 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-4 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando Cambios...
                    </>
                  ) : (
                    'Actualizar Datos de Identidad'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeSubTab === 'security' && (
            <div className="bg-white rounded-3xl border border-stone-200/30 p-10 md:p-12 shadow-sm relative overflow-hidden max-w-xl w-full">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-900"></div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-stone-100">
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

              <form onSubmit={handleUpdatePassword} className="space-y-8 animate-none">
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex gap-4 w-full">
                  <KeyRound className="w-6 h-6 text-stone-400 shrink-0 mt-0.5 animate-none" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Credenciales del Super-Admin</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-1 font-medium">
                      Al actualizar la contraseña maestra, tu sesión se mantendrá activa pero los futuros inicios de sesión en dispositivos nuevos requerirán la nueva clave. Se actualizará en tiempo real en los servidores globales de Supabase Auth.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <label className="text-xs font-bold text-stone-700 block uppercase tracking-wider">Nueva Contraseña Maestra</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl px-5 py-4 text-xs font-medium outline-none transition-all animate-none"
                  />
                  <span className="text-[10px] text-stone-400 font-sans block mt-1">Por favor, usa una clave segura con números, letras y caracteres especiales.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={updatingPassword}
                  className="w-full bg-[#d4af37] hover:bg-[#b08e23] text-stone-950 hover:text-white font-bold py-4 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
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
