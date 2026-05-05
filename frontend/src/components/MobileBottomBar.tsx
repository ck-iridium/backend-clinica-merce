"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, Bell, Menu, ChevronRight, ChevronLeft, ChevronUp, LogOut, User, LayoutDashboard, Users, Sparkles, Ticket, Receipt, CalendarDays, Settings, Database, Image as ImageIcon, Globe, Tag, ShieldCheck, Briefcase, FileText, MoreHorizontal } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from '@/components/ui/skeleton';

type MenuLevel = 'main' | 'gestion' | 'configuracion';

interface MobileBottomBarProps {
  clinicName?: string;
  logoUrl?: string | null;
}

export default function MobileBottomBar({ clinicName = "Clínica", logoUrl = null }: MobileBottomBarProps) {
  const [openSearch, setOpenSearch] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuLevel, setMenuLevel] = useState<MenuLevel>('main');
  const [direction, setDirection] = useState(1);
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName: authUserName, loading } = useAuthRole();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (authUserName) {
      setUserName(authUserName);
    }
  }, [authUserName]);


  // Reiniciar el nivel de menú al cerrar
  useEffect(() => {
    if (!isMobileOpen) {
      setTimeout(() => setMenuLevel('main'), 300);
    }
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  const submenuGestion = [
    { href: '/dashboard/team', label: 'Equipo', icon: ShieldCheck },
    { href: '/dashboard/services', label: 'Servicios', icon: Sparkles },
    { href: '/dashboard/vouchers', label: 'Bonos', icon: Ticket },
  ].filter(item => {
    const currentRole = role?.toLowerCase();

    // Administrador ve todo
    if (currentRole === 'administrador' || currentRole === 'admin') return true;

    // Recepción y Especialista NO ven submenú de Gestión Avanzada
    return false;
  });

  const submenuConfig = [
    { href: '/dashboard/settings', label: 'Ajustes Generales', icon: Settings },
    { href: '/dashboard/backups', label: 'Copias de Seguridad', icon: Database },
    { href: '/dashboard/media', label: 'Galería de Medios', icon: ImageIcon },
    { href: '/dashboard/cms', label: 'Editor Web (CMS)', icon: Globe },
  ].filter(item => {
    const currentRole = role?.toLowerCase();

    // Administrador ve todo
    if (currentRole === 'administrador' || currentRole === 'admin') return true;

    // Recepción y Especialista NO ven menú de Configuración
    return false;
  });

  const navItemsMain = [
    { href: '/dashboard/pos', label: 'Venta Rápida', icon: Tag, isSubmenu: false, style: 'accent' },
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, isSubmenu: false, exact: true },
    { href: '/dashboard/calendar', label: 'Agenda', icon: CalendarDays, isSubmenu: false },
    { href: '/dashboard/clients', label: 'Clientes', icon: Users, isSubmenu: false },
    { href: '/dashboard/invoices', label: 'Facturas', icon: Receipt, isSubmenu: false },
    { href: '/dashboard/vouchers', label: 'Bonos', icon: Ticket, isSubmenu: false },
    // Solo mostrar submenús si tienen contenido para el rol actual
    ...(submenuGestion.length > 0 ? [{ id: 'gestion', label: 'Gestión Avanzada', icon: ShieldCheck, isSubmenu: true }] : []),
    ...(submenuConfig.length > 0 ? [{ id: 'configuracion', label: 'Configuración', icon: Settings, isSubmenu: true }] : []),
  ].filter(item => {
    if (!item.href) return true; // Los submenús no tienen href directo
    const currentRole = role?.toLowerCase();

    // Especialista SOLO ve: Inicio, Agenda, Clientes.
    if (currentRole === 'especialista') {
      const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients'];
      return allowed.includes(item.href || '');
    }

    // Recepción ve Facturas, POS y Bonos como directos (porque no tiene submenús)
    if (currentRole === 'recepción' || currentRole === 'recepcion') {
      const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients', '/dashboard/invoices', '/dashboard/pos', '/dashboard/vouchers'];
      return allowed.includes(item.href || '');
    }

    // Administrador: Ve Facturas como directo (igual que en desktop).
    // Pero Bonos lo ve en el submenú de Gestión, así que lo ocultamos del Main para evitar duplicados.
    if (currentRole === 'administrador' || currentRole === 'admin') {
      if (item.href === '/dashboard/vouchers') return false;
    }

    return true;
  });

  const handleNavigateSubmenu = (level: MenuLevel) => {
    setDirection(1);
    setMenuLevel(level);
  };

  const handleBack = () => {
    setDirection(-1);
    setMenuLevel('main');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsMobileOpen(false);
    router.push('/login');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const renderNavList = (items: any[]) => (
    <div className="flex flex-col gap-2 w-full pt-2">
      {items.map((item) => {
        if (item.isSubmenu) {
          return (
            <button
              key={item.id}
              onClick={() => handleNavigateSubmenu(item.id as MenuLevel)}
              className="group flex items-center justify-between rounded-xl p-3.5 transition-all duration-200 text-stone-500 hover:bg-stone-900 hover:text-white"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center w-6">
                  {item.id === 'gestion' ? <Briefcase size={20} className="text-stone-500 group-hover:text-white transition-all duration-300" strokeWidth={1.5} /> : <item.icon size={20} className="text-stone-500 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />}
                </div>
                <div className="text-sm font-bold whitespace-nowrap ml-3">
                  {item.label}
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-600 group-hover:text-white" />
            </button>
          );
        }

        const active = isActive(item.href, item.exact);
        const Icon = (item.href === '/dashboard/invoices') ? FileText : item.icon;
        let containerClasses = "";
        let iconClasses = "transition-all duration-300 ";

        if (active) {
          containerClasses = "bg-stone-800 text-white shadow-lg";
          iconClasses += "text-white";
        } else {
          containerClasses = "text-stone-500 hover:bg-stone-900 hover:text-white";
          iconClasses += "text-stone-500 group-hover:text-white";
        }

        if (item.style === 'accent' && !active) {
          containerClasses += " border border-stone-800 mb-2";
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`group flex items-center rounded-xl p-3.5 transition-all duration-200 ${containerClasses}`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-6">
              <Icon size={20} className={iconClasses} strokeWidth={active ? 2.5 : 1.5} />
            </div>
            <div className="text-sm font-bold whitespace-nowrap ml-3">
              {item.label}
            </div>
            {active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d9777f] shadow-[0_0_8px_#d9777f]"></div>
            )}
          </Link>
        );
      })}
    </div>
  );

  const renderNavListWithSkeleton = (items: any[]) => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3 w-full pt-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-stone-900/40" />
          ))}
        </div>
      );
    }
    return renderNavList(items);
  };


  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-[70] md:hidden bg-white/90 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex justify-between items-center print:hidden pb-safe">

        <Link href="/dashboard" className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
          <Home size={24} strokeWidth={1.5} />
        </Link>

        <button onClick={() => setOpenSearch(true)} className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
          <Search size={24} strokeWidth={1.5} />
        </button>

        {/* Botón Central (Acción Rápida dependiente del rol) */}
        <Link
          href={(role?.toLowerCase() === 'especialista') ? '/dashboard/calendar' : '/dashboard/pos'}
          className="rounded-full p-3 -mt-6 shadow-lg bg-stone-800 text-white hover:bg-stone-900 transition-all flex items-center justify-center border-4 border-stone-50 active:scale-95"
        >
          <Plus size={24} strokeWidth={2} />
        </Link>

        {/* Notificaciones */}
        <button className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
          <Bell size={24} strokeWidth={1.5} />
        </button>

        {/* Menú Hamburguesa que abre el Sheet Lateral */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-xs p-0 bg-stone-950 border-none [&>button]:hidden shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col">
            <SheetTitle className="sr-only">Navegación Principal</SheetTitle>
            <SheetDescription className="sr-only">Menú lateral de navegación con todas las secciones</SheetDescription>

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence initial={false} custom={direction}>

                {menuLevel === 'main' && (
                  <motion.div
                    key="main"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 w-full h-full overflow-y-auto px-4 pt-8 pb-4 custom-scrollbar"
                  >
                    {renderNavListWithSkeleton(navItemsMain)}
                  </motion.div>
                )}

                {menuLevel === 'gestion' && (
                  <motion.div
                    key="gestion"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 w-full h-full overflow-y-auto px-4 pt-8 pb-4 custom-scrollbar"
                  >
                    <button onClick={handleBack} className="flex items-center text-stone-400 hover:text-white font-bold text-lg mb-6 w-full -ml-1 transition-colors">
                      <ChevronLeft size={24} className="mr-1" /> Gestión
                    </button>
                    {renderNavListWithSkeleton(submenuGestion)}
                  </motion.div>
                )}

                {menuLevel === 'configuracion' && (
                  <motion.div
                    key="config"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 w-full h-full overflow-y-auto px-4 pt-8 pb-4 custom-scrollbar"
                  >
                    <button onClick={handleBack} className="flex items-center text-stone-400 hover:text-white font-bold text-lg mb-6 w-full -ml-1 transition-colors">
                      <ChevronLeft size={24} className="mr-1" /> Configuración
                    </button>
                    {renderNavListWithSkeleton(submenuConfig)}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* SECCIÓN USUARIO FIJA (Bottom) con Dropdown */}
            <div className="mt-auto border-t border-stone-800 bg-stone-950 shadow-[0_-10_20px_rgba(0,0,0,0.2)] relative z-[80] shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between w-full px-5 py-5 group outline-none hover:bg-stone-900/50 active:bg-stone-900 transition-all duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d9777f] to-[#b35e65] text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0 overflow-hidden group-active:scale-95 transition-transform">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-white font-bold text-sm leading-tight truncate">{userName || 'Usuario'}</span>
                        <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest truncate">{role || 'Personal'}</span>
                      </div>
                    </div>
                    <ChevronUp size={18} className="text-stone-600 group-hover:text-stone-400 group-data-[state=open]:rotate-180 transition-all duration-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="center" 
                  side="top" 
                  sideOffset={10}
                  className="w-[calc(85vw-20px)] max-w-[280px] z-[100] rounded-2xl bg-stone-900 border-stone-800 text-white shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-300"
                >
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3">
                    Gestión de Cuenta
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-stone-800 mx-2" />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="flex items-center gap-3 px-4 py-3.5 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer transition-colors">
                    <User size={18} strokeWidth={1.5} className="text-stone-400" />
                    <span className="font-bold text-sm">Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 focus:bg-rose-950 focus:text-rose-300 cursor-pointer transition-colors">
                    <LogOut size={18} strokeWidth={1.5} />
                    <span className="font-bold text-sm">Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </SheetContent>
        </Sheet>
      </div>

      <GlobalSearch open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
