"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : authError.message);
      }
      
      // Simulamos la estructura de usuario de FastAPI para mantener retrocompatibilidad inmediata con el hook useAuthRole
      // Guardamos el token en caso de necesitarlo para acciones futuras
      const userPayload = {
        email: data.user.email,
        id: data.user.id,
        access_token: data.session.access_token
      };
      
      localStorage.setItem('user', JSON.stringify(userPayload));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 relative overflow-hidden">
      {/* Dynamic background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f3c7cb] rounded-full blur-[100px] opacity-40"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-[100px] opacity-20"></div>

      <div className="max-w-md w-full glass-card rounded-[2rem] shadow-2xl p-10 relative z-10 border border-white/50">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#fdf2f3] mb-6 shadow-inner">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Panel Administrativo</h1>
          <p className="text-stone-500 font-medium">Clínica Mercè</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Correo electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
              placeholder="merce@clinicamerce.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        
        <div className="mt-10 text-center">
          <a href="/" className="text-sm font-medium text-stone-400 hover:text-[#d9777f] transition-colors">← Volver al sitio público</a>
        </div>
      </div>
    </div>
  );
}
