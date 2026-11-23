"use client"

import * as React from "react"

import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Loader2,
  CalendarDays,
  Send,
  KeyRound,
  Smartphone,
  SmartphoneNfc,
  Mail,
  Lock,
  Clock,
  CheckCircle2
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeedback } from "@/app/contexts/FeedbackContext"
import {
  getTeamMembers,
  inviteTeamMember,
  deleteTeamMember,
  updateTeamMemberRole,
  resendTeamInvitation,
  createCounterOperatorAction,
  updateOperatorPinAction,
  unbindOperatorDeviceAction
} from "@/app/actions/team"
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
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/contexts/LanguageContext"
import PlanLimitsCard from "@/components/PlanLimitsCard"
import RosteringManager from "@/components/RosteringManager"
import TimeClockManager from "@/components/team/TimeClockManager"

export default function TeamPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { role, loading: loadingRole } = useAuthRole();
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = React.useState<'members' | 'timeclock'>('members');
  const [enableTimeClock, setEnableTimeClock] = React.useState<boolean>(true);
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    full_name: '',
    email: '',
    role: 'Recepción'
  });

  const [creationMode, setCreationMode] = React.useState<'pin' | 'email'>('pin');
  const [operatorPin, setOperatorPin] = React.useState('');

  // Estados para Modal de Cambio de PIN
  const [isPinModalOpen, setIsPinModalOpen] = React.useState(false);
  const [memberToChangePin, setMemberToChangePin] = React.useState<any>(null);
  const [newPinValue, setNewPinValue] = React.useState('');
  const [isUpdatingPin, setIsUpdatingPin] = React.useState(false);

  // Estados para Modal de Edición
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [memberToEdit, setMemberToEdit] = React.useState<any>(null);
  const [editRole, setEditRole] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  // Estados para Planificación (Rostering)
  const [isRosterModalOpen, setIsRosterModalOpen] = React.useState(false);
  const [rosterMember, setRosterMember] = React.useState<any>(null);

  // Estado para Reenviar Invitación
  const [resendingId, setResendingId] = React.useState<string | null>(null);

  const handleResend = async (memberId: string, memberEmail: string) => {
    try {
      setResendingId(memberId);
      const res = await resendTeamInvitation(memberId, language || 'es');
      if (res.success) {
        const translated = t('dashboard.team.resend_success', { email: memberEmail });
        const fallback = `Invitación reenviada correctamente a ${memberEmail}`;
        toast.success(translated && translated !== 'dashboard.team.resend_success' ? translated : fallback);
      } else {
        const translatedErr = t('dashboard.team.resend_error');
        const fallbackErr = "Error al reenviar la invitación.";
        toast.error(res.error || (translatedErr && translatedErr !== 'dashboard.team.resend_error' ? translatedErr : fallbackErr));
      }
    } catch (err: any) {
      toast.error(err.message || "Error al reenviar la invitación.");
    } finally {
      setResendingId(null);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembers();
      setMembers(data || []);

      // Cargar ajustes para verificar si el Control Horario está habilitado en este centro
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const tenantMatch = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
      const tenantId = tenantMatch ? tenantMatch[1] : '';
      const res = await fetch(`${apiUrl}/settings/`, {
        headers: { ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}) }
      });
      if (res.ok) {
        const s = await res.json();
        if (typeof s.enable_time_clock !== 'undefined') {
          const isTimeClockEnabled = Boolean(s.enable_time_clock);
          setEnableTimeClock(isTimeClockEnabled);
          if (!isTimeClockEnabled) {
            setActiveTab('members');
          }
        }
      }
    } catch (err) {
      console.error("Error crítico cargando miembros del equipo:", err);
      toast.error(t('dashboard.team.server_connection_error') || "Error al conectar con el servidor de equipo.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase();
      if (currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error(t('dashboard.team.access_denied_admin') || "Acceso denegado: Solo el Administrador puede gestionar el equipo.");
        router.replace('/dashboard');
      } else {
        fetchMembers();
      }
    }
  }, [role, loadingRole, router]);

  if (loadingRole) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error(t('dashboard.team.invite_fields_required') || "Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    const result = await inviteTeamMember({ ...formData, lang: language || 'es' });
    setIsSubmitting(false);

    if (result.success) {
      toast.success((t('dashboard.team.invite_success') || 'Invitación enviada a {email}').replace('{email}', formData.email));
      setIsInviteModalOpen(false);
      setFormData({ full_name: '', email: '', role: 'Recepción' });
      fetchMembers();
    } else {
      toast.error(result.error || t('dashboard.team.invite_error') || "Error al invitar al usuario");
    }
  };

  const handleSubmitNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.role) {
      toast.error(t('dashboard.team.invite_fields_required') || "Por favor completa el nombre y el rol");
      return;
    }

    if (creationMode === 'pin') {
      const cleanPin = operatorPin.trim();
      if (!cleanPin || cleanPin.length !== 4 || !/^\d+$/.test(cleanPin)) {
        toast.error("El PIN debe tener exactamente 4 dígitos numéricos.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await createCounterOperatorAction({
          full_name: formData.full_name.trim(),
          role: formData.role,
          pin: cleanPin,
          email: formData.email ? formData.email.trim() : undefined,
        });

        if (result.success) {
          toast.success(`Operadora "${formData.full_name}" creada con éxito con acceso por PIN.`);
          setIsInviteModalOpen(false);
          setFormData({ full_name: '', email: '', role: 'Especialista' });
          setOperatorPin('');
          fetchMembers();
        } else {
          toast.error(result.error || "Error al crear la operadora con PIN");
        }
      } catch (err: any) {
        toast.error(err.message || "Error al crear operadora");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await handleInvite(e);
    }
  };

  const handleUnbindDevice = (memberId: string, memberName: string) => {
    showFeedback({
      type: 'confirm',
      title: 'Desvincular Teléfono Personal',
      message: `¿Deseas desvincular el teléfono móvil vinculado a ${memberName}? En su próximo fichaje podrá vincular un nuevo dispositivo móvil.`,
      confirmText: 'Desvincular Dispositivo',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const res = await unbindOperatorDeviceAction(memberId);
        if (res.success) {
          toast.success(`Móvil de ${memberName} desvinculado correctamente.`);
          fetchMembers();
        } else {
          toast.error(res.error || "Error al desvincular el teléfono.");
        }
      }
    });
  };

  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPinValue.trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d+$/.test(cleanPin)) {
      toast.error("El nuevo PIN debe tener exactamente 4 dígitos.");
      return;
    }

    if (!memberToChangePin) return;

    setIsUpdatingPin(true);
    try {
      const res = await updateOperatorPinAction(memberToChangePin.id, cleanPin);
      if (res.success) {
        toast.success(`PIN actualizado correctamente para ${memberToChangePin.full_name}.`);
        setIsPinModalOpen(false);
        setNewPinValue('');
        setMemberToChangePin(null);
        fetchMembers();
      } else {
        toast.error(res.error || "Error al actualizar el PIN");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar el PIN");
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    showFeedback({
      type: 'confirm',
      title: t('dashboard.team.delete_member_title') || 'Confirmar Eliminación',
      message: (t('dashboard.team.delete_member_desc') || '¿Estás seguro de que deseas eliminar a {name} de la clínica? Esta acción es irreversible.').replace('{name}', userName),
      confirmText: t('dashboard.team.delete_member_btn') || 'Eliminar Miembro',
      cancelText: t('dashboard.team.cancel_btn') || 'Cancelar',
      onConfirm: async () => {
        const result = await deleteTeamMember(userId);
        if (result.success) {
          toast.success((t('dashboard.team.delete_success') || '{name} ha sido eliminado correctamente.').replace('{name}', userName));
          fetchMembers();
        } else {
          toast.error(result.error || t('dashboard.team.delete_error') || "Error al eliminar al usuario.");
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
      toast.success(t('dashboard.team.role_update_success') || "Rol actualizado correctamente.");
      setIsEditModalOpen(false);
      fetchMembers();
    } else {
      toast.error(result.error || t('dashboard.team.role_update_error') || "Error al actualizar el rol.");
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
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-5xl font-serif font-semibold text-stone-800 tracking-tight">
              {t('dashboard.team.team_title') || "Gestión de Equipo"}
            </h1>
            <PlanLimitsCard type="specialists" />
          </div>
          <p className="text-stone-400 font-medium max-w-lg">
            {t('dashboard.team.team_subtitle') || "Administra los perfiles de los profesionales, modo mostrador y control horario legal."}
          </p>
        </div>

        {/* Botón Añadir Miembro (Solo visible en pestaña Personal) */}
        {activeTab === 'members' && (role?.toLowerCase() === 'administrador' || role?.toLowerCase() === 'admin') && (
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <Button id="team-add-member-btn" variant="luxury" className="rounded-2xl px-6 h-12 text-sm font-semibold gap-2.5 shadow-sm">
                <UserPlus size={18} strokeWidth={1.5} />
                <span>{t('dashboard.team.add_member_btn') || "Añadir Miembro"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-6 bg-white border-stone-100 shadow-2xl">
              <DialogHeader className="mb-2">
                <DialogTitle className="font-serif text-2xl text-stone-900 font-semibold">
                  Añadir Miembro al Equipo
                </DialogTitle>
                <DialogDescription className="text-stone-500 text-sm">
                  Configura el tipo de acceso según trabaje en mostrador o requiera acceso remoto.
                </DialogDescription>
              </DialogHeader>

              {/* Selector de Modo: Mostrador (PIN) vs Remoto (Email) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100/80 rounded-2xl border border-stone-200/50 mb-4">
                <button
                  type="button"
                  onClick={() => setCreationMode('pin')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${creationMode === 'pin'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                    }`}
                >
                  <KeyRound size={14} className={creationMode === 'pin' ? 'text-[#FF6B00]' : 'text-stone-400'} />
                  <span>Mostrador (PIN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('email')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${creationMode === 'email'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                    }`}
                >
                  <Mail size={14} className={creationMode === 'email' ? 'text-[#FF6B00]' : 'text-stone-400'} />
                  <span>Acceso Remoto (Email)</span>
                </button>
              </div>

              <form onSubmit={handleSubmitNewMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {t('dashboard.team.full_name_label') || "Nombre Completo"}
                  </label>
                  <input
                    id="team-invite-name-input"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-stone-800 transition-all shadow-xs"
                    placeholder="Ej. Laura Gil"
                    required
                  />
                </div>

                {creationMode === 'pin' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        PIN Mostrador (4 dígitos)
                      </label>
                      <span className="text-[11px] text-[#FF6B00] font-semibold">Exclusivo Mostrador</span>
                    </div>
                    <div className="flex justify-center py-1">
                      <input
                        id="team-invite-pin-input"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={operatorPin}
                        onChange={(e) => setOperatorPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        className="w-44 text-center tracking-[0.6em] text-2xl font-mono bg-stone-50/80 border border-stone-200/80 rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-2xs"
                        required
                      />
                    </div>
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                      💡 <strong>Cero acceso externo</strong>: No requiere email ni contraseña. La empleada solo podrá operar desbloqueando con su PIN en la pantalla del mostrador y no podrá entrar desde su casa.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {t('dashboard.team.email_label') || "Correo Electrónico"}
                    </label>
                    <input
                      id="team-invite-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-stone-800 transition-all shadow-xs"
                      placeholder="laura@ejemplo.com"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {t('dashboard.team.role_label') || "Rol"}
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger id="team-invite-role-trigger" className="w-full bg-white border-stone-200/80 rounded-xl px-4 py-3 h-auto text-sm focus:ring-[#FF6B00] focus:border-[#FF6B00] text-stone-800 shadow-xs">
                      <SelectValue placeholder={t('dashboard.team.select_role_placeholder') || "Selecciona un rol"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                      <SelectItem value="Especialista" className="rounded-lg">{t('dashboard.team.roles.specialist') || "Especialista"}</SelectItem>
                      <SelectItem value="Recepción" className="rounded-lg">{t('dashboard.team.roles.reception') || "Recepción"}</SelectItem>
                      <SelectItem value="Administrador" className="rounded-lg">{t('dashboard.team.roles.admin') || "Administrador"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="pt-4 flex gap-2">
                  <Button
                    id="team-invite-cancel-btn"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="rounded-xl text-stone-500 hover:text-stone-800"
                    disabled={isSubmitting}
                  >
                    {t('dashboard.team.cancel_btn') || "Cancelar"}
                  </Button>
                  <Button
                    id="team-invite-submit-btn"
                    type="submit"
                    variant="luxury"
                    disabled={isSubmitting || (creationMode === 'pin' && operatorPin.length !== 4)}
                    className="rounded-xl px-6 gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (creationMode === 'pin' ? <KeyRound size={16} /> : <UserPlus size={16} />)}
                    <span>
                      {isSubmitting
                        ? "Guardando..."
                        : (creationMode === 'pin' ? "Crear Operadora Mostrador" : "Enviar Invitación Remota")}
                    </span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Selector de Pestañas de la Sección (Solo visible si Control Horario está habilitado) */}
      {enableTimeClock && (
        <div className="flex items-center gap-2 p-1.5 bg-stone-200/50 rounded-2xl w-fit border border-stone-200/60 shadow-2xs">
          <button
            type="button"
            id="team-tab-members-btn"
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'members'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <Users size={15} className={activeTab === 'members' ? 'text-[#FF6B00]' : 'text-stone-400'} />
            <span>Personal & Permisos</span>
          </button>

          <button
            type="button"
            id="team-tab-timeclock-btn"
            onClick={() => setActiveTab('timeclock')}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'timeclock'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
              }`}
          >
            <Clock size={15} className={activeTab === 'timeclock' ? 'text-[#FF6B00]' : 'text-stone-400'} />
            <span>Control Horario & Fichajes (RDL 8/2019)</span>
          </button>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 1: LISTADO DE PERSONAL Y PERMISOS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-4 md:p-8 relative group/table">
            <div className="overflow-x-auto scrollbar-hide">
              <table id="team-members-table" className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-stone-50">
                    <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">{t('dashboard.team.table_header_member') || "Miembro"}</th>
                    <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">{t('dashboard.team.table_header_role') || "Rol"}</th>
                    <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">{t('dashboard.team.table_header_status') || "Estado"}</th>
                    <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-stone-300">{t('dashboard.team.table_header_email') || "Email / Acceso"}</th>
                    <th className="pb-5 px-4 text-right text-[11px] font-black uppercase tracking-widest text-stone-300">{t('dashboard.team.table_header_actions') || "Acciones"}</th>
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
                        {t('dashboard.team.empty_team') || "No hay miembros en el equipo aún."}
                      </td>
                    </tr>
                  ) : members.map((member) => (
                    <tr key={member.id} className="group hover:bg-stone-50/50 transition-colors">
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-sm border border-stone-200/60 shadow-xs shrink-0 overflow-hidden">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt={member.full_name || "Avatar"} className="w-full h-full object-cover" />
                            ) : member.full_name ? (
                              <span className="font-bold text-stone-700 text-sm">{member.full_name.charAt(0).toUpperCase()}</span>
                            ) : member.role === 'Administrador' || member.role === 'admin' ? (
                              <ShieldCheck size={18} className="text-stone-600" />
                            ) : (
                              <Sparkles size={18} className="text-[#FF6B00]" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-stone-800">{member.full_name}</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {member.auth_mode === 'pin_only' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200/60 shadow-2xs">
                                  <KeyRound size={10} className="text-[#FF6B00]" />
                                  PIN Mostrador
                                </span>
                              )}
                              {member.bound_device_id && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60 shadow-2xs">
                                  <Smartphone size={10} className="text-blue-600" />
                                  Móvil Vinculado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="text-sm font-semibold text-stone-500">
                          {t(`dashboard.team.roles.${(member.role === 'Administrador' || member.role === 'admin') ? 'admin' : (member.role === 'Especialista' || member.role === 'specialist') ? 'specialist' : 'reception'}`) || member.role}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${(member.status === 'Activo' || member.status === 'active') ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${(member.status === 'Activo' || member.status === 'active') ? 'text-green-600' : 'text-amber-600'}`}>
                            {(member.status === 'Activo' || member.status === 'active')
                              ? (t('dashboard.team.statuses.active') || 'ACTIVO')
                              : (t('dashboard.team.statuses.invited') || 'PENDIENTE')}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        {member.auth_mode === 'pin_only' || (member.email && member.email.includes('@mostrador.local')) ? (
                          <span className="text-xs text-stone-400 italic font-medium bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/50">
                            Acceso local mostrador
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-stone-400 underline decoration-stone-200 underline-offset-4">{member.email}</span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 transition-opacity">
                          {/* Reenviar Invitación */}
                          {(member.status !== 'Activo' && member.status !== 'active' && member.auth_mode !== 'pin_only') && (
                            <button
                              id={`team-resend-btn-${member.id}`}
                              onClick={() => handleResend(member.id, member.email)}
                              disabled={resendingId === member.id}
                              className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-[#FF6B00] transition-all border border-transparent hover:border-stone-100 disabled:opacity-50"
                              title="Reenviar Invitación"
                            >
                              {resendingId === member.id ? <Loader2 size={16} className="animate-spin text-[#FF6B00]" /> : <Send size={16} strokeWidth={1.5} />}
                            </button>
                          )}

                          {/* Cambiar PIN Mostrador */}
                          <button
                            id={`team-pin-btn-${member.id}`}
                            onClick={() => {
                              setMemberToChangePin(member);
                              setNewPinValue('');
                              setIsPinModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-[#FF6B00] transition-all border border-transparent hover:border-stone-100"
                            title="Asignar o Cambiar PIN Mostrador"
                          >
                            <KeyRound size={16} strokeWidth={1.5} />
                          </button>

                          {/* Desvincular Móvil */}
                          {member.bound_device_id && (
                            <button
                              id={`team-unbind-device-btn-${member.id}`}
                              onClick={() => handleUnbindDevice(member.id, member.full_name)}
                              className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-blue-600 transition-all border border-transparent hover:border-stone-100"
                              title="Desvincular Teléfono Móvil"
                            >
                              <SmartphoneNfc size={16} strokeWidth={1.5} />
                            </button>
                          )}

                          {(member.role === 'Especialista' || member.role === 'specialist') && (
                            <button
                              id={`team-roster-btn-${member.id}`}
                              onClick={() => {
                                setRosterMember(member);
                                setIsRosterModalOpen(true);
                              }}
                              className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-[#FF6B00] transition-all border border-transparent hover:border-stone-100"
                              title="Planificar Turnos y Sedes"
                            >
                              <CalendarDays size={16} strokeWidth={1.5} />
                            </button>
                          )}

                          <button
                            id={`team-edit-role-btn-${member.id}`}
                            onClick={() => {
                              setMemberToEdit(member);
                              setEditRole(member.role);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-stone-800 transition-all border border-transparent hover:border-stone-100"
                            title={t('dashboard.team.edit_role_title') || "Editar Rol"}
                          >
                            <Edit2 size={16} strokeWidth={1.5} />
                          </button>

                          <button
                            id={`team-delete-member-btn-${member.id}`}
                            onClick={() => handleDelete(member.id, member.full_name)}
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all border border-transparent hover:border-stone-100"
                            title={t('dashboard.team.delete_member_btn') || "Eliminar Miembro"}
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
              <h4 className="font-bold text-[#d9777f] text-sm">{t('dashboard.team.security_permissions_title') || "Seguridad y Permisos"}</h4>
              <p className="text-stone-400 text-sm font-medium leading-relaxed">
                {t('dashboard.team.security_permissions_desc') || "Recuerda que los Miembros con rol 'Especialista' solo pueden ver su propia agenda, mientras que los 'Administradores' tienen acceso total a la facturación y ajustes de la clínica."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: CONTROL HORARIO Y FICHAJES (RDL 8/2019) */}
      {activeTab === 'timeclock' && (
        <TimeClockManager teamMembers={members} />
      )}

      {/* Modal de Edición de Rol */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 bg-white border-stone-100 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">{t('dashboard.team.edit_role_title') || "Editar Rol"}</DialogTitle>
            <DialogDescription className="text-stone-500">
              {t('dashboard.team.edit_role_desc') || "Modifica los permisos de acceso para este miembro."}
            </DialogDescription>
          </DialogHeader>
          {memberToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  {t('dashboard.team.full_name_label') || "Nombre Completo"}
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
                  {t('dashboard.team.email_label') || "Correo Electrónico"}
                </label>
                <input
                  id="team-edit-email-input"
                  type="email"
                  value={memberToEdit.email}
                  disabled
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-500 opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                  {t('dashboard.team.role_label') || "Rol"}
                </label>
                <Select
                  value={editRole}
                  onValueChange={setEditRole}
                >
                  <SelectTrigger id="team-edit-role-trigger" className="w-full bg-white border-stone-200/80 rounded-xl px-4 py-3 h-auto text-sm focus:ring-[#FF6B00] focus:border-[#FF6B00] text-stone-800 shadow-xs">
                    <SelectValue placeholder={t('dashboard.team.select_role_placeholder') || "Selecciona un rol"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-stone-100 shadow-xl">
                    <SelectItem value="Administrador" className="rounded-lg">{t('dashboard.team.roles.admin') || "Administrador"}</SelectItem>
                    <SelectItem value="Especialista" className="rounded-lg">{t('dashboard.team.roles.specialist') || "Especialista"}</SelectItem>
                    <SelectItem value="Recepción" className="rounded-lg">{t('dashboard.team.roles.reception') || "Recepción"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4 flex gap-2">
                <Button
                  id="team-edit-cancel-btn"
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-stone-500 hover:text-stone-800"
                  disabled={isEditing}
                >
                  {t('dashboard.team.cancel_btn') || "Cancelar"}
                </Button>
                <Button
                  id="team-edit-submit-btn"
                  type="submit"
                  variant="luxury"
                  disabled={isEditing}
                  className="rounded-xl px-6 gap-2"
                >
                  {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                  <span>{isEditing ? (t('dashboard.team.saving_btn') || "Guardando...") : (t('dashboard.team.save_changes_btn') || "Guardar Cambios")}</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Planificación de Turnos (Rostering) */}
      <Dialog open={isRosterModalOpen} onOpenChange={setIsRosterModalOpen}>
        <DialogContent className="max-w-6xl w-full rounded-[2.5rem] p-8 bg-white border-stone-100 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-serif italic text-2xl text-stone-800">Planificar Horario y Sedes</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium">
              Establece los turnos de asistencia habitual y las excepciones de fecha para este profesional.
            </DialogDescription>
          </DialogHeader>
          {rosterMember && (
            <RosteringManager
              staffId={rosterMember.id}
              staffName={rosterMember.full_name}
              onClose={() => setIsRosterModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Cambio de PIN Mostrador */}
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
              <DialogContent className="sm:max-w-sm rounded-[2rem] p-6 bg-white border-stone-100 shadow-2xl text-center">
                <DialogHeader className="mb-2 text-center items-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 text-[#FF6B00] flex items-center justify-center mb-2 shadow-2xs">
                    <Lock size={20} />
                  </div>
                  <DialogTitle className="font-serif font-bold text-xl text-stone-900 text-center">
                    Asignar o Cambiar PIN
                  </DialogTitle>
                    <DialogDescription className="text-stone-500 text-xs text-center max-w-xs">
                      Establece un código de 4 dígitos para {memberToChangePin?.full_name}.
                    </DialogDescription>
                </DialogHeader>

                  <form onSubmit={handleSaveNewPin} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block text-center">
                          Código PIN (4 Dígitos)
                        </label>
                        <div className="flex justify-center">
                          <input
                            id="team-change-pin-input"
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={newPinValue}
                            onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="••••"
                            className="w-44 text-center tracking-[0.6em] text-2xl font-mono bg-stone-50/80 border border-stone-200/80 rounded-2xl px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-2xs"
                            required
                            autoFocus
                          />
                        </div>
                        <p className="text-[11px] text-stone-400 text-center">
                          Permitirá desbloquear la pantalla del mostrador y registrar fichajes.
                        </p>
                    </div>

                      <DialogFooter className="pt-2 flex justify-center gap-2">
                        <Button
                          id="team-pin-cancel-btn"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsPinModalOpen(false)}
                          className="rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800"
                          disabled={isUpdatingPin}
                        >
                          {t('dashboard.team.cancel_btn') || "Cancelar"}
                        </Button>
                        <Button
                          id="team-pin-submit-btn"
                          type="submit"
                          variant="luxury"
                          disabled={isUpdatingPin || newPinValue.length !== 4}
                          className="rounded-xl px-5 text-xs font-bold gap-2"
                        >
                          {isUpdatingPin ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          <span>{isUpdatingPin ? "Guardando..." : "Guardar PIN"}</span>
                        </Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
            </Dialog>
          </div>
          )
}
