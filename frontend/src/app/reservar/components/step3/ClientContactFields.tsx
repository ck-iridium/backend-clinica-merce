"use client";

import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ClientContactFieldsProps {
  formData: any;
  setFormData: (d: any) => void;
  privacyAccepted: boolean;
  setPrivacyAccepted: (v: boolean) => void;
}

export default function ClientContactFields({
  formData,
  setFormData,
  privacyAccepted,
  setPrivacyAccepted,
}: ClientContactFieldsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-3.5 md:space-y-5">
        {/* Nombre Completo */}
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
              className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder={t('wizard.full_name_placeholder')}
            />
          </div>
        </div>

        {/* Email */}
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
              className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        {/* Teléfono */}
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
              className="w-full bg-card border border-border rounded-luxury-btn py-3.5 pl-12 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder="600 000 000"
            />
          </div>
        </div>

        {/* Honeypot field invisible para humanos pero atractivo para bots */}
        <div style={{ display: 'none', opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0, zIndex: -1 }} aria-hidden="true">
          <label htmlFor="website_hp">Website URL</label>
          <input
            id="website_hp"
            type="text"
            name="website_hp"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website_hp || ''}
            onChange={e => setFormData({ ...formData, website_hp: e.target.value })}
          />
        </div>
      </div>

      {/* Privacidad y Aceptación de Términos */}
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
            <span className="text-[9px] md:text-xs text-muted-foreground/70 uppercase tracking-widest mt-0.5 font-medium">
              {t('wizard.secure_data')}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
