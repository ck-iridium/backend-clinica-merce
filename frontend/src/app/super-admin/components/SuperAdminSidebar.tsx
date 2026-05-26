"use client"

import { Building, Activity, DollarSign, Settings, LogOut, User, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SuperAdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SuperAdminSidebar({ activeTab, setActiveTab }: SuperAdminSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-20 md:w-24 bg-white border-r border-stone-200/50 flex flex-col items-center py-8 justify-between flex-shrink-0">
      <div className="flex flex-col items-center gap-12">
        {/* Logo Premium */}
        <div 
          onClick={() => setActiveTab('tenants')}
          className="w-12 h-12 bg-stone-900 text-[#d4af37] rounded-2xl flex items-center justify-center font-serif font-black text-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
        >
          P
        </div>
        
        {/* Menú de Iconos */}
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('tenants')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'tenants' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="Compañías"
          >
            <Building className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'analytics' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="Rendimiento"
          >
            <Activity className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'finance' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="Facturación"
          >
            <DollarSign className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'settings' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="Configuración Global SaaS"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('cms')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'cms' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="CMS Portada & Marketing"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === 'profile' ? 'text-[#d4af37] bg-[#fcf8e5] shadow-sm' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'}`} 
            title="Mi Perfil Administrativo"
          >
            <User className="w-5 h-5" />
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
