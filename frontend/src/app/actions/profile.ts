'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
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

    // 5. Actualizar estado a 'Activo' (respetando el aislamiento multi-tenant)
    const cookieStore = cookies();
    const tenantId = cookieStore.get('tenant_id')?.value;

    let updateQuery = adminSupabase
      .from('profiles')
      .update({ status: 'Activo' })
      .eq('id', user.id);

    if (tenantId && tenantId !== 'undefined') {
      updateQuery = updateQuery.eq('tenant_id', tenantId);
    }

    const { error: dbError } = await updateQuery;

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

export async function getUserRoleByEmail(email: string, targetTenantId?: string) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const cookieStore = cookies();
    let tenantId = targetTenantId || cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    let query = adminSupabase
      .from('profiles')
      .select('role')
      .eq('email', email.trim().toLowerCase());

    if (tenantId && tenantId !== 'undefined') {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { success: false, role: null };
    }

    return { success: true, role: data.role };
  } catch (error) {
    return { success: false, role: null };
  }
}

export async function getUserProfile(userId: string, targetTenantId?: string) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const cookieStore = cookies();
    let tenantId = targetTenantId || cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    let query = adminSupabase.from('profiles').select('*').eq('id', userId);

    if (tenantId && tenantId !== 'undefined') {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      return { success: false, error: error.message };
    }

    // Si no se encuentra perfil para ese tenant_id específico, buscar el primer perfil existente como fallback
    if (!data) {
      const { data: fallbackData } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      if (fallbackData) {
        return { success: true, profile: fallbackData };
      }
      return { success: false, error: "Perfil no encontrado" };
    }

    return { success: true, profile: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId: string, updates: any, targetTenantId?: string) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const cookieStore = cookies();
    let tenantId = targetTenantId || cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    let query = adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (tenantId && tenantId !== 'undefined') {
      query = query.eq('tenant_id', tenantId);
    }

    const { error } = await query;

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
