"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getInvitationDetails, acceptTeamInvitation, rejectTeamInvitation } from "@/app/actions/team";
import { ShieldCheck, UserCheck, CheckCircle2, Loader2, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AceptarInvitacionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tenantId = searchParams.get("tenant") || "";
  const inviteEmail = (searchParams.get("email") || "").toLowerCase().trim();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [invitationInfo, setInvitationInfo] = useState<{
    businessName: string;
    logoUrl: string | null;
    role: string | null;
    status: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!tenantId) {
        setErrorMsg("El enlace de invitación no contiene el identificador del negocio.");
        setLoading(false);
        return;
      }

      // 1. Obtener la sesión actual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (isMounted) setSession(currentSession);

      // 2. Obtener detalles del negocio e invitación
      const info = await getInvitationDetails(tenantId, inviteEmail || currentSession?.user?.email);
      if (isMounted) {
        if (!info.success) {
          setErrorMsg(info.error || "No se pudo cargar la información de la invitación.");
        } else {
          setInvitationInfo({
            businessName: info.businessName || "Negocio",
            logoUrl: info.logoUrl || null,
            role: info.role || null,
            status: info.status || null,
          });
          if (info.status === "Activo" || info.status === "active") {
            toast.info("Ya eres miembro activo de este equipo.");
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          }
        }
        setLoading(false);
      }
    }

    init();

    // Escuchar cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) setSession(newSession);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [tenantId, inviteEmail, router]);

  const handleAccept = async () => {
    if (!session?.access_token) {
      toast.error("Por favor inicia sesión para aceptar la invitación.");
      return;
    }

    setActionLoading(true);
    const res = await acceptTeamInvitation(tenantId, session.access_token);
    setActionLoading(false);

    if (res.success) {
      setAcceptedSuccess(true);
      toast.success("¡Invitación aceptada con éxito! Bienvenido al equipo.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      toast.error(res.error || "Error al aceptar la invitación.");
    }
  };

  const handleReject = async () => {
    if (!session?.access_token) return;

    setActionLoading(true);
    const res = await rejectTeamInvitation(tenantId, session.access_token);
    setActionLoading(false);

    if (res.success) {
      toast.info("Has declinado la invitación.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      toast.error(res.error || "Error al rechazar la invitación.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center gap-4 text-center max-w-md w-full">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <p className="text-stone-500 font-medium text-sm">Validando invitación de equipo...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center gap-4 text-center max-w-md w-full animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800">Invitación No Válida</h2>
          <p className="text-stone-500 text-sm leading-relaxed">{errorMsg}</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors"
          >
            Ir a la página principal
          </Link>
        </div>
      </div>
    );
  }

  if (acceptedSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center gap-4 text-center max-w-md w-full animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900">¡Invitación Aceptada!</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Tu perfil ha sido activado correctamente en <strong>{invitationInfo?.businessName}</strong>. Redirigiendo a tu nuevo panel de control...
          </p>
          <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin mt-2" />
        </div>
      </div>
    );
  }

  const currentUserEmail = session?.user?.email?.toLowerCase();
  const isEmailMismatch = inviteEmail && currentUserEmail && inviteEmail !== currentUserEmail;

  return (
    <div className="min-h-screen bg-[#fcfaf9] flex flex-col items-center justify-center p-4 selection:bg-[#d4af37]/20">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] border border-stone-100 shadow-xl overflow-hidden p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        {/* Encabezado con Icono / Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-stone-50 border border-stone-100 shadow-inner flex items-center justify-center text-[#d4af37]">
            <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
        </div>

        {/* Textos Principales */}
        <span className="text-[11px] font-black uppercase tracking-widest text-[#d4af37] block mb-2">
          Invitación de Equipo ProBookia
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-3">
          {invitationInfo?.businessName || "Negocio"}
        </h1>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-6">
          Te ha invitado formalmente a formar parte de su equipo profesional de gestión y agenda.
        </p>

        {/* Rol Propuesto */}
        {invitationInfo?.role && (
          <div className="bg-[#f7f7f5] rounded-2xl p-4 border border-stone-100/80 mb-8 inline-block w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">
              Rol Asignado
            </span>
            <span className="text-lg font-bold text-stone-800">
              {invitationInfo.role}
            </span>
          </div>
        )}

        {/* Estado según sesión */}
        {!session ? (
          // Caso 1: Usuario no ha iniciado sesión
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl text-left">
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Para confirmar y aceptar esta invitación, por favor inicia sesión con tu cuenta de ProBookia{inviteEmail ? ` (${inviteEmail})` : ""}.
              </p>
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/aceptar-invitacion")}`}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <LogIn size={16} />
              Iniciar Sesión para Aceptar
            </Link>
          </div>
        ) : isEmailMismatch ? (
          // Caso 2: Sesión iniciada con un correo diferente al invitado
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-left">
              <p className="text-xs text-amber-900 leading-relaxed">
                Has iniciado sesión con <strong>{currentUserEmail}</strong>, pero esta invitación fue enviada a <strong>{inviteEmail}</strong>.
              </p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.refresh();
              }}
              className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all"
            >
              Cambiar de Cuenta
            </button>
          </div>
        ) : (
          // Caso 3: Usuario autenticado correctamente con el correo invitado
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white py-4 px-6 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck size={18} />}
              {actionLoading ? "Aceptando..." : "Aceptar Invitación y Entrar"}
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-stone-400 hover:text-red-600 transition-colors"
            >
              Rechazar Invitación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
