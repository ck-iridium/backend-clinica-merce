import DashboardSidebar from '@/components/DashboardSidebar';
import { FeedbackProvider } from '@/app/contexts/FeedbackContext';
import { Bell, Search, User } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
      cache: 'no-store'
    });
    if (res.ok) settings = await res.json();
  } catch (e) {
    console.error("Failed to fetch settings for layout:", e);
  }

  const clinicName = settings?.clinic_name || "Clínica";
  const logoUrl = settings?.logo_app_b64 || null;

  return (
    <FeedbackProvider>
      <div className="min-h-screen bg-background md:flex font-sans text-foreground print:bg-white overflow-hidden">
        
        {/* Sidebar: Mobile top bar + new Heygen-style desktop hover drawer */}
        <DashboardSidebar clinicName={clinicName} logoUrl={logoUrl} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden print:overflow-visible">
          
          {/* Desktop Command Center (Topbar) with Frosted Glass */}
          <header className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-20 bg-background/70 backdrop-blur-2xl border-b border-border/40">
             
             {/* Search Bar Island */}
             <div className="flex items-center bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/30 transition-colors rounded-2xl px-4 py-2.5 w-[28rem] shadow-sm">
               <Search size={18} className="text-muted-foreground mr-3" />
               <input 
                 type="text" 
                 placeholder="Comando rápido: Buscar reservas o clientes..." 
                 className="bg-transparent border-none outline-none text-sm font-medium w-full text-foreground placeholder:text-muted-foreground/70" 
               />
               <span className="text-[10px] font-bold text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-2">⌘K</span>
             </div>
             
             {/* Quick Actions Island */}
             <div className="flex items-center gap-4">
                <button className="relative w-11 h-11 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-sm active:scale-95 group">
                  <Bell size={18} className="group-hover:animate-swing" />
                  <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-destructive border-[1.5px] border-card"></span>
                </button>
                <div className="flex items-center gap-3 bg-card border border-border/50 py-1.5 pl-1.5 pr-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-inner">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-800 leading-tight">Administrador</span>
                    <span className="text-[10px] text-muted-foreground font-semibold leading-tight">Clínica Mercè</span>
                  </div>
                </div>
             </div>
          </header>

          {/* Children View (The Canvas for "Islas de contenido") */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
            <div className="max-w-[1400px] mx-auto z-10 relative space-y-6">
              {children}
            </div>
          </div>
          
        </main>
      </div>
    </FeedbackProvider>
  );
}
