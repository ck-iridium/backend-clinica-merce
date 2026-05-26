"use client"
import React from 'react';
import { User, Mail, Phone, ShieldCheck, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function Step3Details({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  selectedService,
  privacyAccepted,
  setPrivacyAccepted,
  settings
}: {
  formData: { name: string; email: string; phone: string };
  setFormData: (d: any) => void;
  selectedDate: Date;
  selectedTime: string;
  selectedService: any;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
  settings?: any;
}) {
  const { language, t, translate } = useLanguage();
  const [showFianzaInfo, setShowFianzaInfo] = React.useState(false);

  const getServiceDepositInfo = (srv: any) => {
    if (!srv) return { required: false, amount: 0 };
    if (srv.requires_deposit && srv.deposit_amount && srv.deposit_amount > 0) {
      return { required: true, amount: srv.deposit_amount };
    }
    if (settings?.global_deposit_required && settings?.global_deposit_amount && settings?.global_deposit_amount > 0) {
      const isExempt = srv.deposit_amount !== null && srv.deposit_amount !== undefined && parseFloat(srv.deposit_amount) === 0.0;
      if (!isExempt) {
        return { required: true, amount: settings.global_deposit_amount };
      }
    }
    return { required: false, amount: 0 };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col flex-grow min-h-0 bg-background text-foreground"
    >
      {/* Header Equilibrado */}
      <div className="shrink-0 px-6 pt-4 pb-2 z-30 bg-background">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground tracking-tight">{t('wizard.fill_details')}</h1>
        <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground mt-1 uppercase tracking-[0.15em] font-medium truncate">
          {t('wizard.finish_booking_for')} <span className="text-primary font-bold">{translate(selectedService?.name, selectedService?.translations, 'name')}</span>
        </p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pt-3 pb-6 space-y-5">
        {/* Card de Resumen con fuentes legibles */}
        <div className="bg-card rounded-luxury-card p-4 md:p-6 md:px-8 border border-border shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-black uppercase text-primary tracking-[0.2em] mb-0.5">{t('wizard.appointment_for_date')}</p>
            <p className="text-base md:text-xl font-serif text-foreground leading-tight">
              {selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs md:text-sm font-bold text-muted-foreground mt-0.5">{t('wizard.at_time').replace('{time}', selectedTime)}</p>
          </div>

          <div className="text-right relative z-10 flex flex-col items-end">
            <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/50 tracking-widest mb-0.5">{t('wizard.total')}</p>
            <p className="text-2xl md:text-3xl font-serif text-foreground font-bold">{selectedService?.price}€</p>
            {(() => {
              const dep = getServiceDepositInfo(selectedService);
              if (!dep.required) return null;
              return (
                <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                  <motion.button
                    type="button"
                    onClick={() => setShowFianzaInfo(true)}
                    animate={{
                      scale: [1, 1.12, 1],
                      boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 8px rgba(59, 130, 246, 0.45)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors p-1 rounded-full focus:outline-none flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50 mr-0.5"
                    title={t('wizard.deposit_info_title')}
                  >
                    <Info size={13} className="shrink-0" />
                  </motion.button>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t('wizard.fianza')}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-primary">
                    {dep.amount}€
                  </span>
                </div>
              );
            })()}
          </div>
        </div>


        {/* Formulario Compacto pero legible */}
        <div className="space-y-4">
          <div className="space-y-3.5 md:space-y-5">
            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.full_name')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <User size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder={t('wizard.full_name_placeholder')}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.email')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Mail size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                {t('wizard.phone')}
              </label>
              <div className="relative">
                <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                  <Phone size={18} className="md:scale-125" />
                </div>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-card border border-border rounded-luxury-btn py-3.5 md:py-4.5 pl-12 md:pl-16 pr-4 text-sm md:text-base font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Trust Equilibrado */}
          <div className="pt-2 px-1">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={e => setPrivacyAccepted(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-border rounded-luxury-btn bg-card transition-all flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                  <AnimatePresence>
                    {privacyAccepted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute inset-0 bg-primary flex items-center justify-center"
                      >
                        <motion.svg
                          className="w-3.5 h-3.5 md:w-5 md:h-5 text-stone-900 stroke-current"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut", delay: 0.05 }}
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] md:text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {t('wizard.accept_privacy')}{' '}
                  <a
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('wizard.privacy_policy')}
                  </a>
                </span>
                <span className="text-[9px] md:text-xs text-muted-foreground/70 uppercase tracking-widest mt-0.5 font-medium">{t('wizard.secure_data')}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Explicativo de Fianza */}
      <AnimatePresence>
        {showFianzaInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFianzaInfo(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-card rounded-luxury-card p-6 md:p-8 border border-border shadow-xl z-10 flex flex-col gap-5 overflow-hidden"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary" />

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                  <h3 className="text-foreground font-serif text-lg font-bold leading-tight">{t('wizard.deposit_policy')}</h3>
                </div>
                <button
                  onClick={() => setShowFianzaInfo(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                <p>
                  {t('wizard.deposit_policy_desc')}
                </p>

                {(() => {
                  const dep = getServiceDepositInfo(selectedService);
                  const remaining = Math.max(0, parseFloat(selectedService?.price || 0) - dep.amount);
                  return (
                    <div className="bg-muted rounded-xl p-3 border border-border flex flex-col gap-2 font-medium">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">{t('wizard.total_treatment')}</span>
                        <span className="font-bold text-foreground">{selectedService?.price}€</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-primary">
                        <span>{t('wizard.deposit_online_today')}</span>
                        <span className="font-bold">{dep.amount}€</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">{t('wizard.remaining_at_clinic')}</span>
                        <span className="font-bold text-foreground">{remaining}€</span>
                      </div>
                    </div>
                  );
                })()}

                <p>
                  <strong>{t('wizard.need_to_cancel_title')}</strong><br />
                  {t('wizard.need_to_cancel_desc').replace('{hours}', (settings?.cancellation_margin_hours || 24).toString())}
                </p>
              </div>

              <button
                onClick={() => setShowFianzaInfo(false)}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground active:scale-98 transition-all py-3 rounded-luxury-btn font-bold uppercase tracking-wider text-xs"
              >
                {t('common.understood')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
