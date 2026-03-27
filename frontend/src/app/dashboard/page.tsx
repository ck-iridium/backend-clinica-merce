"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Basic auth check
    const userString = localStorage.getItem('user');
    if (!userString) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clientsRes, apptsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`)
        ]);
        
        if (clientsRes.ok) setClients(await clientsRes.json());
        if (apptsRes.ok) setAppointments(await apptsRes.json());
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  // Contabilidad básica
  const upcomingAppointments = appointments.filter((a: any) => a.status === 'pending');

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-10 font-sans text-stone-900">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-stone-100 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#d9777f]">Panel de Control</h1>
            <p className="text-stone-500 font-medium">Bienvenida de nuevo, Mercè</p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('user'); router.push('/login'); }} 
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-full transition-colors text-sm">
            Cerrar Sesión
          </button>
        </header>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block w-12 h-12 border-4 border-[#f3c7cb] border-t-[#d9777f] rounded-full animate-spin mb-4"></div>
            <p className="text-stone-500 font-medium">Sincronizando con la base de datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Clientes Metric */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">Total Clientes</p>
                <h2 className="text-5xl font-extrabold text-stone-800">{clients.length}</h2>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-500 text-3xl shadow-inner">
                👥
              </div>
            </div>
            
            {/* Citas Metric */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">Citas Pendientes</p>
                <h2 className="text-5xl font-extrabold text-stone-800">{upcomingAppointments.length}</h2>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#fdf2f3] to-[#f3c7cb] flex items-center justify-center text-[#d9777f] text-3xl shadow-inner">
                📅
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
