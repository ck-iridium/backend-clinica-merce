"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import SuperAdminSidebar from './components/SuperAdminSidebar';
import TenantList from './components/TenantList';
import TenantDetail from './components/TenantDetail';
import AdminProfile from './components/AdminProfile';
import SaaSGlobalSettings from './components/SaaSGlobalSettings';
import SaaSAnalytics from './components/SaaSAnalytics';
import SaaSFinance from './components/SaaSFinance';
import SaaSCMSManager from './components/SaaSCMSManager';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  stripe_subscription_id?: string | null;
  plan_type?: string;
  subscription_expires_at?: string | null;
  custom_domain?: string | null;
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
              const fullName = session.user.user_metadata?.full_name || '';
              const avatarUrl = session.user.user_metadata?.avatar_url || '';
              setUser({
                email: session.user.email,
                id: session.user.id,
                access_token: session.access_token,
                role: role,
                full_name: fullName,
                avatar_url: avatarUrl
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

  // 3.2. Eliminar físicamente un inquilino de la base de datos (y actualizar la UI)
  const handleTenantDeleted = (tenantId: string) => {
    setTenants((prev) => {
      const filtered = prev.filter(t => t.id !== tenantId);
      if (filtered.length > 0) {
        setSelectedTenant(filtered[0]);
      } else {
        setSelectedTenant(null);
      }
      return filtered;
    });
  };

  // Perfil administrativo ahora se maneja modularmente en el componente <AdminProfile />

  // Carga inicial
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center py-24 px-8">
        <div className="w-full max-w-7xl space-y-8">
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
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Halos dorados ambientales */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

        <Card className="max-w-md w-full bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-stone-200/70 p-9 text-center shadow-xl relative z-10">
          <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-stone-900 border border-[#D4AF37]/30 text-[#D4AF37] mb-6 shadow-md shadow-[#D4AF37]/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Acceso Reservado</h1>
          <p className="text-stone-500 mb-8 font-sans text-xs leading-relaxed">
            Esta consola está estrictamente restringida a administradores de la plataforma global. Si eres propietario de una clínica, accede a través de tu subdominio correspondiente.
          </p>
          <div className="space-y-3">
            <Button
              variant="luxury"
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full text-xs"
            >
              Iniciar Sesión como Administrador
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/')}
              className="w-full text-xs text-stone-600"
            >
              Volver al Portal Público
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FAF9F6] text-stone-850 flex">
      {/* Sidebar Modular */}
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 px-8 flex items-center justify-between">
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
              ) : activeTab === 'cms' ? (
                <>
                  <span>CMS</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Gestor de Contenidos</span>
                </>
              ) : activeTab === 'profile' ? (
                <>
                  <span>Mi Perfil</span>
                  <ChevronRight className="w-3 h-3 text-stone-300" />
                  <span className="text-[#d4af37] font-bold">Administrador</span>
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
                : activeTab === 'cms'
                  ? 'CMS Portada & Sectores'
                  : activeTab === 'profile'
                    ? 'Mi Perfil Administrativo'
                    : activeTab === 'analytics'
                      ? 'Rendimiento y Métricas del Sistema'
                      : activeTab === 'finance'
                        ? 'Finanzas y Control de Ingresos'
                        : 'Backoffice Master'}
            </h1>
          </div>

          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-4 cursor-pointer hover:opacity-85 active:scale-95 transition-all select-none"
            title="Mi Perfil Administrativo"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-850">{user.full_name || 'Administrador Global'}</span>
              <span className="text-[10px] text-stone-400 font-medium">{user.email}</span>
            </div>
            {user.avatar_url ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#fcf8e5] shadow-inner shrink-0">
                <img src={user.avatar_url} alt="Avatar Admin" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#fcf8e5] text-[#d4af37] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                SA
              </div>
            )}
          </div>
        </header>

        {activeTab === 'settings' ? (
          <SaaSGlobalSettings
            saasSettings={saasSettings}
            loadingSettings={loadingSettings}
            savingSettings={savingSettings}
            onToggleIndexing={handleToggleSaasIndexing}
          />
        ) : activeTab === 'cms' ? (
          <SaaSCMSManager token={user?.access_token} />
        ) : activeTab === 'profile' ? (
          <AdminProfile user={user} setUser={setUser} />
        ) : activeTab === 'analytics' ? (
          <SaaSAnalytics tenants={tenants} />
        ) : activeTab === 'finance' ? (
          <SaaSFinance tenants={tenants} />
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
                onUpdateTenant={(updated) => {
                  setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
                  setSelectedTenant(updated);
                }}
                onDeleteTenant={handleTenantDeleted}
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
