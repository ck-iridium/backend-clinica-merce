"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Calendar, ClipboardList, FileText, Scale, Printer, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectorMetadataDisplay } from './SectorMetadataDisplay';

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
  onDeleteConsent?: (consentId: string) => void;
  clientId: string;
  businessSector?: string;
  sectorMetadata?: any;
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
  onDeleteConsent,
  clientId,
  businessSector = 'general',
  sectorMetadata = {}
}: ClientTabsContentProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (activeTab === 'overview') {
    return (
      <Card className="rounded-[2rem] border-stone-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-[#B38F26] shadow-xs">
            <ClipboardList className="w-4 h-4" />
          </div>
          <span>{t(`dashboard.clients.sectors.${businessSector}`) || 'Notas Internas'}</span>
        </h3>
        
        <div className="px-1">
          <SectorMetadataDisplay
            sector={businessSector}
            value={sectorMetadata}
          />
        </div>
      </Card>
    );
  }

  if (activeTab === 'appointments') {
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const paginatedAppointments = appointments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
        <h3 className="text-lg font-serif font-light text-stone-800 border-b border-stone-50 pb-4">
          {t('dashboard.clients.completed_treatments_history') || 'Historial de Tratamientos'}
        </h3>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-stone-400 italic text-sm">
            {t('dashboard.clients.zero_completed_treatments') || 'No hay tratamientos registrados en el historial de este cliente.'}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedAppointments.map(a => {
                const s = services.find(x => x.id === a.service_id);
                return (
                  <div key={a.id} className="p-4 rounded-xl border border-stone-100 bg-[#FAFAFA] hover:bg-white flex items-center justify-between transition-all group">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-650 flex items-center justify-center font-bold text-xs">✓</span>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{s?.name || t('dashboard.clients.treatment_placeholder') || 'Tratamiento'}</p>
                        <p className="text-[10px] text-stone-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          {new Date(a.start_time).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 bg-white border border-stone-200 px-3 py-1 rounded-full uppercase tracking-wider group-hover:border-stone-300">
                      {t('dashboard.clients.completed') || 'Finalizado'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-100 pt-6 mt-6">
                <span className="text-xs text-stone-450 font-semibold uppercase tracking-wider">
                  {t('dashboard.clients.page_pagination')
                    ?.replace('{current}', String(currentPage))
                    ?.replace('{total}', String(totalPages))
                    ?.replace('{count}', String(appointments.length)) 
                    || `Página ${currentPage} de ${totalPages} (${appointments.length} servicios)`}
                </span>
                <div className="flex gap-2">
                  <button 
                    id="prev-appointments-btn"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 text-xs font-bold bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition-all duration-300"
                  >
                    {t('dashboard.clients.previous') || 'Anterior'}
                  </button>
                  <button 
                    id="next-appointments-btn"
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-stone-900 transition-all duration-300"
                  >
                    {t('dashboard.clients.next') || 'Siguiente'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'vouchers') {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 space-y-6">
        <div className="flex justify-between items-center border-b border-stone-50 pb-4">
          <h3 className="text-lg font-serif font-light text-stone-800">
            {t('dashboard.clients.acquired_vouchers_title') || 'Bonos Adquiridos'}
          </h3>
          {!isEspecialista && (
            <a id="sell-voucher-link" href="/dashboard/vouchers" className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-4 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors">
              {t('dashboard.clients.sell_voucher') || 'Vender Bono'}
            </a>
          )}
        </div>

        {vouchers.length === 0 ? (
          <p className="text-stone-400 text-sm italic py-4">
            {t('dashboard.clients.no_vouchers_in_account') || 'Este cliente no posee bonos en su cuenta.'}
          </p>
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
                      <p className="font-bold text-stone-800 text-sm leading-tight">
                        {s?.name || t('dashboard.clients.service_placeholder') || 'Servicio'}
                      </p>
                      <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${isActive ? 'bg-[#D4AF37]/10 text-stone-900' : 'bg-stone-200 text-stone-500'}`}>
                        {isActive ? (t('dashboard.clients.active') || 'Activo') : (t('dashboard.clients.closed') || 'Cerrado')}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-stone-400">
                      {t('dashboard.clients.expires') || 'Vence: '}{new Date(v.expiration_date).toLocaleDateString(dateLocale)}
                    </p>
                  </div>

                  <div className="mt-4">
                    {v.payment_status !== 'paid' ? (
                      <div className="mb-3 bg-white border border-red-100 p-2.5 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase text-stone-400 block">
                            {t('dashboard.clients.debt_label') || 'Deuda'}
                          </span>
                          <strong className="text-red-650 text-sm">{v.total_price - v.amount_paid}€</strong>
                        </div>
                        <button id={`pay-voucher-btn-${v.id}`} onClick={() => onOpenPayModal(v)} className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-md text-xs transition-colors">
                          {t('dashboard.clients.collect_btn') || 'Cobrar'}
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 text-center">
                        <span className="text-[10px] font-bold text-emerald-650">
                          {t('dashboard.clients.fully_paid') || '✓ Pagado Completamente'}
                        </span>
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
      <Card className="rounded-[2rem] border-stone-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {t('dashboard.clients.consents_signatures_title') || 'Consentimientos y Firmas'}
          </h3>
          <Button
            id="sign-consent-btn"
            onClick={onNewConsentClick}
            variant="luxury"
            size="sm"
            className="shadow-luxury gap-1.5 text-xs h-9 px-4"
          >
            <span>{t('dashboard.clients.new_consent') || '+ Firmar Consentimiento'}</span>
          </Button>
        </div>

        {consents.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Scale className="w-10 h-10 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-stone-700 font-serif font-bold text-sm">
              {t('dashboard.clients.no_signed_docs_body') || 'No hay documentos firmados.'}
            </p>
            <p className="text-stone-400 text-xs max-w-sm mx-auto">
              {t('dashboard.clients.no_signed_docs_desc_custom') || 'El paciente aún no ha firmado ningún consentimiento informado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl border border-stone-200/60 bg-white/70 hover:bg-stone-50 transition-colors shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-[#B38F26] shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate">{c.document_title}</p>
                  <p className="text-[11px] text-stone-400 font-medium mt-0.5 font-mono">
                    {t('dashboard.clients.signed_on') || 'Firmado:'} {new Date(c.signed_at).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    id={`view-consent-link-${c.id}`} 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold h-9 px-3.5 bg-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <a href={`/dashboard/clients/${clientId}/consents/${c.id}`}>
                      <Printer className="w-3.5 h-3.5 text-stone-400" />
                      <span>{t('dashboard.clients.view_print') || 'Ver / Imprimir'}</span>
                    </a>
                  </Button>
                  
                  {onDeleteConsent && !isEspecialista && (
                    <Button
                      id={`delete-consent-btn-${c.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteConsent(c.id)}
                      className="h-9 px-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title={t('dashboard.clients.delete_consent') || 'Eliminar Consentimiento'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return null;
}
