"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  User, 
  Lock, 
  Award, 
  ShieldCheck, 
  Loader2, 
  Layers, 
  KeyRound, 
  Upload,
  Building2,
  Sliders,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AdminProfileProps {
  user: any
  setUser: (user: any) => void
}

export default function AdminProfile({ user, setUser }: AdminProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'identity' | 'security'>('overview')
  
  // States for forms
  const [profileName, setProfileName] = useState(user?.full_name || '')
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar_url || '')
  const [newPassword, setNewPassword] = useState('')
  
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // 1. Upload Avatar Image to FastAPI with Client-side Compression to WebP (1:1 aspect ratio)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido.')
      return
    }

    setUploadingAvatar(true)
    const loadingToast = toast.loading('Optimizando imagen a WebP...')

    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      const size = 300
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('No se pudo inicializar el procesador de imágenes.')
      }

      const srcWidth = img.width
      const srcHeight = img.height
      let srcX = 0
      let srcY = 0
      let drawSize = srcWidth

      if (srcWidth > srcHeight) {
        drawSize = srcHeight
        srcX = (srcWidth - srcHeight) / 2
      } else {
        drawSize = srcWidth
        srcY = (srcHeight - srcWidth) / 2
      }

      ctx.drawImage(img, srcX, srcY, drawSize, drawSize, 0, 0, size, size)

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.85)
      })

      if (!blob) {
        throw new Error('Error al comprimir la imagen de perfil.')
      }

      const compressedFile = new File([blob], 'avatar.webp', { type: 'image/webp' })
      const formData = new FormData()
      formData.append('file', compressedFile)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Error al subir la imagen al servidor.')
      }

      const data = await res.json()
      setProfileAvatar(data.url)
      toast.success('Imagen de perfil procesada con éxito.', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la imagen.', { id: loadingToast })
    } finally {
      setUploadingAvatar(false)
    }
  }

  // 2. Update Profile Name & Avatar
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)
    const loadingToast = toast.loading('Actualizando perfil administrativo...')

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName.trim(),
          avatar_url: profileAvatar.trim(),
        },
      })

      if (error) throw error

      setUser({
        ...user,
        full_name: profileName.trim(),
        avatar_url: profileAvatar.trim(),
      })

      toast.success('Perfil actualizado correctamente.', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil.', { id: loadingToast })
    } finally {
      setUpdatingProfile(false)
    }
  }

  // 3. Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setUpdatingPassword(true)
    const loadingToast = toast.loading('Modificando credencial de acceso maestro...')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setNewPassword('')
      toast.success('Contraseña actualizada con éxito en Supabase Auth.', { id: loadingToast })
    } catch (err: any) {
      toast.error(err.message || 'Error al modificar la contraseña.', { id: loadingToast })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const privilegeCards = [
    {
      title: 'Impersonación de Clínicas',
      desc: 'Habilidad para ingresar en modo soporte a cualquier inquilino del SaaS para solventar incidencias en vivo.',
      icon: Building2,
    },
    {
      title: 'Ajustes del Core',
      desc: 'Control de indexación global en buscadores de la landing corporativa y configuraciones estructurales.',
      icon: Sliders,
    },
    {
      title: 'Finanzas Globales',
      desc: 'Acceso total al MRR estimado, ARPU del SaaS, y pasarela de cobros en Stripe de los clientes.',
      icon: BarChart3,
    },
    {
      title: 'Seguridad Total',
      desc: 'Derechos absolutos para restablecer credenciales y administrar la infraestructura B2B.',
      icon: Shield,
    },
  ]

  return (
    <section className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#FAF9F6] select-none">
      
      {/* Sub-Sidebar Izquierdo de Perfil */}
      <aside className="w-full lg:w-72 bg-white/80 backdrop-blur-xl border-r border-stone-200/60 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#B38F26] uppercase tracking-widest font-mono">
              Consola SaaS
            </span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Mi Cuenta
            </h2>
            <p className="text-xs text-stone-400">
              Configuración y credenciales de soporte técnico global.
            </p>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Resumen General', description: 'Vista global y privilegios', icon: Layers },
              { id: 'identity', label: 'Identidad del Perfil', description: 'Nombre y avatar de soporte', icon: User },
              { id: 'security', label: 'Seguridad y Acceso', description: 'Credenciales maestras', icon: Lock }
            ].map(tab => {
              const IconComp = tab.icon
              const isActive = activeSubTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200 focus:outline-none",
                    isActive 
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/80 font-semibold" 
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5",
                    isActive ? "bg-stone-900 text-[#D4AF37]" : "bg-stone-100 text-stone-400"
                  )}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs block font-medium", isActive && "text-stone-900 font-bold")}>
                      {tab.label}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {tab.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Badge inferior */}
        <div className="pt-6 border-t border-stone-100 flex flex-col gap-2">
          <div className="bg-amber-50/80 text-amber-800 border border-amber-200/60 px-3 py-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B38F26]" />
            Acceso Super Admin
          </div>
          <p className="text-[9px] text-stone-400 font-mono tracking-widest uppercase text-center">
            ProBookia SaaS Core
          </p>
        </div>
      </aside>

      {/* Contenido Dinámico a la Derecha */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 min-w-0">
        
        {/* Cabecera */}
        <div className="space-y-1 border-b border-stone-200/60 pb-6">
          <span className="text-[10px] font-bold text-[#B38F26] tracking-widest uppercase font-mono">
            {activeSubTab === 'overview' && 'Consola de Control'}
            {activeSubTab === 'identity' && 'Identidad de Operaciones'}
            {activeSubTab === 'security' && 'Credenciales de Seguridad'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {activeSubTab === 'overview' && 'Resumen del Administrador'}
            {activeSubTab === 'identity' && 'Datos de Identidad y Soporte'}
            {activeSubTab === 'security' && 'Seguridad de la Cuenta'}
          </h1>
          <p className="text-xs text-stone-500 max-w-xl">
            {activeSubTab === 'overview' && 'Estado de sesión, nivel de privilegios y capacidades operacionales del sistema.'}
            {activeSubTab === 'identity' && 'Configura tu nombre público y fotografía visible para soporte e impersonación de clínicas.'}
            {activeSubTab === 'security' && 'Actualiza tu contraseña maestra para el acceso a la plataforma global.'}
          </p>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Tarjeta de Cuenta */}
            <Card className="xl:col-span-4 p-7 bg-white/90 border-stone-200/70 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 p-1 bg-stone-50 mb-4 relative shadow-sm">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Avatar Admin" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-stone-900 text-[#D4AF37] flex items-center justify-center font-bold text-xl font-serif">
                    SA
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold font-serif text-stone-900 truncate w-full">
                {user?.full_name || 'Administrador Global'}
              </h3>
              
              <span className="text-xs text-stone-400 font-mono mt-1 break-all select-all">
                {user?.email}
              </span>

              <div className="w-full border-t border-stone-100 mt-6 pt-5 space-y-3 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Rol</span>
                  <span className="bg-stone-900 text-amber-300 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    SUPERADMIN
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Nivel</span>
                  <span className="text-stone-800 font-semibold font-mono text-xs">Tier 5 (Master)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Estado</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                  </span>
                </div>
              </div>
            </Card>

            {/* Bento Grid de Privilegios */}
            <div className="xl:col-span-8 space-y-6">
              <Card className="p-7 bg-white/90 border-stone-200/70 space-y-6">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" /> Privilegios Globales Habilitados
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Capacidades operacionales asociadas a tu rol de administración global.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {privilegeCards.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <div key={idx} className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/60 flex gap-3.5 transition-all hover:bg-white hover:shadow-xs">
                        <div className="w-9 h-9 rounded-lg bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shrink-0 shadow-xs">
                          <Icon className="w-4 h-4 text-stone-700" />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Aviso de Seguridad */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 flex gap-3.5 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Aviso de Seguridad Operativa
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Al ingresar como soporte a una clínica, tu identidad de administrador queda registrada en los logs de auditoría interna de la plataforma para garantizar la transparencia con los propietarios de negocio.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: IDENTITY */}
        {activeSubTab === 'identity' && (
          <Card className="max-w-xl p-8 bg-white/90 border-stone-200/70 space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Datos de Identidad</h3>
                <p className="text-xs text-stone-400">Modifica tu nombre público y avatar visible</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block ml-1">
                  Nombre de Soporte Técnico
                </label>
                <Input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ej. Juan - Soporte ProBookia"
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block ml-1">
                  Fotografía de Perfil (Avatar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-stone-50 rounded-2xl border border-stone-200/60">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-white shadow-xs shrink-0 flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                    ) : profileAvatar ? (
                      <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-stone-400 font-bold text-sm">SA</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label className={cn(
                        "bg-stone-900 hover:bg-stone-800 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs",
                        uploadingAvatar && "opacity-50 pointer-events-none"
                      )}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarUpload} 
                          className="sr-only" 
                          disabled={uploadingAvatar}
                        />
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Imagen</span>
                      </label>

                      {profileAvatar && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProfileAvatar('')}
                          className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Soporta formatos WebP, PNG y JPG. Optimización automática.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="luxury"
                size="lg"
                disabled={updatingProfile || uploadingAvatar}
                className="w-full text-xs font-semibold gap-1.5"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  'Actualizar Datos de Identidad'
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 3: SECURITY */}
        {activeSubTab === 'security' && (
          <Card className="max-w-xl p-8 bg-white/90 border-stone-200/70 space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Seguridad y Credenciales</h3>
                <p className="text-xs text-stone-400">Actualiza la contraseña maestra de acceso</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 flex gap-3">
                <KeyRound className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  Al actualizar la contraseña, la sesión actual permanecerá activa, pero cualquier nuevo dispositivo requerirá la nueva clave maestra.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block ml-1">
                  Nueva Contraseña Maestra
                </label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                variant="luxury"
                size="lg"
                disabled={updatingPassword}
                className="w-full text-xs font-semibold gap-1.5"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Actualizando clave...</span>
                  </>
                ) : (
                  'Establecer Nueva Contraseña'
                )}
              </Button>
            </form>
          </Card>
        )}

      </div>
    </section>
  )
}
