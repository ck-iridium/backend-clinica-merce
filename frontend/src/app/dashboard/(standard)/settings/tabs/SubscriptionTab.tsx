import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CreditCard, CheckCircle2, Sparkles, TrendingUp, Loader2, Check, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SubscriptionTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);
  const [showBizumModal, setShowBizumModal] = useState(false);
  const [selectedPlanForBizum, setSelectedPlanForBizum] = useState<any>(null);
  const [bizumRequestData, setBizumRequestData] = useState<any>(null);
  const [creatingBizumRequest, setCreatingBizumRequest] = useState(false);
  const [confirmingBizumSent, setConfirmingBizumSent] = useState(false);

  const fetchLimits = async () => {
    try {
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      
      if (userSession) {
        try {
          const parsed = JSON.parse(userSession);
          if (!tenantId) {
            tenantId = parsed.tenant_id || '';
          }
          authToken = parsed.access_token || parsed.token || '';
        } catch (e) {
          console.error("Error parsing user session in SubscriptionTab:", e);
        }
      }

      if (!tenantId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/limits`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar la información del plan.');
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async (sessionId: string) => {
    const toastId = toast.loading('Verificando pago en Stripe y activando plan...');
    try {
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      if (userSession) {
        const parsed = JSON.parse(userSession);
        if (!tenantId) {
          tenantId = parsed.tenant_id || '';
        }
        authToken = parsed.access_token || parsed.token || '';
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/verify-checkout-session/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('¡Suscripción actualizada con éxito! Tu plan ya está activo.', { id: toastId });
        
        // Limpiar parámetros de la URL para evitar recargas erróneas
        const url = new URL(window.location.href);
        url.searchParams.delete('billing_success');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.pathname + url.search);

        // Forzar recarga de límites en la UI
        fetchLimits();
      } else {
        toast.error(result.detail || 'Error al verificar el estado de la suscripción.', { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al sincronizar tu plan.', { id: toastId });
    }
  };

  useEffect(() => {
    fetchLimits();

    // Sincronización activa post-pago de Stripe
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const billingSuccess = params.get('billing_success');
      const sessionId = params.get('session_id');

      if (billingSuccess === 'true' && sessionId) {
        verifySession(sessionId);
      }
    }
  }, []);

  const handleUpgrade = async (planType: string) => {
    if (!data?.tenant_id) return;
    setRedirectingPlan(planType);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-subscription-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: data.tenant_id,
          plan_type: planType
        })
      });
      const result = await res.json();
      if (res.ok && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.detail || 'Error al iniciar la pasarela de pago.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de red al conectar con Stripe.');
    } finally {
      setRedirectingPlan(null);
    }
  };

  const handleSelectPlanBizum = async (plan: any) => {
    if (!data?.tenant_id) return;
    setSelectedPlanForBizum(plan);
    setShowBizumModal(true);
    setCreatingBizumRequest(true);
    setBizumRequestData(null);
    try {
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      
      if (userSession) {
        try {
          const parsed = JSON.parse(userSession);
          if (!tenantId) tenantId = parsed.tenant_id || '';
          authToken = parsed.access_token || parsed.token || '';
        } catch (e) {}
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/request-bizum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({
          plan_type: plan.id,
          billing_period: 'monthly'
        })
      });
      const result = await res.json();
      if (res.ok) {
        setBizumRequestData(result);
      } else {
        toast.error(result.detail || 'Error al iniciar la solicitud de Bizum.');
        setShowBizumModal(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al procesar la solicitud de Bizum.');
      setShowBizumModal(false);
    } finally {
      setCreatingBizumRequest(false);
    }
  };

  const handleConfirmBizumSent = async () => {
    if (!bizumRequestData?.id) return;
    setConfirmingBizumSent(true);
    try {
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      
      if (userSession) {
        try {
          const parsed = JSON.parse(userSession);
          if (!tenantId) tenantId = parsed.tenant_id || '';
          authToken = parsed.access_token || parsed.token || '';
        } catch (e) {}
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/confirm-sent/${bizumRequestData.id}`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('¡Activación en curso! Tu cuenta ha sido desbloqueada por 24h de forma optimista mientras verificamos tu pago.');
        setShowBizumModal(false);
        window.dispatchEvent(new Event('refresh-limits'));
        fetchLimits();
      } else {
        toast.error(result.detail || 'Error al confirmar el envío del Bizum.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de red al confirmar el pago.');
    } finally {
      setConfirmingBizumSent(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-100 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <span className="text-sm font-semibold text-stone-400">Cargando detalles de suscripción...</span>
      </div>
    );
  }

  const currentPlan = (data.plan_type || 'free').toLowerCase();

  const plansList = [
    {
      id: 'free',
      name: 'Plan Inicial Gratuito',
      price: '0€',
      limits: 'Hasta 1 especialista y 3 servicios.',
      features: ['1 Especialista', '3 Servicios', 'Agenda interactiva', 'Soporte estándar']
    },
    {
      id: 'basic',
      name: 'Plan Básico',
      price: '29€',
      limits: 'Hasta 2 especialistas y 10 servicios.',
      features: ['2 Especialistas', '10 Servicios', 'Agenda interactiva', 'Módulo POS y Facturación']
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      price: '59€',
      limits: 'Hasta 5 especialistas y 25 servicios.',
      features: ['5 Especialistas', '25 Servicios', 'Agenda interactiva', 'Fichas de clientes y fotos', 'Módulo POS y Facturación']
    },
    {
      id: 'gold',
      name: 'Plan Gold',
      price: '99€',
      limits: 'Especialistas e IA ilimitada integrada.',
      features: ['Especialistas ilimitados', 'Servicios ilimitados', 'Agenda interactiva', 'Fichas de clientes y fotos', 'Facturación & POS Deluxe', 'IA ilimitada integrada (sin API Key)']
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Active Plan Premium Card */}
      <div className="bg-[#1C1917] text-white rounded-[2.5rem] p-6 md:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-full filter blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#D4AF37]/30">
                Suscripción Activa
              </span>
              {currentPlan === 'gold' && (
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Sparkles size={10} /> IA VIP
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight mt-3 text-white">
              {currentPlan === 'gold' && 'Plan Gold Elite'}
              {currentPlan === 'pro' && 'Plan Pro Premium'}
              {currentPlan === 'basic' && 'Plan Básico'}
              {currentPlan === 'free' && 'Plan Demo Gratuito'}
            </h2>
            <p className="text-stone-300 text-sm mt-2 max-w-xl leading-relaxed">
              Tu cuenta tiene asignados límites de cuota específicos según tu plan actual. Si necesitas ampliar tus recursos o usar IA maestra, actualiza a continuación.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shrink-0 text-center md:text-right min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Estado del Pago</p>
            <p className="text-xl font-bold mt-1 text-white flex items-center justify-center md:justify-end gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              Sincronizado
            </p>
            <p className="text-[10px] font-medium text-stone-400 mt-1">Tenant ID: {data.tenant_id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Plan Usage & Quotas (Progress bars) */}
        {currentPlan !== 'gold' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-white/10 relative z-10">
            {/* Specialists Limit */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Especialistas / Personal</span>
                <span className="text-sm font-mono font-bold text-white">
                  {data.usage.specialists} / {data.limits.specialists}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (data.usage.specialists / data.limits.specialists) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2 font-medium">Límite según plan: {data.limits.specialists} colaboradores.</p>
            </div>

            {/* Services Limit */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Servicios Activos</span>
                <span className="text-sm font-mono font-bold text-white">
                  {data.usage.services} / {data.limits.services}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (data.usage.services / data.limits.services) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2 font-medium">Límite según plan: {data.limits.services} tratamientos activos.</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Plans for Upgrade/Downgrade */}
      <div>
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <TrendingUp size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-2xl font-serif font-semibold text-stone-900">Planes Disponibles</h3>
            <p className="text-xs text-stone-400 mt-0.5">Selecciona el nivel que mejor se adapta al crecimiento de tu clínica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plansList.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <div 
                key={plan.id}
                className={`bg-white rounded-3xl p-6 md:p-8 border transition-all duration-300 flex flex-col justify-between hover:shadow-lg
                  ${isCurrent ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30 shadow-sm relative overflow-hidden' : 'border-stone-200/80 hover:border-[#D4AF37]/40'}`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-stone-950 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest">
                    Activo
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Suscripción SaaS</span>
                  <h4 className="text-xl font-serif font-bold text-stone-900 mt-1">{plan.name}</h4>
                  
                  <div className="flex items-baseline mt-3 mb-4">
                    <span className="text-3xl font-serif font-extrabold text-stone-900">{plan.price}</span>
                    <span className="text-stone-400 text-xs font-semibold ml-1">/ mes</span>
                  </div>

                  <p className="text-xs text-stone-500 mb-6 leading-relaxed font-sans">{plan.limits}</p>

                  <div className="space-y-3 mb-8 border-t border-stone-100 pt-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-medium text-stone-600 leading-tight font-sans">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  id={`subscription-upgrade-btn-${plan.id}`}
                  onClick={() => handleSelectPlanBizum(plan)}
                  disabled={isCurrent || creatingBizumRequest}
                  variant={isCurrent ? "outline" : "luxury"}
                  className={`w-full py-5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    isCurrent ? 'opacity-50 cursor-not-allowed bg-stone-50' : 'shadow-luxury text-stone-950'
                  }`}
                >
                  {creatingBizumRequest && selectedPlanForBizum?.id === plan.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Iniciando...
                    </>
                  ) : isCurrent ? (
                    'Plan Actual'
                  ) : (
                    'Mejorar / Contratar'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL DE PAGO BIZUM (QUIET LUXURY SHADCN) ────────────────────────── */}
      <Dialog open={showBizumModal} onOpenChange={setShowBizumModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border border-stone-200/80 shadow-2xl bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-white/95">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-0.5">Soft-Launch ProBookia</span>
            <DialogTitle className="text-2xl font-serif font-bold text-stone-900">
              Pago Manual vía Bizum
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs mt-1 leading-relaxed">
              Hemos habilitado una forma de pago directa por Bizum para agilizar tu acceso. Por favor, realiza el envío y copia el concepto exacto.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-4 space-y-5">
            {creatingBizumRequest ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-2" />
                <span className="text-xs font-semibold text-stone-400">Generando código de referencia único...</span>
              </div>
            ) : bizumRequestData ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Monto a Enviar</span>
                    <span className="text-xl font-mono font-black text-stone-900 mt-1 block">
                      {bizumRequestData.amount}€
                    </span>
                  </div>
                  <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Teléfono Bizum</span>
                    <span className="text-sm font-mono font-bold text-stone-900 mt-1.5 block">
                      {process.env.NEXT_PUBLIC_BIZUM_PHONE || "+34 600 000 000"}
                    </span>
                  </div>
                </div>

                {/* Concepto Obligatorio */}
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 text-center space-y-3">
                  <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] block">
                    CONCEPTO OBLIGATORIO EN BIZUM
                  </span>
                  
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-mono font-black text-stone-900 tracking-widest">
                      {bizumRequestData.reference_code}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(bizumRequestData.reference_code);
                        toast.success('¡Código copiado al portapapeles!');
                      }}
                      className="w-8 h-8 rounded-xl bg-white hover:bg-stone-50 border-stone-200 text-[#D4AF37] shadow-2xs"
                      title="Copiar código"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                  
                  <p className="text-[10px] text-stone-500 font-medium leading-relaxed">
                    Es fundamental incluir este código exacto para que podamos validar tu transferencia.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleConfirmBizumSent}
                    disabled={confirmingBizumSent}
                    variant="luxury"
                    className="w-full py-5 rounded-2xl text-xs font-bold shadow-luxury text-stone-950 flex items-center justify-center gap-1.5"
                  >
                    {confirmingBizumSent ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Confirmando envío...
                      </>
                    ) : (
                      'Ya he enviado el Bizum'
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
