"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthRole } from "@/hooks/useAuthRole"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useLanguage } from "@/app/contexts/LanguageContext"
import RosteringManager from "@/components/RosteringManager"

export default function MySchedulePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { role, userName, loading: loadingRole } = useAuthRole()
  const [userId, setUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.id) setUserId(user.id)
      } catch (e) {
        console.error("Error parsing user in my-schedule page:", e)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!loadingRole) {
      const currentRole = role?.toLowerCase()
      if (currentRole !== 'especialista' && currentRole !== 'administrador' && currentRole !== 'admin') {
        toast.error(t('dashboard.my_schedule.access_denied'))
        router.replace('/dashboard')
      }
    }
  }, [role, loadingRole, router, t])

  if (loadingRole || !userId || !userName) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-[60vh] animate-in fade-in duration-500">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="w-48 h-6 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="space-y-2">
        <h1 className="text-5xl font-serif font-semibold text-stone-800 tracking-tight">
          {t('dashboard.my_schedule.title')}
        </h1>
        <p className="text-stone-400 font-medium max-w-lg">
          {t('dashboard.my_schedule.subtitle')}
        </p>
      </div>

      <div className="bg-white border border-stone-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <RosteringManager
          staffId={userId}
          staffName={userName}
        />
      </div>
    </div>
  )
}
