import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Trash2, ShieldCheck, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function PaymentsTab({ settings, setSettings }: { settings: any, setSettings: any }) {
  const { t } = useLanguage();
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
          toast.success(t('dashboard.settings.payments.toasts.sync_active'));
        } else {
          toast.info(t('dashboard.settings.payments.toasts.sync_incomplete'));
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
      title: t('dashboard.settings.payments.toasts.disconnect_title'),
      message: t('dashboard.settings.payments.toasts.disconnect_msg'),
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
            toast.success(t('dashboard.settings.payments.toasts.disconnect_success'));
          }
        } catch (e) {
          console.error(e);
          toast.error(t('dashboard.settings.payments.toasts.disconnect_error'));
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
        toast.error(t('dashboard.settings.payments.toasts.connect_error') + (data.detail || "Inténtalo de nuevo más tarde"));
      }
    } catch (e) {
      console.error(e);
      toast.error(t('dashboard.settings.payments.toasts.network_error'));
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between mb-8 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
              <Wallet size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.payments.stripe_connection')}</h2>
              <p className="text-stone-400 text-xs mt-0.5 max-w-xl font-medium">
                {t('dashboard.settings.payments.stripe_desc')}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[11px] font-bold text-stone-600">
            <ShieldCheck size={13} className="text-[#D4AF37]" />
            <span>Stripe Connect</span>
          </div>
        </div>

        {!settings?.stripe_account_id ? (
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-400 mx-auto mb-4 shadow-2xs">
              <CreditCard size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-stone-800 text-base mb-1.5">{t('dashboard.settings.payments.not_connected')}</h3>
            <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto leading-relaxed">
              {t('dashboard.settings.payments.onboarding_desc')}
            </p>
            <Button
              id="payments-connect-stripe-btn"
              onClick={handleConnectStripe}
              disabled={connecting}
              variant="luxury"
              size="lg"
              className="rounded-xl px-6 font-bold shadow-luxury text-stone-950 flex items-center justify-center gap-2 mx-auto"
            >
              <CreditCard size={16} strokeWidth={2} />
              {connecting ? t('dashboard.settings.payments.connecting') : t('dashboard.settings.payments.connect_btn')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`relative overflow-hidden border rounded-2xl p-6 transition-all ${settings.stripe_charges_enabled ? 'bg-white border-stone-200/80 shadow-2xs' : 'bg-amber-50/30 border-amber-200/80'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${settings.stripe_charges_enabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {settings.stripe_charges_enabled ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-800 text-base">
                        {settings.stripe_charges_enabled ? t('dashboard.settings.payments.connected_active') : t('dashboard.settings.payments.onboarding_incomplete')}
                      </h3>
                      {settings.stripe_charges_enabled && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Activo</span>
                      )}
                    </div>
                    <p className="text-stone-400 text-xs font-medium mt-0.5">
                      ID de cuenta: <span className="font-mono text-stone-600 font-semibold">{settings.stripe_account_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <a 
                    id="payments-manage-stripe-link"
                    href="https://dashboard.stripe.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-5 py-2.5 bg-stone-900 hover:bg-[#D4AF37] text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 hover:text-stone-950"
                  >
                    <ExternalLink size={14} />
                    {t('dashboard.settings.payments.manage_stripe')}
                  </a>
                  
                  <Button 
                    id="payments-refresh-status-btn"
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 w-9 p-0 border-stone-200"
                    title="Sincronizar"
                  >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                  </Button>
                </div>
              </div>

              {!settings.stripe_charges_enabled && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-3">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">{t('dashboard.settings.payments.action_required')}</p>
                    <p className="text-amber-800/80 mt-0.5">{t('dashboard.settings.payments.stripe_needed_info')}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end px-1">
              <button 
                id="payments-disconnect-btn"
                onClick={handleDisconnect}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-widest transition-all flex items-center gap-1.5 group"
              >
                <Trash2 size={13} />
                {t('dashboard.settings.payments.disconnect')}
              </button>
            </div>
            
            {/* Opciones Adicionales de Pago */}
            <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-stone-100">
               <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-stone-800 text-sm mb-2">{t('dashboard.settings.payments.slot_blocking')}</h3>
                    <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      {t('dashboard.settings.payments.slot_blocking_desc')}
                    </p>
                  </div>
                   <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80">
                     <label className="block text-[10px] font-bold text-stone-600 mb-2 uppercase tracking-wider">{t('dashboard.settings.payments.cancellation_margin')}</label>
                     <div className="flex items-center gap-3">
                       <input 
                         id="payments-cancellation-margin-input"
                         type="number" 
                         value={settings?.cancellation_margin_hours === undefined || settings?.cancellation_margin_hours === null ? "" : settings.cancellation_margin_hours} 
                         onChange={(e) => {
                           const val = e.target.value;
                           setSettings({ ...settings, cancellation_margin_hours: val === "" ? "" : parseInt(val) });
                         }}
                         className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none font-bold text-stone-800 text-sm"
                         min="1"
                         max="720"
                       />
                       <span className="text-xs font-medium text-stone-500">{t('dashboard.settings.payments.cancellation_margin_desc')}</span>
                     </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div>
                     <h3 className="font-bold text-stone-800 text-sm mb-2">{t('dashboard.settings.payments.deposit_policies')}</h3>
                     <p className="text-xs text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100 mb-3">
                       {t('dashboard.settings.payments.deposit_policies_desc')}
                     </p>
                   </div>

                   {/* Fianza Global Card */}
                   <div className={`p-5 rounded-2xl border transition-all duration-300 ${settings?.global_deposit_required ? 'bg-stone-50/80 border-stone-200 shadow-2xs' : 'bg-stone-50/30 border-stone-100'}`}>
                     <label className="flex items-center justify-between cursor-pointer">
                       <div className="pr-4">
                         <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">{t('dashboard.settings.payments.global_deposit')}</span>
                         <span className="text-[10px] text-stone-400 font-medium block mt-0.5 leading-relaxed">
                           {t('dashboard.settings.payments.global_deposit_desc')}
                         </span>
                       </div>
                       <div className="relative shrink-0">
                         <input 
                           id="payments-global-deposit-checkbox"
                           type="checkbox" 
                           checked={settings?.global_deposit_required || false} 
                           onChange={(e) => setSettings({ ...settings, global_deposit_required: e.target.checked })} 
                           className="sr-only" 
                         />
                         <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${settings?.global_deposit_required ? 'bg-[#D4AF37]' : 'bg-stone-300'}`}></div>
                         <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${settings?.global_deposit_required ? 'translate-x-4' : ''}`}></div>
                       </div>
                     </label>

                     {settings?.global_deposit_required && (
                       <div className="mt-4 pt-4 border-t border-stone-200/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                         <div className="w-full">
                           <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">{t('dashboard.settings.payments.global_deposit_amount')}</label>
                           <div className="relative flex items-center">
                             <span className="absolute left-3.5 text-xs font-bold text-stone-400">€</span>
                             <input 
                               id="payments-global-deposit-amount-input"
                               type="number" 
                               value={settings?.global_deposit_amount === undefined || settings?.global_deposit_amount === null ? "" : settings.global_deposit_amount} 
                               onChange={(e) => {
                                 const val = e.target.value;
                                   setSettings({ ...settings, global_deposit_amount: val === "" ? "" : parseFloat(val) });
                               }}
                               className="w-full pl-8 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none font-bold text-stone-800 text-sm"
                               min="0"
                               max="10000"
                               step="0.5"
                             />
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="p-4 bg-stone-50/50 rounded-xl border border-stone-100/70 italic text-[10px] text-stone-400 leading-relaxed">
                    {t('dashboard.settings.payments.global_deposit_note')}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
