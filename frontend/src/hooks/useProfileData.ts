"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserProfile, updateUserProfile } from '@/app/actions/profile';
import { toast } from 'sonner';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useFeedback } from '@/app/contexts/FeedbackContext';

export function useProfileData() {
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const { showFeedback } = useFeedback();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [receiveEmailAppointments, setReceiveEmailAppointments] = useState(true);
  const [receiveAgendaReminders, setReceiveAgendaReminders] = useState(true);
  
  // Loading states
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Modals
  const [showCropModal, setShowCropModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedImageForCrop, setSelectedImageForCrop] = useState('');
  
  const [browserInfo, setBrowserInfo] = useState('');

  // 1. Inicialización de datos y detección de navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browserName = "Navegador";
      if (ua.match(/chrome|chromium|crios/i)) browserName = "Chrome";
      else if (ua.match(/firefox|fxios/i)) browserName = "Firefox";
      else if (ua.match(/safari/i)) browserName = "Safari";
      const os = ua.match(/Windows/i) ? "Windows" : ua.match(/Mac/i) ? "macOS" : "Dispositivo";
      setBrowserInfo(`${browserName} en ${os}`);
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);
        const { success, profile: profileData } = await getUserProfile(session.user.id);
        if (success && profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setReceiveEmailAppointments(profileData.receive_email_appointments ?? true);
          setReceiveAgendaReminders(profileData.receive_agenda_reminders ?? true);
        }
      } catch (err) {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // 2. Manejadores de Identidad
  const handleUpdateIdentity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    setSavingIdentity(true);
    try {
      const { success } = await updateUserProfile(profile.id, { full_name: fullName });
      if (success) {
        toast.success("Perfil actualizado con éxito");
        setProfile({ ...profile, full_name: fullName });
      }
    } finally {
      setSavingIdentity(false);
    }
  };

  // 3. Manejadores de Seguridad
  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe ser más larga");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) toast.error(error.message);
      else {
        toast.success("Contraseña actualizada");
        setPassword('');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // 4. Manejadores de Preferencias
  const handleUpdatePreferences = async () => {
    if (!profile) return;
    setSavingPrefs(true);
    try {
      const { success } = await updateUserProfile(profile.id, { 
        receive_email_appointments: receiveEmailAppointments,
        receive_agenda_reminders: receiveAgendaReminders
      });
      if (success) toast.success("Preferencias guardadas");
    } finally {
      setSavingPrefs(false);
    }
  };

  // 5. Lógica de Avatar y Storage
  const deleteOldAvatar = async (url: string) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/avatars/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('avatars').remove([filePath]);
      }
    } catch (err) {
      console.error("Error al borrar avatar antiguo:", err);
    }
  };

  const handleAvatarClick = () => {
    const isAdmin = role?.toLowerCase() === 'administrador' || role?.toLowerCase() === 'admin';
    if (isAdmin) {
      setShowMediaModal(true);
    } else {
      document.getElementById('avatar-input')?.click();
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageForCrop(reader.result?.toString() || '');
      setShowCropModal(true);
    };
    reader.readAsDataURL(e.target.files[0]);
    e.target.value = ''; // Reset
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user || !profile) return;
    setShowCropModal(false);
    setUploadingAvatar(true);

    try {
      const isAdmin = role?.toLowerCase() === 'administrador' || role?.toLowerCase() === 'admin';
      if (!isAdmin && profile.avatar_url) {
        await deleteOldAvatar(profile.avatar_url);
      }

      const fileExt = 'webp';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUserProfile(profile.id, { avatar_url: publicUrl });
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Avatar actualizado con éxito");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar avatar");
    } finally {
      setUploadingAvatar(false);
      setSelectedImageForCrop('');
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile || !profile.avatar_url) return;
    const isAdmin = role?.toLowerCase() === 'administrador' || role?.toLowerCase() === 'admin';

    const performRemove = async () => {
      setUploadingAvatar(true);
      try {
        if (!isAdmin && profile.avatar_url) {
          await deleteOldAvatar(profile.avatar_url);
        }
        await updateUserProfile(profile.id, { avatar_url: null });
        setProfile({ ...profile, avatar_url: null });
        toast.success(isAdmin ? "Foto quitada del perfil" : "Foto de perfil eliminada");
      } catch (err) {
        toast.error("Error al procesar la solicitud");
      } finally {
        setUploadingAvatar(false);
      }
    };

    if (isAdmin) {
      performRemove();
    } else {
      showFeedback({
        type: 'confirm',
        title: 'Eliminar Foto',
        message: '¿Estás seguro de que quieres eliminar tu foto de perfil? Esta acción es irreversible.',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        onConfirm: performRemove
      });
    }
  };

  const handleMediaSelected = async (url: string) => {
    if (!profile) return;
    try {
      await updateUserProfile(profile.id, { avatar_url: url });
      setProfile({ ...profile, avatar_url: url });
      toast.success("Avatar actualizado desde la galería");
    } catch (err) {
      toast.error("Error al actualizar avatar");
    } finally {
      setShowMediaModal(false);
    }
  };

  return {
    // Data & Identity
    user,
    profile,
    role,
    loading: loading || loadingRole,
    fullName,
    setFullName,
    browserInfo,
    
    // Security
    password,
    setPassword,
    
    // Preferences
    receiveEmailAppointments,
    setReceiveEmailAppointments,
    receiveAgendaReminders,
    setReceiveAgendaReminders,
    
    // Loading States
    savingIdentity,
    savingPassword,
    savingPrefs,
    uploadingAvatar,
    
    // Modals & Media
    showCropModal,
    setShowCropModal,
    showMediaModal,
    setShowMediaModal,
    selectedImageForCrop,
    setSelectedImageForCrop,
    
    // Actions
    handleUpdateIdentity,
    handleUpdatePassword,
    handleUpdatePreferences,
    handleAvatarClick,
    onFileSelected,
    handleCropComplete,
    handleRemoveAvatar,
    handleMediaSelected,
    handleLogout: () => { localStorage.removeItem('user'); router.push('/login'); }
  };
}
