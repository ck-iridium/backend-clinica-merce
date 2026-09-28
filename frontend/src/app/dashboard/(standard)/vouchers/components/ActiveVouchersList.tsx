import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ticket } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function ActiveVouchersList({
  vouchers,
  getClientName,
  getServiceName,
  isExpired,
  handleOpenPayModal,
  handleDeleteVoucher
}: {
  vouchers: any[];
  getClientName: (id: string) => string;
  getServiceName: (id: string) => string;
  isExpired: (date: string) => boolean;
  handleOpenPayModal: (v: any) => void;
  handleDeleteVoucher: (id: string) => void;
}) {
  const { t, language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-stone-700 ml-1">{t('dashboard.vouchers.active_in_patients') || 'Bonos activos en pacientes'}</h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {vouchers.map(v => {
          const expired = isExpired(v.expiration_date);
          const isEmpty = v.used_sessions >= v.total_sessions;
          const active = !expired && !isEmpty;

          return (
            <motion.div 
              key={v.id} 
              variants={itemVariants}
              className={`bg-white rounded-3xl p-7 border transition-all relative overflow-hidden ${active ? 'border-stone-200/70 shadow-sm hover:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.08)] group' : 'border-stone-100 opacity-60'}`}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-serif text-xl font-normal text-stone-900 leading-tight">{getClientName(v.client_id)}</h3>
                  <p className="text-[10px] font-bold text-[#b08e23] uppercase tracking-[0.18em] mt-1.5">{getServiceName(v.service_id)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {active ? (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                      {t('dashboard.vouchers.active') || 'Activo'}
                    </span>
                  ) : (
                    <span className="bg-stone-50 text-stone-400 px-3 py-1 rounded-full text-[10px] font-bold border border-stone-200/50 uppercase tracking-wider">
                      {isEmpty ? (t('dashboard.vouchers.depleted') || 'Agotado') : (t('dashboard.vouchers.expired') || 'Caducado')}
                    </span>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button id={`voucher-item-actions-trigger-${v.id}`} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all focus:outline-none">
                        <MoreHorizontal size={15} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-stone-100">
                      <DropdownMenuLabel>{t('dashboard.vouchers.actions_title') || 'Acciones del Bono'}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link id={`voucher-view-client-btn-${v.id}`} href={`/dashboard/clients/${v.client_id}`} className="cursor-pointer">
                          {t('dashboard.vouchers.view_client_file') || 'Ver Ficha Cliente'}
                        </Link>
                      </DropdownMenuItem>
                      {v.payment_status !== 'paid' && (
                        <DropdownMenuItem id={`voucher-collect-pending-btn-${v.id}`} onClick={() => handleOpenPayModal(v)} className="text-amber-600 font-bold">
                          {t('dashboard.vouchers.collect_pending') || 'Cobrar Pendiente'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem id={`voucher-annul-btn-${v.id}`} onClick={() => handleDeleteVoucher(v.id)} className="text-rose-600">
                        {t('dashboard.vouchers.annul_voucher') || 'Anular Bono'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className={`mb-6 p-4 rounded-2xl border flex justify-between items-center ${
                v.payment_status === 'paid' ? 'bg-emerald-50/40 border-emerald-100/60' : 
                v.payment_status === 'partial' ? 'bg-amber-50/40 border-amber-100/60' : 
                'bg-rose-50/40 border-rose-100/60'
              }`}>
                <div>
                  <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">{t('dashboard.vouchers.financial_status') || 'Estado Financiero'}</p>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    {v.payment_status === 'paid' && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-emerald-700">{t('dashboard.vouchers.financial_completed') || 'Completado'}</span>
                      </>
                    )}
                    {v.payment_status === 'partial' && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        <span className="text-amber-700">
                          {(t('dashboard.vouchers.financial_debt') || 'Deuda: {debt}€').replace('{debt}', (v.total_price - v.amount_paid).toString())}
                        </span>
                      </>
                    )}
                    {v.payment_status === 'pending' && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        <span className="text-rose-600">{t('dashboard.vouchers.financial_unpaid') || 'Sin Cobrar'}</span>
                      </>
                    )}
                  </div>
                </div>
                 <div className="text-right">
                   <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">{t('dashboard.vouchers.investment') || 'Inversión'}</p>
                   <p className="text-base font-extrabold text-stone-800">{v.total_price}€</p>
                 </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-stone-400">{t('dashboard.vouchers.sessions_progress') || 'Progreso Sesiones'}</span>
                  <span className="text-stone-800">{v.used_sessions} / {v.total_sessions}</span>
                </div>
                <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/40 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((v.used_sessions / v.total_sessions) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${active ? 'bg-gradient-to-r from-[#d4af37] to-[#b08e23]' : 'bg-stone-300'}`} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                <span>
                  {(t('dashboard.vouchers.expires_on') || 'Vence el {date}')
                    .replace('{date}', new Date(v.expiration_date).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }))}
                </span>
              </div>
            </motion.div>
          );
        })}
        
        {vouchers.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/40 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-300 mb-4 shadow-sm">
              <Ticket size={28} strokeWidth={1.2} />
            </div>
            <p className="text-stone-400 font-medium text-sm">{t('dashboard.vouchers.no_active_vouchers') || 'No hay bonos activos asignados a clientes.'}</p>
          </div>
        )}
      </motion.div>
    </>
  );
}
