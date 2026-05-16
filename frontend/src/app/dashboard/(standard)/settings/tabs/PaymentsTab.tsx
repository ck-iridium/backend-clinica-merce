import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';

export default function PaymentsTab({ settings, setSettings }: { settings: any, setSettings: any }) {
  const { showFeedback } = useFeedback();
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/refresh-status`);
      const data = await res.json();
      if (res.ok) {
        setSettings({ ...settings, stripe_charges_enabled: data.charges_enabled });
        if (data.charges_enabled) {
          toast.success("¡Cuenta sincronizada! Pagos activados.");
        } else {
          toast.info("Cuenta sincronizada. Aún falta completar información en Stripe.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (settings?.stripe_account_id && !settings?.stripe_charges_enabled) {
      handleRefreshStatus();
    }
  }, []);

  const handleDisconnect = () => {
    showFeedback({
      type: 'confirm',
      title: 'Desconectar Stripe',
      message: '¿Estás seguro de que deseas desconectar la cuenta de Stripe de esta clínica? Los pagos online y fianzas dejarán de funcionar inmediatamente.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stripe_account_id: null,
              stripe_charges_enabled: false
            })
          });
          if (res.ok) {
            setSettings({ ...settings, stripe_account_id: null, stripe_charges_enabled: false });
            toast.success("Cuenta de Stripe desconectada correctamente.");
          }
        } catch (e) {
          console.error(e);
          toast.error("Error al desconectar la cuenta.");
        }
      }
    });
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/connect`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Error al conectar con Stripe: " + (data.detail || "Inténtalo de nuevo más tarde"));
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de red al conectar con Stripe.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-stone-200 to-stone-300"></div>
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-stone-800">Conexión con Stripe</h2>
            <p className="text-stone-500 text-sm mt-1 max-w-xl">
              Configura tu cuenta de Stripe para procesar cobros y fianzas online. El 100% de los ingresos irán directamente a tu cuenta conectada.
            </p>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>

        {!settings?.stripe_account_id ? (
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center">
            <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-bold text-stone-800 mb-2">Aún no has conectado tu cuenta</h3>
            <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
              Para empezar a cobrar fianzas en tus reservas online, debes completar el proceso de onboarding seguro con Stripe.
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="px-6 py-3 bg-[#635BFF] hover:bg-[#4B45C6] text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <CreditCard size={18} />
              {connecting ? 'Conectando...' : 'Conectar con Stripe'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status Card */}
            <div className={`relative overflow-hidden border rounded-3xl p-8 transition-all ${settings.stripe_charges_enabled ? 'bg-white border-stone-200' : 'bg-orange-50/50 border-orange-100'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${settings.stripe_charges_enabled ? 'bg-green-50 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {settings.stripe_charges_enabled ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-800 text-lg">
                        {settings.stripe_charges_enabled ? 'Cuenta Conectada y Activa' : 'Onboarding Incompleto'}
                      </h3>
                      {settings.stripe_charges_enabled && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">Live</span>
                      )}
                    </div>
                    <p className="text-stone-500 text-sm font-medium mt-0.5">
                      ID: <span className="font-mono text-stone-400">{settings.stripe_account_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a 
                    href="https://dashboard.stripe.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-6 py-3 bg-stone-900 hover:bg-[#d4af37] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Gestionar en Stripe
                  </a>
                  
                  <button 
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-xl border border-stone-100 transition-all"
                    title="Sincronizar"
                  >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {!settings.stripe_charges_enabled && (
                <div className="mt-6 p-4 bg-orange-100/50 rounded-2xl border border-orange-200 flex items-start gap-3">
                  <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-orange-800">
                    <p className="font-bold">Acción requerida</p>
                    <p className="opacity-80">Stripe necesita más información para habilitar los cobros. Haz clic en gestionar para completar tu perfil.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end px-2">
              <button 
                onClick={handleDisconnect}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-all flex items-center gap-2 group"
              >
                <Trash2 size={12} />
                Desconectar de Stripe
              </button>
            </div>
            
            {/* Opciones Adicionales de Pago */}
            <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-stone-100">
               <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-stone-800 text-sm mb-2">Bloqueo de Slots</h3>
                    <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      El sistema bloquea automáticamente los slots durante 10 minutos cuando un cliente inicia el proceso de pago de una fianza. Si no se completa, el slot se libera.
                    </p>
                  </div>
                  <div className="bg-[#fcf8e5] p-4 rounded-xl border border-[#e5e1cc]">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">Margen de Cancelación (Horas)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings?.cancellation_margin_hours || 24} 
                        onChange={(e) => setSettings({ ...settings, cancellation_margin_hours: parseInt(e.target.value) })}
                        className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-[#d4af37] outline-none font-bold text-stone-800"
                        min="1"
                        max="720"
                      />
                      <span className="text-xs font-medium text-stone-500">Horas de antelación para aviso.</span>
                    </div>
                  </div>
               </div>
               <div>
                  <h3 className="font-bold text-stone-800 text-sm mb-2">Fianzas por Servicio</h3>
                  <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    Puedes configurar qué tratamientos requieren fianza y su importe exacto directamente desde el <strong>Editor de Servicios</strong>.
                  </p>
                  <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-100 italic text-[10px] text-stone-400">
                    * Este margen de {settings?.cancellation_margin_hours || 24}h se mostrará automáticamente en tus páginas legales para informar al cliente.
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
