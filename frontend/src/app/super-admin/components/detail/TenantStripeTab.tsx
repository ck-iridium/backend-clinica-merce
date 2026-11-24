"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Banknote,
  CreditCard,
  Copy,
  Check,
  Save,
  CalendarPlus,
  Link2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  stripe_subscription_id?: string | null;
  plan_type?: string;
  subscription_expires_at?: string | null;
  custom_monthly_price?: number | null;
  billing_mode?: string;
  billing_interval?: string;
  billing_notes?: string | null;
  created_at: string | null;
  custom_domain?: string | null;
}

interface TenantStripeTabProps {
  tenant: Tenant;
  onSubscribe: (plan: string) => Promise<void>;
  redirectingPlan: string | null;
  onUpdateTenant?: (updatedTenant: Tenant) => void;
  getJwtToken?: () => string;
}

const STANDARD_PRICES: Record<string, number> = {
  free: 0,
  basic: 39,
  pro: 69,
  gold: 129,
};

export default function TenantStripeTab({
  tenant,
  onSubscribe,
  redirectingPlan,
  onUpdateTenant,
  getJwtToken,
}: TenantStripeTabProps) {
  const [planType, setPlanType] = useState(tenant.plan_type || 'pro');
  const [billingMode, setBillingMode] = useState(tenant.billing_mode || 'stripe');
  const [billingInterval, setBillingInterval] = useState(tenant.billing_interval || 'monthly');
  const [useCustomPrice, setUseCustomPrice] = useState(
    tenant.custom_monthly_price !== null && tenant.custom_monthly_price !== undefined
  );
  const [customPrice, setCustomPrice] = useState(
    tenant.custom_monthly_price !== null && tenant.custom_monthly_price !== undefined
      ? String(tenant.custom_monthly_price)
      : ''
  );
  const [hasExpiry, setHasExpiry] = useState(Boolean(tenant.subscription_expires_at));
  const [expiryDate, setExpiryDate] = useState(
    tenant.subscription_expires_at ? tenant.subscription_expires_at.slice(0, 10) : ''
  );
  const [billingNotes, setBillingNotes] = useState(tenant.billing_notes || '');
  const [savingBilling, setSavingBilling] = useState(false);

  // Modal de cobro manual
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualPeriod, setManualPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [manualChannel, setManualChannel] = useState<'manual_cash' | 'manual_transfer'>('manual_cash');
  const [manualAmount, setManualAmount] = useState('');
  const [manualExtend, setManualExtend] = useState(true);
  const [registeringManual, setRegisteringManual] = useState(false);

  // Enlace Stripe generado
  const [generatingLink, setGeneratingLink] = useState(false);
  const [stripeLink, setStripeLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setPlanType(tenant.plan_type || 'pro');
    setBillingMode(tenant.billing_mode || 'stripe');
    setBillingInterval(tenant.billing_interval || 'monthly');
    const hasCustom = tenant.custom_monthly_price !== null && tenant.custom_monthly_price !== undefined;
    setUseCustomPrice(hasCustom);
    setCustomPrice(hasCustom ? String(tenant.custom_monthly_price) : '');
    setHasExpiry(Boolean(tenant.subscription_expires_at));
    setExpiryDate(tenant.subscription_expires_at ? tenant.subscription_expires_at.slice(0, 10) : '');
    setBillingNotes(tenant.billing_notes || '');
    setStripeLink(null);
  }, [tenant]);

  const effectiveMonthlyPrice =
    billingMode === 'complimentary'
      ? 0
      : useCustomPrice && customPrice !== ''
        ? Number(customPrice) || 0
        : STANDARD_PRICES[planType] ?? 69;

  const handleSaveBilling = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = getJwtToken ? getJwtToken() : '';

    if (useCustomPrice && billingMode !== 'complimentary') {
      const val = Number(customPrice);
      if (customPrice.trim() === '' || Number.isNaN(val) || val < 0) {
        toast.error('Introduce un precio personalizado válido o desmarca la casilla.');
        return;
      }
    }

    setSavingBilling(true);
    const toastId = toast.loading('Guardando condiciones comerciales...');
    try {
      const bodyPayload: any = {
        plan_type: planType,
        billing_mode: billingMode,
        billing_interval: billingInterval,
        billing_notes: billingNotes.trim(),
        clear_custom_price: !useCustomPrice && billingMode !== 'complimentary',
        clear_expiry: !hasExpiry,
      };
      if (useCustomPrice && billingMode !== 'complimentary') {
        bodyPayload.custom_monthly_price = Number(customPrice);
      }
      if (hasExpiry && expiryDate) {
        bodyPayload.subscription_expires_at = `${expiryDate}T23:59:59`;
      }

      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/billing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar condiciones comerciales');

      if (onUpdateTenant) onUpdateTenant(data);
      toast.success('Acuerdo comercial actualizado correctamente.', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar condiciones', { id: toastId });
    } finally {
      setSavingBilling(false);
    }
  };

  const openManualPaymentDialog = () => {
    setManualPeriod(billingInterval === 'yearly' ? 'yearly' : 'monthly');
    setManualChannel(billingMode === 'manual_transfer' ? 'manual_transfer' : 'manual_cash');
    const suggested = billingInterval === 'yearly' ? effectiveMonthlyPrice * 12 : effectiveMonthlyPrice;
    setManualAmount(String(suggested));
    setManualExtend(Boolean(tenant.subscription_expires_at));
    setShowManualModal(true);
  };

  const handleRegisterManualPayment = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = getJwtToken ? getJwtToken() : '';
    const parsedAmount = Number(manualAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error('Introduce un importe válido.');
      return;
    }

    setRegisteringManual(true);
    const toastId = toast.loading('Registrando cobro manual...');
    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/register-manual-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          billing_period: manualPeriod,
          payment_channel: manualChannel,
          extend_days: manualExtend ? (manualPeriod === 'yearly' ? 365 : 30) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al registrar cobro');

      if (onUpdateTenant) onUpdateTenant(data);
      setShowManualModal(false);
      toast.success(`Pago de ${parsedAmount}€ registrado y cuenta activa.`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar el pago', { id: toastId });
    } finally {
      setRegisteringManual(false);
    }
  };

  const handleGenerateStripeLink = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = getJwtToken ? getJwtToken() : '';
    setGeneratingLink(true);
    const toastId = toast.loading('Generando enlace de pago Stripe con la tarifa del tenant...');
    try {
      const res = await fetch(`${API_URL}/super-admin/tenants/${tenant.id}/stripe-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          interval: billingInterval,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.detail || 'No se pudo generar el enlace Stripe');

      setStripeLink(data.url);
      try {
        await navigator.clipboard.writeText(data.url);
        toast.success('Enlace de Stripe generado y copiado al portapapeles.', { id: toastId });
      } catch {
        toast.success('Enlace de Stripe generado correctamente.', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generando enlace Stripe', { id: toastId });
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. ACUERDO COMERCIAL Y COBRO HÍBRIDO (EFECTIVO / STRIPE) */}
      <Card className="p-5 sm:p-6 border-[#D4AF37]/30 bg-[#FAF9F6]/70 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B38F26] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Control Comercial Personalizado
            </span>
            <h3 className="text-lg font-bold font-serif text-stone-900 mt-0.5">
              Tarifa Pactada y Canal de Cobro
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openManualPaymentDialog}
              className="text-xs gap-1.5 bg-white border-stone-200 hover:border-emerald-500 hover:text-emerald-700"
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              Registrar Pago Manual
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateStripeLink}
              disabled={generatingLink}
              className="text-xs gap-1.5 bg-white border-stone-200 hover:border-[#D4AF37] hover:text-[#B38F26]"
            >
              <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              {generatingLink ? 'Generando...' : 'Enlace Stripe Pactado'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Plan Funcional (Límites)</label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger className="bg-white border-stone-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                <SelectItem value="free" className="text-xs">Free Trial (0€ oficial)</SelectItem>
                <SelectItem value="basic" className="text-xs">Individual (39€ oficial)</SelectItem>
                <SelectItem value="pro" className="text-xs">Pro (69€ oficial)</SelectItem>
                <SelectItem value="gold" className="text-xs">Elite Gold (129€ oficial)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Canal de Cobro</label>
            <Select value={billingMode} onValueChange={setBillingMode}>
              <SelectTrigger className="bg-white border-stone-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                <SelectItem value="manual_cash" className="text-xs">Efectivo (Manual)</SelectItem>
                <SelectItem value="manual_transfer" className="text-xs">Transferencia / Bizum</SelectItem>
                <SelectItem value="stripe" className="text-xs">Tarjeta (Stripe Recurrente)</SelectItem>
                <SelectItem value="complimentary" className="text-xs">Cortesía / Invitación (0€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Ciclo de Facturación</label>
            <Select value={billingInterval} onValueChange={setBillingInterval}>
              <SelectTrigger className="bg-white border-stone-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                <SelectItem value="monthly" className="text-xs">Mensual</SelectItem>
                <SelectItem value="yearly" className="text-xs">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {billingMode !== 'complimentary' && (
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomPrice}
                  onChange={(e) => setUseCustomPrice(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Precio mensual personalizado (€)
              </label>
              {useCustomPrice ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Ej: 25"
                    className="font-mono text-sm font-bold"
                  />
                  <span className="text-xs text-stone-500 shrink-0">€ / mes</span>
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  Aplicando tarifa estándar del plan: <span className="font-mono font-bold text-stone-700">{STANDARD_PRICES[planType] ?? 69}€/mes</span>
                </p>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="rounded border-stone-300"
              />
              Establecer fecha de vencimiento
            </label>
            {hasExpiry ? (
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="font-mono text-xs"
              />
            ) : (
              <p className="text-xs text-stone-400">Sin fecha límite (acceso continuo salvo suspensión manual).</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Notas Internas del Acuerdo</label>
          <Textarea
            rows={2}
            value={billingNotes}
            onChange={(e) => setBillingNotes(e.target.value)}
            placeholder="Ej: Peluquería vecina, pago mensual en mano..."
            className="bg-white text-xs resize-none"
          />
        </div>

        {stripeLink && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-[#D4AF37]/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#B38F26]">
                Enlace Stripe Listo ({effectiveMonthlyPrice}€/mes)
              </p>
              <p className="text-xs font-mono text-stone-700 truncate">{stripeLink}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(stripeLink);
                setCopiedLink(true);
                toast.success('Enlace copiado');
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="shrink-0 text-xs gap-1.5 bg-white"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="luxury"
            size="sm"
            onClick={handleSaveBilling}
            disabled={savingBilling}
            className="text-xs gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {savingBilling ? 'Guardando...' : 'Guardar Acuerdo Comercial'}
          </Button>
        </div>
      </Card>

      <div className="flex justify-between items-center border-b border-stone-100 pb-2">
        <h3 className="text-lg font-bold font-serif text-stone-900">
          Detalles de Pasarela de Pagos
        </h3>
        <span className="text-xs bg-[#fcf8e5] text-[#d4af37] px-3 py-1 rounded-full font-bold uppercase">
          {tenant.stripe_subscription_id ? 'Stripe Connected' : billingMode === 'stripe' ? 'Pendiente Stripe' : 'Cobro Manual'}
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
            Contratar o Cambiar Plan Comercial (Pasarela Stripe)
          </h4>
          <p className="text-xs text-stone-400 font-sans">
            {useCustomPrice && customPrice !== ''
              ? `Este tenant tiene tarifa pactada (${customPrice}€/mes): al abrir checkout de Stripe se aplicará ese precio acordado.`
              : 'Selecciona un plan premium para redirigir a la pasarela de pago recurrente y segura de Stripe.'}
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

          {/* Plan Individual */}
          <div className={`p-6 rounded-2xl border bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:-translate-y-0.5 ${
            tenant.plan_type === 'basic' ? 'border-[#d4af37]' : 'border-stone-200/40'
          }`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 font-sans">Individual</span>
                {tenant.plan_type === 'basic' && (
                  <span className="bg-[#fcf8e5] text-[#d4af37] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Activo</span>
                )}
              </div>
              <h5 className="text-sm font-bold font-serif text-stone-950">Plan Individual</h5>
              <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Autónomos y gabinetes independientes.</p>
              <div className="pt-1 flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-stone-900 font-serif">39€</span>
                <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
              </div>
              <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                <li>✓ 1 Especialista Único</li>
                <li>✓ 1 Sede Física</li>
                <li>✓ Servicios Ilimitados</li>
                <li>✓ Agenda & TPV de Caja</li>
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
              <h5 className="text-sm font-bold font-serif text-stone-950">Plan Pro Todo-en-Uno</h5>
              <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Para clínicas con equipo y recepción.</p>
              <div className="pt-1 flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-stone-900 font-serif">69€</span>
                <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
              </div>
              <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                <li>✓ Hasta 4 Especialistas</li>
                <li>✓ Hasta 2 Sedes Físicas</li>
                <li>✓ Firma Digital LOPD en Tablet</li>
                <li>✓ Facturación Oficial PDF & Bonos</li>
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
              <h5 className="text-sm font-bold font-serif text-stone-950">Plan Elite</h5>
              <p className="text-[11px] text-stone-400 font-sans leading-relaxed">Multisede y asistente de IA conversacional.</p>
              <div className="pt-1 flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-stone-900 font-serif">129€</span>
                <span className="text-[10px] text-stone-400 font-sans">/ mes</span>
              </div>
              <ul className="text-[10px] text-stone-500 font-sans space-y-1 pt-2 border-t border-stone-100">
                <li>✓ Hasta 10 Especialistas</li>
                <li>✓ Hasta 5 Sedes Físicas</li>
                <li>✓ Diseñador Web con IA (Texto, Fotos)</li>
                <li>✓ Soporte Prioritario VIP 24/7</li>
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

      {/* Modal de Confirmación de Cobro Manual */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-0 border border-stone-200/80 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-stone-100">
            <DialogTitle className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-emerald-600" />
              Registrar Cobro Manual
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Anota un pago recibido en efectivo o transferencia para {tenant.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Método</label>
                <Select value={manualChannel} onValueChange={(v: any) => setManualChannel(v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                    <SelectItem value="manual_cash" className="text-xs">Efectivo</SelectItem>
                    <SelectItem value="manual_transfer" className="text-xs">Transferencia / Bizum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">Periodo</label>
                <Select
                  value={manualPeriod}
                  onValueChange={(v: any) => {
                    setManualPeriod(v);
                    setManualAmount(String(v === 'yearly' ? effectiveMonthlyPrice * 12 : effectiveMonthlyPrice));
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                    <SelectItem value="monthly" className="text-xs">Mensual (+30 días)</SelectItem>
                    <SelectItem value="yearly" className="text-xs">Anual (+365 días)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Importe recibido (€)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="font-mono text-base font-bold"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={manualExtend}
                onChange={(e) => setManualExtend(e.target.checked)}
                className="rounded border-stone-300"
              />
              Extender fecha de vencimiento automáticamente ({manualPeriod === 'yearly' ? '+365 días' : '+30 días'})
            </label>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-stone-100 bg-stone-50/50 gap-2">
            <Button type="button" variant="outline" onClick={() => setShowManualModal(false)} className="text-xs">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="luxury"
              onClick={handleRegisterManualPayment}
              disabled={registeringManual}
              className="text-xs gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {registeringManual ? 'Registrando...' : 'Confirmar Cobro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
