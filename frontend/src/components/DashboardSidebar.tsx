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

interface DashboardSidebarProps {
  clinicName: string;
  logoUrl: string | null;
}

export const navLinks = [
  { href: '/dashboard/pos',      label: 'Venta Rápida',        icon: Tag,             style: 'accent' },
  { href: '/dashboard',          label: 'Inicio',               icon: LayoutDashboard, style: 'normal', exact: true },
  { href: '/dashboard/clients',  label: 'Clientes',             icon: Users,           style: 'normal' },
  { href: '/dashboard/team',     label: 'Equipo',               icon: ShieldCheck,     style: 'normal' },
  { href: '/dashboard/services', label: 'Servicios',            icon: Sparkles,        style: 'normal' },
  { href: '/dashboard/vouchers', label: 'Bonos',                icon: Ticket,          style: 'normal' },
  { href: '/dashboard/invoices', label: 'Facturas',             icon: Receipt,         style: 'normal' },
  { href: '/dashboard/calendar', label: 'Agenda',               icon: CalendarDays,    style: 'normal' },
  { href: '/dashboard/settings', label: 'Ajustes Generales',    icon: Settings,        style: 'normal' },
  { href: '/dashboard/backups',  label: 'Copias de Seguridad',  icon: Database,        style: 'normal' },
  { href: '/dashboard/media',    label: 'Galería de Medios',    icon: ImageIcon,       style: 'highlight' },
  { href: '/dashboard/cms',      label: 'Editor Web (CMS)',     icon: Globe,           style: 'highlight' },
];

export default function DashboardSidebar({ clinicName, logoUrl }: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (deltaX > 60 && deltaY < 100) {
      setIsMobileOpen(false);
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  // NavItems renderer for DRY (used in both mobile and desktop views)
  const NavItems = ({ expanded }: { expanded: boolean }) => (
    <div className="flex flex-col gap-1 w-full relative z-10 px-3">
      {navLinks.map((link, idx) => {
        const active = isActive(link.href, link.exact);
        const Icon = link.icon;
        
        let containerClasses = "";
        let iconClasses = "transition-all duration-300 ";
        let textClasses = "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ";

        if (link.style === 'accent') {
          containerClasses = `mb-4 shadow-sm border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`;
          iconClasses += active ? "text-primary-foreground" : "text-primary";
        } else if (link.style === 'highlight') {
          containerClasses = `shadow-sm border ${idx === navLinks.findIndex(l => l.style === 'highlight') ? 'mt-6' : ''} ${active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`;
          iconClasses += active ? "text-white" : "text-stone-500";
        } else {
          containerClasses = active ? 'bg-primary/10 text-primary font-bold' : 'text-stone-500 hover:bg-stone-100/50 hover:text-stone-800';
          iconClasses += active ? "text-primary" : "text-stone-400 group-hover:text-stone-600";
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            title={!expanded ? link.label : undefined}
            className={`group flex items-center rounded-xl p-3 transition-all duration-200 ${containerClasses}`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-6">
              <Icon size={18} className={iconClasses} strokeWidth={active ? 2.5 : 2} />
            </div>
            
            <div className={`${textClasses} ${expanded ? 'w-40 opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}`}>
              {link.label}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-none print:hidden">
        <div className={`flex items-center justify-between px-6 py-4 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-white font-serif italic text-xl shadow-xl shadow-stone-200 overflow-hidden border border-white/20">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
            </div>
          </div>
          
          <div className="pointer-events-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border-2 border-white shadow-lg flex items-center justify-center active:scale-95 transition-all outline-none">
                    <User size={18} strokeWidth={1.5} className="text-stone-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl border border-stone-100 p-1.5 z-[60]">
                <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-stone-400 px-3 py-2">
                  Mi cuenta
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl opacity-50">
                  <User size={15} strokeWidth={1.5} />
                  <span className="font-semibold text-sm">Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl opacity-50">
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
        </div>
      </div>

      {/* ─── Desktop Sidebar (Heygen Style) ─── */}
      <aside className="hidden md:block sticky top-0 h-screen z-40 print:hidden">
        {/* Spacer to keep layout flow stable */}
        <div className="w-20 h-full border-r border-stone-200/50 bg-stone-50" />
        
        {/* Actual floating sidebar */}
        <div 
          className={`absolute top-0 left-0 h-full bg-stone-50/90 backdrop-blur-2xl border-r border-stone-200/50 flex flex-col py-6 transition-all duration-300 ease-&lsqb;cubic-bezier(0.16,1,0.3,1)&rsqb; overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isDesktopExpanded ? 'w-64' : 'w-20'}`}
          onMouseEnter={() => setIsDesktopExpanded(true)}
          onMouseLeave={() => setIsDesktopExpanded(false)}
        >
          {/* Logo Area */}
          <div className="flex items-center px-4 mb-8">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-serif italic text-2xl shadow-lg shadow-primary/20 overflow-hidden mx-auto">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
            </div>
            
            <div className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isDesktopExpanded ? 'w-40 opacity-100 ml-4' : 'w-0 opacity-0 ml-0'}`}>
              <h2 className="text-lg font-bold text-stone-800 leading-tight font-serif">{clinicName}</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            <NavItems expanded={isDesktopExpanded} />
          </div>
        </div>
      </aside>

    </>
  );
}
