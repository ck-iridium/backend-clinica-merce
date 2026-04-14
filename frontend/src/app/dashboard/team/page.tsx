"use client"

import * as React from "react"
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Stethoscope, 
  UserCircle 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeedback } from "@/app/contexts/FeedbackContext"

const teamMembers = [
  {
    id: 1,
    name: "Mercè S.",
    role: "Administrador",
    email: "merce@clinicamerce.com",
    status: "Activo",
    avatar: null,
  },
  {
    id: 2,
    name: "Dra. Laura Gil",
    role: "Especialista",
    email: "laura.gil@clinicamerce.com",
    status: "Activo",
    avatar: null,
  },
  {
    id: 3,
    name: "Carlos Ruiz",
    role: "Recepción",
    email: "carlos.r@clinicamerce.com",
    status: "Inactivo",
    avatar: null,
  },
]

export default function TeamPage() {
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulación de carga de la API
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulación de rol de usuario (cambiar a 'staff' para probar la restricción)
  const userRole = 'admin'; 

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
          <button className="flex items-center gap-2.5 bg-stone-900 hover:bg-[#d9777f] text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-stone-200 active:scale-95">
            <UserPlus size={18} strokeWidth={1.5} />
            Añadir Miembro
          </button>
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
              ) : teamMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-stone-50/50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-white shadow-sm shrink-0">
                        {member.role === 'Administrador' ? <ShieldCheck size={20} /> : 
                         member.role === 'Especialista' ? <Stethoscope size={20} /> : 
                         <UserCircle size={20} />}
                      </div>
                      <span className="font-bold text-stone-800">{member.name}</span>
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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-stone-800 transition-all border border-transparent hover:border-stone-100">
                        <Edit2 size={16} strokeWidth={1.5} />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-stone-400 hover:text-red-500 transition-all border border-transparent hover:border-stone-100">
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
    </div>
  )
}
