"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  created_at: string | null;
}

export default function SuperAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
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
          // Decodificar el JWT en el cliente para verificar el rol rápidamente
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
              // Cargar inquilinos
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
      
      // Actualizar la lista en el estado local
      setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
      
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

  // 4. Salida si está cargando la sesión inicial
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center py-24 px-8">
        <div className="w-full max-w-5xl space-y-8">
          <div className="h-10 w-64 bg-stone-200 animate-pulse rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-stone-200 animate-pulse rounded-3xl"></div>
            <div className="h-32 bg-stone-200 animate-pulse rounded-3xl"></div>
            <div className="h-32 bg-stone-200 animate-pulse rounded-3xl"></div>
          </div>
          <div className="h-96 bg-stone-200 animate-pulse rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // 5. Salida si no es un Super Administrador autenticado
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
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#d4af37] transition-all duration-300">
            Volver a la Página Principal
          </button>
        </div>
      </div>
    );
  }

  // 6. Filtrar inquilinos en el cliente
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Métricas para Bento Grid
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.subscription_status === 'active').length;
  const suspendedTenants = tenants.filter(t => t.subscription_status === 'suspended').length;

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* CABECERA EDITORIAL DE LUJO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-stone-200/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-sans">Consola SaaS Global</p>
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 font-bold">Backoffice Master</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-stone-900 text-[#d4af37] px-3 py-1.5 rounded-full font-sans">
              Super Admin: {user.email}
            </span>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="text-xs font-semibold text-stone-500 hover:text-stone-950 transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* METRICAS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200/40 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
            <div className="absolute -top-4 -right-4 text-7xl opacity-5 select-none font-serif">T</div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Inquilinos</p>
            <h2 className="text-5xl font-serif font-bold text-stone-900">{totalTenants}</h2>
            <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
              <div className="bg-[#d4af37] h-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200/40 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
            <div className="absolute -top-4 -right-4 text-7xl opacity-5 select-none font-serif">A</div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Clínicas Activas</p>
            <h2 className="text-5xl font-serif font-bold text-[#d4af37]">{activeTenants}</h2>
            <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
              <div className="bg-[#d4af37] h-full" style={{ width: `${totalTenants > 0 ? (activeTenants / totalTenants) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200/40 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
            <div className="absolute -top-4 -right-4 text-7xl opacity-5 select-none font-serif">S</div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Accesos Suspendidos</p>
            <h2 className="text-5xl font-serif font-bold text-stone-700">{suspendedTenants}</h2>
            <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
              <div className="bg-stone-500 h-full" style={{ width: `${totalTenants > 0 ? (suspendedTenants / totalTenants) * 100 : 0}%` }}></div>
            </div>
          </div>

        </div>

        {/* FILTROS Y CONTROLES */}
        <div className="bg-white rounded-3xl border border-stone-200/50 p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Buscar por nombre o subdominio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-10 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-transparent transition-all text-sm font-sans"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">🔍</span>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {['all', 'active', 'suspended', 'canceled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    statusFilter === status 
                      ? 'bg-stone-900 text-[#d4af37] shadow-sm' 
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}>
                  {status === 'all' && 'Todos'}
                  {status === 'active' && 'Activos'}
                  {status === 'suspended' && 'Suspendidos'}
                  {status === 'canceled' && 'Cancelados'}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA PRINCIPAL DE INQUILINOS */}
          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="space-y-4 py-8">
                <div className="h-10 bg-stone-100 animate-pulse rounded-xl"></div>
                <div className="h-16 bg-stone-50 animate-pulse rounded-xl"></div>
                <div className="h-16 bg-stone-50 animate-pulse rounded-xl"></div>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-16 text-stone-400 font-sans font-medium text-sm">
                No se han encontrado inquilinos bajo los filtros indicados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-3 font-sans">Clínica</th>
                    <th className="py-4 px-3 font-sans">Subdominio</th>
                    <th className="py-4 px-3 font-sans">ID Cliente Stripe</th>
                    <th className="py-4 px-3 font-sans">Registro</th>
                    <th className="py-4 px-3 font-sans">Estado</th>
                    <th className="py-4 px-3 text-right font-sans">Acciones de Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans text-sm text-stone-700">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-stone-50/40 transition-colors">
                      <td className="py-5 px-3">
                        <span className="font-semibold text-stone-900 font-serif text-base">{tenant.name}</span>
                        <span className="block text-xxs text-stone-400 mt-1 uppercase tracking-wider font-sans">{tenant.id}</span>
                      </td>
                      <td className="py-5 px-3">
                        <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-xs font-semibold font-mono">
                          {tenant.slug}.tu-saas.com
                        </span>
                      </td>
                      <td className="py-5 px-3 text-stone-500 font-mono text-xs">
                        {tenant.stripe_customer_id || 'Sin cuenta'}
                      </td>
                      <td className="py-5 px-3 text-stone-500">
                        {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Semilla'}
                      </td>
                      <td className="py-5 px-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-widest ${
                          tenant.subscription_status === 'active'
                            ? 'bg-amber-50 text-[#d4af37] border border-amber-100'
                            : tenant.subscription_status === 'suspended'
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {tenant.subscription_status === 'active' && 'Activo'}
                          {tenant.subscription_status === 'suspended' && 'Suspendido'}
                          {tenant.subscription_status === 'canceled' && 'Cancelado'}
                        </span>
                      </td>
                      <td className="py-5 px-3 text-right">
                        {tenant.subscription_status === 'active' ? (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'suspended')}
                            className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow hover:bg-stone-800 transition-all active:scale-95">
                            Suspender Acceso
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTenantStatus(tenant.id, 'active')}
                            className="bg-white border border-stone-200 text-stone-950 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all active:scale-95">
                            Restaurar Acceso
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
