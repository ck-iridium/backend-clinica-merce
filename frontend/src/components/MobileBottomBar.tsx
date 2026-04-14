"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Bell, Menu } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { navLinks } from './DashboardSidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function MobileBottomBar({ clinicName = "Clínica", logoUrl = null }: { clinicName?: string, logoUrl?: string | null }) {
  const [openSearch, setOpenSearch] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white/90 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex justify-between items-center print:hidden pb-safe">
        
        <Link href="/dashboard" className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
          <Home size={24} strokeWidth={1.5} />
        </Link>
        
        <button onClick={() => setOpenSearch(true)} className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
          <Search size={24} strokeWidth={1.5} />
        </button>
        
        {/* Botón Central (Venta Rápida) */}
        <Link href="/dashboard/pos" className="rounded-full p-3 -mt-6 shadow-lg bg-stone-800 text-white hover:bg-stone-900 transition-all flex items-center justify-center border-4 border-stone-50 active:scale-95">
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
          <SheetContent side="left" className="w-[85vw] max-w-xs p-0 bg-stone-50 border-none [&>button]:hidden">
            <SheetTitle className="sr-only">Navegación Principal</SheetTitle>
            <SheetDescription className="sr-only">Menú lateral de navegación con todas las secciones</SheetDescription>
            
            <div className="flex flex-col h-full py-8">
              <div className="hidden px-6 mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-stone-900 flex items-center justify-center text-white font-serif italic text-2xl shadow-xl shadow-stone-200 overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt={clinicName} className="w-full h-full object-cover" /> : clinicName.charAt(0)}
                  </div>
                  <div>
                    <SheetHeader className="text-left p-0 mb-0">
                      <SheetTitle className="text-xl font-bold text-stone-800 leading-tight font-serif p-0">
                        {clinicName}
                      </SheetTitle>
                      <SheetDescription className="text-[10px] font-black uppercase tracking-widest text-[#d9777f] mt-0.5">
                        Admin Panel
                      </SheetDescription>
                    </SheetHeader>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2">
                <div className="flex flex-col gap-1 w-full relative z-10 px-3">
                  {navLinks.map((link, idx) => {
                    const active = isActive(link.href, link.exact);
                    const Icon = link.icon;
                    let containerClasses = "";
                    let iconClasses = "transition-all duration-300 ";
                    let textClasses = "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 w-40 opacity-100 ml-3";

                    if (link.style === 'accent') {
                      containerClasses = `mb-4 shadow-sm border ${active ? 'bg-[#bf7d6b] text-white border-[#bf7d6b]' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`;
                      iconClasses += active ? "text-white" : "text-[#bf7d6b]";
                    } else if (link.style === 'highlight') {
                      containerClasses = `shadow-sm border ${idx === navLinks.findIndex(l => l.style === 'highlight') ? 'mt-6' : ''} ${active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`;
                      iconClasses += active ? "text-white" : "text-stone-500";
                    } else {
                      containerClasses = active ? 'bg-[#bf7d6b]/10 text-[#bf7d6b] font-bold' : 'text-stone-500 hover:bg-stone-100/50 hover:text-stone-800';
                      iconClasses += active ? "text-[#bf7d6b]" : "text-stone-400";
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`group flex items-center rounded-xl p-3 transition-all duration-200 ${containerClasses}`}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-6">
                          <Icon size={18} className={iconClasses} strokeWidth={active ? 2.5 : 2} />
                        </div>
                        <div className={textClasses}>
                          {link.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <GlobalSearch open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
