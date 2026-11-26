export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window === 'undefined') return headers;
  let tenantId = getCookie('tenant_id') || '';
  let authToken = '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!tenantId) tenantId = parsed.tenant_id || '';
      authToken = parsed.access_token || parsed.token || '';
    }
  } catch {}
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}
