'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, LayoutDashboard, Users, Sparkles,
  Ticket, Receipt, CalendarDays, Settings,
  Database, Image as ImageIcon, Globe, Tag,
  ShieldCheck, User, LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuthRole } from '@/hooks/useAuthRole';
import { Skeleton } from '@/components/ui/skeleton';


interface DashboardSidebarProps {
  clinicName: string;
  logoUrl: string | null;
}

export const navLinks = [
  { href: '/dashboard/pos', label: 'Venta Rápida', icon: Tag, style: 'accent' },
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, style: 'normal', exact: true },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users, style: 'normal' },
  { href: '/dashboard/team', label: 'Equipo', icon: ShieldCheck, style: 'normal' },
  { href: '/dashboard/services', label: 'Servicios', icon: Sparkles, style: 'normal' },
  { href: '/dashboard/vouchers', label: 'Bonos', icon: Ticket, style: 'normal' },
  { href: '/dashboard/invoices', label: 'Facturas', icon: Receipt, style: 'normal' },
  { href: '/dashboard/calendar', label: 'Agenda', icon: CalendarDays, style: 'normal' },
  { href: '/dashboard/settings', label: 'Ajustes Generales', icon: Settings, style: 'normal' },
  { href: '/dashboard/backups', label: 'Copias de Seguridad', icon: Database, style: 'normal' },
  { href: '/dashboard/media', label: 'Galería de Medios', icon: ImageIcon, style: 'highlight' },
  { href: '/dashboard/cms', label: 'Editor Web (CMS)', icon: Globe, style: 'highlight' },
];

export default function DashboardSidebar({ clinicName, logoUrl }: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useAuthRole();


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Ocultar si hacemos scroll hacia abajo y hemos pasado los primeros 50px
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else { // Mostrar si hacemos scroll hacia arriba
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);



  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  // NavItems renderer for DRY (used in both mobile and desktop views)
  const NavItems = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3 w-full px-3 py-2 animate-in fade-in duration-500">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl bg-stone-900/40" />
          ))}
        </div>
      );
    }

    const filteredLinks = navLinks.filter(link => {
      const currentRole = role?.toLowerCase();
      
      // Administrador ve todo
      if (currentRole === 'administrador' || currentRole === 'admin') return true;
      
      // Recepción: Agenda, Clientes y Facturación/Ventas (pos e invoices). NO ve Equipo ni Ajustes.
      if (currentRole === 'recepción' || currentRole === 'recepcion') {
        const restricted = ['/dashboard/team', '/dashboard/settings', '/dashboard/backups', '/dashboard/cms'];
        return !restricted.includes(link.href);
      }
      
      // Especialista: ÚNICAMENTE Agenda y Clientes. NO ve Facturación, ni Equipo, ni Ajustes.
      if (currentRole === 'especialista') {
        const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients'];
        return allowed.includes(link.href);
      }
      
      return false; // Por defecto no ve nada si no hay rol o es desconocido
    });

    return (
      <div className="flex flex-col gap-2 w-full relative z-10 px-3 animate-in fade-in zoom-in-95 duration-500">
        {filteredLinks.map((link, idx) => {
          const active = isActive(link.href, link.exact);
          const Icon = link.icon;

          let containerClasses = "";
          let iconClasses = "transition-all duration-300 ";

          if (active) {
            containerClasses = "bg-stone-800 text-white shadow-lg";
            iconClasses += "text-white";
          } else {
            containerClasses = "text-stone-500 hover:bg-stone-900 hover:text-white";
            iconClasses += "text-stone-500 group-hover:text-white";
          }

          if (link.style === 'accent' && !active) {
            containerClasses += " border border-stone-800 mb-2";
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group/item relative flex items-center justify-center rounded-2xl p-3.5 transition-all duration-200 ${containerClasses}`}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <Icon size={22} className={iconClasses} strokeWidth={active ? 2.5 : 1.5} />
              </div>

              {/* Tooltip SaaS (Cápsula Flotante) */}
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-4 py-2 bg-stone-800 text-white text-[12px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-[110] shadow-2xl border border-stone-700 translate-x-[-15px] group-hover/item:translate-x-0 pointer-events-none">
                {link.label}
              </span>

              {/* Puntito indicador activo */}
              {active && (
                <div className="absolute -left-1 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              )}
            </Link>
          );
        })}
      </div>
    );
  };


  return (
    <>
      {/* ─── Mobile Topbar (Condicionalmente oculto en agenda) ─── */}
      <div className={`md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 bg-transparent transition-transform duration-300 ease-in-out pointer-events-none ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${pathname === '/dashboard/calendar' ? 'hidden' : 'flex'}`}>
        <div className="pointer-events-auto shrink-0">
          <div className="w-12 h-12 rounded-[1.25rem] bg-stone-950 flex items-center justify-center text-white font-serif italic text-2xl shadow-xl shadow-stone-900/10 border border-white/10 transition-transform active:scale-90">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-[1.25rem]" /> : clinicName.charAt(0)}
          </div>
        </div>

        <div id="mobile-topbar-center" className="flex-1 flex justify-center items-center pointer-events-auto px-2"></div>

        <div className="pointer-events-auto shrink-0 invisible w-12">
          {/* Perfil movido al DashboardSidebar bottom por directriz de diseño */}
        </div>
      </div>

      {/* ─── Desktop Sidebar (SaaS Deep Dark Style) ─── */}
      <aside className="hidden md:block sticky top-0 h-screen z-[100] print:hidden shrink-0">
        {/* Actual fixed sidebar */}
        <div className="w-20 h-full bg-stone-950 border-r border-stone-800 flex flex-col py-8 shadow-2xl overflow-visible">

          {/* Logo Area - Isotype Only */}
          <div className="flex items-center justify-center mb-10 px-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d9777f] to-[#b35e65] flex items-center justify-center text-white font-serif italic text-2xl shadow-lg shadow-black/40 overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
            </div>
          </div>

          <div className="flex-1 overflow-visible">
            <NavItems />
          </div>

          {/* User Section Bottom */}
          <div className="px-3 mt-auto pt-4 border-t border-stone-900/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-center p-3 rounded-2xl text-stone-500 hover:bg-stone-900 hover:text-white transition-all outline-none">
                  <User size={22} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-56 ml-4 rounded-[1.5rem] bg-stone-900 border-stone-800 text-white shadow-2xl p-2 animate-in slide-in-from-left-2 duration-200">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3">
                  Admin: {clinicName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-stone-800" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 focus:bg-rose-950 focus:text-rose-300 cursor-pointer">
                  <LogOut size={16} />
                  <span className="font-bold text-sm">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
