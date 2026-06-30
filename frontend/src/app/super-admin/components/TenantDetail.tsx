"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Power, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Globe 
} from 'lucide-react';

// Subcomponentes modulares
import TenantOverviewTab from './detail/TenantOverviewTab';
import TenantStripeTab from './detail/TenantStripeTab';
import TenantConfigTab from './detail/TenantConfigTab';
import DomainConnectionModal from './detail/DomainConnectionModal';
import DeleteConfirmModal from './detail/DeleteConfirmModal';

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
  custom_domain?: string | null;
  business_sector?: string | null;
}

interface TenantDetailProps {
  tenant: Tenant;
  onUpdateStatus: (tenantId: string, status: 'active' | 'suspended') => Promise<void>;
  onUpdateTenant?: (updatedTenant: Tenant) => void;
  onDeleteTenant?: (tenantId: string) => void;
}

export default function TenantDetail({ tenant, onUpdateStatus, onUpdateTenant, onDeleteTenant }: TenantDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stripe' | 'config'>('overview');
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [customDomain, setCustomDomain] = useState<string | null>(tenant.custom_domain || null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [inputDomain, setInputDomain] = useState('');
  const [savingDomain, setSavingDomain] = useState(false);

  // Estados para el borrado en cascada seguro
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Sincronizar el estado del dominio personalizado y limpiar cruzado entre inquilinos
  useEffect(() => {
    setCustomDomain(tenant.custom_domain || null);
    setInputDomain('');
    setConfirmText('');
    setShowDeleteModal(false);
  }, [tenant.id, tenant.custom_domain]);

  const getJwtToken = (): string => {
    let jwtToken = '';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('-auth-token')) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            jwtToken = parsed.access_token || '';
          } catch {}
        }
      }
    }

    if (!jwtToken) {
      const match = document.cookie.match(/sb-[a-zA-Z0-9]+-auth-token/);
      if (match) {
        const val = localStorage.getItem(match[0]);
        if (val) {
          try {
            jwtToken = JSON.parse(val).access_token || '';
          } catch {}
        }
      }
    }
    return jwtToken;
  };

  const handleConnectDomain = async () => {
    if (!inputDomain.trim()) {
      toast.error('Por favor escribe un dominio válido.');
      return;
    }

    setSavingDomain(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Guardando configuración de DNS...');

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/domain`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_domain: inputDomain.trim() })
      });

      if (!res.ok) {
        let errMsg = 'Error al conectar el dominio';
        try {
          const errorData = await res.json();
          errMsg = errorData.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const updatedTenant = await res.json();
      setCustomDomain(updatedTenant.custom_domain);
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant);
      }
      toast.success('¡Dominio personalizado conectado con éxito!', { id: loadingToast });
      setShowDomainModal(false);
      setInputDomain('');
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar el dominio', { id: loadingToast });
    } finally {
      setSavingDomain(false);
    }
  };

  const handleDisconnectDomain = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Desvinculando dominio personalizado...');

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/domain`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_domain: null })
      });

      if (!res.ok) {
        let errMsg = 'Error al desconectar el dominio';
        try {
          const errorData = await res.json();
          errMsg = errorData.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const updatedTenant = await res.json();
      setCustomDomain(null);
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant);
      }
      toast.success('Dominio personalizado desvinculado con éxito', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Error al desvincular el dominio', { id: loadingToast });
    }
  };

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const jwtToken = getJwtToken();

      const res = await fetch(`${API_URL}/super-admin/impersonate/${tenant.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('No se pudo generar el token de impersonación.');
      }

      const data = await res.json();
      if (data.success && data.token) {
        // Establecer cookies de impersonación por 2 horas
        document.cookie = `is_impersonating=true; path=/; max-age=7200; sameSite=lax`;
        document.cookie = `impersonate_tenant_id=${data.tenant_id}; path=/; max-age=7200; sameSite=lax`;
        document.cookie = `impersonate_tenant_slug=${data.slug}; path=/; max-age=7200; sameSite=lax`;
        document.cookie = `impersonate_tenant_name=${encodeURIComponent(data.name)}; path=/; max-age=7200; sameSite=lax`;
        document.cookie = `tenant_id=${data.tenant_id}; path=/; max-age=7200; sameSite=lax`;
        document.cookie = `tenant_slug=${data.slug}; path=/; max-age=7200; sameSite=lax`;

        toast.success(`Iniciando Modo Soporte: ${data.name}...`);
        
        // Redirigir al dashboard de la clínica
        window.location.href = `/dashboard`;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al entrar como soporte.');
    } finally {
      setImpersonating(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (confirmText !== tenant.slug) {
      toast.error('El subdominio ingresado no coincide.');
      return;
    }

    setDeleting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Eliminando inquilino y dependencias en cascada...');

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        let errMsg = 'Error al eliminar el inquilino';
        try {
          const errorData = await res.json();
          errMsg = errorData.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      toast.success('Inquilino y todos sus datos eliminados correctamente.', { id: loadingToast });
      setShowDeleteModal(false);
      setConfirmText('');
      if (onDeleteTenant) {
        onDeleteTenant(tenant.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el inquilino', { id: loadingToast });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateSector = async (sector: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Actualizando sector del negocio...');

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/sector`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ business_sector: sector })
      });

      if (!res.ok) {
        let errMsg = 'Error al actualizar el sector';
        try {
          const errorData = await res.json();
          errMsg = errorData.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const updatedTenant = await res.json();
      if (onUpdateTenant) {
        onUpdateTenant(updatedTenant);
      }
      toast.success('¡Sector del negocio actualizado con éxito!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el sector', { id: loadingToast });
    }
  };

  const handleSubscribe = async (plan: string) => {
    setRedirectingPlan(plan);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${API_URL}/stripe/create-subscription-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          plan_type: plan
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar la sesión de pago de Stripe');
      }

      const data = await response.json();
      if (data.url) {
        toast.success(`Redirigiendo a la pasarela de pago para el plan ${plan.toUpperCase()}...`);
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de redirección');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al iniciar la pasarela de pago.');
    } finally {
      setRedirectingPlan(null);
    }
  };

  return (
    <section className="flex-1 bg-[#FAFAFA] p-8 overflow-y-auto space-y-8">
      <div className="max-w-7xl space-y-8 animate-in fade-in duration-300">
        
        {/* 1. FICHA SUPERIOR (Logo + Título + Status) */}
        <div className="bg-white rounded-[2rem] border border-stone-200/30 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-3xl font-serif shadow-inner">
              🏢
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mb-1">
                {tenant.name}
              </h2>
              <p className="text-xs font-bold text-stone-400 font-mono">
                Subdominio: {tenant.slug}.probookia.com
              </p>
            </div>
          </div>

          {/* Acciones principales de control del tenant */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleImpersonate}
              disabled={impersonating}
              className="w-full md:w-auto bg-[#d4af37] focus:outline-none hover:bg-[#b08e23] hover:shadow-md text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-55 active:scale-95"
            >
              🏢 {impersonating ? 'Iniciando...' : 'Entrar como'}
            </button>
            {tenant.subscription_status === 'active' ? (
              <button
                onClick={() => onUpdateStatus(tenant.id, 'suspended')}
                className="w-full md:w-auto bg-stone-900 focus:outline-none hover:bg-red-600 hover:shadow-md text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Power className="w-4 h-4" />
                Suspender Acceso
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(tenant.id, 'active')}
                className="w-full md:w-auto bg-white border border-stone-200 text-stone-950 hover:border-[#d4af37] hover:text-[#d4af37] text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Reactivar Acceso
              </button>
            )}
          </div>
        </div>

        {/* 2. GRID BENTO DE KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: Estado de Suscripción */}
          <div className="bg-white p-6 rounded-[1.75rem] border border-stone-200/30 shadow-sm flex flex-col justify-between h-36">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Suscripción B2B</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                tenant.subscription_status === 'active' 
                  ? 'bg-[#d4af37] animate-pulse' 
                  : tenant.subscription_status === 'grace'
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-red-500'
              }`}></div>
              <span className="text-xl font-bold font-serif text-stone-900 capitalize leading-none">
                {tenant.subscription_status === 'active' 
                  ? 'Activo' 
                  : tenant.subscription_status === 'grace'
                  ? 'Periodo de Gracia'
                  : 'Suspendido'}
              </span>
            </div>
            <span className="text-xxs text-stone-400 font-medium">Control de acceso activo en middleware</span>
          </div>

          {/* Tarjeta 2: ID de Cliente Stripe */}
          <div className="bg-white p-6 rounded-[1.75rem] border border-stone-200/30 shadow-sm flex flex-col justify-between h-36">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Stripe Billing</p>
            <span className="text-sm font-bold font-mono text-stone-700 truncate">
              {tenant.stripe_customer_id || 'Sin vincular'}
            </span>
            <span className="text-xxs text-stone-400 font-medium">Pasarela recurrente de facturas</span>
          </div>

          {/* Tarjeta 3: Fecha de Registro */}
          <div className="bg-white p-6 rounded-[1.75rem] border border-stone-200/30 shadow-sm flex flex-col justify-between h-36">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Registro Inicial</p>
            <span className="text-base font-bold text-stone-850">
              {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Semilla de Sistema'}
            </span>
            <span className="text-xxs text-stone-400 font-medium">Fecha oficial de creación</span>
          </div>
        </div>

        {/* 3. ALERTA O PRECAUCIÓN DE SUSPENSIÓN SI CORRESPONDE */}
        {tenant.subscription_status !== 'active' && tenant.subscription_status !== 'grace' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-800">Clínica Suspendida</h4>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                El acceso público a esta clínica y a su panel de gestión está actualmente restringido. Los usuarios recibirán una pantalla de "Servicio Suspendido (Código 402)" al intentar acceder.
              </p>
            </div>
          </div>
        )}

        {/* 3.B ALERTA INFORMATIVA DE PERIODO DE GRACIA SI CORRESPONDE */}
        {tenant.subscription_status === 'grace' && (
          <div className="bg-blue-50/50 border border-blue-100/75 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-blue-800">Periodo de Gracia Activo</h4>
              <p className="text-xs text-blue-650 mt-1 leading-relaxed">
                Esta clínica cuenta con un acceso de gracia activo de 24 horas. Los administradores y usuarios pueden explorar y configurar el entorno de trabajo con total normalidad hasta la fecha de vencimiento.
              </p>
            </div>
          </div>
        )}

        {/* 4. SECCIÓN DE TABS INTERACTIVAS (Detalle Avanzado) */}
        <div className="bg-white rounded-[2rem] border border-stone-200/30 overflow-hidden shadow-sm">
          
          {/* Pestañas horizontales */}
          <div className="flex border-b border-stone-100 bg-[#FAFAFA]/50">
            {[
              { id: 'overview', label: 'Resumen', icon: Layers },
              { id: 'stripe', label: 'Pasarela Stripe', icon: DollarSign },
              { id: 'config', label: 'Configuración', icon: Globe }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 md:flex-none px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-b-2 ${
                    isActive 
                      ? 'border-[#d4af37] text-stone-900 bg-white' 
                      : 'border-transparent text-stone-400 hover:text-stone-700 bg-transparent'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="p-8 space-y-6">
            {activeTab === 'overview' && (
              <TenantOverviewTab tenant={tenant} />
            )}

            {activeTab === 'stripe' && (
              <TenantStripeTab 
                tenant={tenant}
                onSubscribe={handleSubscribe}
                redirectingPlan={redirectingPlan}
              />
            )}

            {activeTab === 'config' && (
              <TenantConfigTab 
                tenant={tenant}
                customDomain={customDomain}
                onDisconnectDomain={handleDisconnectDomain}
                onOpenDomainModal={() => setShowDomainModal(true)}
                onOpenDeleteModal={() => setShowDeleteModal(true)}
                onUpdateSector={handleUpdateSector}
              />
            )}
          </div>
        </div>

        {/* Modal de Configuración DNS para Dominio Personalizado */}
        <DomainConnectionModal 
          open={showDomainModal}
          onOpenChange={setShowDomainModal}
          inputDomain={inputDomain}
          onChangeInputDomain={setInputDomain}
          onConnect={handleConnectDomain}
          saving={savingDomain}
        />

        {/* Modal de Confirmación de Borrado en Cascada */}
        <DeleteConfirmModal 
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          tenantSlug={tenant.slug}
          tenantName={tenant.name}
          confirmText={confirmText}
          onChangeConfirmText={setConfirmText}
          onDelete={handleDeleteTenant}
          deleting={deleting}
        />

      </div>
    </section>
  );
}
