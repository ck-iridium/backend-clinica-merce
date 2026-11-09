"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface TenantTrackingProps {
  settings?: {
    gtm_container_id?: string | null;
    google_ads_id?: string | null;
    google_ads_conversion_label?: string | null;
    google_analytics_id?: string | null;
    integrations_config?: Record<string, any> | null;
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
  const gaId = settings.google_analytics_id?.trim() || settings.integrations_config?.google_analytics_id?.trim() || "";
  const primaryGtagId = googleAdsId || gaId;

  return (
    <>
      {/* Google Analytics & Google Ads Global Site Tag (gtag) */}
      {primaryGtagId && (
        <>
          <Script
            id="google-gtag-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtagId)}`}
          />
          <Script
            id="google-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                ${googleAdsId ? `gtag('config', '${encodeURIComponent(googleAdsId)}');` : ''}
                ${gaId ? `gtag('config', '${encodeURIComponent(gaId)}');` : ''}
              `,
            }}
          />
        </>
      )}
    </>
  );
}
