"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Building2,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  Banknote,
  Lock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessToken: string;
  onCreated: (tenant: any) => void;
}

const SECTORS = [
  { value: 'barber', label: 'Barbería y Salón de Peluquería' },
  { value: 'beauty', label: 'Estética, Belleza y Wellness' },
  { value: 'clinical', label: 'Medicina y Clínica de Salud' },
  { value: 'dental', label: 'Clínica Dental y Odontología' },
  { value: 'veterinary', label: 'Veterinaria y Cuidados' },
  { value: 'automotive', label: 'Automoción y Mecánica' },
  { value: 'home_services', label: 'Servicios a Domicilio' },
  { value: 'professional', label: 'Consultoría y Asesoría' },
  { value: 'general', label: 'General / Otros Servicios' },
];

const PLANS = [
  { value: 'basic', label: 'Individual (1 esp. / 1 sede — Oficial 39€)' },
  { value: 'pro', label: 'Pro (4 esp. / 2 sedes — Oficial 69€)' },
  { value: 'gold', label: 'Elite Gold (10 esp. / 5 sedes — Oficial 129€)' },
  { value: 'free', label: 'Free Trial (Prueba 0€)' },
];

function slugifyText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export default function CreateTenantModal({
  open,
  onOpenChange,
  accessToken,
  onCreated,
}: CreateTenantModalProps) {
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [sector, setSector] = useState('barber');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState(() => generateRandomPassword());

  const [planType, setPlanType] = useState('pro');
  const [billingMode, setBillingMode] = useState('manual_cash');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [useCustomPrice, setUseCustomPrice] = useState(true);
  const [customPrice, setCustomPrice] = useState('25');
  const [expiryOption, setExpiryOption] = useState('unlimited');
  const [billingNotes, setBillingNotes] = useState('');

  const [seedServices, setSeedServices] = useState(true);
  const [skipOnboarding, setSkipOnboarding] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ tenant: any; password: string; email: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const resetForm = () => {
    setTenantName('');
    setTenantSlug('');
    setSlugEdited(false);
    setSector('barber');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword(generateRandomPassword());
    setPlanType('pro');
    setBillingMode('manual_cash');
    setBillingInterval('monthly');
    setUseCustomPrice(true);
    setCustomPrice('25');
    setExpiryOption('unlimited');
    setBillingNotes('');
    setSeedServices(true);
    setSkipOnboarding(true);
    setCreatedResult(null);
    setCopiedCreds(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleNameChange = (val: string) => {
    setTenantName(val);
    if (!slugEdited) {
      setTenantSlug(slugifyText(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantSlug.trim() || !adminEmail.trim() || !adminName.trim() || !adminPassword.trim()) {
      toast.error('Completa todos los campos obligatorios del negocio y la titular.');
      return;
    }

    const parsedPrice = useCustomPrice && billingMode !== 'complimentary'
      ? Number(customPrice)
      : billingMode === 'complimentary'
        ? 0
        : null;

    if (useCustomPrice && billingMode !== 'complimentary' && (Number.isNaN(parsedPrice) || (parsedPrice ?? 0) < 0)) {
      toast.error('Introduce un precio personalizado válido.');
      return;
    }

    const expiryDays = expiryOption === '30' ? 30 : expiryOption === '365' ? 365 : null;

    setSubmitting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const toastId = toast.loading('Aprovisionando nuevo negocio en el SaaS...');

    try {
      const res = await fetch(`${API_URL}/super-admin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          tenant_name: tenantName.trim(),
          tenant_slug: tenantSlug.trim().toLowerCase(),
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim(),
          admin_password: adminPassword,
          business_sector: sector,
          plan_type: planType,
          subscription_status: 'active',
          custom_monthly_price: parsedPrice,
          billing_mode: billingMode,
          billing_interval: billingInterval,
          billing_notes: billingNotes.trim() || null,
          expiry_days: expiryDays,
          seed_sector_services: seedServices,
          onboarding_completed: skipOnboarding,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al crear el inquilino');
      }

      toast.success(`¡Negocio '${data.name}' creado y activado!`, { id: toastId });
      setCreatedResult({ tenant: data, password: adminPassword, email: adminEmail.trim() });
      onCreated(data);
    } catch (err: any) {
      toast.error(err.message || 'No se pudo crear el inquilino', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const text = `Acceso a ${createdResult.tenant.name}:\nWeb: https://${createdResult.tenant.slug}.probookia.com/login\nEmail: ${createdResult.email}\nContraseña: ${createdResult.password}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    toast.success('Credenciales copiadas al portapapeles');
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 border border-stone-200/80 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-white">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            Alta Directa de Inquilino
          </div>
          <DialogTitle className="text-2xl font-serif font-bold text-stone-900">
            {createdResult ? 'Negocio Aprovisionado con Éxito' : 'Crear Nuevo Negocio (Tenant)'}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400">
            {createdResult
              ? 'Comparte estos datos de acceso con la titular para que pueda entrar de inmediato.'
              : 'Configura el sector, las credenciales de acceso y las condiciones económicas personalizadas.'}
          </DialogDescription>
        </DialogHeader>

        {createdResult ? (
          <div className="p-6 space-y-5">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-emerald-950">{createdResult.tenant.name} está activo</p>
                <p className="text-emerald-800">
                  Subdominio: <span className="font-mono font-bold">{createdResult.tenant.slug}.probookia.com</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2 text-xs font-mono">
              <p><span className="text-stone-400">URL:</span> https://{createdResult.tenant.slug}.probookia.com/login</p>
              <p><span className="text-stone-400">Email:</span> {createdResult.email}</p>
              <p><span className="text-stone-400">Pass:</span> {createdResult.password}</p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCopyCredentials} className="gap-2 text-xs">
                {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCreds ? 'Copiado' : 'Copiar Credenciales'}
              </Button>
              <Button type="button" variant="luxury" onClick={() => handleClose(false)} className="text-xs">
                Listo, cerrar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 max-h-[68vh] overflow-y-auto space-y-6">
              {/* 1. Datos del Negocio */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Datos del Negocio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Nombre Comercial *</label>
                    <Input
                      value={tenantName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ej: Peluquería María"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Subdominio (Slug) *</label>
                    <div className="flex items-center">
                      <Input
                        value={tenantSlug}
                        onChange={(e) => {
                          setSlugEdited(true);
                          setTenantSlug(slugifyText(e.target.value));
                        }}
                        placeholder="peluqueria-maria"
                        className="rounded-r-none font-mono text-xs"
                        required
                      />
                      <span className="h-9 px-2.5 inline-flex items-center bg-stone-100 border border-l-0 border-stone-200 rounded-r-xl text-[11px] font-mono text-stone-500">
                        .probookia.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">Sector de Actividad</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="bg-white border-stone-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                      {SECTORS.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 2. Cuenta Administradora */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Cuenta de la Titular
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Nombre completo *</label>
                    <Input
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Ej: María López"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Email de acceso *</label>
                    <Input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="maria@peluqueria.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">Contraseña inicial *</label>
                  <div className="flex gap-2">
                    <Input
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="font-mono text-xs"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAdminPassword(generateRandomPassword())}
                      className="shrink-0 gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Generar
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3. Plan Funcional y Acuerdo Económico */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  {billingMode === 'stripe' ? (
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                  ) : (
                    <Banknote className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  Plan Funcional y Tarifa Acordada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Plan de Capacidades</label>
                    <Select value={planType} onValueChange={setPlanType}>
                      <SelectTrigger className="bg-white border-stone-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                        {PLANS.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-xs">
                            {p.label}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="manual_cash" className="text-xs">Efectivo (Pago Manual)</SelectItem>
                        <SelectItem value="manual_transfer" className="text-xs">Transferencia / Bizum</SelectItem>
                        <SelectItem value="stripe" className="text-xs">Tarjeta (Stripe Recurrente)</SelectItem>
                        <SelectItem value="complimentary" className="text-xs">Cortesía / Invitación (0€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {billingMode !== 'complimentary' && (
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useCustomPrice}
                          onChange={(e) => setUseCustomPrice(e.target.checked)}
                          className="rounded border-stone-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        Aplicar precio personalizado pactado
                      </label>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B38F26]">
                        {useCustomPrice ? 'Tarifa Especial' : 'Tarifa Oficial'}
                      </span>
                    </div>

                    {useCustomPrice && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-stone-500">Importe mensual pactado (€)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="bg-white font-mono text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-stone-500">Ciclo de facturación</label>
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
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Control de Vencimiento</label>
                    <Select value={expiryOption} onValueChange={setExpiryOption}>
                      <SelectTrigger className="bg-white border-stone-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-200 rounded-xl shadow-xl">
                        <SelectItem value="unlimited" className="text-xs">Sin caducidad (control manual)</SelectItem>
                        <SelectItem value="30" className="text-xs">Vence en 30 días</SelectItem>
                        <SelectItem value="365" className="text-xs">Vence en 1 año (365 días)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Notas internas del acuerdo</label>
                    <Textarea
                      rows={1}
                      value={billingNotes}
                      onChange={(e) => setBillingNotes(e.target.value)}
                      placeholder="Ej: Peluquería vecina, paga día 1 en efectivo"
                      className="min-h-[36px] text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedServices}
                      onChange={(e) => setSeedServices(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    Precargar servicios demo del sector
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipOnboarding}
                      onChange={(e) => setSkipOnboarding(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    Dejar onboarding completado
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-stone-100 bg-stone-50/50 gap-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" variant="luxury" disabled={submitting} className="text-xs">
                {submitting ? 'Creando negocio...' : 'Crear y Activar Negocio'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
