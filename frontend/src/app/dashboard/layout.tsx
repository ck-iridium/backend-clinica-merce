import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 md:flex flex-col md:flex-row font-sans text-stone-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0 z-10 shadow-sm md:h-screen md:sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-stone-100 bg-[#fdf2f3]/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d9777f] to-[#b35e65] mb-3 flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <h2 className="text-xl font-bold text-stone-800">Clínica Mercè</h2>
          <p className="text-xs font-semibold text-[#d9777f] uppercase tracking-wider">Panel Administrativo</p>
        </div>
        <nav className="p-4 space-y-1.5">
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Inicio
          </Link>
          <Link href="/dashboard/clients" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Pacientes
          </Link>
          <Link href="/dashboard/services" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Servicios
          </Link>
          <Link href="#" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-400 font-medium transition-colors cursor-not-allowed">
            Bonos (Pronto)
          </Link>
          <Link href="/dashboard/calendar" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Agenda
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-stone-50/50">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
