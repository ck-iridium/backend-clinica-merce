import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function PayDebtModal({
  showPayModal,
  setShowPayModal,
  handlePayDebt,
  currentDebt,
  payAmount,
  setPayAmount,
  paying
}: any) {
  const { t } = useLanguage();

  return (
    <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
      <DialogContent className="p-0 border-none max-w-sm">
        <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.vouchers.modal_pay_title') || 'Añadir Pago'}</DialogTitle>
          <DialogDescription className="text-stone-400 text-xs mt-1">
            {t('dashboard.vouchers.modal_pay_desc') || 'Registra un cobro parcial o total sobre la deuda del bono.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pb-32">
          <form id="pay-debt-form" onSubmit={handlePayDebt}>
            <p className="text-sm text-stone-500 mb-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
              {(t('dashboard.vouchers.current_debt_desc') || 'La deuda actual de este bono es de {debt}€.')
                .replace('{debt}', currentDebt.toString())}
            </p>
            
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.vouchers.amount_paid_today') || 'Monto abonado HOY (€)'}</label>
              <input 
                id="pay-debt-amount-input"
                required 
                type="number" 
                step="0.01" 
                max={currentDebt}
                value={payAmount} 
                onChange={e => setPayAmount(Number(e.target.value))} 
                className="w-full p-4 bg-stone-50 border border-stone-200 border-l-4 border-l-[#d9777f] rounded-xl font-extrabold text-stone-800 outline-none text-xl" 
              />
              <p className="text-[10px] text-stone-400 mt-1">{t('dashboard.vouchers.amount_paid_helper') || 'Este importe se sumará al saldo pagado.'}</p>
            </div>
          </form>
        </div>

        <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 flex gap-3 rounded-b-2xl z-20">
          <button id="pay-debt-cancel-btn" type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 text-stone-600 font-bold border border-stone-200 rounded-xl hover:bg-stone-50 bg-white">{t('dashboard.vouchers.cancel') || 'Cancelar'}</button>
          <button id="pay-debt-submit-btn" form="pay-debt-form" type="submit" disabled={paying} className="flex-1 py-3 text-white bg-[#d9777f] font-bold rounded-xl hover:bg-[#c6646b] shadow-md flex justify-center items-center">
            {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (t('dashboard.vouchers.confirm') || 'Confirmar')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
