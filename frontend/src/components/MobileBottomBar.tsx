"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, Menu, ChevronRight, ChevronLeft, ChevronUp, LogOut, User, LayoutDashboard, Users, Sparkles, Ticket, Receipt, CalendarDays, Settings, Database, Image as ImageIcon, Globe, Tag, ShieldCheck, Briefcase, FileText, MoreHorizontal, Bot, CreditCard } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
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
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName: authUserName, loading } = useAuthRole();
  const { t, language, setLanguage } = useLanguage();
  const [userName, setUserName] = useState<string>('');
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    if (authUserName) {
      setUserName(authUserName);
    }
  }, [authUserName]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.plan_type) {
          setPlanType(userObj.plan_type.toLowerCase());
        }
      }
    } catch (e) {
      console.warn(e);
    }

    async function fetchPlan() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`);
        if (res.ok) {
          const limitsData = await res.json();
          const pType = limitsData.plan_type?.toLowerCase() || 'free';
          setPlanType(pType);
        }
      } catch (err) {
        console.error("Error al obtener límites de plan en MobileBar:", err);
      }
    }
    fetchPlan();
  }, []);


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
    { href: '/dashboard/team', label: t('dashboard.menu.team') || 'Equipo', icon: ShieldCheck },
    { href: '/dashboard/services', label: t('dashboard.menu.services') || 'Servicios', icon: Sparkles },
    { href: '/dashboard/vouchers', label: t('dashboard.menu.vouchers') || 'Bonos', icon: Ticket },
  ].filter(item => {
    const currentRole = role?.toLowerCase();

    // Administrador ve todo
    if (currentRole === 'administrador' || currentRole === 'admin') return true;

    // Recepción y Especialista NO ven submenú de Gestión Avanzada
    return false;
  });

  const submenuConfig = [
    { href: '/dashboard/settings', label: t('dashboard.menu.settings') || 'Ajustes Generales', icon: Settings },
    { href: '/dashboard/backups', label: t('dashboard.menu.backups') || 'Copias de Seguridad', icon: Database },
    { href: '/dashboard/media', label: t('dashboard.menu.media') || 'Galería de Medios', icon: ImageIcon },
    { href: '/dashboard/cms', label: t('dashboard.menu.cms') || 'Editor Web (CMS)', icon: Globe },
  ].filter(item => {
    const currentRole = role?.toLowerCase();

    // Administrador ve todo
    if (currentRole === 'administrador' || currentRole === 'admin') return true;

    // Recepción y Especialista NO ven menú de Configuración
    return false;
  });

  const navItemsMain = [
    { href: '/dashboard/pos', label: t('dashboard.menu.pos') || 'Venta Rápida', icon: Tag, isSubmenu: false, style: 'accent' },
    { href: '/dashboard', label: t('dashboard.menu.home') || 'Inicio', icon: LayoutDashboard, isSubmenu: false, exact: true },
    { href: '/dashboard/ai-webmaster', label: t('dashboard.menu.ai_webmaster') || 'Asistente Web IA', icon: Bot, isSubmenu: false },
    { href: '/dashboard/calendar', label: t('dashboard.menu.calendar') || 'Agenda', icon: CalendarDays, isSubmenu: false },
    { href: '/dashboard/clients', label: t('dashboard.menu.clients') || 'Clientes', icon: Users, isSubmenu: false },
    { href: '/dashboard/invoices', label: t('dashboard.menu.invoices') || 'Facturas', icon: Receipt, isSubmenu: false },
    { href: '/dashboard/vouchers', label: t('dashboard.menu.vouchers') || 'Bonos', icon: Ticket, isSubmenu: false },
    // Solo mostrar submenús si tienen contenido para el rol actual
    ...(submenuGestion.length > 0 ? [{ id: 'gestion', label: t('dashboard.menu.management') || 'Gestión Avanzada', icon: ShieldCheck, isSubmenu: true }] : []),
    ...(submenuConfig.length > 0 ? [{ id: 'configuracion', label: t('dashboard.menu.configuration') || 'Configuración', icon: Settings, isSubmenu: true }] : []),
  ].filter(item => {
    if (!item.href) return true; // Los submenús no tienen href directo
    const currentRole = role?.toLowerCase();

    // Especialista SOLO ve: Inicio, Agenda, Clientes, Asistente Web IA.
    if (currentRole === 'especialista') {
      const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients', '/dashboard/ai-webmaster'];
      return allowed.includes(item.href || '');
    }

    // Recepción ve Facturas, POS, Bonos y Asistente Web IA como directos
    if (currentRole === 'recepción' || currentRole === 'recepcion') {
      const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients', '/dashboard/invoices', '/dashboard/pos', '/dashboard/vouchers', '/dashboard/ai-webmaster'];
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
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"></div>
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
        <NotificationCenter isMobile={true} />

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
                      <ChevronLeft size={24} className="mr-1" /> {t('dashboard.menu.management') || 'Gestión'}
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
                      <ChevronLeft size={24} className="mr-1" /> {t('dashboard.menu.configuration') || 'Configuración'}
                    </button>
                    {renderNavListWithSkeleton(submenuConfig)}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* SECCIÓN USUARIO FIJA (Bottom) con Dropdown Animado */}
            <div className="mt-auto border-t border-stone-800 bg-stone-950 shadow-[0_-10px_20px_rgba(0,0,0,0.2)] relative z-[80] shrink-0">
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between w-full px-5 py-5 group outline-none hover:bg-stone-900/50 active:bg-stone-900 transition-all duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-stone-900 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center font-bold text-lg shadow-lg shrink-0 overflow-hidden group-active:scale-95 transition-transform">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-white font-bold text-sm leading-tight truncate">{userName || 'Usuario'}</span>
                        <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest truncate">{role || 'Personal'}</span>
                      </div>
                    </div>
                    <ChevronUp size={18} className={`text-stone-600 transition-all duration-300 ${isUserMenuOpen ? 'rotate-180 text-white' : 'group-hover:text-stone-400'}`} />
                  </button>
                </DropdownMenuTrigger>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <DropdownMenuPortal forceMount>
                      <DropdownMenuContent 
                        asChild
                        align="center" 
                        side="top" 
                        sideOffset={15}
                        className="w-[calc(85vw-20px)] max-w-[280px] z-[9999] rounded-2xl bg-stone-900 border-stone-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 border outline-none"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3 flex items-center justify-between gap-2">
                            <span>{t('dashboard.menu.profile') || 'Gestión de Cuenta'}</span>
                            {planType && (
                              <span className="bg-[#d4af37]/15 text-[#e4c257] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-[#d4af37]/20 flex items-center gap-1 select-none shrink-0">
                                {planType === 'gold' ? 'Gold' : planType === 'pro' ? 'Pro' : planType === 'basic' ? 'Básico' : 'Demo'}
                              </span>
                            )}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-stone-800 mx-2" />
                          
                          {/* Selector de idioma inline en el menú móvil */}
                          <div className="px-4 py-2 flex items-center justify-between bg-stone-950/40 rounded-xl border border-stone-800/85 mx-2 my-1.5">
                            <span className="text-xs font-bold text-stone-400">{t('dashboard.menu.language') || 'Idioma'}</span>
                            <div className="flex items-center gap-2">
                              {[
                                { code: 'es', flag: '🇪🇸' },
                                { code: 'en', flag: '🇬🇧' },
                                { code: 'fr', flag: '🇫🇷' }
                              ].map((l) => (
                                <button
                                  key={l.code}
                                  onClick={() => setLanguage(l.code as any)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all ${
                                    language === l.code
                                      ? 'bg-stone-800 border border-[#d4af37]/40 scale-110 shadow-sm'
                                      : 'opacity-40 hover:opacity-100'
                                  }`}
                                >
                                  {l.flag}
                                </button>
                              ))}
                            </div>
                          </div>
                          <DropdownMenuItem onClick={() => { setIsUserMenuOpen(false); router.push('/dashboard/profile'); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer transition-colors">
                            <User size={18} strokeWidth={1.5} className="text-stone-400" />
                            <span className="font-bold text-sm">{t('dashboard.menu.profile') || 'Mi Perfil'}</span>
                          </DropdownMenuItem>
                          {(role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrador') && (
                            <DropdownMenuItem onClick={() => { setIsUserMenuOpen(false); router.push('/dashboard/settings?tab=subscription'); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer text-[#d4af37] focus:text-[#e4c257] focus:bg-stone-800 transition-colors">
                               <CreditCard size={18} strokeWidth={1.5} />
                              <span className="font-bold text-sm">{t('dashboard.settings.tabs.billing') || 'Plan & Suscripción'}</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 focus:bg-rose-950 focus:text-rose-300 cursor-pointer transition-colors">
                            <LogOut size={18} strokeWidth={1.5} />
                            <span className="font-bold text-sm">{t('dashboard.menu.logout') || 'Cerrar Sesión'}</span>
                          </DropdownMenuItem>
                        </motion.div>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  )}
                </AnimatePresence>
              </DropdownMenu>
            </div>

          </SheetContent>
        </Sheet>
      </div>

      <GlobalSearch open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
