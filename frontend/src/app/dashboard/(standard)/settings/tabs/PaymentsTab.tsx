import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-stone-200 to-stone-300"></div>
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-semibold text-stone-800">{t('dashboard.settings.payments.stripe_connection')}</h2>
            <p className="text-stone-500 text-sm mt-1 max-w-xl">
              {t('dashboard.settings.payments.stripe_desc')}
            </p>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>

        {!settings?.stripe_account_id ? (
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center">
            <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-bold text-stone-800 mb-2">{t('dashboard.settings.payments.not_connected')}</h3>
            <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
              {t('dashboard.settings.payments.onboarding_desc')}
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="px-6 py-3 bg-[#635BFF] hover:bg-[#4B45C6] text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              <CreditCard size={18} />
              {connecting ? t('dashboard.settings.payments.connecting') : t('dashboard.settings.payments.connect_btn')}
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
                        {settings.stripe_charges_enabled ? t('dashboard.settings.payments.connected_active') : t('dashboard.settings.payments.onboarding_incomplete')}
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
                    {t('dashboard.settings.payments.manage_stripe')}
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
                    <p className="font-bold">{t('dashboard.settings.payments.action_required')}</p>
                    <p className="opacity-80">{t('dashboard.settings.payments.stripe_needed_info')}</p>
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
                  <div className="bg-[#fcf8e5] p-4 rounded-xl border border-[#e5e1cc]">
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">{t('dashboard.settings.payments.cancellation_margin')}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={settings?.cancellation_margin_hours === undefined || settings?.cancellation_margin_hours === null ? "" : settings.cancellation_margin_hours} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings({ ...settings, cancellation_margin_hours: val === "" ? "" : parseInt(val) });
                        }}
                        className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-[#d4af37] outline-none font-bold text-stone-800"
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
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${settings?.global_deposit_required ? 'bg-stone-50/70 border-stone-200 shadow-sm' : 'bg-stone-50/30 border-stone-100'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="pr-4">
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">{t('dashboard.settings.payments.global_deposit')}</span>
                        <span className="text-[10px] text-stone-400 font-medium block mt-0.5 leading-relaxed">
                          {t('dashboard.settings.payments.global_deposit_desc')}
                        </span>
                      </div>
                      <div className="relative shrink-0">
                        <input 
                          type="checkbox" 
                          checked={settings?.global_deposit_required || false} 
                          onChange={(e) => setSettings({ ...settings, global_deposit_required: e.target.checked })} 
                          className="sr-only" 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${settings?.global_deposit_required ? 'bg-[#d4af37]' : 'bg-stone-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${settings?.global_deposit_required ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>

                    {settings?.global_deposit_required && (
                      <div className="mt-4 pt-4 border-t border-stone-200/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="w-full">
                          <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">{t('dashboard.settings.payments.global_deposit_amount')}</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-stone-400">€</span>
                            <input 
                              type="number" 
                              value={settings?.global_deposit_amount === undefined || settings?.global_deposit_amount === null ? "" : settings.global_deposit_amount} 
                              onChange={(e) => {
                                const val = e.target.value;
                                  setSettings({ ...settings, global_deposit_amount: val === "" ? "" : parseFloat(val) });
                              }}
                              className="w-full pl-7 pr-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-[#d4af37] outline-none font-bold text-stone-800 text-sm"
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
