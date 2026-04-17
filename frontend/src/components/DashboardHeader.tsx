"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Users, LogOut, ChevronDown } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsPopover } from './NotificationsPopover';
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
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <header className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-20 bg-transparent border-none">

        {/* Search Bar Island — Ahora es un Trigger */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/30 transition-all rounded-2xl px-4 py-2.5 w-[28rem] shadow-sm text-left group"
        >
          <Search size={18} strokeWidth={1.5} className="text-muted-foreground mr-3 shrink-0 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-muted-foreground/70 flex-1">
            Comando rápido: Buscar reservas o clientes...
          </span>
          <span className="text-[10px] font-bold text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-2 text-stone-400">Ctrl K</span>
        </button>

        {/* Quick Actions Island */}
        <div className="flex items-center gap-4">

        <NotificationsPopover />

      </div>
    </header>

    <GlobalSearch open={open} setOpen={setOpen} />
    </>
  );
}

