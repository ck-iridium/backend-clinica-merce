import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  console.log(`[MIDDLEWARE] Path: ${url.pathname} | Host: ${hostname}`);

  // 1. Excluir recursos estáticos, api routes, _next y archivos de sistema
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    (url.pathname.includes('.') && url.pathname !== '/robots.txt' && url.pathname !== '/sitemap.xml') ||
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

  console.log(`[MIDDLEWARE] subdomain resolved to: "${subdomain}" (cleanHost: "${cleanHost}")`);

  // 3.1. BLOQUEO ESTRICTO: /super-admin SOLO puede existir en el dominio central (probookia.com)
  // En cualquier subdominio de inquilino, /super-admin debe dar 404 para no filtrar la consola central
  if (url.pathname.startsWith('/super-admin') && subdomain && subdomain !== "www") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 4. Resolver tenant_id para el subdominio
  let tenantId = "";

  // Impersonación (Modo Soporte)
  const isImpersonating = request.cookies.get("is_impersonating")?.value === "true";
  const impersonateTenantId = request.cookies.get("impersonate_tenant_id")?.value;
  const impersonateTenantSlug = request.cookies.get("impersonate_tenant_slug")?.value;
  const isSuperAdminPath = url.pathname.startsWith('/super-admin');
  if (isImpersonating && impersonateTenantId && impersonateTenantSlug && !isSuperAdminPath) {
    tenantId = impersonateTenantId;
    subdomain = impersonateTenantSlug;
  }

  if (tenantId || (subdomain && subdomain !== "www")) {
    // 1. Prioridad: Si la URL trae explícitamente el parámetro tenant o tenant_id (ej. aceptar-invitacion, activar-cuenta)
    const queryTenant = url.searchParams.get("tenant") || url.searchParams.get("tenant_id");
    if (queryTenant && /^[0-9a-fA-F-]{36}$/.test(queryTenant)) {
      tenantId = queryTenant;
    }

    // 2. Prioridad: Intentar resolver dinámicamente usando las cookies del navegador para evitar peticiones redundantes
    if (!tenantId) {
      const cachedId = request.cookies.get("cached_tenant_id")?.value;
      const cachedSlug = request.cookies.get("cached_tenant_slug")?.value;
      if (cachedSlug === subdomain && cachedId) {
        tenantId = cachedId;
      }
    }

    // 3. Prioridad: Consultar a Supabase REST API directamente (latencia ultrabaja ~30ms, sin riesgo de cold-start de Render)
    if (!tenantId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        try {
          const supaRes = await fetch(`${supabaseUrl}/rest/v1/tenants?select=id&slug=eq.${encodeURIComponent(subdomain)}&limit=1`, {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          });
          if (supaRes.ok) {
            const data = await supaRes.json();
            if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
              tenantId = data[0].id;
            }
          }
        } catch (supaErr) {
          console.warn("[MIDDLEWARE SUPABASE RESOLVE WARN]", supaErr);
        }
      }
    }

    // 4. Prioridad: Consultar a la API del backend en Render
    if (!tenantId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
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

    // 5. Fallback de emergencia para enlaces de invitación con query param
    if (!tenantId && queryTenant) {
      tenantId = queryTenant;
    }

    if (!tenantId) {
      return new NextResponse("Tenant ID missing or invalid", { status: 400 });
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
      url.pathname.startsWith("/docs") ||
      url.pathname.startsWith("/onboarding") ||
      url.pathname === "/login" ||
      url.pathname === "/aviso-legal" ||
      url.pathname === "/privacidad" ||
      url.pathname === "/cookies" ||
      url.pathname === "/robots.txt" ||
      url.pathname === "/sitemap.xml" ||
      url.pathname.startsWith("/super-admin");

    console.log(`[MIDDLEWARE-GLOBAL] Path: "${url.pathname}" | isGlobalSassPath: ${isGlobalSassPath}`);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-slug", "");
    requestHeaders.set("x-tenant-id", "");
    requestHeaders.set("x-pathname", url.pathname);

    if (!isGlobalSassPath) {
      console.log(`[MIDDLEWARE-GLOBAL] Redirecting to / because path is not global SaaS`);
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (url.pathname === "/") {
      console.log(`[MIDDLEWARE-GLOBAL] Rewriting / to /marketing`);
      url.pathname = "/marketing";
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (e.g. /_next/static, public/images)
     * Incluye explícitamente /sitemap.xml y /robots.txt para contexto multi-tenant
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
    '/sitemap.xml',
    '/robots.txt',
  ],
};
