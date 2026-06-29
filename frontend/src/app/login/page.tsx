"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [tenantName, setTenantName] = useState('Probookia');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
      const welcomeParam = params.get('welcome');
      if (welcomeParam === 'true') {
        setSuccess('¡Tu portal de reservas está activo! Por seguridad, introduce tu contraseña para acceder.');
      }

      const hostname = window.location.hostname.toLowerCase();
      if (hostname.includes('.localhost') && hostname !== 'localhost') {
        const sub = hostname.split('.')[0];
        setTenantName(sub === 'merce' ? 'Estética Mercè' : sub.charAt(0).toUpperCase() + sub.slice(1));
      } else if (hostname.endsWith('.probookia.com')) {
        const sub = hostname.replace('.probookia.com', '');
        setTenantName(sub === 'merce' ? 'Estética Mercè' : sub.charAt(0).toUpperCase() + sub.slice(1));
      } else if (hostname.includes('esteticamerce.com')) {
        setTenantName('Estética Mercè');
      } else {
        setTenantName('Probookia SaaS');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : authError.message);
      }
      
      const userPayload = {
        email: data.user.email,
        id: data.user.id,
        access_token: data.session.access_token
      };
      
      const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
      localStorage.setItem('user', JSON.stringify(userPayload));
      
      if (role === 'super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const redirectToUrl = `${window.location.origin}/restablecer-contrasena`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada o spam.');
    } catch (err: any) {
      setError(err.message === 'Email not found' ? 'El correo ingresado no está registrado' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 relative overflow-hidden">
      {/* Dynamic background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f3c7cb] rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-[100px] opacity-20"></div>

      <div className="max-w-md w-full glass-card rounded-[2rem] shadow-2xl p-10 relative z-10 border border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#fdf2f3] mb-6 shadow-inner">
            <span className="text-2xl">{isForgotPassword ? '✉️' : '🔐'}</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isForgotPassword ? 'Recuperar Contraseña' : 'Panel Administrativo'}
          </h1>
          <p className="text-stone-500 font-medium">{tenantName}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm text-center border border-green-100">
            {success}
          </div>
        )}

        {!isForgotPassword ? (
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Correo electrónico</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
                placeholder="admin@tudominio.com" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-stone-700">Contraseña</label>
                <button 
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsForgotPassword(true);
                  }}
                  className="text-xs font-semibold text-[#d9777f] hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
                placeholder="••••••••" 
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-stone-900 focus:outline-none hover:bg-[#d9777f] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-8 active:scale-[0.98]">
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Ingresa tu correo registrado</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
                placeholder="correo@ejemplo.com" 
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-stone-900 focus:outline-none hover:bg-[#d9777f] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-8 active:scale-[0.98]">
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setIsForgotPassword(false);
                }}
                className="text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors focus:outline-none"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-10 text-center">
          <a href="/" className="text-sm font-medium text-stone-400 hover:text-[#d9777f] transition-colors">← Volver al sitio público</a>
        </div>
      </div>
    </div>
  );
}
