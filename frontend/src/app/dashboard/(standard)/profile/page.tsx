"use client"

import React from 'react';
import { useProfileData } from '@/hooks/useProfileData';
import { Skeleton } from '@/components/ui/skeleton';
import CropImageModal from '@/components/CropImageModal';
import MediaPickerModal from '@/components/MediaPickerModal';

// Componentes modulares
import ProfileAvatarCard from '@/components/profile/ProfileAvatarCard';
import ProfileIdentityForm from '@/components/profile/ProfileIdentityForm';
import ProfileSecurityForm from '@/components/profile/ProfileSecurityForm';
import ProfilePreferencesForm from '@/components/profile/ProfilePreferencesForm';

export default function ProfilePage() {
  const data = useProfileData();

  if (data.loading) {
    return (
      <div className="p-10 max-w-6xl mx-auto space-y-10">
        <Skeleton className="h-20 w-1/3 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Skeleton className="h-[500px] rounded-[3rem]" />
          </div>
          <div className="lg:col-span-8 space-y-10">
            <Skeleton className="h-[300px] rounded-[3rem]" />
            <Skeleton className="h-[300px] rounded-[3rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-20 px-4 lg:px-0">
      
      {/* ── Header Elegante ── */}
      <div className="mb-12 relative pt-8 lg:pt-0">
        <div className="absolute -left-10 top-0 w-20 h-20 bg-stone-100 rounded-full blur-3xl opacity-60"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Gestión de Identidad</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-stone-900 tracking-tight leading-tight">
          Mi Perfil <span className="text-stone-300 font-light block sm:inline">Digital</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Avatar e Info de Cuenta */}
        <ProfileAvatarCard 
          profile={data.profile}
          user={data.user}
          role={data.role}
          uploadingAvatar={data.uploadingAvatar}
          handleAvatarClick={data.handleAvatarClick}
          onFileSelected={data.onFileSelected}
          handleRemoveAvatar={data.handleRemoveAvatar}
          handleUpdatePreferences={data.handleUpdatePreferences}
          savingPrefs={data.savingPrefs}
        />

        {/* Columna Derecha: Formularios de Ajustes */}
        <div className="lg:col-span-8 space-y-10">
          <ProfileIdentityForm 
            fullName={data.fullName}
            setFullName={data.setFullName}
            email={data.user?.email}
            savingIdentity={data.savingIdentity}
            handleUpdateIdentity={data.handleUpdateIdentity}
            isNameChanged={data.fullName !== data.profile?.full_name}
          />

          <ProfileSecurityForm 
            password={data.password}
            setPassword={data.setPassword}
            savingPassword={data.savingPassword}
            handleUpdatePassword={data.handleUpdatePassword}
            browserInfo={data.browserInfo}
            handleLogout={data.handleLogout}
          />

          <ProfilePreferencesForm 
            receiveEmailAppointments={data.receiveEmailAppointments}
            setReceiveEmailAppointments={data.setReceiveEmailAppointments}
            receiveAgendaReminders={data.receiveAgendaReminders}
            setReceiveAgendaReminders={data.setReceiveAgendaReminders}
          />
        </div>
      </div>

      {/* Modales de Gestión de Imagen (Orquestados desde la página raíz) */}
      {data.showCropModal && (
        <CropImageModal 
          imageSrc={data.selectedImageForCrop}
          onClose={() => { data.setShowCropModal(false); data.setSelectedImageForCrop(''); }}
          onCropComplete={data.handleCropComplete}
          forceAspect={1}
          maxResolution={1024}
        />
      )}

      {data.showMediaModal && (
        <MediaPickerModal 
          onClose={() => data.setShowMediaModal(false)}
          onImageSelected={data.handleMediaSelected}
          forceAspect={1}
          maxResolution={1024}
        />
      )}
    </div>
  );
}
