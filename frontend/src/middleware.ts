import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
  const cleanHost = hostname.split(':')[0].toLowerCase();

  // Mapeo de Dominios Personalizados (Custom Domains) a Slugs de Inquilinos
  const customDomainMapping: Record<string, string> = {
    "esteticamerce.com": "merce",
    "www.esteticamerce.com": "merce",
  };

  // 3. Detectar subdominio o inquilino activo según la estructura de host
  let subdomain = url.searchParams.get("tenant") || "";
  
  if (subdomain === "clear") {
    subdomain = "";
  }

  if (!subdomain) {
    // A. Comprobar si es un Dominio Personalizado
    if (customDomainMapping[cleanHost]) {
      subdomain = customDomainMapping[cleanHost];
    }
    // B. Comprobar si es un subdominio de la plataforma principal (ej. pepe.probookia.com)
    else if (cleanHost.endsWith(".probookia.com") && cleanHost !== "www.probookia.com" && cleanHost !== "probookia.com") {
      subdomain = cleanHost.replace(".probookia.com", "");
    }
    // C. Comprobar si es un subdominio en localhost para desarrollo (ej. pepe.localhost)
    else if (cleanHost.endsWith(".localhost")) {
      subdomain = cleanHost.replace(".localhost", "");
    }
  }

  // D. Forzar limpieza de subdominio si acceden a la raíz de los dominios corporativos para mostrar la Landing limpia
  if ((cleanHost === "probookia.com" || cleanHost === "www.probookia.com" || cleanHost === "localhost") && !url.searchParams.has("tenant") && url.pathname === "/") {
    subdomain = "";
  }

  // 4. Resolver tenant_id para el subdominio
  let tenantId = "00000000-0000-0000-0000-000000000001"; // Fallback por defecto a Clínica Mercè

  // Impersonación (Modo Soporte)
  const isImpersonating = request.cookies.get("is_impersonating")?.value === "true";
  const impersonateTenantId = request.cookies.get("impersonate_tenant_id")?.value;
  const impersonateTenantSlug = request.cookies.get("impersonate_tenant_slug")?.value;
  const isSuperAdminPath = url.pathname.startsWith('/super-admin');

  if (isImpersonating && impersonateTenantId && impersonateTenantSlug && !isSuperAdminPath) {
    tenantId = impersonateTenantId;
    subdomain = impersonateTenantSlug;
  } else if (subdomain && subdomain !== "www") {
    // Mapeo básico para el Cliente Nº 1
    if (subdomain === "merce") {
      tenantId = "00000000-0000-0000-0000-000000000001";
    } else {
      // Intentar resolver dinámicamente usando las cookies del navegador para evitar peticiones redundantes
      const cachedId = request.cookies.get("cached_tenant_id")?.value;
      const cachedSlug = request.cookies.get("cached_tenant_slug")?.value;

      if (cachedSlug === subdomain && cachedId) {
        tenantId = cachedId;
      } else {
        // Consultar a la API del backend para resolver el subdominio de forma real
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
          const res = await fetch(`${apiUrl}/stripe/resolve-tenant/${subdomain}`);
          if (res.ok) {
            const data = await res.json();
            if (data.tenant_id) {
              tenantId = data.tenant_id;
            }
          }
        } catch (err) {
          console.error("[MIDDLEWARE RESOLVE ERROR]", err);
        }
      }
    }

    // Clonamos la petición para inyectar cabeceras y cookies del inquilino activo
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-tenant-slug", subdomain);
    requestHeaders.set("x-pathname", url.pathname);

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
    response.cookies.set("cached_tenant_id", tenantId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600 * 24, // 24 horas
    });
    response.cookies.set("cached_tenant_slug", subdomain, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600 * 24, // 24 horas
    });

    return response;
  } else {
    // 5. Dominio Principal (Marketing & Registro SaaS B2B)
    // Redirigir si intentan acceder a una ruta específica de clínica sin inquilino activo
    const isGlobalSassPath = 
      url.pathname === "/" ||
      url.pathname === "/marketing" ||
      url.pathname.startsWith("/onboarding") ||
      url.pathname === "/login" ||
      url.pathname === "/aviso-legal" ||
      url.pathname === "/privacidad" ||
      url.pathname === "/cookies" ||
      url.pathname.startsWith("/super-admin");

    if (!isGlobalSassPath) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

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
