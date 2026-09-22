'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

/**
 * Actualiza la contraseña del usuario y cambia su estado a 'Activo'.
 * Requiere el accessToken para autenticar la petición de cambio de contraseña en el servidor.
 * Valida estrictamente que el usuario tenga una invitación en el tenant antes de activarlo.
 */
export async function updatePasswordAndActivate(newPassword: string, accessToken: string, explicitTenantId?: string) {
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

    // 4. Determinar tenant de destino con aislamiento estricto
    const cookieStore = cookies();
    let targetTenantId = explicitTenantId || cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      targetTenantId = impersonateTenantId;
    }

    if (!targetTenantId || targetTenantId === 'undefined') {
      return { 
        success: false, 
        error: "No se pudo identificar el negocio al que perteneces. Por favor, asegúrate de acceder a través del enlace completo recibido por correo." 
      };
    }

    // 5. REGLA FUNDAMENTAL DE AISLAMIENTO:
    // Verificar que el usuario tenga un registro de perfil existente en ESTE negocio específico
    const { data: profile, error: profileCheckError } = await adminSupabase
      .from('profiles')
      .select('id, tenant_id, status, role')
      .eq('id', user.id)
      .eq('tenant_id', targetTenantId)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Error comprobando perfil para activación:", profileCheckError);
      return { success: false, error: "Error validando los datos de la invitación." };
    }

    if (!profile) {
      console.warn(`Intento de activación denegado: usuario ${user.id} no tiene invitación en tenant ${targetTenantId}`);
      return { 
        success: false, 
        error: "No tienes ninguna invitación en este negocio. Si no has sido invitado por el administrador de este centro, no puedes activar una cuenta aquí." 
      };
    }

    // 6. Cambiar la contraseña usando los privilegios de administrador y confirmar el correo en Auth
    const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true
    });

    if (passwordError) {
      console.error("Error actualizando contraseña:", passwordError);
      return { success: false, error: passwordError.message };
    }

    // 7. Actualizar estado a 'Activo' exclusivamente para ESTE tenant
    const { error: dbError } = await adminSupabase
      .from('profiles')
      .update({ status: 'Activo' })
      .eq('id', user.id)
      .eq('tenant_id', targetTenantId);

    if (dbError) {
      console.error("Error activando perfil:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard');
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

    if (!tenantId || tenantId === 'undefined') {
      return { success: false, role: null };
    }

    let query = adminSupabase
      .from('profiles')
      .select('role, status')
      .eq('email', email.trim().toLowerCase())
      .eq('tenant_id', tenantId);

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { success: false, role: null };
    }

    return { success: true, role: data.role, status: data.status };
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

    if (!tenantId || tenantId === 'undefined') {
      return { success: false, error: "Inquilino no especificado" };
    }

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      return { success: false, error: error.message };
    }

    // Aislamiento Multi-Tenant Estricto: Si no existe perfil en este tenant, NO devolver perfiles de otros tenants
    if (!data) {
      return { success: false, error: "Perfil no encontrado en este negocio" };
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
