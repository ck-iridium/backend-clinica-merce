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
          
          // 1. Intentar obtener el nombre del localStorage primero (caché rápida)
          if (user.full_name || user.name) {
             setUserName(user.full_name || user.name);
          }

          // 2. Obtener perfil completo de la DB para asegurar datos frescos (rol y nombre)
          const profileRes = await getUserProfile(user.id);
          
          if (profileRes.success && profileRes.profile) {
            const p = profileRes.profile;
            const name = p.full_name || p.name || 'Usuario';
            const r = p.role?.toLowerCase() || user.role?.toLowerCase() || null;
            
            setUserName(name);
            setRole(r);

            // 3. Sincronizar localStorage si el nombre ha cambiado o no existía
            if (user.full_name !== name) {
              localStorage.setItem('user', JSON.stringify({ ...user, full_name: name }));
            }
            return;
          } else if (user.role) {
             // Fallback a los datos de la sesión si la DB falla
             setRole(user.role.toLowerCase());
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
