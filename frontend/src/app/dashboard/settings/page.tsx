"use client"
import { useState, useEffect, useRef } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Save, Building2, Link2, SearchCode, ImageIcon, Hash, ChevronDown } from 'lucide-react';

export default function SettingsPage() {
  const { showFeedback } = useFeedback();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // File inputs refs
  const logoAppRef = useRef<HTMLInputElement>(null);
  const logoPdfRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`);
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const { id, ...payload } = settings;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showFeedback({ type: 'success', title: 'Éxito', message: 'Configuración guardada correctamente' });
    } catch (e) {
      console.error(e);
      showFeedback({ type: 'error', title: 'Error', message: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };


  // Compresión de imagen a Base64
  const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 500; // Máximo 500px

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/png', 0.8);
        setSettings({ ...settings, [field]: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (loading || !settings) {
     return <div className="text-center py-32"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-[#d9777f] rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-[1100px] mx-auto">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-stone-800 tracking-tight">Ajustes Generales</h1>
          <p className="text-stone-400 font-medium mt-1">Configura la información de tu clínica y preferencias.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} strokeWidth={1.5} />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Detalles de la Empresa */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Building2 size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Detalles de la Empresa</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nombre Comercial</label>
                <input required type="text" value={settings.clinic_name} onChange={e => setSettings({...settings, clinic_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nombre Legal del Titular (DNI)</label>
                <input type="text" value={settings.legal_name || ''} onChange={e => setSettings({...settings, legal_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">CIF/NIF</label>
                <input type="text" value={settings.clinic_nif} onChange={e => setSettings({...settings, clinic_nif: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Nº de Registro Sanitario</label>
                <input type="text" value={settings.sanitary_register || ''} onChange={e => setSettings({...settings, sanitary_register: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" placeholder="Opcional" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-500 mb-2">Dirección Completa</label>
                <input type="text" value={settings.clinic_address} onChange={e => setSettings({...settings, clinic_address: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono de Contacto</label>
                <input type="text" value={settings.clinic_phone} onChange={e => setSettings({...settings, clinic_phone: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Email</label>
                <input type="email" value={settings.clinic_email} onChange={e => setSettings({...settings, clinic_email: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] focus:ring-1 focus:ring-[#d9777f] transition-all" />
              </div>
           </div>
        </div>

        {/* Enlaces y Redes Sociales */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Link2 size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Enlaces y Redes Sociales</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">URL de Instagram</label>
                <input type="text" value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono WhatsApp</label>
                <input type="text" value={settings.whatsapp_number || ''} onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="600000000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">URL de Google Maps</label>
                <input type="text" value={settings.maps_url || ''} onChange={e => setSettings({...settings, maps_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] transition-all" placeholder="https://goo.gl/maps/..." />
              </div>
           </div>
        </div>

        {/* Control SEO */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <SearchCode size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Posicionamiento SEO</h3>
          </div>
           <label className="flex items-center gap-4 cursor-pointer group w-fit">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={settings.allow_search_engine_indexing} 
                  onChange={e => setSettings({...settings, allow_search_engine_indexing: e.target.checked})} 
                  className="sr-only" 
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.allow_search_engine_indexing ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.allow_search_engine_indexing ? 'translate-x-6' : ''}`}></div>
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold transition-colors ${settings.allow_search_engine_indexing ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {settings.allow_search_engine_indexing ? 'Indexación en Google Activada' : 'Indexación Oculta (No Index)'}
                </span>
                <span className="text-xs text-stone-400 font-medium">Determina si los motores de búsqueda pueden rastrear e indexar tu página pública.</span>
              </div>
           </label>
        </div>

        {/* Imágenes y Logos */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <ImageIcon size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Imágenes y Logotipos</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Logo App */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Logo Panel App</label>
                   <p className="text-xs text-stone-400">Barra lateral (Solo icono o compacto)</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.logo_app_b64 ? <img src={settings.logo_app_b64} alt="App Logo" className="max-h-full object-contain" /> : <span className="text-stone-300 text-xs">Sin logo</span>}
                 </div>
                 <input type="file" accept="image/*" ref={logoAppRef} className="hidden" onChange={e => handleImageUpload('logo_app_b64', e)} />
                 <button type="button" onClick={() => logoAppRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

              {/* Logo PDF */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Logotipo Documentos</label>
                   <p className="text-xs text-stone-400">Cabeceras de Facturas y PDF</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.logo_pdf_b64 ? <img src={settings.logo_pdf_b64} alt="PDF Logo" className="max-h-full object-contain" /> : <span className="text-stone-300 text-xs">Sin logo</span>}
                 </div>
                 <input type="file" accept="image/*" ref={logoPdfRef} className="hidden" onChange={e => handleImageUpload('logo_pdf_b64', e)} />
                 <button type="button" onClick={() => logoPdfRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

              {/* Firma */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col items-start gap-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-800 mb-1">Sello y Firma</label>
                   <p className="text-xs text-stone-400">Validez a pie de factura o Consentimiento</p>
                 </div>
                 <div className="w-full h-32 bg-white border border-stone-200 border-dashed rounded-lg flex items-center justify-center p-2">
                    {settings.signature_b64 ? <img src={settings.signature_b64} alt="Signature" className="max-h-full object-contain mix-blend-multiply" /> : <span className="text-stone-300 text-xs">Sin firma</span>}
                 </div>
                 <input type="file" accept="image/*" ref={sigRef} className="hidden" onChange={e => handleImageUpload('signature_b64', e)} />
                 <button type="button" onClick={() => sigRef.current?.click()} className="text-xs font-bold text-[#d9777f] bg-[#fdf2f3] px-4 py-2 rounded-lg hover:bg-[#f3c7cb] w-full">Cambiar Archivo</button>
              </div>

           </div>
        </div>


        {/* Numeración */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
              <Hash size={18} strokeWidth={1.5} />
            </span>
            <h3 className="text-2xl font-serif font-semibold text-stone-800">Agenda y Numeración</h3>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 p-4 bg-orange-50/50 border border-orange-100 rounded-xl mb-2">
                <label className="block text-xs font-bold text-orange-700 mb-2">Margen de antelación para hoy (Horas)</label>
                <input type="number" min="0" step="0.5" value={settings.booking_margin_hours ?? 2.0} onChange={e => setSettings({...settings, booking_margin_hours: parseFloat(e.target.value) || 0})} className="w-full md:w-1/2 p-4 bg-white border border-orange-200 rounded-xl focus:border-orange-400 font-mono font-bold text-orange-800" />
                <p className="text-[10px] text-orange-600/80 mt-2">Ejemplo: Si pones 2, y un cliente entra a las 10:00 a reservar para hoy, solo le saldrán horas a partir de las 12:00.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Prefijo de Factura</label>
                <div className="relative">
                   <input type="text" value={settings.invoice_prefix} onChange={e => setSettings({...settings, invoice_prefix: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono text-sm" />
                </div>
                <p className="text-[10px] text-stone-400 mt-2">Usa &#123;YY&#125; para año, &#123;YYYY&#125; para año completo, &#123;MM&#125; para mes.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">Sig. Nº Factura</label>
                  <input type="number" min="1" value={settings.invoice_next_number} onChange={e => setSettings({...settings, invoice_next_number: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">IVA por defecto (%)</label>
                  <input type="number" min="0" step="0.5" value={settings.default_tax_rate || 21} onChange={e => setSettings({...settings, default_tax_rate: parseFloat(e.target.value)})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d9777f] font-mono font-bold" />
                </div>
              </div>
              <div className="md:col-span-2 mt-2">
                <p className="text-[10px] text-emerald-500 italic font-medium">Ejemplo final auto-generado: <span className="font-bold">{settings.invoice_prefix.replace('{YY}', new Date().getFullYear().toString().slice(-2)).replace('{YYYY}', new Date().getFullYear().toString()).replace('{MM}', (new Date().getMonth()+1).toString().padStart(2,'0'))}{String(settings.invoice_next_number).padStart(4, '0')}</span></p>
              </div>
           </div>
        </div>

      </form>
    </div>
  );
}
