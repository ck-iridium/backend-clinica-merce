import { Hash, ImageIcon } from 'lucide-react';
import { RefObject } from 'react';

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
  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Numeración y Prefijos */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Hash size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Configuración de Facturas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Prefijo de Factura</label>
            <input type="text" value={settings.invoice_prefix} onChange={e => setSettings({...settings, invoice_prefix: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono text-sm outline-none" />
            <p className="text-[10px] text-stone-400 mt-2">Variables: &#123;YY&#125;, &#123;YYYY&#125;, &#123;MM&#125;.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-2">Sig. Nº Factura</label>
              <input 
                type="number" 
                min="1" 
                value={settings.invoice_next_number === undefined || settings.invoice_next_number === null ? "" : settings.invoice_next_number} 
                onChange={e => {
                  const val = e.target.value;
                  setSettings({...settings, invoice_next_number: val === "" ? "" : parseInt(val) });
                }} 
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono font-bold outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-2">IVA (%)</label>
              <input 
                type="number" 
                min="0" 
                step="0.5" 
                value={settings.default_tax_rate === undefined || settings.default_tax_rate === null ? "" : settings.default_tax_rate} 
                onChange={e => {
                  const val = e.target.value;
                  setSettings({...settings, default_tax_rate: val === "" ? "" : parseFloat(val) });
                }} 
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] font-mono font-bold outline-none" 
              />
            </div>
          </div>
          <div className="md:col-span-2 p-4 bg-[#fcf8e5] rounded-xl border border-[#f5efd5]">
            <p className="text-[10px] text-stone-600 font-medium">Previsualización del formato actual: <span className="font-bold text-stone-900">{settings.invoice_prefix.replace('{YY}', new Date().getFullYear().toString().slice(-2)).replace('{YYYY}', new Date().getFullYear().toString()).replace('{MM}', (new Date().getMonth()+1).toString().padStart(2,'0'))}{String(settings.invoice_next_number).padStart(4, '0')}</span></p>
          </div>
        </div>
      </div>

      {/* Imágenes de Documentos */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <ImageIcon size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Identidad en Documentos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo PDF */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4 transition-all hover:bg-stone-50">
            <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                {settings.logo_pdf_b64 ? <img src={settings.logo_pdf_b64} alt="PDF Logo" className="max-h-full object-contain" /> : <span className="text-stone-300 text-[10px] uppercase tracking-widest font-bold">Logo Factura</span>}
            </div>
            <input type="file" accept="image/*" ref={logoPdfRef} className="hidden" onChange={e => handleImageUpload('logo_pdf_b64', e)} />
            <button type="button" onClick={() => logoPdfRef.current?.click()} className="text-xs font-bold text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-lg hover:border-stone-900 w-full transition-all">Cambiar Logo Documentos</button>
          </div>
          {/* Firma */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4 transition-all hover:bg-stone-50">
            <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                {settings.signature_b64 ? <img src={settings.signature_b64} alt="Signature" className="max-h-full object-contain mix-blend-multiply" /> : <span className="text-stone-300 text-[10px] uppercase tracking-widest font-bold">Sello / Firma</span>}
            </div>
            <input type="file" accept="image/*" ref={sigRef} className="hidden" onChange={e => handleImageUpload('signature_b64', e)} />
            <button type="button" onClick={() => sigRef.current?.click()} className="text-xs font-bold text-stone-900 bg-white border border-stone-200 px-4 py-2 rounded-lg hover:border-stone-900 w-full transition-all">Cambiar Sello y Firma</button>
          </div>
        </div>
      </div>
    </div>
  );
}
