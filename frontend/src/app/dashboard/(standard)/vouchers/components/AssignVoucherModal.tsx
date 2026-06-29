import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AssignVoucherModal({
  showAssignModal,
  setShowAssignModal,
  handleAssignVoucher,
  selectedClientId,
  setSelectedClientId,
  clients,
  selectedTemplateId,
  setSelectedTemplateId,
  searchTerm,
  setSearchTerm,
  filteredTemplates,
  handleSelectTemplateForAssignment,
  templates,
  assignPrice,
  setAssignPrice,
  assignAmountPaid,
  setAssignAmountPaid,
  expirationMonths,
  setExpirationMonths,
  saving
}: any) {
  const { t } = useLanguage();

  return (
    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
      <DialogContent className="p-0 border-none max-w-lg">
        <DialogHeader className="p-8 border-b border-stone-100 bg-stone-50 rounded-t-xl">
          <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.vouchers.modal_emit_title') || 'Emitir / Vender Bono'}</DialogTitle>
          <DialogDescription className="text-stone-400 text-sm">
            {t('dashboard.vouchers.modal_emit_desc') || 'Asigna un bono del catálogo a un cliente y define las condiciones de pago.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8">
          <form id="assign-voucher-form" onSubmit={handleAssignVoucher}>
            {/* 1. Seleccionar Cliente */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('dashboard.vouchers.client_receptor') || 'Cliente Receptor'}</label>
              <Select required value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="assign-voucher-client-trigger" className="w-full bg-stone-50 border-stone-200 uppercase tracking-tighter shadow-sm font-bold">
                  <SelectValue placeholder={t('dashboard.vouchers.select_client_placeholder') || "Selecciona cliente..."} />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .filter((c: any) => c.email !== 'contado@generico.local')
                    .map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Seleccionar Plantilla con Buscador */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-2xl relative">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('dashboard.vouchers.choose_template') || 'Elegir Plantilla del Catálogo'}</label>
              {!selectedTemplateId ? (
                 <>
                    <input 
                      id="assign-voucher-template-search"
                      type="text" 
                      placeholder={t('dashboard.vouchers.search_template_placeholder') || "Buscar plantilla..."} 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full p-3 mb-2 bg-white border border-stone-200 rounded-xl text-sm outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                       {filteredTemplates.length === 0 && <p className="text-xs text-stone-400">{t('dashboard.vouchers.no_templates_found') || 'No se encontraron plantillas.'}</p>}
                       {filteredTemplates.map((tmpl: any) => (
                          <div 
                            id={`assign-voucher-template-result-${tmpl.id}`}
                            key={tmpl.id} 
                            onClick={() => handleSelectTemplateForAssignment(tmpl.id)}
                            className="p-3 bg-white border border-stone-100 rounded-xl hover:border-[#d9777f] hover:shadow-sm cursor-pointer transition-all flex justify-between items-center"
                          >
                             <div>
                               <p className="font-bold text-stone-700 text-sm">{tmpl.name}</p>
                               <p className="text-xs text-stone-400">{(t('dashboard.vouchers.sessions_count_plural') || '{sessions} Sesiones').replace('{sessions}', tmpl.total_sessions.toString())}</p>
                             </div>
                             <span className="font-extrabold text-[#d9777f]">{tmpl.price}€</span>
                          </div>
                       ))}
                    </div>
                 </>
              ) : (
                 <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#f3c7cb] shadow-inner">
                    <div>
                       <p className="font-bold text-stone-800 text-sm">{templates.find((t: any) => t.id === selectedTemplateId)?.name}</p>
                       <p className="text-xs text-[#d9777f] font-semibold mt-0.5">
                         {(t('dashboard.vouchers.sessions_to_consume') || '{sessions} Sesiones a consumir').replace('{sessions}', (templates.find((t: any) => t.id === selectedTemplateId)?.total_sessions || 0).toString())}
                       </p>
                    </div>
                    <button 
                      id="assign-voucher-change-template-btn"
                      type="button" 
                      onClick={() => setSelectedTemplateId('')}
                      className="text-xs font-bold text-stone-400 underline hover:text-stone-600"
                    >{t('dashboard.vouchers.change') || 'Cambiar'}</button>
                 </div>
              )}
            </div>

            {/* 3. Condiciones Financieras */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 transition-all duration-300 ${selectedTemplateId ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1">{t('dashboard.vouchers.final_price') || 'Precio Final Pactado (€)'}</label>
                <input 
                  id="assign-voucher-price-input"
                  type="number" step="0.01" required 
                  value={assignPrice} onChange={e => setAssignPrice(Number(e.target.value))}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-extrabold text-[#b08e23] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-600 tracking-wide mb-1">{t('dashboard.vouchers.initial_payment') || 'Pago Inicial Hoy (€)'}</label>
                <input 
                  id="assign-voucher-initial-pay-input"
                  type="number" step="0.01" required min="0" max={Number(assignPrice)}
                  value={assignAmountPaid} onChange={e => setAssignAmountPaid(Number(e.target.value))}
                  className="w-full p-3 bg-white border border-stone-200 border-l-4 border-l-emerald-400 rounded-xl font-extrabold text-stone-800 outline-none focus:border-l-emerald-600 focus:bg-emerald-50/30"
                />
              </div>

              <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('dashboard.vouchers.voucher_expiration') || 'Caducidad del Bono'}</label>
                  <Select value={expirationMonths.toString()} onValueChange={(val) => setExpirationMonths(Number(val))}>
                    <SelectTrigger id="assign-voucher-expiration-trigger" className="w-full bg-white border border-stone-200 rounded-xl font-semibold text-stone-700">
                      <SelectValue placeholder={t('dashboard.vouchers.select_expiration') || "Selecciona caducidad..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">{t('dashboard.vouchers.expiration_3_months') || '3 meses desde la compra'}</SelectItem>
                      <SelectItem value="6">{t('dashboard.vouchers.expiration_6_months') || '6 meses desde la compra'}</SelectItem>
                      <SelectItem value="12">{t('dashboard.vouchers.expiration_12_months') || '12 meses desde la compra'}</SelectItem>
                      <SelectItem value="24">{t('dashboard.vouchers.expiration_24_months') || '2 años desde la compra'}</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="sticky bottom-0 left-0 w-full p-8 border-t border-stone-100 bg-gradient-to-t from-white via-white to-white/0 rounded-b-2xl z-20">
          <button 
            id="assign-voucher-submit-btn"
            form="assign-voucher-form"
            type="submit" 
            disabled={saving || !selectedTemplateId} 
            className="w-full py-4 bg-stone-800 text-white font-extrabold rounded-xl hover:bg-stone-900 transition-all flex justify-center items-center shadow-lg disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (t('dashboard.vouchers.emit_confirm') || "Crear y Asignar Bono")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
