'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Actualiza la contraseña del usuario y cambia su estado a 'Activo'.
 * Requiere el accessToken para autenticar la petición de cambio de contraseña en el servidor.
 */
export async function updatePasswordAndActivate(newPassword: string, accessToken: string) {
  try {
    // 1. Cliente estándar
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 2. Obtener el usuario de forma segura validando el token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error("Error validando token de usuario:", userError);
      return { success: false, error: "El enlace es inválido o ha caducado." };
    }

    // 3. Instanciar cliente Admin (Service Role)
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 4. Cambiar la contraseña usando los privilegios de administrador
    const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (passwordError) {
      console.error("Error actualizando contraseña:", passwordError);
      return { success: false, error: passwordError.message };
    }

    // 5. Actualizar estado a 'Activo'
    const { error: dbError } = await adminSupabase
      .from('profiles')
      .update({ status: 'Activo' })
      .eq('id', user.id);

    if (dbError) {
      console.error("Error activando perfil:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    console.error("Excepción en updatePasswordAndActivate:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserRoleByEmail(email: string) {
  try {
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();

    if (error || !data) {
      return { success: false, role: null };
    }

    return { success: true, role: data.role };
  } catch (error) {
    return { success: false, role: null };
  }
}
