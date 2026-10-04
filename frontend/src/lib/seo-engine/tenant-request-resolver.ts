import { NextRequest } from 'next/server';

/**
 * Resuelve de forma robusta el identificador o slug del tenant a partir de:
 * 1. Payload de la petición (POST body)
 * 2. Parámetros de búsqueda en la URL (?tenantId=... o ?slug=...)
 * 3. Cabeceras HTTP ('x-tenant-id', 'x-tenant-slug')
 * 4. Cookies de impersonación (Modo Soporte desde ProBookia central)
 * 5. Cookies de sesión del inquilino ('tenant_id', 'cached_tenant_id', 'tenant_slug')
 */
export function resolveRequestTenant(request: NextRequest, body?: any): string | null {
  // 1. Cuerpo de la petición si existe
  if (body) {
    if (body.tenantId && typeof body.tenantId === 'string' && body.tenantId.trim()) {
      return body.tenantId.trim();
    }
    if (body.tenant_id && typeof body.tenant_id === 'string' && body.tenant_id.trim()) {
      return body.tenant_id.trim();
    }
    if (body.slug && typeof body.slug === 'string' && body.slug.trim()) {
      return body.slug.trim();
    }
  }

  // 2. Parámetros de URL
  const queryTenantId = request.nextUrl.searchParams.get('tenantId') || request.nextUrl.searchParams.get('tenant_id');
  if (queryTenantId && queryTenantId.trim()) {
    return queryTenantId.trim();
  }

  const querySlug = request.nextUrl.searchParams.get('slug') || request.nextUrl.searchParams.get('tenant');
  if (querySlug && querySlug.trim()) {
    return querySlug.trim();
  }

  // 3. Cabeceras HTTP
  const headerTenantId = request.headers.get('x-tenant-id');
  if (headerTenantId && headerTenantId.trim() && headerTenantId !== 'undefined' && headerTenantId !== 'null') {
    return headerTenantId.trim();
  }

  const headerTenantSlug = request.headers.get('x-tenant-slug');
  if (headerTenantSlug && headerTenantSlug.trim() && headerTenantSlug !== 'undefined' && headerTenantSlug !== 'null') {
    return headerTenantSlug.trim();
  }

  // 4. Cookies de Modo Soporte / Impersonación (Prioridad si el super-admin está impersonando)
  const isImpersonating = request.cookies.get('is_impersonating')?.value === 'true';
  const impersonateId = request.cookies.get('impersonate_tenant_id')?.value;
  const impersonateSlug = request.cookies.get('impersonate_tenant_slug')?.value;

  if (impersonateId && impersonateId.trim()) {
    return impersonateId.trim();
  }
  if (impersonateSlug && impersonateSlug.trim()) {
    return impersonateSlug.trim();
  }

  // 5. Cookies estándar de inquilino
  const cookieTenantId = request.cookies.get('tenant_id')?.value || request.cookies.get('cached_tenant_id')?.value;
  if (cookieTenantId && cookieTenantId.trim()) {
    return cookieTenantId.trim();
  }

  const cookieSlug = request.cookies.get('tenant_slug')?.value || request.cookies.get('cached_tenant_slug')?.value;
  if (cookieSlug && cookieSlug.trim()) {
    return cookieSlug.trim();
  }

  return null;
}
