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
} from "lucide-react"

import { useAuthRole } from "@/hooks/useAuthRole"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface Client {
  id: string;
  name: string;
}

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter()
  const { role } = useAuthRole()
  const currentRole = role?.toLowerCase()
  const isEspecialista = currentRole === 'especialista'
  const isRecepcion = currentRole === 'recepción' || currentRole === 'recepcion'
  const isAdmin = currentRole === 'administrador' || currentRole === 'admin'

  const [clients, setClients] = React.useState<Client[]>([])
  const [loadingClients, setLoadingClients] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  // NOTA: El atajo de teclado Ctrl+K ha sido eliminado de aquí para evitar
  // colisiones de estado si el componente se monta en Header y Footer simultáneamente.
  // Ahora debe ser gestionado por el componente padre (DashboardHeader).

  // Limpiar búsqueda al cerrar
  React.useEffect(() => {
    if (!open) setSearchQuery('')
  }, [open])

  // Cargar clientes cuando el usuario empieza a escribir
  React.useEffect(() => {
    if (!open || searchQuery.length === 0) {
      setClients([])
      return
    }
    setLoadingClients(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/`)
      .then(res => res.ok ? res.json() : [])
      .then((data: Client[]) => setClients(
        data.filter((c: Client) => c.name.toLowerCase().trim() !== 'cliente de contado')
      ))
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false))
  }, [open, searchQuery.length > 0])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="¿Qué estás buscando?" onValueChange={setSearchQuery} />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

        {/* Accesos Directos */}
        <CommandGroup heading="Accesos Directos">
          <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/calendar"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Ir a Agenda</span>
          </CommandItem>
          <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/clients"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Ir a Clientes</span>
          </CommandItem>
          
          {/* Servicios y Bonos filtrados */}
          {isAdmin && (
            <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/services"))}>
              <Zap className="mr-2 h-4 w-4" />
              <span>Ir a Servicios</span>
            </CommandItem>
          )}
          
          {(!isEspecialista) && (
            <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/vouchers"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Ver Bonos y Packs</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Gestión de Contenidos: Solo Admin (Ni Especialista ni Recepción) */}
        {isAdmin && (
          <>
            <CommandGroup heading="Gestión de Contenidos">
              <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/media"))}>
                <Search className="mr-2 h-4 w-4" />
                <span>Galería de Medios</span>
              </CommandItem>
              
              <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/cms"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Editor Web (CMS)</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Ajustes: Solo Admin */}
        {isAdmin && (
          <>
            <CommandGroup heading="Ajustes y Sistema">
              <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/team"))}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Gestionar Equipo</span>
              </CommandItem>
              <CommandItem className="cursor-pointer" onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ajustes Generales</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Clientes — solo visibles si hay búsqueda activa */}
        {searchQuery.length > 0 && (
          loadingClients ? (
            <CommandGroup heading="Clientes">
              <CommandItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-stone-400">Buscando clientes...</span>
              </CommandItem>
            </CommandGroup>
          ) : clients.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading={`Clientes (${clients.length})`}>
                {clients.slice(0, 8).map((client) => {
                  const normalized = client.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                  return (
                    <CommandItem
                      key={client.id}
                      value={normalized}
                      className="cursor-pointer"
                      onSelect={() => runCommand(() => router.push(`/dashboard/clients?search=${encodeURIComponent(client.name)}`))}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{client.name}</span>
                    </CommandItem>
                  )
                })}
                {clients.length > 8 && (
                  <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/clients"))}>
                    <Users className="mr-2 h-4 w-4 text-stone-400" />
                    <span className="text-stone-400 text-sm">Ver los {clients.length - 8} restantes...</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          ) : null
        )}
      </CommandList>
    </CommandDialog>
  )
}
