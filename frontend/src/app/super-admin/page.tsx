"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-850 flex">
      {/* Sidebar Modular */}
      <SuperAdminSidebar />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-stone-200/50 px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 font-sans">
              <span>Consola SaaS</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <span>Inquilinos</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <span className="text-[#d4af37] font-bold">Listado General</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900">Backoffice Master</h1>
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
      </main>
    </div>
  );
}
