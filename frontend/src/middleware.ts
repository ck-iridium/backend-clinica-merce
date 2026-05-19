import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // 1. Excluir recursos estáticos, api routes, _next y archivos de sistema
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Limpiar el hostname de puertos (ej. localhost:3000 -> localhost)
  const cleanHost = hostname.split(':')[0];

  // 3. Detectar subdominio, parámetro query 'tenant' o cookie
  let subdomain = url.searchParams.get("tenant") || "";
  
  if (subdomain === "clear") {
    subdomain = "";
  }

  if (!subdomain) {
    if (cleanHost.endsWith(".localhost")) {
      subdomain = cleanHost.replace(".localhost", "");
    } else {
      const parts = cleanHost.split(".");
      // En producción (ej: merce.tu-saas.com), si hay más de 2 partes y no es 'www', el primero es el subdominio
      if (parts.length > 2 && parts[0] !== 'www') {
        subdomain = parts[0];
      }
    }
  }

  // Fallback a cookie de inquilino para desarrollo local (permite persistir la sesión sin subdominios DNS locales)
  if (!subdomain && cleanHost === "localhost" && url.pathname !== "/marketing") {
    subdomain = request.cookies.get("tenant_slug")?.value || "";
  }

  // 4. Resolver tenant_id para el subdominio
  let tenantId = "00000000-0000-0000-0000-000000000001"; // Fallback por defecto a Clínica Mercè

  if (subdomain && subdomain !== "www") {
    // Mapeo básico para el Cliente Nº 1
    if (subdomain === "merce") {
      tenantId = "00000000-0000-0000-0000-000000000001";
    } else {
      // En una fase posterior se resolverá dinámicamente desde la DB de Supabase.
      // Por ahora, se asocia al mismo ID para desarrollo y testing de otros subdominios.
      tenantId = "00000000-0000-0000-0000-000000000001"; 
    }

    // Clonamos la petición para inyectar cabeceras y cookies del inquilino activo
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-tenant-slug", subdomain);

    // Reescribimos la petición con los encabezados modificados para que Server Components los lean
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });

    // Inyectamos las cookies para que Client Components puedan acceder fácilmente a ellas
    response.cookies.set("tenant_id", tenantId, {
      path: "/",
      httpOnly: false, // Permitir acceso desde JS cliente
      sameSite: "lax",
    });
    response.cookies.set("tenant_slug", subdomain, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } else {
    // 5. Dominio Principal (Marketing & Registro SaaS B2B)
    // Si acceden a la raíz del dominio principal, los redirigimos/reescribimos a la Landing Page (/marketing)
    if (url.pathname === "/") {
      url.pathname = "/marketing";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (e.g. /_next/static, public/images)
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
  ],
};
