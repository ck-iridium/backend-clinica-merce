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
              // Normalizamos a minúsculas para comparaciones seguras
              setRole(result.role);
              return;
            } else if (user.role) {
              setRole(user.role);
              return;
            }
          }
        }
        setRole(null); // No hay sesión o usuario
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { role, loading };
}
