"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export type Language = 'es' | 'en' | 'fr';

const dictionaries = { es, en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translate: (spanishText: string, translations: any, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  // Detectar idioma inicial al montar el componente y sincronizar cookies
  useEffect(() => {
    let savedLang = localStorage.getItem('preferred_language') as Language;
    if (!savedLang) {
      const browserLang = navigator.language.split('-')[0] as Language;
      savedLang = ['es', 'en', 'fr'].includes(browserLang) ? browserLang : 'es';
    }
    setLanguageState(savedLang);
    document.cookie = `preferred_language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
    if (typeof window !== 'undefined') {
      document.cookie = `preferred_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Evitamos reiniciar en el flujo de reserva (para no perder el paso actual) ni en el panel de control.
      // Para páginas públicas (Home, Categorías, Contacto), recargamos para que Next.js Server Components
      // reconstruyan todo el contenido traducido desde la base de datos de manera impecable.
      if (!window.location.pathname.startsWith('/reservar') && !window.location.pathname.startsWith('/dashboard')) {
        window.location.reload();
      }
    }
  };

  // Función t(key) para parsear claves anidadas con puntos (ej. 'booking.next')
  const t = (key: string): string => {
    const keys = key.split('.');
    
    // 1. Buscar en el diccionario activo
    let value: any = dictionaries[language];
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string') return value;

    // 2. Fallback al diccionario en Español si no se encuentra
    let fallbackValue: any = dictionaries['es'];
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
    }

    if (typeof fallbackValue === 'string') return fallbackValue;

    // 3. Devolver la clave original si todo lo demás falla
    return key;
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
