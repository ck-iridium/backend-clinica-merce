import { Building2, Link2 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface GeneralTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function GeneralTab({ settings, setSettings }: GeneralTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      {/* Detalles de la Empresa */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <Building2 size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.company_details')}</h3>
            <p className="text-xs text-stone-400 font-medium">Información corporativa y datos fiscales de tu clínica</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.clinic_name')}</label>
            <input 
              id="general-clinic-name" 
              required 
              type="text" 
              value={settings.clinic_name} 
              onChange={e => setSettings({...settings, clinic_name: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.legal_name')}</label>
            <input 
              id="general-legal-name" 
              type="text" 
              value={settings.legal_name || ''} 
              onChange={e => setSettings({...settings, legal_name: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.clinic_nif')}</label>
            <input 
              id="general-clinic-nif" 
              type="text" 
              value={settings.clinic_nif} 
              onChange={e => setSettings({...settings, clinic_nif: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.sanitary_register')}</label>
            <input 
              id="general-sanitary-register" 
              type="text" 
              value={settings.sanitary_register || ''} 
              onChange={e => setSettings({...settings, sanitary_register: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none placeholder:text-stone-400" 
              placeholder={t('dashboard.settings.optional')} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.clinic_address')}</label>
            <input 
              id="general-clinic-address" 
              type="text" 
              value={settings.clinic_address} 
              onChange={e => setSettings({...settings, clinic_address: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Descripción del Negocio (Footer)</label>
            <textarea 
              id="general-clinic-description" 
              rows={3} 
              value={settings.clinic_description || ''} 
              onChange={e => setSettings({...settings, clinic_description: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none resize-none placeholder:text-stone-400" 
              placeholder="Ej: Tu centro de confianza para servicios personalizados y bienestar..." 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.clinic_phone')}</label>
            <input 
              id="general-clinic-phone" 
              type="text" 
              value={settings.clinic_phone} 
              onChange={e => setSettings({...settings, clinic_phone: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.clinic_email')}</label>
            <input 
              id="general-clinic-email" 
              type="email" 
              value={settings.clinic_email} 
              onChange={e => setSettings({...settings, clinic_email: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Enlaces y Redes Sociales */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-2xs shrink-0">
            <Link2 size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900">{t('dashboard.settings.social_links')}</h3>
            <p className="text-xs text-stone-400 font-medium">Canales de contacto directo y presencia digital</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.instagram_url')}</label>
            <input 
              id="general-instagram-url" 
              type="text" 
              value={settings.instagram_url || ''} 
              onChange={e => setSettings({...settings, instagram_url: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none placeholder:text-stone-400" 
              placeholder="@usuario o https://instagram.com/..." 
            />
            <p className="text-[11px] text-stone-400 mt-1.5">Acepta usuario (ej. @merce.estetica) o enlace completo.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.whatsapp')}</label>
            <input 
              id="general-whatsapp-number" 
              type="text" 
              value={settings.whatsapp_number || ''} 
              onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none placeholder:text-stone-400" 
              placeholder="600000000" 
            />
            <p className="text-[11px] text-stone-400 mt-1.5">Número con o sin prefijo para chat directo.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{t('dashboard.settings.maps_url')}</label>
            <input 
              id="general-maps-url" 
              type="text" 
              value={settings.maps_url || ''} 
              onChange={e => setSettings({...settings, maps_url: e.target.value})} 
              className="w-full px-4 py-3 bg-stone-50/70 hover:bg-stone-50 focus:bg-white border border-stone-200/80 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all font-semibold text-sm text-stone-800 outline-none placeholder:text-stone-400" 
              placeholder="https://maps.app.goo.gl/..." 
            />
            <p className="text-[11px] text-stone-400 mt-1.5">Enlace a Google Business / Maps para navegación GPS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
