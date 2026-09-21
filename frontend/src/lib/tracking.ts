/**
 * Utilidad unificada de seguimiento y conversiones multi-tenant para Clínica Mercè / Probookia.
 * Respeta el dataLayer de Google Tag Manager y Google Ads Conversion Tracking.
 */

export interface BookingConversionData {
  bookingId: string;
  serviceName: string;
  value: number;
  currency?: string;
  clientEmail?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
}

export function trackBookingConversion(data: BookingConversionData) {
  if (typeof window === 'undefined') return;

  const win = window as any;
  win.dataLayer = win.dataLayer || [];

  // 1. Evento estándar para Google Tag Manager
  win.dataLayer.push({
    event: 'appointment_booked',
    ecommerce: {
      transaction_id: data.bookingId,
      value: data.value,
      currency: data.currency || 'EUR',
      items: [
        {
          item_id: data.bookingId,
          item_name: data.serviceName,
          price: data.value,
          quantity: 1
        }
      ]
    },
    booking_id: data.bookingId,
    service_name: data.serviceName,
    value: data.value,
    currency: data.currency || 'EUR',
    customer_email: data.clientEmail || ''
  });

  // 2. Disparo directo a Google Ads Conversion si está disponible gtag y configurado
  if (data.googleAdsId && data.googleAdsConversionLabel) {
    const sendTo = `${data.googleAdsId}/${data.googleAdsConversionLabel}`;
    if (typeof win.gtag === 'function') {
      win.gtag('event', 'conversion', {
        send_to: sendTo,
        value: data.value,
        currency: data.currency || 'EUR',
        transaction_id: data.bookingId
      });
      console.log(`[Tracking] Google Ads conversion sent to ${sendTo}`);
    } else {
      // Fallback a dataLayer event para gtag
      win.dataLayer.push({
        event: 'conversion',
        send_to: sendTo,
        value: data.value,
        currency: data.currency || 'EUR',
        transaction_id: data.bookingId
      });
    }
  }
}
