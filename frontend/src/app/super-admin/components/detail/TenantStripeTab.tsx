"use client"

import React from 'react';

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

interface TenantStripeTabProps {
  tenant: Tenant;
  onSubscribe: (plan: string) => Promise<void>;
  redirectingPlan: string | null;
}

export default function TenantStripeTab({ tenant, onSubscribe, redirectingPlan }: TenantStripeTabProps) {
  return (
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
          {tenant.stripe_customer_id ? (
            <a 
              href={`https://dashboard.stripe.com/customers/${tenant.stripe_customer_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#d4af37] hover:underline hover:text-[#b08e23] transition-all"
            >
              Ver en Stripe Dashboard →
            </a>
          ) : (
            <span className="text-xs text-stone-450 italic font-semibold">
              Sin vincular
            </span>
          )}
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
              onClick={() => onSubscribe('free')}
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
              onClick={() => onSubscribe('basic')}
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
              onClick={() => onSubscribe('pro')}
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
              onClick={() => onSubscribe('gold')}
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
  );
}
