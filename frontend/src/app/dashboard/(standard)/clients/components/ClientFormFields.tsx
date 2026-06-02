"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ClientFormFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dni: string;
    service_address: string;
    service_postal_code: string;
    service_city: string;
    billing_name: string;
    billing_nif: string;
    billing_address: string;
    billing_postal_code: string;
    billing_city: string;
  };
  onChange: (field: string, value: any) => void;
  errors?: {
    first_name?: string;
    email?: string;
  };
  isBillingDifferent: boolean;
  onBillingDifferentChange: (val: boolean) => void;
  disabled?: boolean;
}

export function ClientFormFields({
  formData,
  onChange,
  errors = {},
  isBillingDifferent,
  onBillingDifferentChange,
  disabled = false
}: ClientFormFieldsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {/* Nombre y Apellidos */}
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          Nombre *
        </label>
        <input 
          type="text" 
          value={formData.first_name} 
          onChange={e => onChange('first_name', e.target.value)} 
          className={`w-full px-5 py-3 rounded-xl border bg-stone-50/50 transition-all ${errors.first_name ? 'border-red-300 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-100 focus:bg-white'} outline-none focus:ring-4 disabled:bg-stone-100 disabled:text-stone-400`} 
          placeholder="Ana" 
          disabled={disabled}
          required
        />
        {errors.first_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.first_name}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          Apellidos
        </label>
        <input 
          type="text" 
          value={formData.last_name} 
          onChange={e => onChange('last_name', e.target.value)} 
          className="w-full px-5 py-3 rounded-xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all disabled:bg-stone-100 disabled:text-stone-400" 
          placeholder="Martínez" 
          disabled={disabled}
        />
      </div>

      {/* Email y Teléfono */}
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          {t('dashboard.clients.email_label') || 'Correo electrónico *'}
        </label>
        <input 
          type="email" 
          value={formData.email} 
          onChange={e => onChange('email', e.target.value)} 
          className={`w-full px-5 py-3 rounded-xl border bg-stone-50/50 transition-all ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-stone-100 focus:ring-stone-100 focus:bg-white'} outline-none focus:ring-4 disabled:bg-stone-100 disabled:text-stone-400`} 
          placeholder="ana@email.com" 
          disabled={disabled}
          required
        />
        {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          {t('dashboard.clients.phone_label') || 'Teléfono móvil'}
        </label>
        <input 
          type="tel" 
          value={formData.phone} 
          onChange={e => onChange('phone', e.target.value)} 
          className="w-full px-5 py-3 rounded-xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all disabled:bg-stone-100 disabled:text-stone-400" 
          placeholder="+34 600..." 
          disabled={disabled}
        />
      </div>

      {/* NIF/DNI */}
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          DNI / NIF / NIE
        </label>
        <input 
          type="text" 
          value={formData.dni} 
          onChange={e => onChange('dni', e.target.value)} 
          className="w-full px-5 py-3 rounded-xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all disabled:bg-stone-100 disabled:text-stone-400" 
          placeholder="12345678Z" 
          disabled={disabled}
        />
      </div>

      {/* Dirección de Servicio */}
      <div className="md:col-span-2 border-t border-stone-100 pt-4 mt-2">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500 mb-3">
          Dirección de Servicio / Domicilio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-stone-400">Calle y Número</label>
            <input 
              type="text" 
              value={formData.service_address} 
              onChange={e => onChange('service_address', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
              placeholder="Calle Gran Vía 45, 3ºA" 
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400">Código Postal</label>
            <input 
              type="text" 
              value={formData.service_postal_code} 
              onChange={e => onChange('service_postal_code', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
              placeholder="28013" 
              disabled={disabled}
            />
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-stone-400">Ciudad</label>
            <input 
              type="text" 
              value={formData.service_city} 
              onChange={e => onChange('service_city', e.target.value)} 
              className="w-full px-4 py-2 text-sm rounded-xl border border-stone-100 bg-stone-50 focus:bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
              placeholder="Madrid" 
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Dirección Fiscal / Facturación Desacoplada */}
      <div className="md:col-span-2 border-t border-stone-100 pt-4 mt-2">
        <div className="flex items-center gap-3 mb-3">
          <input 
            type="checkbox" 
            id="billing-diff-check" 
            checked={isBillingDifferent} 
            onChange={e => onBillingDifferentChange(e.target.checked)} 
            className="rounded text-stone-900 focus:ring-stone-900 h-4 w-4 border-stone-300 cursor-pointer disabled:opacity-50" 
            disabled={disabled}
          />
          <label htmlFor="billing-diff-check" className="text-xs font-black uppercase tracking-wider text-stone-600 cursor-pointer">
            La dirección de facturación es distinta a la de servicio
          </label>
        </div>

        <AnimatePresence>
          {isBillingDifferent && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100 mt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">Razón Social / Nombre Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.billing_name} 
                    onChange={e => onChange('billing_name', e.target.value)} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
                    placeholder="Empresa S.L. / Ana Martínez" 
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">NIF / CIF / DNI Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.billing_nif} 
                    onChange={e => onChange('billing_nif', e.target.value)} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
                    placeholder="B12345678" 
                    disabled={disabled}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">Dirección Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.billing_address} 
                    onChange={e => onChange('billing_address', e.target.value)} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
                    placeholder="Av. Diagonal 120, Esc. B 1-2" 
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">Código Postal Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.billing_postal_code} 
                    onChange={e => onChange('billing_postal_code', e.target.value)} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
                    placeholder="08013" 
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500">Ciudad Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.billing_city} 
                    onChange={e => onChange('billing_city', e.target.value)} 
                    className="w-full px-4 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none disabled:bg-stone-100 disabled:text-stone-400" 
                    placeholder="Barcelona" 
                    disabled={disabled}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
