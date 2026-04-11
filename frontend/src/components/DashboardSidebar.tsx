'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface DashboardSidebarProps {
  clinicName: string;
  logoUrl: string | null;
}

const navLinks = [
  { href: '/dashboard/pos',      label: 'Venta Rápida',        icon: '🏷️',  style: 'accent' },
  { href: '/dashboard',          label: 'Inicio',               icon: null,   style: 'normal', exact: true },
  { href: '/dashboard/clients',  label: 'Clientes',             icon: null,   style: 'normal' },
  { href: '/dashboard/services', label: 'Servicios',            icon: null,   style: 'normal' },
  { href: '/dashboard/vouchers', label: 'Bonos',                icon: null,   style: 'normal' },
  { href: '/dashboard/invoices', label: 'Facturas',             icon: null,   style: 'normal' },
  { href: '/dashboard/calendar', label: 'Agenda',               icon: null,   style: 'normal' },
  { href: '/dashboard/settings', label: 'Ajustes Generales',    icon: null,   style: 'normal' },
  { href: '/dashboard/backups',  label: 'Copias de Seguridad',  icon: null,   style: 'normal' },
  { href: '/dashboard/media',    label: 'Galería de Medios',    icon: '🖼️',  style: 'highlight' },
  { href: '/dashboard/cms',      label: 'Editor Web (CMS)',     icon: '🌐',   style: 'highlight' },
];

export default function DashboardSidebar({ clinicName, logoUrl }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Auto-close on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    // Swipe left (more horizontal than vertical, at least 60px)
    if (deltaX > 60 && deltaY < 100) {
      setIsOpen(false);
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  const SidebarContent = () => (
    <>
      {/* Logo / Clinic */}
      <div className="p-6 border-b border-stone-100 bg-[#fdf2f3]/50 flex items-center justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d9777f] to-[#b35e65] mb-3 flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-stone-800 leading-tight">{clinicName}</h2>
          <p className="text-xs font-semibold text-[#d9777f] uppercase tracking-wider">Panel Administrativo</p>
        </div>
        {/* Close button — only relevant on mobile drawer */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-all"
          aria-label="Cerrar menú"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navLinks.map((link, idx) => {
          const active = isActive(link.href, link.exact);

          if (link.style === 'accent') {
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl font-bold transition-all mb-2 flex items-center gap-2 shadow-sm border ${active ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-800 hover:text-white'}`}
              >
                {link.icon && <span className="text-lg">{link.icon}</span>} {link.label}
              </Link>
            );
          }

          if (link.style === 'highlight') {
            const first = navLinks.filter(l => l.style === 'highlight')[0];
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm border ${idx === navLinks.findIndex(l => l.style === 'highlight') ? 'mt-4' : ''} ${active ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-800 hover:text-white'}`}
              >
                {link.icon && <span>{link.icon}</span>} {link.label}
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-[#fdf2f3] text-[#d9777f] font-bold' : 'text-stone-600 hover:bg-[#fdf2f3] hover:text-[#d9777f]'}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d9777f] to-[#b35e65] flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
          </div>
          <span className="font-bold text-stone-800 text-base">{clinicName}</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-all active:scale-95"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-stone-200 flex-shrink-0 z-10 shadow-sm h-screen sticky top-0 overflow-y-auto print:hidden">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Drawer ─── */}

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 print:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden fixed top-0 left-0 h-full w-[85vw] max-w-xs z-50 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out print:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú principal"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
