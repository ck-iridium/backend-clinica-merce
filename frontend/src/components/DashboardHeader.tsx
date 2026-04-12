'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell, User, Users, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  clinicName: string;
}

export default function DashboardHeader({ clinicName }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-20 bg-background/70 backdrop-blur-2xl border-b border-border/40">

      {/* Search Bar Island */}
      <div className="flex items-center bg-card/60 backdrop-blur-md border border-border/60 rounded-2xl px-4 py-2.5 w-[28rem] shadow-sm opacity-50 cursor-not-allowed">
        <Search size={18} strokeWidth={1.5} className="text-muted-foreground mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Comando rápido: Buscar reservas o clientes..."
          className="bg-transparent border-none outline-none text-sm font-medium w-full text-foreground placeholder:text-muted-foreground/70 cursor-not-allowed"
          disabled
        />
        <span className="text-[10px] font-bold text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-2">⌘K</span>
      </div>

      {/* Quick Actions Island */}
      <div className="flex items-center gap-4">

        {/* Bell — inactiva */}
        <button
          disabled
          className="relative w-11 h-11 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm opacity-50 cursor-not-allowed"
        >
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-destructive border-[1.5px] border-card" />
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 bg-card border border-border/50 py-1.5 pl-1.5 pr-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all group outline-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-inner">
                <User size={16} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-stone-800 leading-tight">Administrador</span>
                <span className="text-[10px] text-muted-foreground font-semibold leading-tight">{clinicName}</span>
              </div>
              <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground ml-1 group-data-[state=open]:rotate-180 transition-transform duration-200" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl border border-stone-100 p-1.5">
            <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-stone-400 px-3 py-2">
              Mi cuenta
            </DropdownMenuLabel>

            <DropdownMenuItem
              disabled
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50"
            >
              <User size={15} strokeWidth={1.5} />
              <span className="font-semibold text-sm">Mi Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50"
            >
              <Users size={15} strokeWidth={1.5} />
              <span className="font-semibold text-sm">Gestión de Usuarios</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 bg-stone-100" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.5} />
              <span className="font-semibold text-sm">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
