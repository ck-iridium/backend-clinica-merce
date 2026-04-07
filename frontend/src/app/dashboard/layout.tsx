import Link from 'next/link';

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
    <div className="min-h-screen bg-stone-50 md:flex flex-col md:flex-row font-sans text-stone-900 overflow-hidden print:bg-white print:overflow-visible text-base">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0 z-10 shadow-sm md:h-screen md:sticky top-0 overflow-y-auto print:hidden">
        <div className="p-6 border-b border-stone-100 bg-[#fdf2f3]/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d9777f] to-[#b35e65] mb-3 flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : clinicName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-stone-800">{clinicName}</h2>
          <p className="text-xs font-semibold text-[#d9777f] uppercase tracking-wider">Panel Administrativo</p>
        </div>
        <nav className="p-4 space-y-1.5">
          <Link href="/dashboard/pos" className="block px-4 py-3 rounded-xl hover:bg-stone-800 hover:text-white bg-stone-100 text-stone-800 font-bold transition-all mb-2 flex items-center gap-2 shadow-sm border border-stone-200">
            <span className="text-lg">🏷️</span> Venta Rápida
          </Link>
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Inicio
          </Link>
          <Link href="/dashboard/clients" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Clientes
          </Link>
          <Link href="/dashboard/services" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Servicios
          </Link>
          <Link href="/dashboard/vouchers" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Bonos
          </Link>
          <Link href="/dashboard/invoices" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Facturas
          </Link>
          <Link href="/dashboard/calendar" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Agenda
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Ajustes Generales
          </Link>
          <Link href="/dashboard/backups" className="block px-4 py-3 rounded-xl hover:bg-[#fdf2f3] hover:text-[#d9777f] text-stone-600 font-medium transition-colors">
            Copias de Seguridad
          </Link>
          <Link href="/dashboard/cms" className="block px-4 py-3 rounded-xl hover:bg-stone-800 hover:text-white bg-stone-100 text-stone-800 font-bold transition-all mt-6 shadow-sm border border-stone-200">
            🌐 Editor Web (CMS)
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
