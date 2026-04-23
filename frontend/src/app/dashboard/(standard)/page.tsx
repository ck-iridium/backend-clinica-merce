"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, Banknote, Activity, Plus, UserPlus, Zap, ChevronRight, CalendarCheck } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthRole } from '@/hooks/useAuthRole';

export default function DashboardPage() {
  const { role, loading: loadingRole } = useAuthRole();
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
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
        const [clientsRes, apptsRes, servicesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/`)
        ]);
        
        if (clientsRes.ok) setClients(await clientsRes.json());
        if (apptsRes.ok) setAppointments(await apptsRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const upcomingAppointments = appointments.filter((a: any) => a.status === 'pending');

  // Citas de HOY ordenadas por hora
  const todayStr = new Date().toDateString();
  const todayAppointments = appointments
    .filter((a: any) => {
      const d = new Date(a.start_time.endsWith('Z') ? a.start_time.slice(0, -1) : a.start_time);
      return d.toDateString() === todayStr && a.status !== 'cancelled';
    })
    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const clientMap = new Map(clients.map((c: any) => [c.id, c.name]));
  const serviceMap = new Map(services.map((s: any) => [s.id, s.name]));

  const metrics = [
    {
      label: 'Citas de Hoy',
      value: '8',
      icon: CalendarDays,
      color: 'text-[#d9777f]',
      bg: 'bg-[#fdf2f3]',
    },
    {
      label: 'Nuevos Clientes',
      value: clients.length.toString(),
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Ingresos Estimados',
      value: '450 €',
      icon: Banknote,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Tasa de Ocupación',
      value: '85%',
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── Bienvenida ── */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Panel de Control</p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-800 leading-tight">
            Bienvenida de nuevo, Mercè
          </h1>
          <p className="text-stone-400 font-medium mt-2 text-sm">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── Acciones Rápidas ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => router.push('/dashboard/calendar')}
            className="flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={1.5} />
            Nueva Cita
          </button>
          <button
            onClick={() => router.push('/dashboard/clients')}
            className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <UserPlus size={18} strokeWidth={1.5} />
            Nuevo Cliente
          </button>
          
          {(role?.toLowerCase() !== 'especialista') && (
            <button
              onClick={() => router.push('/dashboard/pos')}
              className="flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Zap size={18} strokeWidth={1.5} />
              Cobro Rápido
            </button>
          )}
        </div>
      </div>

      {/* ── Grid de Métricas ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-7 flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <Skeleton className="w-14 h-14 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-7 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{m.label}</p>
                    <p className="text-4xl font-extrabold text-stone-800">{m.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} shrink-0`}>
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Panel Tu Día de un Vistazo ── */}
          <div className="mt-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold text-stone-800">Tu Día de un Vistazo</h2>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                {todayAppointments.length} citas hoy
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              // ── Empty State ──
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <CalendarCheck size={72} strokeWidth={1} className="text-stone-200" />
                <p className="text-stone-400 font-semibold text-base text-center max-w-xs">
                  No tienes próximas citas.<br />
                  <span className="text-stone-300 font-medium text-sm">¡Aprovecha para descansar o gestionar la clínica!</span>
                </p>
                <button
                  onClick={() => router.push('/dashboard/calendar')}
                  className="mt-2 flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  <Plus size={16} strokeWidth={1.5} /> Nueva Cita
                </button>
              </div>
            ) : (
              // ── Lista de citas ──
              <div className="divide-y divide-stone-100">
                {todayAppointments.map((appt: any) => {
                  const apptDate = new Date(appt.start_time.endsWith('Z') ? appt.start_time.slice(0, -1) : appt.start_time);
                  const hora = apptDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  const clientName = clientMap.get(appt.client_id) || 'Cliente desconocido';
                  const serviceName = serviceMap.get(appt.service_id) || 'Tratamiento';
                  return (
                    <div
                      key={appt.id}
                      onClick={() => router.push('/dashboard/calendar')}
                      className="flex items-center gap-5 py-4 cursor-pointer group hover:bg-stone-50 -mx-2 px-2 rounded-2xl transition-colors"
                    >
                      {/* Hora */}
                      <div className="w-16 shrink-0 text-center">
                        <span className="text-lg font-extrabold text-stone-800 leading-none">{hora}</span>
                        <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-0.5">h</p>
                      </div>

                      {/* Separador vertical */}
                      <div className="w-px h-10 bg-stone-100 shrink-0" />

                      {/* Cliente + Tratamiento */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 truncate">{clientName}</p>
                        <p className="text-sm text-stone-400 font-medium truncate">{serviceName}</p>
                      </div>

                      {/* Estado badge */}
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0
                        ${ appt.status === 'confirmed' ? 'bg-[#fdf2f3] text-[#d9777f]'
                          : appt.status === 'web_pending' ? 'bg-orange-50 text-orange-500'
                          : 'bg-stone-100 text-stone-400'}`}>
                        {appt.status === 'confirmed' ? 'Confirmada'
                          : appt.status === 'web_pending' ? 'Web'
                          : 'Pendiente'}
                      </span>

                      {/* Chevron */}
                      <ChevronRight size={18} strokeWidth={1.5} className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
