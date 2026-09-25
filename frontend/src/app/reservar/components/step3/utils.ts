/**
 * Obtiene el tenant_id desde las cookies del navegador
 */
export const getTenantId = (): string => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; tenant_id=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

/**
 * Calcula si un servicio requiere fianza y su importe según la configuración del servicio y global de la clínica
 */
export const getServiceDepositInfo = (srv: any, settings?: any): { required: boolean; amount: number } => {
  if (!srv) return { required: false, amount: 0 };
  if (srv.requires_deposit && srv.deposit_amount && srv.deposit_amount > 0) {
    return { required: true, amount: srv.deposit_amount };
  }
  if (settings?.global_deposit_required && settings?.global_deposit_amount && settings?.global_deposit_amount > 0) {
    const isExempt = srv.deposit_amount !== null && srv.deposit_amount !== undefined && parseFloat(srv.deposit_amount) === 0.0;
    if (!isExempt) {
      return { required: true, amount: settings.global_deposit_amount };
    }
  }
  return { required: false, amount: 0 };
};
