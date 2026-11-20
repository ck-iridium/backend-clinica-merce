"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarDays, Users, Banknote, Activity, Plus, UserPlus, 
  Zap, ChevronRight, CalendarCheck, Clock, Sparkles, Bot, 
  Tag, Globe, ArrowUpRight, ShieldAlert, CheckCircle2
} from 'lucide-react';
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

  const confirmedAppointmentsCount = todayAppointments.filter((a: any) => a.status === 'confirmed').length;
  const pendingAppointmentsCount = todayAppointments.length - confirmedAppointmentsCount;

  // Próxima cita hoy
  const nowTs = Date.now();
  const nextAppointment = todayAppointments.find((a: any) => {
    const d = new Date(a.start_time.endsWith('Z') ? a.start_time.slice(0, -1) : a.start_time);
    return d.getTime() > nowTs;
  }) || todayAppointments[0] || null;

  const clientMap = new Map(clients.map((c: any) => [c.id, c.name]));
  const serviceMap = new Map(services.map((s: any) => [s.id, s.name]));

  // Métricas
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
  
  // Ocupación estándar de jornada (8h = 480m)
  const occupancyRateValue = totalBookedMinutes > 0 ? Math.min(100, Math.round((totalBookedMinutes / 480) * 100)) : 0;

  // Saludo dinámico según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 13) {
      return language === 'en' ? 'Good morning' : language === 'fr' ? 'Bonjour' : 'Buenos días';
    } else if (hour >= 13 && hour < 21) {
      return language === 'en' ? 'Good afternoon' : language === 'fr' ? 'Bon après-midi' : 'Buenas tardes';
    } else {
      return language === 'en' ? 'Good evening' : language === 'fr' ? 'Bonsoir' : 'Buenas noches';
    }
  };

  // Limpieza de nombre en modo soporte
  const isSupportMode = userName.toLowerCase().includes('soporte');
  const cleanDisplayName = isSupportMode 
    ? userName.replace(/modo\s*soporte:\s*/i, '').trim() || 'Modo Soporte'
    : (userName || 'Equipo');

  const getFormattedDate = () => {
    const locale = language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR';
    return new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleOpenCopilot = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-probookia-copilot'));
    }
  };

  const metrics = [
    {
      id: 'today_appointments',
      label: t('dashboard.home.today_appointments') || 'Citas de Hoy',
      value: todayAppointments.length.toString(),
      sublabel: `${confirmedAppointmentsCount} confirmadas · ${pendingAppointmentsCount} pendientes`,
      icon: CalendarDays,
      color: 'text-[#FF6B00]',
      bg: 'bg-orange-500/10',
      border: 'border-orange-200/60',
      glow: 'from-orange-500/10 to-transparent',
      onClick: () => router.push('/dashboard/calendar'),
    },
    {
      id: 'new_clients',
      label: t('dashboard.home.new_clients') || 'Clientes Activos',
      value: clients.length.toString(),
      sublabel: 'Expedientes registrados',
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-500/10',
      border: 'border-sky-200/50',
      glow: 'from-sky-500/10 to-transparent',
      onClick: () => router.push('/dashboard/clients'),
    },
    {
      id: 'estimated_revenue',
      label: t('dashboard.home.estimated_revenue') || 'Ingresos Estimados',
      value: `${estimatedRevenueValue.toLocaleString('es-ES')} €`,
      sublabel: 'Facturación en agenda hoy',
      icon: Banknote,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-200/50',
      glow: 'from-emerald-500/10 to-transparent',
      onClick: () => router.push('/dashboard/invoices'),
    },
    {
      id: 'occupancy_rate',
      label: t('dashboard.home.occupancy_rate') || 'Tasa de Ocupación',
      value: `${occupancyRateValue}%`,
      sublabel: `${Math.floor(totalBookedMinutes / 60)}h ${totalBookedMinutes % 60}m reservadas (8h)`,
      icon: Activity,
      color: 'text-stone-700',
      bg: 'bg-stone-100',
      border: 'border-stone-200/70',
      glow: 'from-orange-500/5 to-transparent',
      onClick: () => router.push('/dashboard/calendar'),
    },
  ].filter(m => {
    if (role?.toLowerCase() === 'especialista') {
      return m.id !== 'estimated_revenue';
    }
    return true;
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-8 font-sans">

      {/* ── 1. Hero Card Ejecutivo & Hub de Acciones ProBookia ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-white/95 backdrop-blur-xl p-6 sm:p-8 lg:p-9 shadow-sm">
        {/* Halo sutil de fondo ProBookia */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-500/5 via-stone-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          {/* Izquierda: Saludo y Estado */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/70 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                <span>{t('dashboard.home.control_panel') || 'Panel de Control'}</span>
              </span>
              {isSupportMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  Modo Soporte Activo
                </span>
              )}
              <span className="text-stone-400 font-medium text-xs capitalize">
                • {getFormattedDate()}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {getGreeting()},{' '}
                <span className="text-[#1E2540]">{cleanDisplayName}</span>
              </h1>
              <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">
                {todayAppointments.length === 0
                  ? 'Tu agenda está libre hoy. Puedes registrar citas, emitir tickets en caja o gestionar tu catálogo.'
                  : `Tienes ${todayAppointments.length} ${todayAppointments.length === 1 ? 'cita programada' : 'citas programadas'} hoy · Ocupación estimada al ${occupancyRateValue}%.`}
              </p>
            </div>
          </div>

          {/* Derecha: Hub de Acciones Rápidas ProBookia (Estilo Limpio y Homogéneo) */}
          <div className="flex items-center gap-3 flex-wrap xl:justify-end shrink-0">
            {/* CTA Primario ProBookia */}
            <button
              type="button"
              onClick={() => router.push('/dashboard/calendar')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF6B00] hover:bg-[#EA5E00] text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>{t('dashboard.home.new_appointment') || 'Nueva Cita'}</span>
            </button>

            {/* Cobro Rápido TPV (Armónico y elegante) */}
            {role?.toLowerCase() !== 'especialista' && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/pos')}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 font-semibold text-sm shadow-2xs transition-all active:scale-95 group"
              >
                <Zap className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                <span>{t('dashboard.home.quick_sale') || 'Cobro Rápido'}</span>
              </button>
            )}

            {/* Nuevo Cliente */}
            <button
              type="button"
              onClick={() => router.push('/dashboard/clients')}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 font-semibold text-sm shadow-2xs transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-stone-500" strokeWidth={2} />
              <span>{t('dashboard.home.new_client') || 'Nuevo Cliente'}</span>
            </button>

            {/* Co-Piloto IA */}
            <button
              type="button"
              onClick={handleOpenCopilot}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#EA5E00] border border-orange-200/80 font-semibold text-sm shadow-2xs transition-all active:scale-95"
              title="Abrir Co-Piloto Operativo IA"
            >
              <Bot className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              <span className="hidden sm:inline">Co-Piloto IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Grid de Métricas (Bento Grid KPIs) ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="rounded-[2rem] border-stone-200/60 p-6 flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-xl" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              <Skeleton className="w-13 h-13 rounded-2xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.id}
                onClick={m.onClick}
                className="relative overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white/90 backdrop-blur-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${m.glow} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />
                
                <div className="space-y-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{m.label}</span>
                    <div className={`w-11 h-11 rounded-2xl ${m.bg} ${m.border} border flex items-center justify-center ${m.color} shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-sans">
                      {m.value}
                    </p>
                    <p className="text-xs text-stone-400 font-medium mt-1 truncate">
                      {m.sublabel}
                    </p>
                  </div>

                  {/* Microbarra de progreso para la tasa de ocupación */}
                  {m.id === 'occupancy_rate' && (
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${occupancyRateValue}%` }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── 3. Layout Asimétrico Bento (Agenda en Vivo + Hub Operativo) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Columna Izquierda (8 cols): Tu Día de un Vistazo ── */}
        <div className="lg:col-span-8">
          <Card className="rounded-[2.2rem] border border-stone-200/70 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-stone-100/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    {t('dashboard.home.day_at_glance') || 'Tu Día de un Vistazo'}
                  </h2>
                </div>
                <p className="text-xs text-stone-400 font-medium">Programación de la jornada en tiempo real</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-600 bg-stone-100/90 px-3.5 py-1.5 rounded-full border border-stone-200/60 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                {todayAppointments.length} {t('dashboard.home.citas_hoy') || 'citas hoy'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 py-8">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-16 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </div>
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              // ── Empty State Limpio ──
              <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-center">
                <div className="w-18 h-18 rounded-3xl bg-orange-500/10 border border-orange-200/70 flex items-center justify-center text-[#FF6B00] shadow-xs">
                  <CalendarCheck className="w-9 h-9 text-[#FF6B00]" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <p className="text-stone-900 font-serif font-bold text-xl">
                    {t('dashboard.home.no_appointments') || 'Agenda despejada para hoy'}
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    {t('dashboard.home.rest_or_manage') || 'No tienes citas registradas para esta jornada. Puedes registrar citas manuales, consultar expedientes o realizar ventas directas desde la caja.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/calendar')}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#FF6B00] hover:bg-[#EA5E00] text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span>{t('dashboard.home.new_appointment') || 'Nueva Cita'}</span>
                  </button>
                  {role?.toLowerCase() !== 'especialista' && (
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/pos')}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 font-semibold text-xs shadow-2xs transition-all active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
                      <span>Cobro en Caja TPV</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // ── Lista de Citas Refinada ──
              <div className="divide-y divide-stone-100/80 pt-2">
                {todayAppointments.map((appt: any) => {
                  const apptDate = new Date(appt.start_time.endsWith('Z') ? appt.start_time.slice(0, -1) : appt.start_time);
                  const hora = apptDate.toLocaleTimeString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const clientName = clientMap.get(appt.client_id) || 'Cliente';
                  const serviceName = serviceMap.get(appt.service_id) || 'Tratamiento General';
                  const servicePrice = servicePriceMap.get(appt.service_id);
                  const serviceDuration = serviceDurationMap.get(appt.service_id) || 30;
                  
                  const isConfirmed = appt.status === 'confirmed';
                  const isWeb = appt.status === 'web_pending';

                  return (
                    <div
                      key={appt.id}
                      onClick={() => router.push('/dashboard/calendar')}
                      className="flex items-center gap-4 sm:gap-6 py-4.5 cursor-pointer group hover:bg-stone-50/70 -mx-3 px-3 sm:-mx-4 sm:px-4 rounded-2xl transition-all duration-200"
                    >
                      {/* Hora */}
                      <div className="w-16 shrink-0 text-center bg-stone-50/80 border border-stone-200/50 py-2 rounded-xl group-hover:border-orange-300 transition-colors">
                        <span className="text-base font-bold text-stone-900 leading-none font-mono">{hora}</span>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">hrs</p>
                      </div>

                      {/* Cliente + Tratamiento */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-stone-900 truncate text-sm sm:text-base group-hover:text-[#1E2540] transition-colors">
                            {clientName}
                          </p>
                          <span className="text-[11px] text-stone-400 font-mono">
                            · {serviceDuration}m
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-medium truncate mt-0.5">
                          {serviceName} {role?.toLowerCase() !== 'especialista' && servicePrice ? `(${servicePrice}€)` : ''}
                        </p>
                      </div>

                      {/* Estado badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 border
                        ${isConfirmed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : isWeb 
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : 'bg-stone-100 text-stone-600 border-stone-200/60'}`}>
                        {isConfirmed ? (t('dashboard.home.confirmed') || 'Confirmada')
                          : isWeb ? (t('dashboard.home.web') || 'Web')
                          : (t('dashboard.home.pending') || 'Pendiente')}
                      </span>

                      {/* Chevron */}
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Columna Derecha (4 cols): Accesos Operativos & Siguiente Cita ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Tarjeta de Próxima Cita en Cabina */}
          {nextAppointment ? (
            <Card className="rounded-[2.2rem] border border-stone-200/70 bg-gradient-to-br from-orange-500/10 via-white to-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-[#EA5E00] text-[10px] font-extrabold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-[#FF6B00]" />
                  Próxima en Cabina
                </span>
                <span className="text-xs font-mono font-bold text-stone-700">
                  {new Date(nextAppointment.start_time.endsWith('Z') ? nextAppointment.start_time.slice(0, -1) : nextAppointment.start_time).toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })} hrs
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {clientMap.get(nextAppointment.client_id) || 'Cliente'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {serviceMap.get(nextAppointment.service_id) || 'Tratamiento'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/dashboard/calendar')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold transition-all shadow-2xs"
              >
                <span>Ver detalles en Agenda</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </Card>
          ) : (
            <Card className="rounded-[2.2rem] border border-stone-200/70 bg-white/95 backdrop-blur-xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-serif font-bold text-base text-stone-900">Centro Operativo Activo</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Plataforma conectada y lista para recibir reservas en tiempo real y emitir tickets de caja.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                <span>Catálogo de servicios</span>
                <span className="font-bold text-stone-800">{services.length} tratamientos</span>
              </div>
            </Card>
          )}

          {/* Atajos Operativos Frecuentes */}
          <Card className="rounded-[2.2rem] border border-stone-200/70 bg-white/95 backdrop-blur-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Accesos Operativos Frecuentes
            </h3>

            <div className="space-y-2">
              {role?.toLowerCase() !== 'especialista' && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/pos')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200/60 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 text-[#FF6B00] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-[#FF6B00] transition-colors">
                        Caja & Venta Rápida (TPV)
                      </p>
                      <p className="text-[11px] text-stone-400">Cobro directo y ticket instantáneo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 transition-colors" />
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push('/dashboard/clients')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 group-hover:text-sky-700 transition-colors">
                      Fichas & Clientes
                    </p>
                    <p className="text-[11px] text-stone-400">Expedientes, consentimientos y bonos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/pages')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 group-hover:text-purple-700 transition-colors">
                      Diseñador Web & Páginas
                    </p>
                    <p className="text-[11px] text-stone-400">Editar bloques visuales y fotos IA</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/services')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] border border-orange-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 group-hover:text-[#FF6B00] transition-colors">
                      Catálogo de Servicios
                    </p>
                    <p className="text-[11px] text-stone-400">Tarifas y duraciones de cabina</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 transition-colors" />
              </button>
            </div>
          </Card>

          {/* Tarjeta Co-Piloto Operativo IA ProBookia */}
          <div className="rounded-[2.2rem] bg-gradient-to-br from-[#162033] via-[#1B2742] to-[#141B2D] text-white p-6 sm:p-7 border border-stone-800 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/15 rounded-bl-full pointer-events-none group-hover:bg-[#FF6B00]/25 transition-all" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                    Co-Piloto Operativo IA
                  </h4>
                  <p className="text-[11px] text-stone-400">Asistente en tiempo real</p>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Pídele al Co-Piloto agendar citas, consultar tus métricas o redactar textos y fotos de servicios para tu web.
              </p>

              <button
                type="button"
                onClick={handleOpenCopilot}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#EA5E00] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Abrir Co-Piloto IA</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
