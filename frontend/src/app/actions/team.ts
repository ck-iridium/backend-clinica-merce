'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Inicializar cliente con Service Role (Bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function inviteTeamMember(data: { email: string, full_name: string, role: string }) {
  try {
    // 1. Invitar al usuario por email
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
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

    // 2. Insertar en la tabla profiles
    const { error: dbError } = await supabase
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo equipo:", error);
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
    const { error } = await supabase.auth.admin.deleteUser(userId);
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
    const { error } = await supabase
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
