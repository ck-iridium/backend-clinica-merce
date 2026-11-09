"use client";

import { useEffect } from 'react';
import { useLanguage, AlternateUrls, Language } from '@/app/contexts/LanguageContext';

export default function AlternateUrlsSetter({ urls, lang }: { urls: AlternateUrls; lang?: Language }) {
  const { setAlternateUrls, syncLanguage, language } = useLanguage();

  useEffect(() => {
    setAlternateUrls(urls);
    if (lang && lang !== language) {
      syncLanguage(lang);
    }
    return () => {
      setAlternateUrls(null);
    };
  }, [urls.es, urls.en, urls.fr, lang, language, setAlternateUrls, syncLanguage]);

  return null;
}
