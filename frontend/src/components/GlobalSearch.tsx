"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  Search,
  Settings,
  CreditCard,
  User,
  Zap,
  Loader2,
  ShieldCheck,
  Receipt,
  FileText,
  MapPin,
  Clock,
  Plus,
  Ticket,
  UserCheck,
  Sparkles,
  Command as CommandIcon,
  ArrowRight
} from "lucide-react"

import { useAuthRole } from "@/hooks/useAuthRole"
import { useLanguage } from "@/app/contexts/LanguageContext"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter()
  const { t } = useLanguage()
  const { role } = useAuthRole()
  const currentRole = role?.toLowerCase()
  const isEspecialista = currentRole === 'especialista'
  const isRecepcion = currentRole === 'recepción' || currentRole === 'recepcion'
  const isAdmin = currentRole === 'administrador' || currentRole === 'admin'

  const [clients, setClients] = React.useState<Client[]>([])
  const [loadingClients, setLoadingClients] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  // Atajo de teclado global: ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  // Limpiar búsqueda al cerrar
  React.useEffect(() => {
    if (!open) setSearchQuery('')
  }, [open])

  // Cargar clientes con debounce al escribir
  React.useEffect(() => {
    if (!open || searchQuery.trim().length === 0) {
      setClients([])
      return
    }

    const timer = setTimeout(() => {
      setLoadingClients(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`)
        .then(res => res.ok ? res.json() : [])
        .then((data: Client[]) => setClients(
          data.filter((c: Client) => 
            c.name.toLowerCase().trim() !== 'cliente de contado' &&
            c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
          )
        ))
        .catch(() => setClients([]))
        .finally(() => setLoadingClients(false))
    }, 200)

    return () => clearTimeout(timer)
  }, [open, searchQuery])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="relative">
        <CommandInput 
          placeholder={t('search.placeholder') || "Buscar pacientes, módulos o teclear una acción..."} 
          onValueChange={setSearchQuery} 
          className="text-sm font-sans"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 rounded border border-stone-200">ESC</kbd>
        </div>
      </div>

      <CommandList className="py-2">
        <CommandEmpty className="py-10 text-center text-sm font-medium text-stone-400">
          {searchQuery ? `No encontramos resultados para "${searchQuery}"` : "Escribe algo para buscar..."}
        </CommandEmpty>

        {/* ── 1. ACCIONES RÁPIDAS ── */}
        <CommandGroup heading="Acciones Frecuentes">
          <CommandItem 
            className="cursor-pointer gap-3 py-3" 
            onSelect={() => runCommand(() => router.push("/dashboard/calendar"))}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-stone-800 text-sm">Agendar Cita en Calendario</span>
              <span className="text-[11px] text-stone-400">Abrir cuadrícula interactiva de turnos</span>
            </div>
            <CommandShortcut className="text-[10px]">C</CommandShortcut>
          </CommandItem>

          {!isEspecialista && (
            <CommandItem 
              className="cursor-pointer gap-3 py-3" 
              onSelect={() => runCommand(() => router.push("/dashboard/pos"))}
            >
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-[#bf9b30] flex items-center justify-center shrink-0 border border-[#D4AF37]/20">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-800 text-sm">Cobrar en TPV / Caja Rápida</span>
                <span className="text-[11px] text-stone-400">Ticket express, cobro por Bizum o tarjeta</span>
              </div>
              <CommandShortcut className="text-[10px]">T</CommandShortcut>
            </CommandItem>
          )}

          <CommandItem 
            className="cursor-pointer gap-3 py-3" 
            onSelect={() => runCommand(() => router.push("/dashboard/clients"))}
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-stone-800 text-sm">Directorio de Pacientes</span>
              <span className="text-[11px] text-stone-400">Crear o consultar fichas médicas</span>
            </div>
            <CommandShortcut className="text-[10px]">P</CommandShortcut>
          </CommandItem>

          {!isEspecialista && (
            <CommandItem 
              className="cursor-pointer gap-3 py-3" 
              onSelect={() => runCommand(() => router.push("/dashboard/vouchers"))}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Ticket className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-800 text-sm">Emitir Bono / Pack de Sesiones</span>
                <span className="text-[11px] text-stone-400">Asignar tratamientos multisesión</span>
              </div>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* ── 2. NAVEGACIÓN GENERAL ── */}
        <CommandGroup heading="Módulos del Sistema">
          <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span>Inicio (Dashboard)</span>
          </CommandItem>

          {!isEspecialista && (
            <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/invoices"))}>
              <FileText className="h-4 w-4 text-stone-500" />
              <span>Facturas & Recibos</span>
            </CommandItem>
          )}

          {isAdmin && (
            <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/services"))}>
              <Zap className="h-4 w-4 text-stone-500" />
              <span>Servicios & Catálogo</span>
            </CommandItem>
          )}

          <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/my-schedule"))}>
            <Clock className="h-4 w-4 text-stone-500" />
            <span>Mi Horario & Turnos</span>
          </CommandItem>

          {isAdmin && (
            <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/locations"))}>
              <MapPin className="h-4 w-4 text-stone-500" />
              <span>Sedes & Clínicas</span>
            </CommandItem>
          )}

          {isAdmin && (
            <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/team"))}>
              <ShieldCheck className="h-4 w-4 text-stone-500" />
              <span>Equipo & Especialistas</span>
            </CommandItem>
          )}

          {isAdmin && (
            <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
              <Settings className="h-4 w-4 text-stone-500" />
              <span>Ajustes Generales</span>
            </CommandItem>
          )}

          <CommandItem className="cursor-pointer gap-2.5" onSelect={() => runCommand(() => router.push("/dashboard/profile"))}>
            <UserCheck className="h-4 w-4 text-stone-500" />
            <span>Mi Perfil Digital</span>
          </CommandItem>
        </CommandGroup>

        {/* ── 3. CLIENTES FILTRADOS EN TIEMPO REAL ── */}
        {searchQuery.trim().length > 0 && (
          loadingClients ? (
            <>
              <CommandSeparator className="my-2" />
              <CommandGroup heading="Pacientes">
                <CommandItem disabled className="gap-2.5 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                  <span className="text-stone-400">Buscando en la base de pacientes...</span>
                </CommandItem>
              </CommandGroup>
            </>
          ) : clients.length > 0 ? (
            <>
              <CommandSeparator className="my-2" />
              <CommandGroup heading={`Pacientes Encontrados (${clients.length})`}>
                {clients.slice(0, 6).map((client) => {
                  const initials = client.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(w => w[0].toUpperCase())
                    .join('') || 'CL';

                  return (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      className="cursor-pointer gap-3 py-2.5"
                      onSelect={() => runCommand(() => router.push(`/dashboard/clients/${client.id}`))}
                    >
                      <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-stone-900 text-sm truncate">{client.name}</span>
                        {(client.phone || client.email) && (
                          <span className="text-xs text-stone-400 truncate">{client.phone || client.email}</span>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-stone-300 ml-auto shrink-0" />
                    </CommandItem>
                  )
                })}
                {clients.length > 6 && (
                  <CommandItem 
                    className="cursor-pointer text-stone-500 font-semibold"
                    onSelect={() => runCommand(() => router.push(`/dashboard/clients?search=${encodeURIComponent(searchQuery)}`))}
                  >
                    <Search className="mr-2 h-4 w-4 text-[#D4AF37]" />
                    <span>Ver los {clients.length - 6} pacientes restantes en Directorio</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          ) : null
        )}
      </CommandList>

      {/* ── FOOTER DE AYUDA DE TECLADO ── */}
      <div className="border-t border-stone-100 px-4 py-2.5 bg-stone-50/60 flex items-center justify-between text-[11px] text-stone-400 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white rounded border border-stone-200 text-stone-600 shadow-2xs">↑↓</kbd> Navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white rounded border border-stone-200 text-stone-600 shadow-2xs">↵</kbd> Abrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white rounded border border-stone-200 text-stone-600 shadow-2xs">ESC</kbd> Cerrar
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#b08e23] font-semibold">
          <CommandIcon size={11} /> ProBookia Spotlight
        </div>
      </div>
    </CommandDialog>
  )
}
