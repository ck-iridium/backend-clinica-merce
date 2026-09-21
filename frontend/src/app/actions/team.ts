'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function inviteTeamMember(data: { email: string, full_name: string, role: string }) {
  try {
    const supabaseAdmin = getSupabaseAdmin(); // Instanciado dentro de la zona segura
    
    // 1. Obtener tenant_id desde las cookies
    const cookieStore = cookies();
    const tenantId = cookieStore.get('tenant_id')?.value;

    if (!tenantId) {
      console.error("Seguridad: Intento de invitar miembro de equipo sin tenant_id en cookies");
      return { success: false, error: "No autorizado. Inquilino no identificado." };
    }

    // 2. Consultar el plan del tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('plan_type')
      .eq('id', tenantId)
      .single();

    if (tenantError) {
      console.error("Error consultando plan de inquilino:", tenantError);
      return { success: false, error: "No se pudo validar el plan del negocio." };
    }
 
    const planType = (tenant?.plan_type || 'free').toLowerCase();
 
    // 3. Definir límites del plan
    const PLAN_LIMITS: Record<string, number> = {
      free: 1,
      basic: 2,
      pro: 10,
      gold: 999999
    };
 
    const maxSpecialists = PLAN_LIMITS[planType] || 1;
 
    // 4. Contar miembros de equipo actuales
    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('role', [
        'specialist', 'receptionist', 'admin',
        'especialista', 'recepcionist', 'recepción', 'recepcion', 'administrador',
        'Especialista', 'Recepción', 'Recepcion', 'Administrador'
      ]);
 
    if (countError) {
      console.error("Error contando perfiles del equipo:", countError);
      return { success: false, error: "No se pudo calcular el uso actual del plan." };
    }
 
    const currentCount = count || 0;
 
    if (currentCount >= maxSpecialists) {
      return {
        success: false,
        error: `Límite de especialistas alcanzado para su plan '${planType.toUpperCase()}'. Máximo permitido: ${maxSpecialists}. Mejore su plan de facturación.`
      };
    }
 
    // 5. Proceder con la invitación si está dentro del límite
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectTo = `${protocol}://${host}/`;

    let targetUserId: string | null = null;
    let isExistingUser = false;
    const cleanEmail = data.email.trim().toLowerCase();

    // Intentar invitar mediante Supabase Admin Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
      data: { full_name: data.full_name, role: data.role },
      redirectTo: redirectTo
    });

    if (authError) {
      const errorMsg = (authError.message || '').toLowerCase();
      
      // Comprobar si el correo ya está registrado en Supabase Auth
      if (
        errorMsg.includes('already been registered') ||
        errorMsg.includes('already registered') ||
        errorMsg.includes('user already exists') ||
        errorMsg.includes('email_exists')
      ) {
        isExistingUser = true;

        // Localizar al usuario existente en la lista global de Auth
        const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError || !usersList?.users) {
          console.error("Error consultando usuarios existentes:", listError);
          return { success: false, error: "Error localizando la cuenta del usuario en la plataforma." };
        }

        const existingAuthUser = usersList.users.find(
          u => u.email?.toLowerCase() === cleanEmail
        );

        if (!existingAuthUser) {
          return { success: false, error: "No se pudo recuperar la identidad del usuario registrado." };
        }

        targetUserId = existingAuthUser.id;
      } else {
        console.error("Error invitando usuario:", authError);
        return { success: false, error: authError.message };
      }
    } else {
      targetUserId = authData.user?.id || null;
    }

    if (!targetUserId) {
      return { success: false, error: "No se pudo obtener el ID del usuario invitado" };
    }

    // Si ya existía, comprobar si YA forma parte del equipo de ESTE negocio
    if (isExistingUser) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (existingProfile) {
        return {
          success: false,
          error: "Este usuario ya forma parte del equipo de este negocio."
        };
      }
    }

    // Estado del miembro:
    // Si ya existía globalmente, ya configuró su contraseña -> 'Activo'
    // Si es nuevo y se le envió el email de configuración -> 'Pendiente'
    const memberStatus = isExistingUser ? 'Activo' : 'Pendiente';

    const { error: dbError } = await supabaseAdmin.from('profiles').upsert(
      {
        id: targetUserId,
        tenant_id: tenantId,
        email: cleanEmail,
        full_name: data.full_name,
        role: data.role,
        status: memberStatus
      },
      { onConflict: 'id,tenant_id' }
    );

    if (dbError) {
      console.error("Error insertando perfil:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath('/dashboard/team');
    return { success: true, alreadyRegistered: isExistingUser };
  } catch (error: any) {
    console.error("Excepción en inviteTeamMember:", error);
    return { success: false, error: error.message };
  }
}

export async function getTeamMembers() {
  try {
    const supabaseAdmin = getSupabaseAdmin(); // Instanciado dentro de la zona segura
    
    // Obtener tenant_id desde las cookies para asegurar el aislamiento multi-tenant
    const cookieStore = cookies();
    let tenantId = cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    if (!tenantId || tenantId === 'undefined') {
      console.error("Seguridad: Intento de obtener miembros de equipo sin tenant_id en cookies");
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo equipo desde Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error("Excepción crítica obteniendo equipo:", error);
    return [];
  }
}

export async function deleteTeamMember(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el miembro pertenece al inquilino (tenant) actual
    const cookieStore = cookies();
    let tenantId = cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    if (!tenantId) {
      console.error("Seguridad: Intento de eliminar miembro sin tenant_id en cookies");
      return { success: false, error: "No autorizado." };
    }
    
    const { data: member, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (checkError || !member) {
      return { success: false, error: "Miembro no encontrado en este negocio." };
    }

    // 1. Eliminar únicamente la vinculación de este usuario con el tenant actual
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('tenant_id', tenantId);

    if (deleteProfileError) {
      return { success: false, error: deleteProfileError.message };
    }

    // 2. Comprobar si al usuario le quedan otras clínicas asociadas en profiles
    const { data: remainingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId);

    // Solo si no pertenece a ningún otro tenant en la plataforma, purgar de Supabase Auth
    if (!remainingProfiles || remainingProfiles.length === 0) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeamMemberRole(userId: string, newRole: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el miembro pertenece al inquilino (tenant) actual
    const cookieStore = cookies();
    let tenantId = cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    if (!tenantId) {
      console.error("Seguridad: Intento de actualizar rol de miembro sin tenant_id en cookies");
      return { success: false, error: "No autorizado." };
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('tenant_id', tenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}