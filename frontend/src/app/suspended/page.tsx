"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CreditCard, Send, ShieldAlert, Loader2, ClipboardCheck, Clipboard } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function SuspendedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extraer parámetros de la URL
  const tenantIdFromUrl = searchParams.get('tenant_id');
  const planFromUrl = searchParams.get('plan') || 'pro';
  
  const [tenantId, setTenantId] = useState(tenantIdFromUrl || '');
  const [plan, setPlan] = useState(planFromUrl);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingBizum, setLoadingBizum] = useState(false);
  const [bizumRequested, setBizumRequested] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [amount, setAmount] = useState(59.00);
  const [copied, setCopied] = useState(false);

  // Mapeo de precios
  const PLAN_PRICES: Record<string, number> = {
    basic: 29.00,
    pro: 59.00,
    gold: 99.00
  };

  useEffect(() => {
    if (tenantIdFromUrl) {
      setTenantId(tenantIdFromUrl);
    } else {
      // Intentar recuperar de localStorage o cookies
      const storedTenantId = localStorage.getItem('last_tenant_id');
      if (storedTenantId) setTenantId(storedTenantId);
    }

    if (planFromUrl && PLAN_PRICES[planFromUrl.toLowerCase()]) {
      setPlan(planFromUrl.toLowerCase());
      setAmount(PLAN_PRICES[planFromUrl.toLowerCase()]);
    }
  }, [tenantIdFromUrl, planFromUrl]);

  // Obtener JWT del usuario logueado
  const getJwtToken = (): string => {
    let jwtToken = '';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('-auth-token')) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            jwtToken = JSON.parse(val).access_token || '';
          } catch {}
        }
      }
    }
    return jwtToken;
  };

  // 1. Reactivar con Stripe (Tarjeta)
  const handleStripePayment = async () => {
    if (!tenantId) {
      toast.error('Identificador de inquilino faltante. Por favor, inicia sesión de nuevo.');
      return;
    }

    setLoadingStripe(true);
    const loadingToast = toast.loading('Generando sesión de facturación segura...');

    try {
      const response = await fetch(`${API_URL}/stripe/create-subscription-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          plan_type: plan
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor de Stripe.');
      }

      const data = await response.json();
      if (data.url) {
        toast.success('Redirigiendo a la pasarela de Stripe...', { id: loadingToast });
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar la sesión de pago.', { id: loadingToast });
    } finally {
      setLoadingStripe(false);
    }
  };

  // 2. Solicitar Código de Referencia Bizum (Activar Periodo de Gracia de 24h)
  const handleBizumRequest = async () => {
    if (!tenantId) {
      toast.error('Identificador de inquilino faltante. Inicia sesión de nuevo.');
      return;
    }

    setLoadingBizum(true);
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Registrando solicitud de Bizum...');

    try {
      const response = await fetch(`${API_URL}/subscription/request-bizum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
        },
        body: JSON.stringify({
          plan_type: plan,
          billing_period: 'monthly'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al registrar la solicitud de pago.');
      }

      const data = await response.json();
      setReferenceCode(data.reference_code);
      setAmount(data.amount);
      setBizumRequested(true);
      
      toast.success('¡Solicitud registrada! Tienes 24h de acceso de gracia operativo.', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || 'Error al solicitar Bizum.', { id: loadingToast });
    } finally {
      setLoadingBizum(false);
    }
  };

  // 3. Confirmar que se ha enviado el Bizum y acceder al Dashboard
  const handleConfirmBizumSent = async () => {
    if (!tenantId) return;
    setLoadingBizum(true);
    const jwtToken = getJwtToken();
    const loadingToast = toast.loading('Confirmando envío del Bizum...');

    try {
      // Buscar la solicitud para marcarla como submitted
      const reqRes = await fetch(`${API_URL}/subscription/current-request`, {
        headers: {
          'X-Tenant-ID': tenantId,
          ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
        }
      });
      
      if (!reqRes.ok) throw new Error('No se encontró ninguna solicitud de Bizum activa.');
      const currentReq = await reqRes.json();

      const confirmRes = await fetch(`${API_URL}/subscription/confirm-sent/${currentReq.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
        }
      });

      if (!confirmRes.ok) throw new Error('Error al registrar la confirmación del pago.');

      toast.success('¡Pago en verificación! Redirigiendo a tu panel...', { id: loadingToast });
      
      // Redirigir al login o dashboard directamente
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);

    } catch (err: any) {
      toast.error(err.message || 'Error al confirmar el Bizum.', { id: loadingToast });
      setLoadingBizum(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Código de referencia copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 md:p-12 select-none font-sans relative overflow-hidden">
      {/* Background Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-900/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(28,25,23,0.04)] border border-[#1F2937]/5 overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-stone-950 via-[#d4af37] to-stone-950" />
        
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 shadow-inner relative overflow-hidden animate-pulse">
            <ShieldAlert className="w-8 h-8 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-transparent"></div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight mb-3">
            Suscripción Inactiva
          </h1>
          <p className="text-stone-500 text-xs md:text-sm max-w-md font-medium leading-relaxed">
            El periodo de prueba de tu clínica ha finalizado. Para seguir gestionando tus citas, fichas de clientes y facturación, activa tu plan comercial.
          </p>
        </div>

        {/* Formas de Pago (Sección Asimétrica Bento) */}
        {!bizumRequested ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Opción 1: Stripe (Tarjeta) */}
            <div className="bg-[#FAFAFA] border border-stone-200/50 hover:border-[#d4af37] p-8 rounded-3xl flex flex-col justify-between h-72 transition-all duration-300 group hover:shadow-sm">
              <div>
                <span className="w-12 h-12 rounded-xl bg-white border border-stone-100 text-[#d4af37] flex items-center justify-center mb-4 shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif mb-2">Pago con Tarjeta</h3>
                <p className="text-xxs text-stone-400 font-semibold leading-relaxed">
                  Pasarela automática instantánea. Reactivación al segundo sin esperas administrativas.
                </p>
              </div>

              <button
                onClick={handleStripePayment}
                disabled={loadingStripe}
                className="w-full bg-[#1F2937] hover:bg-stone-900 focus:outline-none text-white font-bold py-3.5 rounded-xl text-xs shadow-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loadingStripe ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pagar con Tarjeta'}
              </button>
            </div>

            {/* Opción 2: Bizum (Manual) */}
            <div className="bg-[#FAFAFA] border border-stone-200/50 hover:border-blue-500 p-8 rounded-3xl flex flex-col justify-between h-72 transition-all duration-300 group hover:shadow-sm">
              <div>
                <span className="w-12 h-12 rounded-xl bg-white border border-stone-100 text-blue-500 flex items-center justify-center mb-4 shadow-sm font-sans font-black text-sm uppercase">
                  Bz
                </span>
                <h3 className="text-base font-bold text-stone-900 font-serif mb-2">Pago por Bizum</h3>
                <p className="text-xxs text-stone-400 font-semibold leading-relaxed">
                  Transferencia manual directa. Obtén 24 horas de gracia operativa mientras validamos tu pago.
                </p>
              </div>

              <button
                onClick={handleBizumRequest}
                disabled={loadingBizum}
                className="w-full bg-white hover:bg-blue-50 focus:outline-none text-stone-900 border border-stone-200 hover:border-blue-500 font-bold py-3.5 rounded-xl text-xs shadow-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loadingBizum ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pagar por Bizum'}
              </button>
            </div>

          </div>
        ) : (
          /* Paso de instrucciones de Bizum cuando se solicita */
          <div className="bg-[#FAFAFA] border border-stone-200/40 p-6 md:p-8 rounded-3xl space-y-6 animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Instrucciones de Pago</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Teléfono Bizum</span>
                <span className="text-sm font-extrabold text-stone-850 font-mono">+34 630 338 538</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Importe Mensual</span>
                <span className="text-sm font-extrabold text-[#d4af37] font-mono">{amount.toFixed(2)} €</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Concepto Obligatorio</span>
                <span className="text-base font-extrabold text-stone-900 font-mono tracking-widest">{referenceCode}</span>
              </div>
              <button
                onClick={() => copyToClipboard(referenceCode)}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 hover:text-[#d4af37] transition-all hover:bg-stone-100 focus:outline-none active:scale-95"
              >
                {copied ? <ClipboardCheck className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <span className="text-sm mt-0.5">💡</span>
              <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                Al hacer clic en el botón de abajo, se te concederá de inmediato un **periodo de gracia de 24 horas** de acceso completo. Una vez verifiquemos la transferencia en nuestro banco, tu suscripción se activará de forma definitiva.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setBizumRequested(false)}
                className="w-1/3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirmBizumSent}
                disabled={loadingBizum}
                className="w-2/3 bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loadingBizum ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>He enviado el Bizum</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer legal discreto */}
        <p className="text-[9px] text-stone-400 text-center font-medium leading-normal mt-8 select-none">
          Garantía de reembolso de 14 días. Conexiones cifradas SSL y pasarela segura administrada por Stripe.
        </p>
      </div>
    </div>
  );
}

export default function SuspendedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
        <h2 className="text-lg font-serif font-bold text-stone-850">Cargando paywall...</h2>
      </div>
    }>
      <SuspendedContent />
    </Suspense>
  );
}
