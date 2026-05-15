import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function PaymentsTab({ settings, setSettings }: { settings: any, setSettings: any }) {
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
          <div className="space-y-6">
            <div className={`border rounded-2xl p-6 flex items-center justify-between ${settings.stripe_charges_enabled ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-4">
                {settings.stripe_charges_enabled ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                )}
                <div>
                  <h3 className={`font-bold ${settings.stripe_charges_enabled ? 'text-green-900' : 'text-orange-900'}`}>
                    {settings.stripe_charges_enabled ? 'Cuenta Conectada y Activa' : 'Onboarding Incompleto'}
                  </h3>
                  <p className={`text-sm ${settings.stripe_charges_enabled ? 'text-green-700' : 'text-orange-700'}`}>
                    ID de Cuenta: <span className="font-mono">{settings.stripe_account_id}</span>
                  </p>
                </div>
              </div>
              {!settings.stripe_charges_enabled && (
                 <button
                 onClick={handleConnectStripe}
                 disabled={connecting}
                 className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
               >
                 <ExternalLink size={16} />
                 {connecting ? 'Cargando...' : 'Completar Perfil'}
               </button>
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleRefreshStatus}
                disabled={refreshing}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-all"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Sincronizar estado con Stripe
              </button>
            </div>
            
            {/* Opciones Adicionales de Pago */}
            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-stone-100">
               <div>
                  <h3 className="font-bold text-stone-800 text-sm mb-2">Bloqueo de Slots</h3>
                  <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    El sistema bloquea automáticamente los slots durante 15 minutos cuando un cliente inicia el proceso de pago de una fianza. Si no se completa, el slot se libera.
                  </p>
               </div>
               <div>
                  <h3 className="font-bold text-stone-800 text-sm mb-2">Fianzas por Servicio</h3>
                  <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    Puedes configurar qué tratamientos requieren fianza y su importe exacto directamente desde el <strong>Editor de Servicios</strong>.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
