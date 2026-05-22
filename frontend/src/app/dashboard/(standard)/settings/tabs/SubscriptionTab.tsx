import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CreditCard, CheckCircle2, Sparkles, TrendingUp, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);

  const fetchLimits = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/limits`);
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
      <div className="bg-[#1c1917] text-white rounded-[2.5rem] p-6 md:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#d4af37]/20 to-transparent rounded-full filter blur-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#d4af37]/20 text-[#e4c257] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#d4af37]/30">
                Suscripción Activa
              </span>
              {currentPlan === 'gold' && (
                <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1">
                  <Sparkles size={10} /> IA VIP
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight mt-3 text-white">
              {currentPlan === 'gold' && '🥇 Plan Gold Elite'}
              {currentPlan === 'pro' && '🥈 Plan Pro Premium'}
              {currentPlan === 'basic' && '🥉 Plan Básico'}
              {currentPlan === 'free' && '🌱 Plan Demo Gratuito'}
            </h2>
            <p className="text-stone-400 text-sm mt-2 max-w-xl leading-relaxed">
              Tu cuenta tiene asignados límites de cuota específicos según tu plan actual. Si necesitas ampliar tus recursos o usar IA maestra, actualiza a continuación.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shrink-0 text-center md:text-right min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Estado del Pago</p>
            <p className="text-xl font-bold mt-1 text-white flex items-center justify-center md:justify-end gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
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
                  className="bg-gradient-to-r from-[#d4af37] to-amber-500 h-full rounded-full transition-all duration-500"
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
                  className="bg-gradient-to-r from-[#d4af37] to-amber-500 h-full rounded-full transition-all duration-500"
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
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <TrendingUp size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Planes Disponibles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plansList.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const canContratar = !isCurrent;

            return (
              <div 
                key={plan.id}
                className={`bg-white rounded-3xl p-6 md:p-8 border transition-all duration-300 flex flex-col justify-between hover:shadow-lg
                  ${isCurrent ? 'border-[#d4af37] shadow-sm relative overflow-hidden' : 'border-stone-200/60'}`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#d4af37] text-white px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest">
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

                  <p className="text-xs text-stone-500 mb-6 leading-relaxed">{plan.limits}</p>

                  <div className="space-y-3 mb-8 border-t border-stone-100 pt-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs font-medium text-stone-600 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || redirectingPlan !== null}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5
                    ${isCurrent 
                      ? 'bg-stone-50 text-stone-400 cursor-not-allowed border border-stone-200/50' 
                      : 'bg-stone-900 hover:bg-[#d4af37] text-white shadow-sm'}`}
                >
                  {redirectingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : isCurrent ? (
                    'Plan Actual'
                  ) : (
                    'Mejorar / Contratar'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
