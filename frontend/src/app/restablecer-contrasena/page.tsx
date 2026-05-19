"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RestablecerContrasenaPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess('¡Tu contraseña ha sido restablecida con éxito! Redirigiéndote al inicio de sesión...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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

      <div className="max-w-md w-full glass-card rounded-[2rem] shadow-2xl p-10 relative z-10 border border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#fdf2f3] mb-6 shadow-inner">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Restablecer Contraseña</h1>
          <p className="text-stone-500 font-medium">Ingresa tu nueva contraseña a continuación</p>
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

        <form className="space-y-5" onSubmit={handleUpdatePassword}>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Nueva Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9777f] focus:border-transparent transition-all shadow-sm" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            disabled={loading || !!success}
            className="w-full bg-stone-900 focus:outline-none hover:bg-[#d9777f] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-colors mt-8 active:scale-[0.98]">
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
