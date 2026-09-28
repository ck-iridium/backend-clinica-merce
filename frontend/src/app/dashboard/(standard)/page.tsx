"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, Banknote, Activity, Plus, UserPlus, Zap, ChevronRight, CalendarCheck, Clock, Sparkles } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthRole } from '@/hooks/useAuthRole';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { role, userName: authUserName, loading: loadingRole } = useAuthRole();
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (authUserName) {
      setUserName(authUserName);
    }
  }, [authUserName]);

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

  // Lógica dinámica de métricas aisladas por inquilino
  const servicePriceMap = new Map(services.map((s: any) => [s.id, Number(s.price) || 0]));
  const estimatedRevenueValue = todayAppointments.reduce((sum: number, appt: any) => {
    const price = servicePriceMap.get(appt.service_id) || 0;
    return sum + price;
  }, 0);

  const serviceDurationMap = new Map(services.map((s: any) => [s.id, Number(s.duration_minutes) || 0]));
  const totalBookedMinutes = todayAppointments.reduce((sum: number, appt: any) => {
    const duration = serviceDurationMap.get(appt.service_id) || 30;
    return sum + duration;
  }, 0);
  
  // Asumiendo una jornada laboral estándar de 8 horas (480 minutos)
  const occupancyRateValue = totalBookedMinutes > 0 ? Math.min(100, Math.round((totalBookedMinutes / 480) * 100)) : 0;

  const metrics = [
    {
      id: 'today_appointments',
      label: t('dashboard.home.today_appointments'),
      value: todayAppointments.length.toString(),
      icon: CalendarDays,
      color: 'text-[#B38F26]',
      bg: 'bg-amber-500/10',
      border: 'border-amber-200/50',
      glow: 'from-amber-500/10 to-transparent',
    },
    {
      id: 'new_clients',
      label: t('dashboard.home.new_clients'),
      value: clients.length.toString(),
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-500/10',
      border: 'border-sky-200/50',
      glow: 'from-sky-500/10 to-transparent',
    },
    {
      id: 'estimated_revenue',
      label: t('dashboard.home.estimated_revenue'),
      value: `${estimatedRevenueValue} €`,
      icon: Banknote,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-200/50',
      glow: 'from-emerald-500/10 to-transparent',
    },
    {
      id: 'occupancy_rate',
      label: t('dashboard.home.occupancy_rate'),
      value: `${occupancyRateValue}%`,
      icon: Activity,
      color: 'text-[#D4AF37]',
      bg: 'bg-stone-900/5',
      border: 'border-stone-200/60',
      glow: 'from-amber-400/10 to-transparent',
    },
  ].filter(m => {
    if (role?.toLowerCase() === 'especialista') {
      return m.id !== 'estimated_revenue';
    }
    return true;
  });

  const getFormattedDate = () => {
    const locale = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
    return new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">

      {/* ── Bienvenida & Acciones Rápidas ── */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/80 border border-stone-200/60 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{t('dashboard.home.control_panel')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            {t('dashboard.home.welcome')}, <span className="text-stone-700">{userName || 'Equipo'}</span>
          </h1>
          <p className="text-stone-400 font-sans font-medium text-xs sm:text-sm capitalize">
            {getFormattedDate()}
          </p>
        </div>

        {/* ── Acciones Rápidas con shadcn Button ── */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => router.push('/dashboard/calendar')}
            variant="luxury"
            size="default"
            className="gap-2 shadow-luxury h-11"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t('dashboard.home.new_appointment')}</span>
          </Button>

          <Button
            onClick={() => router.push('/dashboard/clients')}
            variant="outline"
            size="default"
            className="gap-2 h-11 bg-white/90 border-stone-200/80 hover:bg-stone-50 text-stone-700 font-semibold"
          >
            <UserPlus className="w-4 h-4 text-stone-500" strokeWidth={2} />
            <span>{t('dashboard.home.new_client')}</span>
          </Button>
          
          {(role?.toLowerCase() !== 'especialista') && (
            <Button
              onClick={() => router.push('/dashboard/pos')}
              variant="outline"
              size="default"
              className="gap-2 h-11 bg-white/90 border-stone-200/80 hover:bg-stone-50 text-stone-700 font-semibold"
            >
              <Zap className="w-4 h-4 text-amber-500" strokeWidth={2} />
              <span>{t('dashboard.home.quick_sale')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Grid de Métricas (Bento Grid KPIs) ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="rounded-[2rem] border-stone-200/60 p-6 flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
              <Skeleton className="w-13 h-13 rounded-2xl" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.label}
                  className="relative overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${m.glow} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{m.label}</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-sans">{m.value}</p>
                    </div>
                    <div className={`w-13 h-13 rounded-2xl ${m.bg} ${m.border} border flex items-center justify-center ${m.color} shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Panel Tu Día de un Vistazo ── */}
          <Card className="rounded-[2rem] border border-stone-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-stone-100/80">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">{t('dashboard.home.day_at_glance')}</h2>
                <p className="text-xs text-stone-400 font-sans font-medium">Programación del día en tiempo real</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-600 bg-stone-100/90 px-3.5 py-1.5 rounded-full border border-stone-200/60 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                {todayAppointments.length} {t('dashboard.home.citas_hoy')}
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              // ── Empty State ──
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-400 shadow-xs">
                  <CalendarCheck className="w-8 h-8 text-stone-300" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-stone-800 font-serif font-bold text-lg">
                    {t('dashboard.home.no_appointments')}
                  </p>
                  <p className="text-stone-400 font-sans text-xs max-w-sm leading-relaxed">
                    {t('dashboard.home.rest_or_manage')}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/calendar')}
                  variant="luxury"
                  size="default"
                  className="mt-2 gap-2 shadow-luxury"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>{t('dashboard.home.new_appointment')}</span>
                </Button>
              </div>
            ) : (
              // ── Lista de Citas Refinada ──
              <div className="divide-y divide-stone-100/80 pt-2">
                {todayAppointments.map((appt: any) => {
                  const apptDate = new Date(appt.start_time.endsWith('Z') ? appt.start_time.slice(0, -1) : appt.start_time);
                  const hora = apptDate.toLocaleTimeString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const clientName = clientMap.get(appt.client_id) || 'Cliente';
                  const serviceName = serviceMap.get(appt.service_id) || 'Tratamiento General';
                  
                  const isConfirmed = appt.status === 'confirmed';
                  const isWeb = appt.status === 'web_pending';

                  return (
                    <div
                      key={appt.id}
                      onClick={() => router.push('/dashboard/calendar')}
                      className="flex items-center gap-4 sm:gap-6 py-4.5 cursor-pointer group hover:bg-stone-50/70 -mx-3 px-3 sm:-mx-4 sm:px-4 rounded-2xl transition-all duration-200"
                    >
                      {/* Hora */}
                      <div className="w-16 shrink-0 text-center bg-stone-50/80 border border-stone-200/50 py-2 rounded-xl group-hover:border-[#D4AF37]/40 transition-colors">
                        <span className="text-base font-bold text-stone-900 leading-none font-mono">{hora}</span>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">hrs</p>
                      </div>

                      {/* Cliente + Tratamiento */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 truncate text-sm sm:text-base group-hover:text-stone-950 transition-colors">
                          {clientName}
                        </p>
                        <p className="text-xs text-stone-400 font-medium truncate mt-0.5">
                          {serviceName}
                        </p>
                      </div>

                      {/* Estado badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 border
                        ${isConfirmed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : isWeb 
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : 'bg-stone-100 text-stone-600 border-stone-200/60'}`}>
                        {isConfirmed ? t('dashboard.home.confirmed')
                          : isWeb ? t('dashboard.home.web')
                          : t('dashboard.home.pending')}
                      </span>

                      {/* Chevron */}
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
