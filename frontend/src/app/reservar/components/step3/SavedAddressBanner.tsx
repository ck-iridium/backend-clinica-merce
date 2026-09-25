"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SavedAddressBannerProps {
  savedAddressData: any;
  serviceModality: string;
  onApplySavedAddress: () => void;
}

export default function SavedAddressBanner({
  savedAddressData,
  serviceModality,
  onApplySavedAddress,
}: SavedAddressBannerProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {savedAddressData && serviceModality === 'home' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-amber-50/50 border border-[#d4af37]/20 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm"
        >
          <div className="flex gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
              <CheckCircle size={16} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-[#b08e23]">
                {t('wizard.detected_address_title')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium leading-normal mt-0.5">
                {t('wizard.detected_address_desc')}{' '}
                <strong>{savedAddressData.client_address}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onApplySavedAddress}
            className="w-full md:w-auto px-4 py-2 bg-[#d4af37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            {t('wizard.autocomplete')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
