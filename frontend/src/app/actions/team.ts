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
    // Redirigir a activar-cuenta para usuarios nuevos que necesitan configurar contraseña
    const redirectTo = `${protocol}://${host}/activar-cuenta`;

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
        .select('role, status')
        .eq('id', targetUserId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.status === 'Activo' || existingProfile.status === 'active') {
          return {
            success: false,
            error: "Este usuario ya forma parte del equipo activo de este negocio."
          };
        } else {
          return {
            success: false,
            error: "Ya existe una invitación pendiente para este usuario en este negocio. Puedes reenviarla desde la lista."
          };
        }
      }
    }

    // REGLA FUNDAMENTAL: Todo miembro invitado nace SIEMPRE como 'Pendiente'
    const memberStatus = 'Pendiente';

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

    // Si el usuario ya existía en la plataforma, Supabase Auth NO envía email de invitación.
    // Enviamos nuestro correo transaccional ProBookia con enlace de aprobación directa.
    if (isExistingUser) {
      const inviteUrl = `${protocol}://${host}/aceptar-invitacion?tenant=${tenantId}&email=${encodeURIComponent(cleanEmail)}`;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      try {
        await fetch(`${apiUrl}/users/send-team-invitation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            full_name: data.full_name,
            role: data.role,
            tenant_id: tenantId,
            invite_url: inviteUrl
          })
        });
      } catch (mailErr) {
        console.error("Error contactando con el servicio de correo para invitación:", mailErr);
      }
    }

    revalidatePath('/dashboard/team');
    return { success: true, alreadyRegistered: isExistingUser };
  } catch (error: any) {
    console.error("Excepción en inviteTeamMember:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Reenvía el correo de invitación a un miembro que se encuentra en estado 'Pendiente'.
 */
export async function resendTeamInvitation(memberId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const cookieStore = cookies();
    let tenantId = cookieStore.get('tenant_id')?.value;
    const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';
    const impersonateTenantId = cookieStore.get('impersonate_tenant_id')?.value;

    if (isImpersonating && impersonateTenantId) {
      tenantId = impersonateTenantId;
    }

    if (!tenantId) {
      return { success: false, error: "No autorizado." };
    }

    // Obtener perfil del miembro
    const { data: member, error: memberError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', memberId)
      .eq('tenant_id', tenantId)
      .single();

    if (memberError || !member) {
      return { success: false, error: "Miembro no encontrado en este negocio." };
    }

    if (member.status === 'Activo' || member.status === 'active') {
      return { success: false, error: "Este miembro ya ha aceptado la invitación y está activo." };
    }

    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cleanEmail = member.email.trim().toLowerCase();

    // Comprobar si el usuario ya tiene cuenta confirmada en Auth
    const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(memberId);
    const isConfirmedUser = Boolean(authUserData?.user?.email_confirmed_at || authUserData?.user?.last_sign_in_at);

    if (isConfirmedUser) {
      // Enviar correo transaccional ProBookia de invitación existente
      const inviteUrl = `${protocol}://${host}/aceptar-invitacion?tenant=${tenantId}&email=${encodeURIComponent(cleanEmail)}`;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const res = await fetch(`${apiUrl}/users/send-team-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          full_name: member.full_name || cleanEmail,
          role: member.role,
          tenant_id: tenantId,
          invite_url: inviteUrl
        })
      });

      if (!res.ok) {
        return { success: false, error: "Error enviando correo de invitación." };
      }
    } else {
      // Usuario nuevo sin confirmar: reenviar invitación de Supabase
      const redirectTo = `${protocol}://${host}/activar-cuenta`;
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        data: { full_name: member.full_name, role: member.role },
        redirectTo: redirectTo
      });

      if (inviteError) {
        console.error("Error reenviando invitación de Supabase:", inviteError);
        return { success: false, error: inviteError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Excepción en resendTeamInvitation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los detalles de una invitación pendiente para un tenant específico.
 */
export async function getInvitationDetails(targetTenantId: string, email?: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Obtener información del negocio
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('id, name, slug')
      .eq('id', targetTenantId)
      .maybeSingle();

    let businessName = tenant?.name || "Clínica";

    const { data: settings } = await supabaseAdmin
      .from('clinic_settings')
      .select('clinic_name, logo_url')
      .eq('tenant_id', targetTenantId)
      .maybeSingle();

    if (settings?.clinic_name) {
      businessName = settings.clinic_name;
    }

    let role = null;
    let status = null;

    if (email) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, status, full_name')
        .eq('email', email.trim().toLowerCase())
        .eq('tenant_id', targetTenantId)
        .maybeSingle();

      if (profile) {
        role = profile.role;
        status = profile.status;
      }
    }

    return {
      success: true,
      businessName,
      logoUrl: settings?.logo_url || null,
      role,
      status
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Acepta formalmente la invitación a un negocio, pasando el perfil a 'Activo'.
 */
export async function acceptTeamInvitation(targetTenantId: string, accessToken: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Validar token del usuario autenticado
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !user) {
      return { success: false, error: "Sesión inválida o expirada. Por favor inicia sesión de nuevo." };
    }

    // Verificar que existe una invitación pendiente para este usuario en ese tenant
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('tenant_id', targetTenantId)
      .maybeSingle();

    if (profileError || !profile) {
      return { success: false, error: "No se encontró ninguna invitación pendiente para tu cuenta en este negocio." };
    }

    if (profile.status === 'Activo' || profile.status === 'active') {
      return { success: true, message: "Ya eres miembro activo de este equipo." };
    }

    // Activar perfil
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'Activo' })
      .eq('id', user.id)
      .eq('tenant_id', targetTenantId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Rechaza la invitación a un negocio, eliminando el perfil pendiente.
 */
export async function rejectTeamInvitation(targetTenantId: string, accessToken: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Validar token del usuario autenticado
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !user) {
      return { success: false, error: "Sesión inválida o expirada." };
    }

    // Eliminar perfil pendiente
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)
      .eq('tenant_id', targetTenantId)
      .eq('status', 'Pendiente');

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
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