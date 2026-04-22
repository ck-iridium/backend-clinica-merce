'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Instancia global de Supabase Admin (Service Role)
// IMPORTANTE: Esto solo se ejecuta en el servidor (Server Actions)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function inviteTeamMember(data: { email: string, full_name: string, role: string }) {
  try {
    // 1. Invitar al usuario por email usando privilegios de admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: {
        full_name: data.full_name,
        role: data.role
      }
    });

    if (authError) {
      console.error("Error invitando usuario:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: "No se pudo obtener el ID del usuario invitado" };
    }

    // 2. Insertar en la tabla profiles (bypass RLS)
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
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
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo equipo desde Supabase Admin:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Excepción obteniendo equipo:", error);
    return [];
  }
}

export async function deleteTeamMember(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Error eliminando usuario:", error);
      return { success: false, error: error.message };
    }
    
    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    console.error("Excepción en deleteTeamMember:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamMemberRole(userId: string, newRole: string) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error("Error actualizando rol:", error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    console.error("Excepción en updateTeamMemberRole:", error);
    return { success: false, error: error.message };
  }
}
