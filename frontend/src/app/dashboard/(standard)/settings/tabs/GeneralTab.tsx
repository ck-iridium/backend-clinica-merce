import { Building2, Link2 } from 'lucide-react';

interface GeneralTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function GeneralTab({ settings, setSettings }: GeneralTabProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
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
            <input required type="text" value={settings.clinic_name} onChange={e => setSettings({...settings, clinic_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Nombre Legal del Titular (DNI)</label>
            <input type="text" value={settings.legal_name || ''} onChange={e => setSettings({...settings, legal_name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">CIF/NIF</label>
            <input type="text" value={settings.clinic_nif} onChange={e => setSettings({...settings, clinic_nif: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Nº de Registro Sanitario</label>
            <input type="text" value={settings.sanitary_register || ''} onChange={e => setSettings({...settings, sanitary_register: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" placeholder="Opcional" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-500 mb-2">Dirección Completa</label>
            <input type="text" value={settings.clinic_address} onChange={e => setSettings({...settings, clinic_address: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono de Contacto</label>
            <input type="text" value={settings.clinic_phone} onChange={e => setSettings({...settings, clinic_phone: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Email</label>
            <input type="email" value={settings.clinic_email} onChange={e => setSettings({...settings, clinic_email: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all outline-none" />
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
            <input type="text" value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] transition-all outline-none" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">Teléfono WhatsApp</label>
            <input type="text" value={settings.whatsapp_number || ''} onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] transition-all outline-none" placeholder="600000000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2">URL de Google Maps</label>
            <input type="text" value={settings.maps_url || ''} onChange={e => setSettings({...settings, maps_url: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:border-[#d4af37] transition-all outline-none" placeholder="https://goo.gl/maps/..." />
          </div>
        </div>
      </div>
    </div>
  );
}
