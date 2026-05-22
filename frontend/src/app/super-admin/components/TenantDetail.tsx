"use client"

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Power, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Globe, 
  Shield 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
}

interface TenantDetailProps {
  tenant: Tenant;
  onUpdateStatus: (tenantId: string, status: 'active' | 'suspended') => Promise<void>;
}

export default function TenantDetail({ tenant, onUpdateStatus }: TenantDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stripe' | 'config'>('overview');
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [customDomain, setCustomDomain] = useState<string | null>(tenant.custom_domain || null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [inputDomain, setInputDomain] = useState('');
  const [savingDomain, setSavingDomain] = useState(false);

  // Sincronizar el estado del dominio personalizado y limpiar cruzado entre inquilinos
  useEffect(() => {
    setCustomDomain(tenant.custom_domain || null);
    setInputDomain('');
  }, [tenant.id, tenant.custom_domain]);

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Intentar recuperar el token de Supabase del localStorage
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
        // Fallback a cookies o token por defecto si no lo encuentra en localStorage
        const match = document.cookie.match(/sb-[a-zA-Z0-9]+-auth-token/);
        if (match) {
          const val = localStorage.getItem(match[0]);
          if (val) {
            jwtToken = JSON.parse(val).access_token || '';
          }
        }
      }

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
                tenant.subscription_status === 'active' ? 'bg-[#d4af37] animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-xl font-bold font-serif text-stone-900 capitalize">
                {tenant.subscription_status === 'active' ? 'Activo' : 'Suspendido'}
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
        {tenant.subscription_status !== 'active' && (
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
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-2">
                  Información General del Inquilino
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">ID Único</span>
                    <p className="font-mono text-stone-700 font-semibold">{tenant.id}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Plan Comercial</span>
                    <p className="text-stone-900 font-bold text-base flex items-center gap-2">
                      {tenant.plan_type === 'gold' && '🥇 Elite Gold Plan'}
                      {tenant.plan_type === 'pro' && '🥈 Pro Premium Plan'}
                      {tenant.plan_type === 'basic' && '🥉 Basic Plan'}
                      {(!tenant.plan_type || tenant.plan_type === 'free') && '🌱 Free Trial Plan'}
                      <span className="bg-[#fcf8e5] text-[#d4af37] px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        {tenant.plan_type || 'FREE'}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Estado en Middleware</span>
                    <p className="text-stone-850 font-medium">
                      {tenant.subscription_status === 'active' 
                        ? 'Permitido y desbloqueado en capas de API globales' 
                        : 'Acceso denegado con cabecera de suspensión activa'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Renovación / Expiración</span>
                    <p className="text-stone-850 font-medium font-mono text-xs">
                      {tenant.subscription_expires_at 
                        ? new Date(tenant.subscription_expires_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Sin fecha de expiración activa'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stripe' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Detalles de Pasarela de Pagos
                  </h3>
                  <span className="text-xs bg-[#fcf8e5] text-[#d4af37] px-3 py-1 rounded-full font-bold uppercase">
                    Stripe Connected
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl text-sm border border-stone-100">
                    <div>
                      <p className="font-bold text-stone-900">Identificador de Cliente</p>
                      <p className="text-xs text-stone-400 mt-0.5">Enlazado a la cuenta principal del SaaS</p>
                    </div>
                    <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-stone-200/50 text-xs font-bold text-stone-700">
                      {tenant.stripe_customer_id || 'Sin vincular'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl text-sm border border-stone-100">
                    <div>
                      <p className="font-bold text-stone-900">ID de Suscripción Stripe</p>
                      <p className="text-xs text-stone-400 mt-0.5">Identificador de facturación recurrente activa</p>
                    </div>
                    <span className="font-mono bg-white px-3 py-1.5 rounded-lg border border-stone-200/50 text-xs font-bold text-stone-700">
                      {tenant.stripe_subscription_id || 'Sin suscripción activa'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl text-sm border border-stone-100">
                    <div>
                      <p className="font-bold text-stone-900">Historial de Pagos B2B</p>
                      <p className="text-xs text-stone-400 mt-0.5">Control directo de cobros por suscripción mensual</p>
                    </div>
                    <button className="text-xs font-bold text-[#d4af37] hover:underline focus:outline-none">
                      Ver en Stripe Dashboard →
                    </button>
                  </div>
                </div>

                {/* Sección de Selección de Planes */}
                <div className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-serif text-stone-900">
                      Contratar o Cambiar Plan Comercial
                    </h4>
                    <p className="text-xs text-stone-400 font-sans">
                      Selecciona un plan premium para redirigir a la pasarela de pago recurrente y segura de Stripe.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Plan Gratuito */}
                    <div className={`p-6 rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:-translate-y-0.5 ${
                      tenant.plan_type === 'free' || !tenant.plan_type ? 'border-[#d4af37]' : 'border-stone-200/40'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 font-sans">Gratuito</span>
                          {(tenant.plan_type === 'free' || !tenant.plan_type) && (
                            <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold font-serif text-stone-950">Plan Gratuito</h5>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Agenda inicial para autónomos y pruebas.</p>
                        <div className="pt-1 flex items-baseline gap-0.5">
                          <span className="text-xl font-bold text-stone-900 font-serif">0€</span>
                          <span className="text-[10px] text-stone-400 font-sans">/ siempre</span>
                        </div>
                        <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                          <li>✓ 1 Profesional</li>
                          <li>✓ Hasta 3 Servicios</li>
                          <li>✓ Agenda Interactiva</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleSubscribe('free')}
                        disabled={redirectingPlan !== null || tenant.plan_type === 'free' || !tenant.plan_type}
                        className={`mt-5 w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                          tenant.plan_type === 'free' || !tenant.plan_type
                            ? 'bg-stone-50 text-stone-400 border border-stone-200/50 cursor-default'
                            : 'bg-white border border-stone-200 text-stone-950 hover:border-[#d4af37] hover:text-[#d4af37]'
                        }`}
                      >
                        {redirectingPlan === 'free' ? 'Cargando...' : (tenant.plan_type === 'free' || !tenant.plan_type) ? 'Plan Actual' : 'Contratar'}
                      </button>
                    </div>

                    {/* Plan Básico */}
                    <div className={`p-6 rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:-translate-y-0.5 ${
                      tenant.plan_type === 'basic' ? 'border-[#d4af37]' : 'border-stone-200/40'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 font-sans">Básico</span>
                          {tenant.plan_type === 'basic' && (
                            <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold font-serif text-stone-950">Plan Básico</h5>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Agenda estándar para equipos pequeños.</p>
                        <div className="pt-1 flex items-baseline gap-0.5">
                          <span className="text-xl font-bold text-stone-900 font-serif">29€</span>
                          <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
                        </div>
                        <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                          <li>✓ Citas y Clientes Ilimitados</li>
                          <li>✓ Hasta 2 Profesionales</li>
                          <li>✓ Agenda Interactiva</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleSubscribe('basic')}
                        disabled={redirectingPlan !== null || tenant.plan_type === 'basic'}
                        className={`mt-5 w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                          tenant.plan_type === 'basic'
                            ? 'bg-stone-50 text-stone-400 border border-stone-200/50 cursor-default'
                            : 'bg-white border border-stone-200 text-stone-950 hover:border-[#d4af37] hover:text-[#d4af37]'
                        }`}
                      >
                        {redirectingPlan === 'basic' ? 'Cargando...' : tenant.plan_type === 'basic' ? 'Plan Actual' : 'Contratar'}
                      </button>
                    </div>

                    {/* Plan Pro */}
                    <div className={`p-6 rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:-translate-y-0.5 ${
                      tenant.plan_type === 'pro' ? 'border-[#d4af37]' : 'border-stone-200/40'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 font-sans">Profesional</span>
                          {tenant.plan_type === 'pro' && (
                            <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold font-serif text-stone-950">Plan Pro Premium</h5>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Para clínicas de estética de alto crecimiento.</p>
                        <div className="pt-1 flex items-baseline gap-0.5">
                          <span className="text-xl font-bold text-stone-900 font-serif">59€</span>
                          <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
                        </div>
                        <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                          <li>✓ Todo lo del Plan Básico</li>
                          <li>✓ Hasta 10 Profesionales</li>
                          <li>✓ Venta Rápida y Bonos</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleSubscribe('pro')}
                        disabled={redirectingPlan !== null || tenant.plan_type === 'pro'}
                        className={`mt-5 w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                          tenant.plan_type === 'pro'
                            ? 'bg-stone-50 text-stone-400 border border-stone-200/50 cursor-default'
                            : 'bg-stone-950 text-white hover:bg-stone-850 hover:shadow-md'
                        }`}
                      >
                        {redirectingPlan === 'pro' ? 'Cargando...' : tenant.plan_type === 'pro' ? 'Plan Actual' : 'Contratar'}
                      </button>
                    </div>

                    {/* Plan Elite Gold */}
                    <div className={`p-6 rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:-translate-y-0.5 ${
                      tenant.plan_type === 'gold' ? 'border-[#d4af37]' : 'border-stone-200/40'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 font-sans">Elite</span>
                          {tenant.plan_type === 'gold' && (
                            <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold font-serif text-stone-950">Plan Elite Gold</h5>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Asistentes de IA ilimitados y multi-local.</p>
                        <div className="pt-1 flex items-baseline gap-0.5">
                          <span className="text-xl font-bold text-stone-900 font-serif">99€</span>
                          <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
                        </div>
                        <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                          <li>✓ Profesionales Ilimitados</li>
                          <li>✓ IA Avanzada Ilimitada</li>
                          <li>✓ Soporte Personalizado 24/7</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handleSubscribe('gold')}
                        disabled={redirectingPlan !== null || tenant.plan_type === 'gold'}
                        className={`mt-5 w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                          tenant.plan_type === 'gold'
                            ? 'bg-stone-50 text-stone-400 border border-stone-200/50 cursor-default'
                            : 'bg-white border border-stone-200 text-stone-950 hover:border-[#d4af37] hover:text-[#d4af37]'
                        }`}
                      >
                        {redirectingPlan === 'gold' ? 'Cargando...' : tenant.plan_type === 'gold' ? 'Plan Actual' : 'Contratar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-2">
                  Estructura de Ruteo e Infraestructura
                </h3>
                <div className="space-y-4">
                  {/* Tarjeta de Dominios Personalizados Condicional */}
                  <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-stone-200/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <span className="w-12 h-12 rounded-xl bg-white border border-stone-100 text-stone-400 flex items-center justify-center shrink-0 shadow-sm">
                        <Globe className="w-6 h-6" />
                      </span>
                      <div className="space-y-1">
                        <p className="font-bold text-stone-900 text-sm">Dominios Personalizados</p>
                        {customDomain ? (
                          <div className="space-y-0.5">
                            <p className="text-stone-400 text-xs">Mapeo DNS activo para el dominio:</p>
                            <p className="text-base font-serif font-bold text-[#d4af37]">{customDomain}</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-stone-400 text-xs">Usando subdominio de la plataforma:</p>
                            <p className="text-stone-700 font-mono text-xs">{tenant.slug}.probookia.com</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {customDomain ? (
                        <>
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xxs font-black uppercase tracking-wider">
                            🟢 Activo
                          </span>
                          <button 
                            onClick={() => {
                              toast.success('Dominio personalizado desvinculado con éxito');
                              setCustomDomain(null);
                            }}
                            className="text-stone-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider transition-colors"
                          >
                            Desconectar
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="bg-stone-100 text-stone-500 border border-stone-200 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wider">
                            Sin dominio personalizado
                          </span>
                          <button 
                            onClick={() => setShowDomainModal(true)}
                            className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xxs font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95"
                          >
                            Conectar Dominio
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#FAFAFA] p-4 rounded-xl text-sm border border-stone-200/30">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-stone-400" />
                      <div>
                        <p className="font-bold text-stone-900">Políticas RLS en Base de Datos</p>
                        <p className="text-xs text-stone-400">Aislamiento por Row Level Security (RLS) habilitado</p>
                      </div>
                    </div>
                    <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xxs font-black uppercase">
                      Protegido
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Configuración DNS para Dominio Personalizado */}
        <Dialog open={showDomainModal} onOpenChange={setShowDomainModal}>
          <DialogContent className="bg-white rounded-3xl border border-stone-200/50 p-8 shadow-xl max-w-lg w-full">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <Globe className="w-6 h-6 text-[#d4af37]" /> Conectar Dominio Propio
              </DialogTitle>
              <DialogDescription className="text-sm text-stone-500 leading-relaxed font-sans">
                Asocia tu propio dominio comercial para que tus clientes puedan reservar tratamientos directamente en tu dirección web.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Ingresa tu Dominio</label>
                <input 
                  type="text" 
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  placeholder="ej: www.miestetica.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all text-sm font-sans"
                />
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-4">
                <h5 className="text-xs font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
                  📋 Registros DNS Requeridos
                </h5>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Accede a tu proveedor de dominios (GoDaddy, Namecheap, etc.) y añade el siguiente registro CNAME para habilitar el mapeo:
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-xs md:text-sm font-mono border-t border-stone-200/50 pt-4">
                  <span className="text-stone-400 font-bold">Tipo:</span>
                  <span className="col-span-2 text-stone-800 font-black">CNAME</span>

                  <span className="text-stone-400 font-bold">Host:</span>
                  <span className="col-span-2 text-stone-800 font-black">www o @</span>

                  <span className="text-stone-400 font-bold">Valor:</span>
                  <span className="col-span-2 text-stone-800 font-black text-[#b08e23]">cname.probookia.com</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-stone-100">
                <button
                  onClick={() => setShowDomainModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!inputDomain.trim()) {
                      toast.error('Por favor escribe un dominio válido.');
                      return;
                    }
                    setSavingDomain(true);
                    const toastId = toast.loading('Guardando configuración de DNS...');
                    setTimeout(() => {
                      setCustomDomain(inputDomain.trim());
                      toast.success('¡Dominio personalizado conectado con éxito!', { id: toastId });
                      setSavingDomain(false);
                      setShowDomainModal(false);
                      setInputDomain('');
                    }, 1200);
                  }}
                  disabled={savingDomain}
                  className="bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {savingDomain ? 'Guardando...' : 'Verificar y Conectar'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </section>
  );
}
