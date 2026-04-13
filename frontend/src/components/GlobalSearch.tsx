"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  Search,
  Command as CommandIcon,
  Settings,
  CreditCard,
  User,
  Zap,
} from "lucide-react"

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

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev: boolean) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="¿Qué estás buscando?" />
      <CommandList>
        <CommandEmpty>No se han encontrado resultados.</CommandEmpty>
        <CommandGroup heading="Accesos Directos">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/calendar"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Ir a Agenda</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/clients"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Ir a Clientes</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/services"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Ir a Servicios</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/vouchers"))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Ver Bonos y Packs</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Directorio de Clientes">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/clients?search=Juan+Bares"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Juan Bares</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/clients?search=Maria+Gomez"))}>
            <User className="mr-2 h-4 w-4" />
            <span>María Gómez</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/clients?search=Carlos+Ruiz"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Carlos Ruiz</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Gestión de Contenidos">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/media"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Galería de Medios</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/cms"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Editor Web (CMS)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ajustes y Sistema">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ajustes Generales</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
