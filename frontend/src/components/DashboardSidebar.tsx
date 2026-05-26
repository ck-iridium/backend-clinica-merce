'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Sparkles,
  Ticket, Receipt, CalendarDays, Settings,
  Database, Image as ImageIcon, Globe, Tag,
  ShieldCheck, User, LogOut, Search, ChevronRight,
  MoreHorizontal, Briefcase, FileText, Bot, CreditCard
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
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
import { useAIImage } from '@/app/contexts/AIImageContext';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';


interface DashboardSidebarProps {
  clinicName: string;
  logoUrl: string | null;
}

export const navLinks = [
  { href: '/dashboard/pos', label: 'Venta Rápida', icon: Tag, style: 'accent' },
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, style: 'normal', exact: true },
  { href: '/dashboard/ai-webmaster', label: 'Asistente Web IA', icon: Bot, style: 'highlight' },
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
  const { t, language, setLanguage } = useLanguage();

  const getTranslatedLabel = (href: string, fallback: string) => {
    switch (href) {
      case '/dashboard/pos': return t('dashboard.menu.pos');
      case '/dashboard': return t('dashboard.menu.home');
      case '/dashboard/ai-webmaster': return t('dashboard.menu.ai_webmaster') || 'Asistente Web IA';
      case '/dashboard/clients': return t('dashboard.menu.clients');
      case '/dashboard/team': return t('dashboard.menu.team');
      case '/dashboard/services': return t('dashboard.menu.services');
      case '/dashboard/vouchers': return t('dashboard.menu.vouchers');
      case '/dashboard/invoices': return t('dashboard.menu.invoices');
      case '/dashboard/calendar': return t('dashboard.menu.calendar');
      case '/dashboard/settings': return t('dashboard.menu.settings');
      case '/dashboard/backups': return t('dashboard.menu.backups');
      case '/dashboard/media': return t('dashboard.menu.media');
      case '/dashboard/cms': return t('dashboard.menu.cms');
      default: return fallback;
    }
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    // 1. Intentar leer rápido de localStorage
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

    // 2. Fetch de la API para asegurar frescura de los datos
    async function fetchPlan() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`);
        if (res.ok) {
          const limitsData = await res.json();
          const pType = limitsData.plan_type?.toLowerCase() || 'free';
          setPlanType(pType);
          
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.plan_type !== pType) {
              localStorage.setItem('user', JSON.stringify({ ...userObj, plan_type: pType }));
            }
          }
        }
      } catch (err) {
        console.error("Error al obtener límites de plan en Sidebar:", err);
      }
    }
    fetchPlan();
  }, []);
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName: authUserName, loading } = useAuthRole();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (authUserName) {
      setUserName(authUserName);
    }
  }, [authUserName]);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);



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

  const NavItems = () => {
    const { isGenerating } = useAIImage();

    const handleProtectedNavigation = (e: React.MouseEvent, href: string) => {
      if (isGenerating) {
        e.preventDefault();
        toast.warning("Espera a que la IA termine antes de salir de la edición.");
        return;
      }
      router.push(href);
    };

    if (loading) {
      return (
        <div className="flex flex-col gap-3 w-full px-3 py-2 animate-in fade-in duration-500">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl bg-stone-900/40" />
          ))}
        </div>
      );
    }

    const currentRole = role?.toLowerCase();
    const isRecepcion = currentRole === 'recepción' || currentRole === 'recepcion';
    const isAdmin = currentRole === 'administrador' || currentRole === 'admin';

    // Definición de grupos dinámica según el rol para evitar redundancias
    const directLinksHrefs = [
      '/dashboard/pos', 
      '/dashboard', 
      '/dashboard/ai-webmaster',
      '/dashboard/calendar', 
      '/dashboard/clients', 
      '/dashboard/invoices',
      ...(isRecepcion ? ['/dashboard/vouchers'] : []) // Solo Recepción ve Bonos fuera
    ];

    const gestionLinksHrefs = [
      '/dashboard/team', 
      '/dashboard/services', 
      ...(isAdmin ? ['/dashboard/vouchers'] : []) // Admin sigue viendo Bonos en Gestión
    ];

    const configLinksHrefs = ['/dashboard/settings', '/dashboard/backups', '/dashboard/media', '/dashboard/cms'];

    const directLinks = navLinks.filter(link => directLinksHrefs.includes(link.href));
    const gestionLinks = navLinks.filter(link => gestionLinksHrefs.includes(link.href));
    const configLinks = navLinks.filter(link => configLinksHrefs.includes(link.href));

    // Filtrado por roles para cada grupo
    const filterByRole = (links: typeof navLinks) => {
      const currentRole = role?.toLowerCase();
      return links.filter(link => {
        // --- FEATURE FLAG PARA EL PLAN GOLD ---
        if (link.href === '/dashboard/ai-webmaster' && planType !== 'gold') {
          return false;
        }

        if (currentRole === 'administrador' || currentRole === 'admin') return true;

        if (currentRole === 'recepción' || currentRole === 'recepcion') {
          // Recepción NO ve: Equipo, Servicios, Ajustes, Media, CMS, Backups
          const restricted = ['/dashboard/team', '/dashboard/settings', '/dashboard/backups', '/dashboard/cms', '/dashboard/services', '/dashboard/media'];
          return !restricted.includes(link.href);
        }

        if (currentRole === 'especialista') {
          const allowed = ['/dashboard', '/dashboard/calendar', '/dashboard/clients', '/dashboard/ai-webmaster'];
          return allowed.includes(link.href);
        }
        return false;
      });
    };

    const filteredDirect = filterByRole(directLinks);
    const filteredGestion = filterByRole(gestionLinks);
    const filteredConfig = filterByRole(configLinks);

    return (
      <div className="flex flex-col gap-2 w-full relative z-10 px-3">
        {/* 1. GlobalSearch (Lupa) */}
        <button
          onClick={() => {
            if (isGenerating) {
              toast.warning("No puedes buscar mientras se genera la imagen.");
              return;
            }
            setSearchOpen(true);
          }}
          className={`w-full group/item relative flex items-center justify-center rounded-2xl p-3.5 transition-all duration-200 text-stone-500 hover:bg-stone-900 hover:text-white border border-transparent hover:border-stone-800 mb-2 ${isGenerating ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
        >
          <Search size={22} strokeWidth={1.5} />
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-4 py-2 bg-stone-800 text-white text-[12px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-[110] shadow-2xl border border-stone-700 translate-x-[-15px] group-hover/item:translate-x-0 pointer-events-none">
            {t('dashboard.menu.search_placeholder')}
          </span>
        </button>

        {/* 2-6. Accesos Directos */}
        {filteredDirect.map((link) => {
          const active = isActive(link.href, link.exact);
          const Icon = link.href === '/dashboard/invoices' ? FileText : link.icon;

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
              onClick={(e) => {
                if (isGenerating) {
                  e.preventDefault();
                  toast.warning("Espera a que la IA termine antes de salir.");
                }
              }}
              className={`group/item relative flex items-center justify-center rounded-2xl p-3.5 transition-all duration-200 ${containerClasses} ${isGenerating ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <Icon size={22} className={iconClasses} strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-4 py-2 bg-stone-800 text-white text-[12px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-[110] shadow-2xl border border-stone-700 translate-x-[-15px] group-hover/item:translate-x-0 pointer-events-none">
                {getTranslatedLabel(link.href, link.label)}
              </span>
              {active && (
                <div className="absolute -left-1 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              )}
            </Link>
          );
        })}

        {/* Grupo 'Gestión' Flyout */}
        {filteredGestion.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled={isGenerating} className={`group/item relative flex items-center justify-center rounded-2xl p-3.5 transition-all duration-200 ${filteredGestion.some(l => isActive(l.href)) ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-900 hover:text-white'} ${isGenerating ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}>
                <div className="flex-shrink-0 flex items-center justify-center">
                  <Briefcase size={22} strokeWidth={1.5} />
                </div>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-4 py-2 bg-stone-800 text-white text-[12px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-[110] shadow-2xl border border-stone-700 translate-x-[-15px] group-hover/item:translate-x-0 pointer-events-none">
                  {t('dashboard.menu.management')}
                </span>
                {filteredGestion.some(l => isActive(l.href)) && (
                  <div className="absolute -left-1 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-56 ml-4 rounded-[1.5rem] bg-stone-900 border-stone-800 text-white shadow-2xl p-2 animate-in slide-in-from-left-2 duration-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3">
                {t('dashboard.menu.management')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-stone-800" />
              {filteredGestion.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={(e) => handleProtectedNavigation(e, link.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer ${active ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                    <span className="font-bold text-sm">{getTranslatedLabel(link.href, link.label)}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Grupo 'Configuración' Flyout (Admin Only) */}
        {filteredConfig.length > 0 && (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrador') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`group/item relative flex items-center justify-center rounded-2xl p-3.5 transition-all duration-200 ${filteredConfig.some(l => isActive(l.href)) ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-900 hover:text-white'}`}>
                <div className="flex-shrink-0 flex items-center justify-center">
                  <Settings size={22} strokeWidth={1.5} />
                </div>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-5 px-4 py-2 bg-stone-800 text-white text-[12px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 whitespace-nowrap z-[110] shadow-2xl border border-stone-700 translate-x-[-15px] group-hover/item:translate-x-0 pointer-events-none">
                  {t('dashboard.menu.configuration')}
                </span>
                {filteredConfig.some(l => isActive(l.href)) && (
                  <div className="absolute -left-1 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-56 ml-4 rounded-[1.5rem] bg-stone-900 border-stone-800 text-white shadow-2xl p-2 animate-in slide-in-from-left-2 duration-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3">
                {t('dashboard.menu.configuration')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-stone-800" />
              {filteredConfig.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <DropdownMenuItem
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer ${active ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                    <span className="font-bold text-sm">{getTranslatedLabel(link.href, link.label)}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };


  return (
    <>

      {/* ─── Desktop Sidebar (SaaS Deep Dark Style) ─── */}
      <aside className="hidden md:block sticky top-0 h-screen z-[100] print:hidden shrink-0">
        {/* Actual fixed sidebar */}
        <div className="w-20 h-full bg-stone-950 border-r border-stone-800 flex flex-col py-8 shadow-2xl overflow-visible">

          {/* Logo Area - Isotype Only */}
          <div className="flex items-center justify-center mb-10 px-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa8412] flex items-center justify-center text-white font-serif italic text-2xl shadow-lg shadow-black/40 overflow-hidden">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
            </div>
          </div>

          <div className="flex-1 overflow-visible flex flex-col">
            <NavItems />
          </div>

          {/* Utilities & User Section Bottom */}
          <div className="px-3 mt-auto pt-4 border-t border-stone-900/50 space-y-2">
            {/* Notifications Slot */}
            <div className="flex justify-center">
              <NotificationCenter isMobile={false} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-center p-3 rounded-2xl text-stone-500 hover:bg-stone-900 hover:text-white transition-all outline-none">
                  <User size={22} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-56 ml-4 rounded-[1.5rem] bg-stone-900 border-stone-800 text-white shadow-2xl p-2 animate-in slide-in-from-left-2 duration-200">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white text-xs font-bold leading-tight truncate max-w-[110px]">{userName || 'Usuario'}</span>
                    <span className="text-stone-500 text-[9px] leading-none truncate max-w-[110px]">{role || 'Personal'}</span>
                  </div>
                  {planType && (
                    <span className="bg-[#d4af37]/15 text-[#e4c257] text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-[#d4af37]/20 flex items-center gap-1 select-none shrink-0">
                      {planType === 'gold' ? 'Plan Gold' : planType === 'pro' ? 'Plan Pro' : planType === 'basic' ? 'Plan Básico' : 'Plan Demo'}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-stone-800" />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="flex items-center gap-3 px-4 py-3 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer">
                  <User size={16} />
                  <span className="font-bold text-sm">{t('dashboard.menu.profile')}</span>
                </DropdownMenuItem>
                {(role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrador') && (
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings?tab=subscription')} className="flex items-center gap-3 px-4 py-3 rounded-xl focus:bg-stone-800 focus:text-white cursor-pointer text-[#d4af37] focus:text-[#e4c257] focus:bg-stone-800">
                    <CreditCard size={16} />
                    <span className="font-bold text-sm">Plan & Suscripción</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 focus:bg-rose-950 focus:text-rose-300 cursor-pointer">
                  <LogOut size={16} />
                  <span className="font-bold text-sm">{t('dashboard.menu.logout')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-800" />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-4 py-2">
                  {t('dashboard.menu.language')}
                </DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                  {(['es', 'en', 'fr'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`py-1.5 text-[10px] font-black rounded-xl transition-all ${
                        language === lang
                          ? 'bg-[#d4af37] text-stone-950 shadow-md'
                          : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
