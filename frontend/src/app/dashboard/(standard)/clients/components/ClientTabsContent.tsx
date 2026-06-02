"use client";

import { useLanguage } from '@/app/contexts/LanguageContext';
import { Calendar } from "lucide-react";

interface ClientTabsContentProps {
  activeTab: 'overview' | 'appointments' | 'vouchers' | 'consents';
  appointments: any[];
  vouchers: any[];
  consents: any[];
  services: any[];
  isEspecialista: boolean;
  onOpenPayModal: (v: any) => void;
  dateLocale: string;
  onNewConsentClick: () => void;
  clientId: string;
}

export function ClientTabsContent({
  activeTab,
  appointments,
  vouchers,
  consents,
  services,
  isEspecialista,
  onOpenPayModal,
  dateLocale,
  onNewConsentClick,
  clientId
}: ClientTabsContentProps) {
  const { t } = useLanguage();

  if (activeTab === 'overview') {
    return null; // Managed by ClientActivityCards in the main layout
  }

  if (activeTab === 'appointments') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
        <h3 className="text-lg font-serif font-light text-stone-800 border-b border-stone-50 pb-4">Historial de Tratamientos</h3>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-stone-400 italic text-sm">No hay tratamientos registrados en el historial de este cliente.</div>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => {
              const s = services.find(x => x.id === a.service_id);
              return (
                <div key={a.id} className="p-4 rounded-xl border border-stone-100 bg-[#FAFAFA] hover:bg-white flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-650 flex items-center justify-center font-bold text-xs">✓</span>
                    <div>
                      <p className="font-bold text-stone-800 text-sm">{s?.name || 'Tratamiento'}</p>
                      <p className="text-[10px] text-stone-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {new Date(a.start_time).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 bg-white border border-stone-200 px-3 py-1 rounded-full uppercase tracking-wider group-hover:border-stone-300">
                    {t('dashboard.clients.completed') || 'Completado'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'vouchers') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
        <div className="flex justify-between items-center border-b border-stone-50 pb-4">
          <h3 className="text-lg font-serif font-light text-stone-800">Bonos Adquiridos</h3>
          {!isEspecialista && (
            <a href="/dashboard/vouchers" className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-4 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors">
              {t('dashboard.clients.sell_voucher') || 'Vender Bono'}
            </a>
          )}
        </div>

        {vouchers.length === 0 ? (
          <p className="text-stone-400 text-sm italic py-4">Este cliente no posee bonos en su cuenta.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vouchers.map(v => {
              const s = services.find(x => x.id === v.service_id);
              const isExpired = new Date(v.expiration_date) < new Date();
              const isEmpty = v.used_sessions >= v.total_sessions;
              const isActive = !isExpired && !isEmpty;

              return (
                <div key={v.id} className={`p-4 rounded-xl border flex flex-col justify-between ${isActive ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-stone-800 text-sm leading-tight">{s?.name || 'Servicio'}</p>
                      <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-[#D4AF37]/10 text-stone-900' : 'bg-stone-200 text-stone-500'}`}>
                        {isActive ? 'Activo' : 'Cerrado'}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-400">Vence: {new Date(v.expiration_date).toLocaleDateString(dateLocale)}</p>
                  </div>

                  <div className="mt-4">
                    {v.payment_status !== 'paid' ? (
                      <div className="mb-3 bg-white border border-red-100 p-2.5 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase text-stone-400 block">Deuda</span>
                          <strong className="text-red-650 text-sm">{v.total_price - v.amount_paid}€</strong>
                        </div>
                        <button onClick={() => onOpenPayModal(v)} className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-md text-xs transition-colors">
                          Cobrar
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-center">
                        <span className="text-[10px] font-bold text-emerald-650">✓ Pagado Completamente</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white h-1.5 rounded-full overflow-hidden border border-stone-200">
                        <div className="bg-[#D4AF37] h-full" style={{ width: `${(v.used_sessions / v.total_sessions) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-stone-700">{v.used_sessions}/{v.total_sessions}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'consents') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
        <div className="flex justify-between items-center border-b border-stone-50 pb-4">
          <h3 className="text-lg font-serif font-light text-stone-800">Consentimientos y Firmas</h3>
          <button 
            onClick={onNewConsentClick}
            className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            {t('dashboard.clients.new_consent') || '+ Firmar Consentimiento'}
          </button>
        </div>

        {consents.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-stone-300 text-3xl mb-2 block">⚖️</span>
            <p className="text-stone-500 font-medium text-sm">No hay documentos firmados.</p>
            <p className="text-stone-400 text-xs mt-1">El paciente aún no ha firmado ningún consentimiento informado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-xl border border-stone-100 bg-[#FAFAFA] hover:bg-stone-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">📄</div>
                <div className="flex-1">
                  <p className="font-bold text-stone-850 text-sm">{c.document_title}</p>
                  <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                    Firmado: {new Date(c.signed_at).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <a href={`/dashboard/clients/${clientId}/consents/${c.id}`} className="w-full sm:w-auto text-center px-4 py-2 bg-white border border-stone-200 text-stone-600 font-bold text-xs rounded-lg shadow-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                  Ver / Imprimir
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
