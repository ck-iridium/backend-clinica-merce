'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Download, 
  Monitor, 
  Lock, 
  Unlock, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TerminalItem {
  id: string;
  device_name: string;
  ip_address?: string;
  browser_info?: string;
  is_active: boolean;
  last_seen_at?: string;
  created_at?: string;
}

interface TerminalSecurityManagerProps {
  initialRequireRestriction?: boolean;
}

export function TerminalSecurityManager({
  initialRequireRestriction = false
}: TerminalSecurityManagerProps) {
  const [restrictionEnabled, setRestrictionEnabled] = useState(initialRequireRestriction);
  const [toggling, setToggling] = useState(false);
  const [terminals, setTerminals] = useState<TerminalItem[]>([]);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [currentTerminal, setCurrentTerminal] = useState<any>(null);
  const [isCurrentRegistered, setIsCurrentRegistered] = useState(false);
  
  // Authorize device form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [authorizing, setAuthorizing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.tenant_id) headers['X-Tenant-ID'] = user.tenant_id;
          const token = user.access_token || user.token;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.error(e);
        }
      }
      const terminalToken = localStorage.getItem('probookia_terminal_token');
      if (terminalToken) {
        headers['X-Terminal-Token'] = terminalToken;
      }
    }
    return headers;
  };

  const loadStatusAndTerminals = async () => {
    setLoadingTerminals(true);
    try {
      const headers = getHeaders();

      // 1. Check status
      const resStatus = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/status`, {
        headers,
        cache: 'no-store'
      });
      if (resStatus.ok) {
        const dataStatus = await resStatus.json();
        setRestrictionEnabled(dataStatus.restriction_enabled);
        setIsCurrentRegistered(dataStatus.is_device_registered);
        setCurrentTerminal(dataStatus.terminal);
      }

      // 2. Load list of terminals
      const resList = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/`, {
        headers,
        cache: 'no-store'
      });
      if (resList.ok) {
        const list = await resList.json();
        setTerminals(list);
      }
    } catch (err) {
      console.error('Error cargando terminales:', err);
    } finally {
      setLoadingTerminals(false);
    }
  };

  useEffect(() => {
    loadStatusAndTerminals();

    // Default friendly name
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let os = 'PC Windows';
    if (ua.includes('Mac')) os = 'Mac';
    else if (ua.includes('iPad') || ua.includes('iPhone')) os = 'Tablet iOS';
    else if (ua.includes('Android')) os = 'Tablet Android';
    setNewDeviceName(`PC Mostrador (${os})`);

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleToggleRestriction = async () => {
    const nextState = !restrictionEnabled;

    if (nextState && terminals.length === 0 && !isCurrentRegistered) {
      toast.error('Debes registrar al menos este ordenador antes de activar la restricción obligatoria.');
      return;
    }

    setToggling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/toggle-restriction`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ enabled: nextState })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al actualizar restricción');
      }

      setRestrictionEnabled(nextState);
      toast.success(
        nextState 
          ? '🛡️ Restricción activada: Solo los ordenadores autorizados podrán acceder al panel.' 
          : '🔓 Restricción desactivada: Acceso libre con credenciales.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar restricción');
    } finally {
      setToggling(false);
    }
  };

  const handleAuthorizeThisDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) {
      toast.error('Indica un nombre para identificar este equipo');
      return;
    }

    setAuthorizing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/authorize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          device_name: newDeviceName.trim(),
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

      toast.success('¡Este ordenador ha sido homologado como Terminal del Centro!');
      setShowAddModal(false);
      await loadStatusAndTerminals();
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleRevokeTerminal = async (terminalId: string, terminalName: string) => {
    setDeletingId(terminalId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminals/${terminalId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error('Error al revocar terminal');
      }

      // Si revocamos este mismo equipo, limpiar token
      if (currentTerminal?.id === terminalId) {
        localStorage.removeItem('probookia_terminal_token');
        document.cookie = 'probookia_terminal_token=; path=/; max-age=0';
        setIsCurrentRegistered(false);
        setCurrentTerminal(null);
      }

      setTerminals(prev => prev.filter(t => t.id !== terminalId));
      toast.success(`Acceso revocado para "${terminalName}"`);
      await loadStatusAndTerminals();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo revocar el terminal');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        toast.success('¡Aplicación instalada con éxito en tu escritorio!');
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaGuide(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tarjeta Principal: Hardware Guard */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${
              restrictionEnabled 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' 
                : 'bg-stone-100 text-stone-500 border border-stone-200/60'
            }`}>
              {restrictionEnabled ? <ShieldCheck size={20} strokeWidth={2} /> : <ShieldAlert size={20} strokeWidth={2} />}
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 leading-tight">
                Protección de Terminales (Hardware Guard)
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                Bloquea el acceso al sistema fuera de los ordenadores homologados de la peluquería o centro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleRestriction}
              disabled={toggling}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                restrictionEnabled ? 'bg-[#FF6B00]' : 'bg-stone-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  restrictionEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-stone-700 min-w-20">
              {restrictionEnabled ? 'Activado' : 'Desactivado'}
            </span>
          </div>
        </div>

        {/* Estado del equipo actual */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isCurrentRegistered 
            ? 'bg-emerald-50/60 border-emerald-200/70 text-emerald-950' 
            : 'bg-amber-50/50 border-amber-200/70 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCurrentRegistered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <Laptop size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold flex items-center gap-2">
                  <span>Este ordenador:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCurrentRegistered 
                      ? 'bg-emerald-200/60 text-emerald-800' 
                      : 'bg-amber-200/60 text-amber-800'
                  }`}>
                    {isCurrentRegistered ? '✓ Homologado' : 'No Registrado'}
                  </span>
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isCurrentRegistered 
                    ? `Registrado como "${currentTerminal?.device_name || 'Terminal Mostrador'}"` 
                    : 'Si activas la restricción sin homologar este equipo, no podrás operar desde él.'}
                </p>
              </div>
            </div>

            {!isCurrentRegistered ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Homologar este PC</span>
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 size={15} />
                <span>Terminal Seguro Activo</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Inline para Homologar Este Equipo */}
        {showAddModal && (
          <form onSubmit={handleAuthorizeThisDevice} className="p-5 bg-orange-50/50 border border-orange-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
                Homologar este Navegador como Terminal Seguro
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                Nombre del Terminal (ej. Mostrador Principal, iPad Cabina...)
              </label>
              <input
                type="text"
                value={newDeviceName}
                onChange={e => setNewDeviceName(e.target.value)}
                placeholder="PC Mostrador Peluquería"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={authorizing}
                className="rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
              >
                {authorizing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Guardar y Homologar</span>
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Terminales Registrados */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Monitor size={14} />
              <span>Terminales Homologados del Centro ({terminals.length})</span>
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadStatusAndTerminals}
              disabled={loadingTerminals}
              className="h-7 text-xs text-stone-400 hover:text-stone-700 gap-1 px-2"
            >
              <RefreshCw size={11} className={loadingTerminals ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </Button>
          </div>

          {terminals.length === 0 ? (
            <div className="text-center py-6 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
              Aún no hay ningún terminal homologado. Pulsa en &quot;Homologar este PC&quot; para autorizar el primer equipo.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
              {terminals.map((t) => {
                const isCurrent = currentTerminal?.id === t.id;
                return (
                  <div key={t.id} className="p-3.5 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Laptop size={14} className="text-[#FF6B00]" />
                        <span className="font-bold text-stone-900">{t.device_name}</span>
                        {isCurrent && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            Este equipo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate max-w-md font-mono">
                        {t.browser_info || 'Navegador web'} {t.ip_address ? `· IP: ${t.ip_address}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-400">
                        {t.last_seen_at ? `Activo: ${new Date(t.last_seen_at).toLocaleDateString()}` : 'Nunca'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeTerminal(t.id, t.device_name)}
                        disabled={deletingId === t.id}
                        className="h-8 w-8 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Revocar acceso"
                      >
                        {deletingId === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Tarjeta Fase 5: Acceso Directo de Escritorio (PWA Kiosk) */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FF6B00] shadow-sm shrink-0">
              <Download size={22} strokeWidth={2} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF6B00] inline-block mb-0.5">
                Modo Escritorio & Kiosco
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">
                Instalar ProBookia en el Escritorio de este PC
              </h3>
            </div>
          </div>

          <Button
            type="button"
            onClick={handlePwaInstall}
            className="rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold gap-2 shadow-lg h-11 px-5 cursor-pointer shrink-0"
          >
            <Download size={15} />
            <span>Instalar como Aplicación</span>
          </Button>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
          Instala la aplicación en Windows o Mac para que Estela y las empleadas abran el programa con doble clic desde el Escritorio, a pantalla completa sin barras de navegación ni pestañas de navegador.
        </p>

        {showPwaGuide && (
          <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in duration-300 text-xs">
            <h5 className="font-bold text-white flex items-center gap-2">
              <Info size={15} className="text-[#FF6B00]" />
              <span>Instrucciones rápidas para Chrome o Edge en 3 pasos:</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-300 text-[11px] leading-relaxed">
              <li>Haz clic en el menú superior derecho de tu navegador <strong>(los 3 puntos ⋮)</strong>.</li>
              <li>Selecciona <strong>&quot;Guardar y compartir&quot;</strong> o <strong>&quot;Aplicaciones&quot;</strong> y pulsa en <strong>&quot;Instalar página como aplicación&quot;</strong>.</li>
              <li>Marca la casilla <strong>&quot;Crear acceso directo en el Escritorio&quot;</strong> y pulsa Aceptar.</li>
            </ol>
            <p className="text-[10px] text-stone-400 pt-1">
              Al hacer doble clic sobre el nuevo icono del Escritorio, se abrirá directamente en el Modo Mostrador TPV.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
