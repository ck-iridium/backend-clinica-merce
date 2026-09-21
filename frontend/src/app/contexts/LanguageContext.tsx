"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import esCommon from '../locales/es/common.json';
import esDashboard from '../locales/es/dashboard.json';
import esClients from '../locales/es/clients.json';
import esInvoices from '../locales/es/invoices.json';
import esVouchers from '../locales/es/vouchers.json';
import esServices from '../locales/es/services.json';

import enCommon from '../locales/en/common.json';
import enDashboard from '../locales/en/dashboard.json';
import enClients from '../locales/en/clients.json';
import enInvoices from '../locales/en/invoices.json';
import enVouchers from '../locales/en/vouchers.json';
import enServices from '../locales/en/services.json';

import frCommon from '../locales/fr/common.json';
import frDashboard from '../locales/fr/dashboard.json';
import frClients from '../locales/fr/clients.json';
import frInvoices from '../locales/fr/invoices.json';
import frVouchers from '../locales/fr/vouchers.json';
import frServices from '../locales/fr/services.json';

export type Language = 'es' | 'en' | 'fr';

const es = {
  ...esCommon,
  ...esDashboard,
  dashboard: {
    ...esDashboard,
    clients: esClients,
    invoices: esInvoices,
    vouchers: esVouchers,
    services: esServices
  }
};

const en = {
  ...enCommon,
  ...enDashboard,
  dashboard: {
    ...enDashboard,
    clients: enClients,
    invoices: enInvoices,
    vouchers: enVouchers,
    services: enServices
  }
};

const fr = {
  ...frCommon,
  ...frDashboard,
  dashboard: {
    ...frDashboard,
    clients: frClients,
    invoices: frInvoices,
    vouchers: frVouchers,
    services: frServices
  }
};

const dictionaries = { es, en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  translate: (spanishText: string, translations: any, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  // Detectar idioma inicial al montar el componente y sincronizar cookies
  useEffect(() => {
    try {
      let savedLang: Language | null = null;
      try {
        savedLang = localStorage.getItem('preferred_language') as Language;
      } catch (_) {}

      if (!savedLang) {
        const browserLang = typeof navigator !== 'undefined' && navigator.language 
          ? (navigator.language.split('-')[0] as Language) 
          : 'es';
        savedLang = ['es', 'en', 'fr'].includes(browserLang) ? browserLang : 'es';
      }
      setLanguageState(savedLang);
      if (typeof document !== 'undefined') {
        document.cookie = `preferred_language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (e) {
      console.warn("Error inicializando LanguageContext:", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('preferred_language', lang);
    } catch (_) {}
    if (typeof window !== 'undefined') {
      try {
        document.cookie = `preferred_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (_) {}
      
      // Evitamos reiniciar únicamente en el flujo de reserva (para no perder el paso actual y la selección).
      // Para el dashboard y las páginas públicas, recargamos para que Next.js Server Components
      // reconstruyan todo el contenido traducido desde la base de datos de manera impecable.
      if (!window.location.pathname.startsWith('/reservar')) {
        window.location.reload();
      }
    }
  };

  // Función t(key) para parsear claves anidadas con puntos (ej. 'booking.next')
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    // 1. Buscar en el diccionario activo
    let value: any = dictionaries[language];
    for (const k of keys) {
      value = value?.[k];
    }
    
    let result = '';
    if (typeof value === 'string') {
      result = value;
    } else {
      // 2. Fallback al diccionario en Español si no se encuentra
      let fallbackValue: any = dictionaries['es'];
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      if (typeof fallbackValue === 'string') {
        result = fallbackValue;
      } else {
        result = key;
      }
    }

    if (variables && result) {
      Object.entries(variables).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return result;
  };

  // Función para traducir contenido dinámico (Servicios, Categorías)
  const translate = (spanishText: string, translations: any, field: string): string => {
    if (!translations) return spanishText;
    
    // Parsear si viene como string JSON
    let parsedTranslations = translations;
    if (typeof translations === 'string') {
      try {
        parsedTranslations = JSON.parse(translations);
      } catch (e) {
        return spanishText;
      }
    }

    const fieldTranslation = parsedTranslations?.[language]?.[field];
    if (fieldTranslation && typeof fieldTranslation === 'string' && fieldTranslation.trim() !== '') {
      return fieldTranslation;
    }

    return spanishText; // Fallback al español original
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
}
