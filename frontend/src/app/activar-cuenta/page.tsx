"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react';
import { updatePasswordAndActivate } from '@/app/actions/profile';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ActivarCuentaPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorUrl, setErrorUrl] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkToken = async () => {
      if (typeof window === 'undefined') return;

      let token = null;

      // 1. Intentar extraer del hash (método estándar de invitación)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (hashToken && type === 'invite') {
           token = hashToken;
           setAccessToken(token);
           // Limpiar el hash para seguridad
           window.history.replaceState(null, '', window.location.pathname);
        }
      }

      // 2. Si no hay token en hash, o acabamos de limpiarlo, 
      // verificamos si Supabase ya ha establecido una sesión (común en móviles)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Usamos el token de la sesión activa
        const sessionToken = session.access_token;
        setAccessToken(sessionToken);
        if (session.user?.email) setUserEmail(session.user.email);
      } else if (token) {
        // Si teníamos token del hash pero no hay sesión aún, cargamos el usuario
        const { data } = await supabase.auth.getUser(token);
        if (data.user?.email) setUserEmail(data.user.email);
      } else {
        // Solo marcar error si realmente no hay rastro de invitación ni sesión
        setErrorUrl(true);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!accessToken) {
      toast.error("Falta el token de seguridad. Vuelve a hacer clic en el enlace del correo.");
      return;
    }

    setLoading(true);
    // Ejecutamos la acción del servidor que actualiza Auth y la tabla profiles
    const result = await updatePasswordAndActivate(password, accessToken);

    if (result.success) {
      toast.success("Cuenta activada correctamente. Redirigiendo al sistema...");
      
      // Realizamos un login automático con la nueva contraseña para asegurar la sesión
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password
      });

      if (!signInError && signInData.session) {
         // Recreamos el formato esperado por el hook useAuthRole
         const userPayload = {
            email: signInData.session.user.email,
            id: signInData.session.user.id,
            access_token: signInData.session.access_token
         };
         localStorage.setItem('user', JSON.stringify(userPayload));
      }
      
      // Pequeño delay para UX fluida
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } else {
      setLoading(false);
      toast.error(result.error || "Error al activar la cuenta. Inténtalo de nuevo o solicita una nueva invitación.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 relative py-12">
      {/* Dynamic background lights (Diseño Premium heredado) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f3c7cb] rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-[100px] opacity-20"></div>

      <div className="max-w-md w-full glass-card bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-white/50 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-[#fdf2f3] mb-6 shadow-inner outline outline-4 outline-white">
            <ShieldCheck size={32} className="text-[#d9777f]" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-stone-800 tracking-tight mb-2">
            Activa tu cuenta
          </h1>
          <p className="text-stone-500 font-medium text-sm px-2">
            Establece una contraseña segura para acceder a tu panel de gestión.
          </p>
        </div>

        {errorUrl ? (
           <div className="p-5 bg-amber-50 text-amber-700 rounded-2xl text-sm border border-amber-100 flex flex-col items-center text-center gap-3 animate-in fade-in">
              <AlertCircle size={24} className="text-amber-500" />
              <p>No se detectó un token válido de invitación.</p>
              <p className="text-xs opacity-80">Por favor, asegúrate de haber hecho clic en el enlace completo que recibiste en tu correo electrónico.</p>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo oculto para que el gestor de contraseñas asocie la clave al email correcto */}
            <input 
              type="text" 
              name="username" 
              value={userEmail} 
              readOnly 
              autoComplete="username" 
              className="hidden" 
            />

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 px-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-stone-400" />
                </div>
                <input
                  type="password"
                  name="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] focus:bg-white transition-all shadow-sm"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 px-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-stone-400" />
                </div>
                <input
                  type="password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] focus:bg-white transition-all shadow-sm"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-stone-200 active:scale-[0.98] mt-8 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {loading ? "Activando cuenta..." : "Guardar y Entrar"}
            </button>
          </form>
        )}
      </div>
      
      {/* Decorative Brand footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-300">CLÍNICA MERCÈ</p>
      </div>
    </div>
  );
}
