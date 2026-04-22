'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// 1. Función defensiva: Crea el cliente justo cuando se necesita y 
// limpia cualquier comilla o espacio fantasma que venga de Vercel.
function getSupabaseAdmin() {
  const url = 'https://ypimdbkiuguiszaddzaj.supabase.co';

  // PEGÁMOS LA SERVICE ROLE KEY DIRECTAMENTE AQUÍ (Solo para esta prueba)
  // Es la que empieza por eyJ... y termina en CrsKF8
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaW1kYmtpdWd1aXN6YWRkemFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU5MTg4NiwiZXhwIjoyMDkwMTY3ODg2fQ.Q8syF6pO-v2Wd0VaBc0Q8iR4iXeWMEePoYnNlCrsKF8';

  console.log("INTENTANDO CONEXIÓN MAESTRA DIRECTA...");

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function inviteTeamMember(data: { email: string, full_name: string, role: string }) {
  try {
    const supabaseAdmin = getSupabaseAdmin(); // Instanciado dentro de la zona segura
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name, role: data.role }
    });

    if (authError) {
      console.error("Error invitando usuario:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) return { success: false, error: "No se pudo obtener el ID del usuario invitado" };

    const { error: dbError } = await supabaseAdmin.from('profiles').insert({
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
    const supabaseAdmin = getSupabaseAdmin(); // Instanciado dentro de la zona segura
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error obteniendo equipo desde Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Excepción crítica obteniendo equipo:", error);
    return [];
  }
}

export async function deleteTeamMember(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
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
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/team');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}