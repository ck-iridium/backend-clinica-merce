import { Hash, ImageIcon, FileText, CheckCircle } from 'lucide-react';
import { RefObject } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface BillingTabProps {
  settings: any;
  setSettings: (s: any) => void;
  logoPdfRef: RefObject<HTMLInputElement>;
  sigRef: RefObject<HTMLInputElement>;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BillingTab({ 
  settings, 
  setSettings, 
  logoPdfRef, 
  sigRef, 
  handleImageUpload 
}: BillingTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Numeración y Prefijos */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <Hash size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.billing.title')}</h3>
            <p className="text-xs text-stone-400 font-medium">Secuencia correlativa, prefijos oficiales y tipo impositivo por defecto</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.billing.prefix')}</label>
            <input 
              id="billing-invoice-prefix" 
              type="text" 
              value={settings.invoice_prefix} 
              onChange={e => setSettings({...settings, invoice_prefix: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono text-sm font-semibold text-stone-800 outline-none transition-all" 
            />
            <p className="text-[11px] text-stone-400 mt-2 font-medium">{t('dashboard.settings.billing.prefix_vars')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.billing.next_number')}</label>
              <input 
                id="billing-invoice-next-number"
                type="number" 
                min="1" 
                value={settings.invoice_next_number === undefined || settings.invoice_next_number === null ? "" : settings.invoice_next_number} 
                onChange={e => {
                  const val = e.target.value;
                  setSettings({...settings, invoice_next_number: val === "" ? "" : parseInt(val) });
                }} 
                className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono font-bold text-stone-800 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.billing.tax_rate')}</label>
              <input 
                id="billing-default-tax-rate"
                type="number" 
                min="0" 
                step="0.5" 
                value={settings.default_tax_rate === undefined || settings.default_tax_rate === null ? "" : settings.default_tax_rate} 
                onChange={e => {
                  const val = e.target.value;
                  setSettings({...settings, default_tax_rate: val === "" ? "" : parseFloat(val) });
                }} 
                className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 font-mono font-bold text-stone-800 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="md:col-span-2 p-4 bg-amber-50/40 rounded-2xl border border-amber-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-[#D4AF37]" />
              <p className="text-xs text-stone-600 font-medium">
                {t('dashboard.settings.billing.preview')} <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">{settings.invoice_prefix.replace('{YY}', new Date().getFullYear().toString().slice(-2)).replace('{YYYY}', new Date().getFullYear().toString()).replace('{MM}', (new Date().getMonth()+1).toString().padStart(2,'0'))}{String(settings.invoice_next_number).padStart(4, '0')}</span>
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#b08e23] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-amber-200">
              Formato Válido
            </span>
          </div>
        </div>
      </div>

      {/* Imágenes de Documentos */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <ImageIcon size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.billing.docs_identity')}</h3>
            <p className="text-xs text-stone-400 font-medium">Membrete oficial y firma digital incrustada en tus facturas PDF</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo PDF */}
          <div className="border border-stone-200/80 rounded-2xl p-5 bg-stone-50/50 flex flex-col items-start gap-4 transition-all hover:bg-stone-50">
            <div className="w-full h-36 bg-white border-2 border-stone-200/80 border-dashed rounded-xl flex items-center justify-center p-3 shadow-2xs">
              {settings.logo_pdf_b64 ? (
                <img src={settings.logo_pdf_b64} alt="PDF Logo" className="max-h-full object-contain" />
              ) : (
                <span className="text-stone-300 text-[10px] uppercase tracking-widest font-bold">{t('dashboard.settings.billing.invoice_logo')}</span>
              )}
            </div>
            <input id="billing-logo-pdf-input" type="file" accept="image/*" ref={logoPdfRef} className="hidden" onChange={e => handleImageUpload('logo_pdf_b64', e)} />
            <Button 
              id="billing-logo-pdf-btn" 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => logoPdfRef.current?.click()} 
              className="w-full rounded-xl font-bold text-xs border-stone-200 text-stone-800 hover:border-[#D4AF37] hover:text-[#b08e23]"
            >
              {t('dashboard.settings.billing.change_logo')}
            </Button>
          </div>
          {/* Firma */}
          <div className="border border-stone-200/80 rounded-2xl p-5 bg-stone-50/50 flex flex-col items-start gap-4 transition-all hover:bg-stone-50">
            <div className="w-full h-36 bg-white border-2 border-stone-200/80 border-dashed rounded-xl flex items-center justify-center p-3 shadow-2xs">
              {settings.signature_b64 ? (
                <img src={settings.signature_b64} alt="Signature" className="max-h-full object-contain mix-blend-multiply" />
              ) : (
                <span className="text-stone-300 text-[10px] uppercase tracking-widest font-bold">{t('dashboard.settings.billing.signature')}</span>
              )}
            </div>
            <input id="billing-signature-input" type="file" accept="image/*" ref={sigRef} className="hidden" onChange={e => handleImageUpload('signature_b64', e)} />
            <Button 
              id="billing-signature-btn" 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => sigRef.current?.click()} 
              className="w-full rounded-xl font-bold text-xs border-stone-200 text-stone-800 hover:border-[#D4AF37] hover:text-[#b08e23]"
            >
              {t('dashboard.settings.billing.change_signature')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
