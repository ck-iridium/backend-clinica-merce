'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Utilidad simple para leer cookies en el cliente
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function TenantInitializer() {
  const router = useRouter();

  useEffect(() => {
    // 1. Interceptar recuperación de contraseña mediante hash directo en URL para evitar desincronización de eventos
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('recovery_token=') || hash.includes('access_token='))) {
        console.log('[Auth] Recovery hash detected on client mount. Redirecting to /restablecer-contrasena...');
        router.push('/restablecer-contrasena' + hash);
      }
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).__tenant_fetch_patched) {
      (window as any).__tenant_fetch_patched = true;
      
      const originalFetch = window.fetch;
      
      window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
        let url = '';
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Si el destino es la API de nuestro backend, inyectamos la cabecera X-Tenant-ID
        if (url.startsWith(apiUrl)) {
          const isImpersonating = getCookie('is_impersonating') === 'true';
          const impersonateId = getCookie('impersonate_tenant_id');
          const normalTenantId = getCookie('tenant_id');
          const tenantId = isImpersonating ? (impersonateId || normalTenantId) : normalTenantId;
          
          console.log('[TenantInitializer Patch] Intercepting:', url, {
            isImpersonating,
            impersonateId,
            normalTenantId,
            selectedTenantId: tenantId,
            cookies: typeof document !== 'undefined' ? document.cookie : ''
          });
          
          if (tenantId) {
            init = init || {};
            
            // Obtener cabeceras del request o del init para no perder cabeceras previas (ej. Authorization)
            let baseHeaders: HeadersInit = {};
            if (init.headers) {
              baseHeaders = init.headers;
            } else if (input instanceof Request) {
              baseHeaders = input.headers;
            }
            
            const headers = new Headers(baseHeaders);
            const currentTenantHeader = headers.get('X-Tenant-ID');
            if (!currentTenantHeader || currentTenantHeader === 'null' || currentTenantHeader === 'undefined') {
              headers.set('X-Tenant-ID', tenantId);
            }
            init.headers = headers;
          }
        }
        
        const response = await originalFetch(input, init);
        
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          
          // Evitar bucle infinito si ya estamos en /suspended
          if (response.status === 402 && currentPath !== '/suspended') {
            const tenantId = getCookie('tenant_id') || '';
            console.log('[Multi-Tenancy] 402 Payment Required detected. Redirecting to paywall.');
            window.location.href = `/suspended?tenant_id=${tenantId}`;
          }
          
          if (response.status === 403 && currentPath !== '/suspended') {
            const lastToastTime = (window as any).__last_403_toast_time || 0;
            const now = Date.now();
            if (now - lastToastTime > 5000) {
              (window as any).__last_403_toast_time = now;
              toast.error('Acceso Restringido: Por favor, confirma tu correo electrónico para seguir usando el sistema.');
            }
          }

          if (response.status === 401) {
            try {
              const data = await response.clone().json();
              if (data?.detail === 'session_superseded') {
                console.warn('[Session] Session superseded by a newer login. Logging out...');
                toast.error('Tu sesión ha sido iniciada en otro dispositivo. Por favor, inicia sesión de nuevo.', {
                  duration: 8000
                });
                await supabase.auth.signOut();
                window.location.href = '/login?reason=superseded';
              }
            } catch (err) {
              // Ignorar errores si no es JSON
            }
          }
        }
        
        return response;
      };
      
      console.log('[Multi-Tenancy] Global client-side fetch successfully patched.');
    }
  }, []);

  return null;
}
