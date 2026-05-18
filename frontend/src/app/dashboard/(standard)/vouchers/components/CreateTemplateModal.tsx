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

export default function CreateTemplateModal({
  showTemplateModal,
  setShowTemplateModal,
  handleCreateTemplate,
  templateName,
  setTemplateName,
  templateServiceId,
  setTemplateServiceId,
  services,
  templateSessions,
  setTemplateSessions,
  calculateTemplateDefaultPrice,
  templatePrice,
  setTemplatePrice,
  saving
}: any) {
  const { t } = useLanguage();

  return (
    <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
      <DialogContent className="p-0 border-none max-w-sm">
        <DialogHeader className="p-6 border-b border-stone-50 bg-white rounded-t-xl">
          <DialogTitle className="text-xl font-extrabold text-stone-800">{t('dashboard.vouchers.modal_template_title') || 'Crear Plantilla'}</DialogTitle>
          <DialogDescription className="text-stone-400 text-xs mt-1">
            {t('dashboard.vouchers.modal_template_desc') || 'Define los parámetros básicos para una nueva plantilla de bono.'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pb-32">
          <form id="template-form" onSubmit={handleCreateTemplate}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.vouchers.template_name_label') || 'Nombre (Ej: Bono 5 Ses. Axilas)'}</label>
                <input required type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.vouchers.base_service_label') || 'Servicio / Tratamiento base'}</label>
                <Select value={templateServiceId} onValueChange={(val) => {
                  setTemplateServiceId(val);
                  calculateTemplateDefaultPrice(val, templateSessions);
                }}>
                  <SelectTrigger className="w-full bg-stone-50 border-stone-200 font-bold">
                    <SelectValue placeholder={t('dashboard.vouchers.choose_technique') || "-- Elige técnica --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.filter((s: any) => s.is_active).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.price}€/sesión)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.vouchers.sessions_count_label') || 'Nº de Sesiones / Usos'}</label>
                <input 
                  required type="number" min="1"
                  value={templateSessions} 
                  onChange={e => {
                    const sess = Number(e.target.value);
                    setTemplateSessions(sess);
                    calculateTemplateDefaultPrice(templateServiceId, sess);
                  }} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.vouchers.suggested_price_label') || 'Precio de Venta Sugerido (€)'}</label>
                <input required type="number" step="0.01" value={templatePrice} onChange={e => setTemplatePrice(Number(e.target.value))} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-[#b08e23]" />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="sticky bottom-0 left-0 w-full p-6 border-t border-stone-50 bg-gradient-to-t from-white via-white to-white/0 rounded-b-2xl z-20">
          <button form="template-form" type="submit" disabled={saving} className="w-full py-4 bg-[#bf7d6b] text-white font-extrabold rounded-xl hover:bg-[#a66a5a] transition-all flex justify-center items-center shadow-lg shadow-[#bf7d6b]/20 active:scale-95">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (t('dashboard.vouchers.save_template') || "Guardar Plantilla")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
