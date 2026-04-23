"use client"

import React from 'react';
import { 
  User, Camera, Trash2, Mail, Shield, 
  Sparkles, CheckCircle2, Loader2 
} from 'lucide-react';

interface ProfileAvatarCardProps {
  profile: any;
  user: any;
  role: string | null;
  uploadingAvatar: boolean;
  handleAvatarClick: () => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAvatar: () => void;
  handleUpdatePreferences: () => void;
  savingPrefs: boolean;
}

export default function ProfileAvatarCard({
  profile,
  user,
  role,
  uploadingAvatar,
  handleAvatarClick,
  onFileSelected,
  handleRemoveAvatar,
  handleUpdatePreferences,
  savingPrefs
}: ProfileAvatarCardProps) {
  return (
    <div className="lg:col-span-4 space-y-8 sticky top-24">
      <div className="bg-white rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 p-10 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D4AF37] via-[#f3c7cb] to-[#D4AF37] opacity-60"></div>

        {/* Avatar Upload */}
        <div className="relative group mb-6">
          <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-stone-100 to-stone-50 shadow-inner overflow-hidden mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-stone-50 flex items-center justify-center border border-white shadow-sm">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <User size={60} className="text-stone-200" strokeWidth={1} />
              )}
            </div>
          </div>

          {/* Botones de Acción (Flotantes y Discretos) */}
          <div className="absolute bottom-2 right-1/2 translate-x-[65px] flex flex-col gap-2">
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="w-9 h-9 bg-stone-900 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-[#d9777f] hover:scale-105 transition-all duration-300 border-2 border-white active:scale-95"
              title="Cambiar foto"
            >
              {uploadingAvatar ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
            </button>

            {profile?.avatar_url && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="w-9 h-9 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-50 hover:scale-105 transition-all duration-300 border-2 border-white active:scale-95"
                title="Quitar foto"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelected}
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-stone-800 tracking-tight">
            {profile?.full_name || 'Sin Nombre'}
          </h2>
          <p className="text-stone-400 font-medium text-sm flex items-center justify-center gap-2">
            <Mail size={14} className="text-stone-300" />
            {user?.email}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="px-5 py-2.5 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-2 shadow-sm">
            <Shield size={16} className="text-[#D4AF37]" />
            <span className="text-xs font-bold text-stone-600 tracking-tighter uppercase">{role}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats / Info */}
      <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-white/10 w-20 h-20" />
        <h4 className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Estado de Cuenta</h4>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
            <CheckCircle2 className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Activo</p>
            <p className="text-xs text-stone-500">
              Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón Guardar Preferencias (Reubicado por petición) */}
      <button
        onClick={handleUpdatePreferences}
        disabled={savingPrefs}
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-5 rounded-[2.5rem] font-bold text-sm shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
      >
        {savingPrefs ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <CheckCircle2 size={18} className="text-emerald-100 group-hover:scale-110 transition-transform" />
        )}
        Guardar Preferencias
      </button>
    </div>
  );
}
