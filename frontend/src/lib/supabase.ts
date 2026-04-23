import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación estricta para evitar errores en Vercel
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("CRÍTICO: NEXT_PUBLIC_SUPABASE_URL no está definida o es inválida:", supabaseUrl);
  throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL. Verifica las variables de entorno en Vercel.');
}

if (!supabaseAnonKey) {
  console.error("CRÍTICO: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida.");
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Verifica las variables de entorno en Vercel.');
}

// Cliente estándar para uso en el navegador (Auth, Consultas públicas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retorna un cliente con privilegios de administrador (Service Role).
 * SOLO debe usarse en Server Actions o API Routes.
 */
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error("CRÍTICO: SUPABASE_SERVICE_ROLE_KEY no está definida.");
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Este cliente solo puede instanciarse en el servidor.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
