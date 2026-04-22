"use client"

import * as React from "react"

import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Stethoscope, 
  UserCircle,
  Loader2
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeedback } from "@/app/contexts/FeedbackContext"
import { getTeamMembers, inviteTeamMember, deleteTeamMember, updateTeamMemberRole } from "@/app/actions/team"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthRole } from "@/hooks/useAuthRole"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TeamPage() {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estados para Modal de Invitación
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    full_name: '',
    email: '',
    role: 'Recepción'
  });

  // Estados para Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [memberToEdit, setMemberToEdit] = React.useState<any>(null);
  const [editRole, setEditRole] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  const { showFeedback } = useFeedback();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();

  React.useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        router.replace('/dashboard');
        toast.error("Acceso denegado: Solo los administradores pueden gestionar el equipo.");
      }
    }
  }, [role, loadingRole, router]);


  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembers();
      setMembers(data || []);
    } catch (err) {
      console.error("Error crítico cargando miembros del equipo:", err);
      toast.error("Error al conectar con el servidor de equipo.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    const result = await inviteTeamMember(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Invitación enviada a ${formData.email}`);
      setIsInviteModalOpen(false);
      setFormData({ full_name: '', email: '', role: 'Recepción' });
      fetchMembers();
    } else {
      toast.error(result.error || "Error al invitar al usuario");
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${userName} de la clínica? Esta acción es irreversible.`,
      confirmText: 'Eliminar Miembro',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const result = await deleteTeamMember(userId);
        if (result.success) {
          toast.success(`${userName} ha sido eliminado correctamente.`);
          fetchMembers();
        } else {
          toast.error(result.error || "Error al eliminar al usuario.");
        }
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit) return;
    
    setIsEditing(true);
    const result = await updateTeamMemberRole(memberToEdit.id, editRole);
    setIsEditing(false);

    if (result.success) {
      toast.success("Rol actualizado correctamente.");
      setIsEditModalOpen(false);
      fetchMembers();
    } else {
      toast.error(result.error || "Error al actualizar el rol.");
    }
  };

  if (loadingRole || (role?.toLowerCase() !== 'administrador' && role?.toLowerCase() !== 'admin')) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  // userRole is now dynamic from useAuthRole
  const userRole = role; 


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-serif font-semibold text-stone-800 tracking-tight">
            Gestión de Equipo
          </h1>
          <p className="text-stone-400 font-medium max-w-lg">
            Administra los perfiles de los profesionales y personal de recepción de la clínica.
          </p>
        </div>

        {userRole === 'admin' ? (
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2.5 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-stone-200 active:scale-95">
                <UserPlus size={18} strokeWidth={1.5} />
                Añadir Miembro
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 bg-white border-stone-100 shadow-2xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="font-serif italic text-2xl text-stone-800">Invitar al Equipo</DialogTitle>
                <DialogDescription className="text-stone-500">
                  Enviaremos un correo de invitación para que el usuario configure su contraseña.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] transition-all"
                    placeholder="Ej. Dra. Laura Gil"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d9777f]/20 focus:border-[#d9777f] transition-all"
                    placeholder="laura@clinicamerce.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                    Rol
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger className="w-full bg-stone-50 border-stone-200 rounded-xl px-4 py-3 h-auto text-sm focus:ring-[#d9777f]/20 focus:border-[#d9777f]">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                      <SelectItem value="Administrador" className="rounded-lg">Administrador</SelectItem>
                      <SelectItem value="Especialista" className="rounded-lg">Especialista</SelectItem>
                      <SelectItem value="Recepción" className="rounded-lg">Recepción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {isSubmitting ? "Enviando..." : "Enviar Invitación"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="bg-stone-50 border border-stone-100 px-5 py-3 rounded-2xl">
            <p className="text-stone-400 text-xs font-semibold">
              Solo los administradores pueden gestionar el equipo.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-4 md:p-8 relative group/table">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 opacity-0 group-hover/table:opacity-100 transition-opacity md:hidden pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 opacity-0 group-hover/table:opacity-100 transition-opacity md:hidden pointer-events-none"></div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-50">
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">Miembro</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">Rol</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">Estado</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">Email</th>
                <th className="pb-5 px-4 text-right text-[11px] font-black uppercase tracking-widest text-stone-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded-lg" />
                      </div>
                    </td>
                    <td className="py-5 px-4"><Skeleton className="h-4 w-20 rounded-lg" /></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                         <Skeleton className="w-1.5 h-1.5 rounded-full" />
                         <Skeleton className="h-3 w-12 rounded-full" />
                      </div>
                    </td>
                    <td className="py-5 px-4"><Skeleton className="h-4 w-40 rounded-lg" /></td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="w-8 h-8 rounded-xl" />
                        <Skeleton className="w-8 h-8 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                    No hay miembros en el equipo aún.
                  </td>
                </tr>
              ) : members.map((member) => (
                <tr key={member.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-white shadow-sm shrink-0">
                        {member.role === 'Administrador' ? <ShieldCheck size={20} /> : 
                         member.role === 'Especialista' ? <Stethoscope size={20} /> : 
                         <UserCircle size={20} />}
                      </div>
                      <span className="font-bold text-stone-800">{member.full_name}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-sm font-semibold text-stone-500">{member.role}</span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Activo' ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'Activo' ? 'text-green-600' : 'text-stone-400'}`}>
                        {member.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-sm font-medium text-stone-400 underline decoration-stone-200 underline-offset-4">{member.email}</span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => {
                          setMemberToEdit(member);
                          setEditRole(member.role);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-stone-800 transition-all border border-transparent hover:border-stone-100"
                        title="Editar Rol"
                      >
                        <Edit2 size={16} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(member.id, member.full_name)}
                        className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all border border-transparent hover:border-stone-100"
                        title="Eliminar Miembro"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card de Ayuda */}
      <div className="bg-[#fdf2f3]/30 border border-[#fdf2f3] rounded-[2rem] p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#fdf2f3] flex items-center justify-center text-[#d9777f] shrink-0 outline outline-4 outline-white">
          <ShieldCheck size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="font-bold text-[#d9777f] text-sm">Seguridad y Permisos</h4>
          <p className="text-stone-400 text-sm font-medium leading-relaxed">
            Recuerda que los Miembros con rol 'Especialista' solo pueden ver su propia agenda, mientras que los 'Administradores' tienen acceso total a la facturación y ajustes de la clínica.
          </p>
        </div>
      </div>

      {/* Modal de Edición de Rol */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">Editar Rol</DialogTitle>
            <DialogDescription className="text-stone-500">
              Modifica los permisos de acceso para este miembro.
            </DialogDescription>
          </DialogHeader>
          {memberToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={memberToEdit.full_name}
                  disabled
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-500 opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={memberToEdit.email}
                  disabled
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-500 opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  Rol
                </label>
                <Select
                  value={editRole}
                  onValueChange={setEditRole}
                >
                  <SelectTrigger className="w-full bg-stone-50 border-stone-200 rounded-xl px-4 py-3 h-auto text-sm focus:ring-[#d9777f]/20 focus:border-[#d9777f]">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                    <SelectItem value="Administrador" className="rounded-lg">Administrador</SelectItem>
                    <SelectItem value="Especialista" className="rounded-lg">Especialista</SelectItem>
                    <SelectItem value="Recepción" className="rounded-lg">Recepción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm"
                  disabled={isEditing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex items-center gap-2 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                  {isEditing ? "Guardando..." : "Guardar Cambios"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
