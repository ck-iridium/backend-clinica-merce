"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { GoogleTagManager } from '@next/third-parties/google';

interface TenantTrackingProps {
  settings?: {
    gtm_container_id?: string | null;
    google_ads_id?: string | null;
    google_ads_conversion_label?: string | null;
  } | null;
}

export default function TenantTracking({ settings }: TenantTrackingProps) {
  const pathname = usePathname();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // 1. Comprobar si las cookies ya fueron aceptadas
    const checkConsent = () => {
      try {
        const accepted = localStorage.getItem('cookies_accepted') === 'true';
        setHasConsent(accepted);
      } catch (_) {
        setHasConsent(false);
      }
    };

    checkConsent();

    // 2. Escuchar el evento reactivo de aceptación de cookies emitido por CookieBanner
    const handleConsentUpdated = () => {
      checkConsent();
    };

    window.addEventListener('cookie_consent_updated', handleConsentUpdated);
    window.addEventListener('storage', handleConsentUpdated);

    return () => {
      window.removeEventListener('cookie_consent_updated', handleConsentUpdated);
      window.removeEventListener('storage', handleConsentUpdated);
    };
  }, []);

  // SEGURIDAD: Nunca inyectar rastreadores en rutas privadas/administrativas
  const isPrivateArea = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/super-admin') || 
    pathname.startsWith('/login');

  if (isPrivateArea || !hasConsent || !settings) {
    return null;
  }

  const gtmId = settings.gtm_container_id?.trim();
  const googleAdsId = settings.google_ads_id?.trim();

  return (
    <>
      {/* 1. Google Tag Manager Container (Oficial de Next.js) */}
      {gtmId && (
        <GoogleTagManager gtmId={gtmId} />
      )}

      {/* 2. Google Ads Global Site Tag (gtag) si no se usa GTM o como complemento */}
      {googleAdsId && (
        <>
          <Script
            id="google-ads-gtag"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAdsId)}`}
          />
          <Script
            id="google-ads-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${encodeURIComponent(googleAdsId)}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}
