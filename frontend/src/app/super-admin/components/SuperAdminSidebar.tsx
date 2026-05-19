"use client"

import { Building, Activity, DollarSign, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SuperAdminSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-20 md:w-24 bg-white border-r border-stone-200/50 flex flex-col items-center py-8 justify-between flex-shrink-0">
      <div className="flex flex-col items-center gap-12">
        {/* Logo Premium */}
        <div className="w-12 h-12 bg-stone-900 text-[#d4af37] rounded-2xl flex items-center justify-center font-serif font-black text-xl shadow-md transition-transform hover:scale-105 cursor-pointer">
          P
        </div>
        
        {/* Menú de Iconos */}
        <nav className="flex flex-col gap-6">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-[#d4af37] bg-[#fcf8e5] shadow-sm transition-all" title="Compañías">
            <Building className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all" title="Rendimiento">
            <Activity className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all" title="Facturación">
            <DollarSign className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all" title="Configuración">
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Salida / LogOut */}
      <button 
        onClick={handleLogout}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all" 
        title="Cerrar Sesión"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  );
}
