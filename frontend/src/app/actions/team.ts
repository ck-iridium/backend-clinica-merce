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

     const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
       data: { full_name: data.full_name, role: data.role },
       redirectTo: redirectTo
     });
 
     if (authError) {
       console.error("Error invitando usuario:", authError);
       return { success: false, error: authError.message };
     }
 
     const userId = authData.user?.id;
     if (!userId) return { success: false, error: "No se pudo obtener el ID del usuario invitado" };
 
     const { error: dbError } = await supabaseAdmin.from('profiles').upsert({
       id: userId,
       tenant_id: tenantId,
       email: data.email,
       full_name: data.full_name,
       role: data.role,
       status: 'Pendiente'
     });
 
     if (dbError) {
       console.error("Error insertando perfil:", dbError);
       return { success: false, error: dbError.message };
     }
 
     revalidatePath('/dashboard/team');
     return { success: true };
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

      let logMsg = `[getTeamMembers] tenantId: "${tenantId}" | isImpersonating: ${isImpersonating} | impersonateTenantId: "${impersonateTenantId}"\n`;

      if (!tenantId || tenantId === 'undefined') {
        logMsg += "Seguridad: Intento de obtener miembros de equipo sin tenant_id en cookies\n";
        require('fs').appendFileSync('c:/Users/Juan/.gemini/antigravity-ide/scratch/backend-clinica-merce/tmp_team_debug.log', logMsg);
        console.error("Seguridad: Intento de obtener miembros de equipo sin tenant_id en cookies");
        return [];
      }
  
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
  
      logMsg += `[getTeamMembers] Profiles count: ${data ? data.length : 0} | Error: ${error ? JSON.stringify(error) : 'null'}\n`;
      if (data) {
        logMsg += `Profiles: ${JSON.stringify(data)}\n`;
      }
      require('fs').appendFileSync('c:/Users/Juan/.gemini/antigravity-ide/scratch/backend-clinica-merce/tmp_team_debug.log', logMsg);

      if (error) {
        console.error("Error obteniendo equipo desde Supabase:", error);
        return [];
      }
  
      return data || [];
    } catch (error: any) {
      const errMsg = `Excepción crítica obteniendo equipo: ${error.message || error}\n`;
      require('fs').appendFileSync('c:/Users/Juan/.gemini/antigravity-ide/scratch/backend-clinica-merce/tmp_team_debug.log', errMsg);
      console.error("Excepción crítica obteniendo equipo:", error);
      return [];
    }
  }
 
 export async function deleteTeamMember(userId: string) {
   try {
     const supabaseAdmin = getSupabaseAdmin();
     
     // Verificar que el miembro pertenece al inquilino (tenant) actual
     const cookieStore = cookies();
     const tenantId = cookieStore.get('tenant_id')?.value;
 
     if (!tenantId) {
       console.error("Seguridad: Intento de eliminar miembro sin tenant_id en cookies");
       return { success: false, error: "No autorizado." };
     }
     
     const { data: member, error: checkError } = await supabaseAdmin
       .from('profiles')
       .select('tenant_id')
       .eq('id', userId)
       .single();
 
     if (checkError || !member) {
       return { success: false, error: "Miembro no encontrado." };
     }
 
     if (member.tenant_id !== tenantId) {
       return { success: false, error: "No autorizado para eliminar este miembro." };
     }
 
     const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
 
     if (error) return { success: false, error: error.message };
 
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
     const tenantId = cookieStore.get('tenant_id')?.value;
 
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