"use client";

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getServiceDepositInfo } from './utils';

interface DepositInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: any;
  settings?: any;
}

export default function DepositInfoModal({
  isOpen,
  onClose,
  selectedService,
  settings,
}: DepositInfoModalProps) {
  const { t } = useLanguage();
  const dep = getServiceDepositInfo(selectedService, settings);
  const remaining = Math.max(0, parseFloat(selectedService?.price || 0) - dep.amount);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in duration-300">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm bg-card rounded-luxury-card p-6 md:p-8 border border-border shadow-xl z-10 flex flex-col gap-5 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary" />
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary w-5 h-5 shrink-0" />
                <h3 className="text-foreground font-serif text-lg font-bold leading-tight">
                  {t('wizard.deposit_policy')}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <p>{t('wizard.deposit_policy_desc')}</p>
              
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

              <p>
                <strong>{t('wizard.need_to_cancel_title')}</strong><br />
                {t('wizard.need_to_cancel_desc').replace('{hours}', (settings?.cancellation_margin_hours || 24).toString())}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground active:scale-98 transition-all py-3 rounded-luxury-btn font-bold uppercase tracking-wider text-xs"
            >
              {t('common.understood')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
