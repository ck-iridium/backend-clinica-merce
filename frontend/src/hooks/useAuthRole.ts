import { useState, useEffect } from 'react';
import { getUserRoleByEmail } from '@/app/actions/profile';

export function useAuthRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.email) {
            const result = await getUserRoleByEmail(user.email);
            if (result.success && result.role) {
              setRole(result.role);
              return;
            } else if (user.role) {
              // Fallback temporal si no existe en perfiles de Supabase
              setRole(user.role);
              return;
            }
          }
        }
        // Rol por defecto más restrictivo si falla
        setRole('Recepción');
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole('Recepción');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { role, loading };
}
