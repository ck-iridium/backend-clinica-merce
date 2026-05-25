'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
          const tenantId = getCookie('tenant_id');
          
          init = init || {};
          
          // Crear un objeto Headers para manejar de forma robusta mayúsculas/minúsculas
          const headers = new Headers(init.headers || {});
          if (tenantId && !headers.has('X-Tenant-ID')) {
            headers.set('X-Tenant-ID', tenantId);
          }
          
          init.headers = headers;
        }
        
        return originalFetch(input, init);
      };
      
      console.log('[Multi-Tenancy] Global client-side fetch successfully patched.');
    }
  }, []);

  return null;
}
