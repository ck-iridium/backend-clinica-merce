'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Laptop, CheckCircle2, Lock, ArrowRight, LogOut, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TerminalStatus {
  restriction_enabled: boolean;
  is_authorized: boolean;
  is_device_registered: boolean;
  terminal: {
    id: string;
    device_name: string;
    browser_info?: string;
    last_seen_at?: string;
  } | null;
}

export function TerminalGuard() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TerminalStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [authorizing, setAuthorizing] = useState(false);

  const checkStatus = async () => {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      let headers: Record<string, string> = {};
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.tenant_id) headers['X-Tenant-ID'] = user.tenant_id;
          const role = (user.role || '').toLowerCase();
          setIsAdmin(role.includes('admin'));
          setIsSuperAdmin(role.includes('super_admin') || role.includes('superadmin'));
          const token = user.access_token || user.token;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.error(e);
        }
      }

      const terminalToken = typeof window !== 'undefined' ? localStorage.getItem('probookia_terminal_token') : null;
      if (terminalToken) {
        headers['X-Terminal-Token'] = terminalToken;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/status`, {
        headers,
        cache: 'no-store'
      });

      if (res.ok) {
        const data: TerminalStatus = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('TerminalGuard: No se pudo verificar el estado del terminal', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Default friendly name based on OS/browser
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let os = 'PC';
    if (ua.includes('Win')) os = 'PC Windows';
    else if (ua.includes('Mac')) os = 'Mac';
    else if (ua.includes('iPad') || ua.includes('iPhone')) os = 'iPad / Tablet';
    else if (ua.includes('Android')) os = 'Tablet Android';
    setDeviceName(`Mostrador Principal (${os})`);
  }, []);

  const handleAuthorizeDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      toast.error('Introduce un nombre para identificar este equipo');
      return;
    }

    setAuthorizing(true);
    try {
      const userStr = localStorage.getItem('user');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.tenant_id) headers['X-Tenant-ID'] = user.tenant_id;
        const token = user.access_token || user.token;
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/authorize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          device_name: deviceName.trim(),
          browser_info: navigator.userAgent
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al autorizar terminal');
      }

      const data = await res.json();
      const rawToken = data.terminal_token;
      if (rawToken) {
        localStorage.setItem('probookia_terminal_token', rawToken);
        document.cookie = `probookia_terminal_token=${rawToken}; path=/; max-age=315360000; SameSite=Lax`;
      }

      toast.success('¡Dispositivo homologado con éxito como Terminal del Centro!');
      setShowAuthModal(false);
      await checkStatus();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión al autorizar terminal');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('supabase_token');
      window.location.href = '/login';
    }
  };

  // Si está cargando o no hay restricción, no bloqueamos nada
  if (loading || !status) return null;

  // Si la restricción no está activa o el terminal está autorizado, o es SuperAdmin global, no hay bloqueo
  if (!status.restriction_enabled || status.is_authorized || isSuperAdmin) {
    return null;
  }

  // Si llegamos aquí: RESTRICCIÓN ACTIVA Y TERMINAL NO AUTORIZADO
  return (
    <div className="fixed inset-0 z-[9999] bg-stone-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] border border-stone-200/90 shadow-2xl max-w-lg w-full p-8 text-center space-y-6 overflow-hidden relative">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={32} strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
            Hardware Guard Activo
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            Terminal No Autorizado
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
            Este centro tiene activada la protección de acceso exclusivo en local. Solo los equipos autorizados dentro del establecimiento pueden operar la plataforma.
          </p>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <Laptop size={15} className="text-[#FF6B00]" />
            <span>Identificación de este equipo:</span>
          </div>
          <p className="text-stone-500 font-mono text-[11px] truncate">
            {typeof navigator !== 'undefined' ? navigator.userAgent : 'Navegador web'}
          </p>
          <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 text-amber-800 font-medium text-[11px]">
            <Lock size={12} className="shrink-0" />
            <span>Acceso bloqueado fuera del salón para proteger la información y clientes.</span>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-3 pt-2">
            {!showAuthModal ? (
              <Button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full h-12 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs gap-2 shadow-md cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Soy la Administradora: Autorizar este Equipo Ahora</span>
              </Button>
            ) : (
              <form onSubmit={handleAuthorizeDevice} className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3 text-left animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                  Nombre descriptivo para este terminal
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder="Ej: PC Mostrador Principal, iPad Cabina..."
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  required
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 rounded-xl text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={authorizing}
                    className="flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs gap-1.5"
                  >
                    {authorizing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    <span>Confirmar y Homologar</span>
                  </Button>
                </div>
              </form>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-stone-400 hover:text-stone-700 text-xs gap-1.5"
            >
              <LogOut size={13} />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-stone-500 italic">
              Pide a la dirección del centro que autorice este ordenador desde su perfil de administración.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl text-xs font-semibold gap-1.5"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
