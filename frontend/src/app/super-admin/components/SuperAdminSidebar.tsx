"use client"

import { Building, Activity, DollarSign, Settings, LogOut, User, Globe, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SuperAdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function SuperAdminSidebar({ activeTab, setActiveTab }: SuperAdminSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigate = (tab: string) => {
    if (tab === 'docs-cms') {
      router.push('/super-admin/docs-cms')
    } else {
      setActiveTab(tab)
      if (typeof window !== 'undefined' && window.location.pathname !== '/super-admin') {
        router.push('/super-admin')
      }
    }
  }

  const navItems = [
    { id: 'tenants', label: 'Compañías', icon: Building },
    { id: 'analytics', label: 'Rendimiento', icon: Activity },
    { id: 'finance', label: 'Facturación', icon: DollarSign },
    { id: 'settings', label: 'Configuración Global', icon: Settings },
    { id: 'cms', label: 'CMS Portada & Marketing', icon: Globe },
    { id: 'docs-cms', label: 'CMS Documentación', icon: FileText },
    { id: 'profile', label: 'Mi Perfil Admin', icon: User },
  ]

  return (
    <aside className="w-20 md:w-24 bg-white/90 backdrop-blur-xl border-r border-stone-200/70 flex flex-col items-center py-7 justify-between flex-shrink-0 z-30 select-none shadow-[2px_0_15px_-4px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col items-center gap-10">
        {/* Monograma Oficial ProBookia */}
        <div
          onClick={() => handleNavigate('tenants')}
          className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 border border-[#D4AF37]/35 shadow-md shadow-[#D4AF37]/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D4AF37]/20 cursor-pointer group"
          title="ProBookia Master Backoffice"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />
          <span className="font-serif text-xl font-bold bg-gradient-to-br from-amber-100 via-[#D4AF37] to-amber-600 bg-clip-text text-transparent">
            P
          </span>
        </div>

        {/* Menú de Navegación Vertical */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group focus:outline-none",
                  isActive
                    ? "text-[#D4AF37] bg-[#FAF8F2] shadow-sm font-semibold border border-[#D4AF37]/25"
                    : "text-stone-400 hover:text-stone-900 hover:bg-stone-50"
                )}
                title={item.label}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#D4AF37] rounded-r-full" />
                )}
                <Icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", isActive && "text-[#D4AF37]")} />
              </button>
            )
          })}
        </nav>
      </div>

      {/* Salida / LogOut */}
      <button
        onClick={handleLogout}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 focus:outline-none group"
        title="Cerrar Sesión"
      >
        <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      </button>
    </aside>
  )
}
