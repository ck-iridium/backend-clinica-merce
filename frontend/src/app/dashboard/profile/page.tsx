"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { updatePasswordAndActivate } from '@/app/actions/profile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Extraer token de la URL si venimos de la invitación de Supabase
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('access_token');
      if (token) {
        setAccessToken(token);
        // Limpiar el hash de la URL por seguridad sin recargar la página
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
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
    const result = await updatePasswordAndActivate(password, accessToken);
    setLoading(false);

    if (result.success) {
      toast.success("Cuenta activada correctamente. Contraseña guardada.");
      router.push('/dashboard');
    } else {
      toast.error(result.error || "Error al actualizar la contraseña");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-xl mx-auto mt-20 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#fdf2f3] mb-4 outline outline-4 outline-white shadow-sm">
          <ShieldCheck size={28} className="text-[#d9777f]" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-serif font-semibold text-stone-800 tracking-tight">
          Seguridad de la Cuenta
        </h1>
        <p className="text-stone-400 font-medium">
          {accessToken ? "Establece tu contraseña para activar tu perfil" : "Actualiza tu contraseña de acceso"}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl overflow-hidden p-8">
        {!accessToken ? (
           <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-100 text-center">
            No se detectó el token de invitación en la URL. Si estás intentando activar tu cuenta, por favor usa el enlace exacto del correo electrónico.
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-stone-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-stone-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200 active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {loading ? "Guardando..." : "Guardar y Activar Cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
