import { useState, useEffect } from 'react';
import { getUserRoleByEmail, getUserProfile } from '@/app/actions/profile';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useAuthRole() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        // Impersonación (Modo Soporte)
        const isImpersonating = getCookie('is_impersonating') === 'true';
        if (isImpersonating) {
          const impersonateName = getCookie('impersonate_tenant_name') || 'Soporte';
          setRole('administrador');
          setUserName(`Modo Soporte: ${decodeURIComponent(impersonateName)}`);
          setLoading(false);
          return;
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // 1. Intentar obtener el nombre y rol del localStorage primero (caché instantánea)
          if (user.full_name || user.name) {
             setUserName(user.full_name || user.name);
          }
          if (user.role) {
             setRole(user.role.toLowerCase());
          }

          // 2. Obtener perfil completo de la DB para asegurar datos frescos (rol y nombre) según el tenant activo
          const activeTenantId = getCookie('tenant_id') || undefined;
          const profileRes = await getUserProfile(user.id, activeTenantId);
          
          if (profileRes.success && profileRes.profile) {
            const p = profileRes.profile;
            // Si el estado no es 'Activo' (por ejemplo, sigue 'Pendiente'), no se conceden permisos en este negocio
            if (p.status !== 'Activo' && p.status !== 'active') {
              setRole(null);
              setUserName(p.full_name || p.name || 'Usuario (Invitación Pendiente)');
              return;
            }

            const name = p.full_name || p.name || user.full_name || 'Usuario';
            const r = p.role?.toLowerCase() || user.role?.toLowerCase() || 'admin';
            
            setUserName(name);
            setRole(r);

            // 3. Sincronizar localStorage si el nombre o rol ha cambiado
            if (user.full_name !== name || user.role !== r) {
              localStorage.setItem('user', JSON.stringify({ ...user, full_name: name, role: r }));
            }
            return;
          }

          // Fallback de resiliencia: Si profileRes falló por cold-start pero localStorage tenía rol válido
          if (user.role) {
            setRole(user.role.toLowerCase());
            setUserName(user.full_name || user.name || 'Administrador');
            return;
          }
        }
        setRole(null);
        setUserName(null);
      } catch (err) {
        console.error("Error en useAuthRole:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  return { role, userName, loading };
}
