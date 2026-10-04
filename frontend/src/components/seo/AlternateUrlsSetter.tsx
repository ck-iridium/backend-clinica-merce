"use client";

import { useEffect } from 'react';
import { useLanguage, AlternateUrls } from '@/app/contexts/LanguageContext';

export default function AlternateUrlsSetter({ urls }: { urls: AlternateUrls }) {
  const { setAlternateUrls } = useLanguage();

  useEffect(() => {
    setAlternateUrls(urls);
    return () => {
      setAlternateUrls(null);
    };
  }, [urls.es, urls.en, urls.fr, setAlternateUrls]);

  return null;
}
