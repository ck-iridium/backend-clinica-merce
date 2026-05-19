"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChevronRight, Globe, ShieldCheck, Loader2, TrendingUp, Users, Sparkles, CreditCard, Award, DollarSign, Activity, Building } from 'lucide-react';

import SuperAdminSidebar from './components/SuperAdminSidebar';
import TenantList from './components/TenantList';
import TenantDetail from './components/TenantDetail';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  stripe_subscription_id?: string | null;
  plan_type?: string;
  subscription_expires_at?: string | null;
  created_at: string | null;
}

export default function SuperAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState('tenants');
  const [saasSettings, setSaasSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Verificar sesión de Supabase Auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const tokenParts = session.access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const role = payload.app_metadata?.role || payload.user_metadata?.role;
            
            if (role === 'super_admin') {
              setUser({
                email: session.user.email,
                id: session.user.id,
                access_token: session.access_token,
                role: role
              });
              fetchTenants(session.access_token);
              fetchSaasSettings(session.access_token);
            } else {
              setUser({ role: role || 'client' });
            }
          }
        }
      } catch (err) {
        console.error('Error al comprobar sesión:', err);
      } finally {
        setLoadingSession(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch settings dynamically if tab changes
  useEffect(() => {
    if (user?.access_token && activeTab === 'settings') {
      fetchSaasSettings(user.access_token);
    }
  }, [activeTab, user]);

  // 2. Obtener lista de inquilinos del Backend
  async function fetchTenants(token: string) {
    setLoadingData(true);
    try {
      const response = await fetch(`${API_URL}/super-admin/tenants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error al consultar los inquilinos en el servidor');
      }
      const data = await response.json();
      setTenants(data);
      if (data.length > 0) {
        setSelectedTenant(data[0]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con la API de administración');
    } finally {
      setLoadingData(false);
    }
  }

  // 2.2. Obtener configuración global del SaaS
  async function fetchSaasSettings(token: string) {
    setLoadingSettings(true);
    try {
      const response = await fetch(`${API_URL}/super-admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSaasSettings(data);
      }
    } catch (err) {
      console.error("Error fetching SaaS settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }

  // 2.3. Guardar indexación global del SaaS
  async function handleToggleSaasIndexing() {
    if (!user?.access_token || !saasSettings) return;
    setSavingSettings(true);
    const newIndexValue = !saasSettings.allow_search_engine_indexing;
    const loadingToast = toast.loading('Actualizando indexación de motores de búsqueda...');
    try {
      const response = await fetch(`${API_URL}/super-admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({ allow_search_engine_indexing: newIndexValue })
      });
      if (!response.ok) {
        throw new Error('Error al actualizar los ajustes del SaaS');
      }
      setSaasSettings({ allow_search_engine_indexing: newIndexValue });
      toast.success(newIndexValue 
        ? 'Indexación global de motores de búsqueda ACTIVADA para el SaaS' 
        : 'Indexación global de motores de búsqueda DESACTIVADA para el SaaS', 
        { id: loadingToast }
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar los ajustes del SaaS', { id: loadingToast });
    } finally {
      setSavingSettings(false);
    }
  }

  // 3. Modificar estado de suscripción (Suspender / Activar)
  async function updateTenantStatus(tenantId: string, newStatus: 'active' | 'suspended') {
    if (!user?.access_token) return;
    
    const loadingToast = toast.loading('Actualizando estado del inquilino...');
    try {
      const response = await fetch(`${API_URL}/super-admin/tenants/${tenantId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al actualizar el estado en el servidor');
      }

      const updatedTenant = await response.json();
      
      setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(updatedTenant);
      }
      
      toast.success(
        newStatus === 'suspended' 
          ? `Acceso para '${updatedTenant.name}' suspendido correctamente.`
          : `Acceso para '${updatedTenant.name}' reactivado correctamente.`,
        { id: loadingToast }
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la actualización de estado', { id: loadingToast });
    }
  }

  // Carga inicial
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center py-24 px-8">
        <div className="w-full max-w-5xl space-y-8">
          <div className="h-10 w-64 bg-stone-200 animate-pulse rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-stone-200 animate-pulse rounded-[2rem]"></div>
            <div className="h-32 bg-stone-200 animate-pulse rounded-[2rem]"></div>
            <div className="h-32 bg-stone-200 animate-pulse rounded-[2rem]"></div>
          </div>
          <div className="h-96 bg-stone-200 animate-pulse rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  // Acceso Denegado con opción a Iniciar Sesión como Super Admin
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-stone-200/60 p-10 text-center shadow-luxury">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-stone-100 text-stone-600 mb-6 text-2xl">
            🔒
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Acceso Denegado</h1>
          <p className="text-stone-500 mb-8 font-sans font-medium text-sm leading-relaxed">
            Esta área está estrictamente reservada para el Super Administrador global del SaaS. Tu cuenta actual no dispone de los privilegios requeridos.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-[#d4af37] hover:bg-[#c29f2e] text-stone-950 font-bold py-4 rounded-xl shadow-md transition-all duration-300">
              Iniciar Sesión como Super Admin
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-4 rounded-xl shadow-sm transition-all duration-300">
              Volver a la Página Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic metrics calculations for dashboards
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.subscription_status === 'active').length;
  const suspendedTenantsCount = tenants.filter(t => t.subscription_status === 'suspended').length;
  
  const freeTrialPlansCount = tenants.filter(t => t.plan_type === 'free' || !t.plan_type).length;
  const basicPlansCount = tenants.filter(t => t.plan_type === 'basic').length;
  const proPlansCount = tenants.filter(t => t.plan_type === 'pro').length;
  const goldPlansCount = tenants.filter(t => t.plan_type === 'gold').length;

  const activeMRR = tenants.reduce((acc, t) => {
    if (t.subscription_status === 'active') {
      if (t.plan_type === 'basic') return acc + 29;
      if (t.plan_type === 'pro') return acc + 59;
      if (t.plan_type === 'gold') return acc + 99;
    }
    return acc;
  }, 0);

  const arpu = activeMRR / (activeTenantsCount || 1);
  const annualRunRate = activeMRR * 12;

  const formattedMRR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(activeMRR);
  const formattedARPU = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(arpu);
  const formattedARR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(annualRunRate);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-850 flex">
      {/* Sidebar Modular */}
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-stone-200/50 px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 font-sans">
              <span>Consola SaaS</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              {activeTab === 'settings' ? (
                <>
                  <span>Configuración</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Ajustes Globales</span>
                </>
              ) : activeTab === 'analytics' ? (
                <>
                  <span>Monitoreo</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Rendimiento</span>
                </>
              ) : activeTab === 'finance' ? (
                <>
                  <span>Ingresos</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Facturación Global</span>
                </>
              ) : (
                <>
                  <span>Inquilinos</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Listado General</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              {activeTab === 'settings' 
                ? 'Configuración Global del SaaS' 
                : activeTab === 'analytics' 
                ? 'Rendimiento y Métricas del Sistema' 
                : activeTab === 'finance'
                ? 'Finanzas y Control de Ingresos'
                : 'Backoffice Master'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-850">Administrador Global</span>
              <span className="text-[10px] text-stone-400 font-medium">{user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center font-bold text-sm shadow-inner">
              SA
            </div>
          </div>
        </header>

        {activeTab === 'settings' ? (
          <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-[800px] mx-auto w-full animate-in fade-in duration-300">
            {/* Bento Card: Indexación de Motores de Búsqueda */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af37]"></div>
              
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-stone-100">
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-stone-800">Indexación en Buscadores</h3>
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest block mt-0.5">Control de Visibilidad de Landing Page y App SaaS</span>
                </div>
              </div>

              {loadingSettings ? (
                <div className="flex flex-col justify-center items-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                  <span className="text-sm text-stone-400 font-medium font-sans">Cargando configuración...</span>
                </div>
              ) : saasSettings ? (
                <div className="space-y-6">
                  <div className="p-6 bg-stone-50 rounded-[2rem] border border-stone-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shrink-0 shadow-sm">
                      <ShieldCheck size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-800">Visibilidad del SaaS Global</h4>
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                        Controla si la landing page corporativa de <strong>Probookia (www.probookia.com)</strong> y sus páginas de marketing son indexables en Google. Si desactivas esta opción, se agregará la directiva <code>noindex, nofollow</code> al sitio global, previniendo su aparición pública en buscadores.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Interruptor Premium */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-stone-900">
                        {saasSettings.allow_search_engine_indexing ? 'Indexación Global Activada' : 'Indexación Global Desactivada'}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">
                        {saasSettings.allow_search_engine_indexing 
                          ? 'El SaaS corporativo y la landing serán rastreados por motores de búsqueda.' 
                          : 'Rastreo bloqueado temporalmente (Modo Lanzamiento / Privado).'}
                      </span>
                    </div>

                    <label className="flex items-center gap-4 cursor-pointer self-start sm:self-auto">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={saasSettings.allow_search_engine_indexing} 
                          onChange={handleToggleSaasIndexing}
                          disabled={savingSettings}
                          className="sr-only" 
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${saasSettings.allow_search_engine_indexing ? 'bg-[#d4af37]' : 'bg-stone-200'} ${savingSettings ? 'opacity-50' : ''}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${saasSettings.allow_search_engine_indexing ? 'translate-x-6' : ''} shadow-sm`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500">
                  No se pudo cargar la configuración de los ajustes globales.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-[1000px] mx-auto w-full animate-in fade-in duration-300">
            {/* Bento Matrix: Tarjetas de Rendimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#d4af37]"></div>
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Negocios Registrados</span>
                  <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{totalTenantsCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Cuentas Activas</span>
                  <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{activeTenantsCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>
                <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Tasa de Ocupación SaaS</span>
                  <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">
                    {totalTenantsCount > 0 ? Math.round((activeTenantsCount / totalTenantsCount) * 100) : 0}%
                  </span>
                </div>
              </div>

            </div>

            {/* Distribución por Planes */}
            <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" /> Distribución de Clientes por Planes
              </h3>

              <div className="space-y-6">
                
                {/* Gold Plan */}
                <div>
                  <div className="flex justify-between items-center text-sm font-sans mb-2">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]"></span> Gold Plan (Lujo Total)
                    </span>
                    <span className="text-stone-500 font-semibold">{goldPlansCount} inquilinos</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#d4af37] rounded-full transition-all duration-500" 
                      style={{ width: `${totalTenantsCount > 0 ? (goldPlansCount / totalTenantsCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pro Plan */}
                <div>
                  <div className="flex justify-between items-center text-sm font-sans mb-2">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-850"></span> Pro Plan (Multisala)
                    </span>
                    <span className="text-stone-500 font-semibold">{proPlansCount} inquilinos</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-850 rounded-full transition-all duration-500" 
                      style={{ width: `${totalTenantsCount > 0 ? (proPlansCount / totalTenantsCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Basic Plan */}
                <div>
                  <div className="flex justify-between items-center text-sm font-sans mb-2">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span> Basic Plan (Mono)
                    </span>
                    <span className="text-stone-500 font-semibold">{basicPlansCount} inquilinos</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-400 rounded-full transition-all duration-500" 
                      style={{ width: `${totalTenantsCount > 0 ? (basicPlansCount / totalTenantsCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Free Plan / Demo */}
                <div>
                  <div className="flex justify-between items-center text-sm font-sans mb-2">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span> Semilla de Sistema / Free Trial
                    </span>
                    <span className="text-stone-500 font-semibold">{freeTrialPlansCount} inquilinos</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-200 rounded-full transition-all duration-500" 
                      style={{ width: `${totalTenantsCount > 0 ? (freeTrialPlansCount / totalTenantsCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : activeTab === 'finance' ? (
          <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-[1000px] mx-auto w-full animate-in fade-in duration-300">
            {/* Bento Matrix: Financiera */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#d4af37]"></div>
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">MRR Estimado</span>
                  <span className="text-3xl font-serif font-black text-stone-900 block mt-0.5">{formattedMRR}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">ARPU (Ingreso Medio)</span>
                  <span className="text-2xl font-serif font-black text-stone-900 block mt-0.5">{formattedARPU}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-stone-850"></div>
                <span className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-850 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">ARR (Run Rate Anual)</span>
                  <span className="text-2xl font-serif font-black text-stone-900 block mt-0.5">{formattedARR}</span>
                </div>
              </div>

            </div>

            {/* Listado de Suscripciones con Precios */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-stone-100">
                <h3 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#d4af37]" /> Estado Financiero por Inquilino
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-bold tracking-wider text-[10px] uppercase">
                      <th className="py-4 px-8">Inquilino / Slug</th>
                      <th className="py-4 px-6">Plan Suscrito</th>
                      <th className="py-4 px-6">Estado Cobro</th>
                      <th className="py-4 px-8 text-right">Facturación Estimada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => {
                      let planPrice = 0;
                      if (t.subscription_status === 'active') {
                        if (t.plan_type === 'basic') planPrice = 29;
                        if (t.plan_type === 'pro') planPrice = 59;
                        if (t.plan_type === 'gold') planPrice = 99;
                      }

                      return (
                        <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                          <td className="py-4 px-8">
                            <span className="font-bold text-stone-800 block">{t.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">{t.slug}.probookia.com</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xxs font-black uppercase tracking-widest ${
                              t.plan_type === 'gold' 
                                ? 'bg-amber-50 text-[#b08e23]' 
                                : t.plan_type === 'pro'
                                ? 'bg-stone-900 text-white'
                                : t.plan_type === 'basic'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-stone-50 text-stone-400'
                            }`}>
                              {t.plan_type || 'free trial'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              t.subscription_status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {t.subscription_status === 'active' ? 'Pagado' : 'Suspendido / Trial'}
                            </span>
                          </td>
                          <td className="py-4 px-8 text-right font-mono font-bold text-stone-700">
                            {planPrice > 0 ? `${planPrice}€ / mes` : '0€ (Trial)'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Listado Modular */}
            <TenantList 
              tenants={tenants}
              selectedTenant={selectedTenant}
              onSelectTenant={setSelectedTenant}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loadingData={loadingData}
            />

            {/* Ficha Detallada Modular */}
            {selectedTenant ? (
              <TenantDetail 
                tenant={selectedTenant}
                onUpdateStatus={updateTenantStatus}
              />
            ) : (
              <section className="flex-1 bg-[#FAFAFA] flex items-center justify-center text-stone-400 font-serif text-lg">
                Selecciona una clínica para ver sus detalles de control.
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
