'use server';

import { revalidatePath } from 'next/cache';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

/**
 * Actualiza la contraseña del usuario y cambia su estado a 'Activo'.
 * Requiere el accessToken para autenticar la petición de cambio de contraseña en el servidor.
 */
export async function updatePasswordAndActivate(newPassword: string, accessToken: string) {
  try {
    // 1. Cliente estándar (importado de @/lib/supabase)
    // 2. Obtener el usuario de forma segura validando el token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error("Error validando token de usuario:", userError);
      return { success: false, error: "El enlace es inválido o ha caducado." };
    }

    // 3. Instanciar cliente Admin (Service Role)
    const adminSupabase = getSupabaseAdmin();

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
    const adminSupabase = getSupabaseAdmin();

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

export async function getUserProfile(userId: string) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      return { success: false, error: error.message };
    }

    return { success: true, profile: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const { error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error("Error actualizando perfil:", error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
