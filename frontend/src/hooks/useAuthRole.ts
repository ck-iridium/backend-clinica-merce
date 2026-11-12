import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar eventos en caliente de actualización de avatar o perfil
    const onProfileUpdate = (e: any) => {
      if (e.detail?.avatar_url !== undefined) {
        setUserAvatar(e.detail.avatar_url || null);
      }
      if (e.detail?.full_name && getCookie('is_impersonating') !== 'true') {
        setUserName(e.detail.full_name);
      }
    };
    window.addEventListener('profile-updated', onProfileUpdate);

    const fetchAuthData = async () => {
      try {
        const isImpersonating = getCookie('is_impersonating') === 'true';
        const impersonateName = getCookie('impersonate_tenant_name') || 'Soporte';

        let localUser: any = null;
        let userId = '';
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            localUser = JSON.parse(userStr);
            userId = localUser.id || '';
            if (localUser.avatar_url) setUserAvatar(localUser.avatar_url);
            if (!isImpersonating) {
              if (localUser.full_name || localUser.name) setUserName(localUser.full_name || localUser.name);
              if (localUser.role) setRole(localUser.role.toLowerCase());
            }
          } catch {}
        }

        if (isImpersonating) {
          setRole('administrador');
          setUserName(`Modo Soporte: ${decodeURIComponent(impersonateName)}`);
        }

        // Si no teníamos ID en localStorage, obtenerlo de la sesión activa de Supabase
        if (!userId) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) userId = session.user.id;
          } catch {}
        }

        // Consultar perfil fresco desde la DB para obtener el avatar real
        if (userId) {
          const activeTenantId = getCookie('impersonate_tenant_id') || getCookie('tenant_id') || undefined;
          const profileRes = await getUserProfile(userId, activeTenantId);
          
          if (profileRes.success && profileRes.profile) {
            const p = profileRes.profile;
            const avatar = p.avatar_url || null;
            if (avatar) {
              setUserAvatar(avatar);
              if (localUser) {
                localStorage.setItem('user', JSON.stringify({ ...localUser, avatar_url: avatar }));
              }
            }

            if (!isImpersonating) {
              if (p.status !== 'Activo' && p.status !== 'active') {
                setRole(null);
                setUserName(p.full_name || p.name || 'Usuario (Invitación Pendiente)');
                return;
              }

              const name = p.full_name || p.name || localUser?.full_name || 'Usuario';
              const r = p.role?.toLowerCase() || localUser?.role?.toLowerCase() || 'admin';
              setUserName(name);
              setRole(r);

              if (localUser) {
                localStorage.setItem('user', JSON.stringify({ ...localUser, full_name: name, role: r, avatar_url: avatar }));
              }
            }
            return;
          }
        }

        // Fallbacks si no se pudo consultar el perfil
        if (!isImpersonating && localUser?.role) {
          setRole(localUser.role.toLowerCase());
          setUserName(localUser.full_name || localUser.name || 'Administrador');
        }
      } catch (err) {
        console.error("Error en useAuthRole:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthData();

    return () => {
      window.removeEventListener('profile-updated', onProfileUpdate);
    };
  }, []);

  return { role, userName, userAvatar, loading };
}
