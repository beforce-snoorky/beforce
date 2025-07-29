"use client"

import { useAuth } from "@/hooks/useAuth"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function SolutionsButton({ item }: { item: string }) {
  const { company } = useAuth()

  if (!company) return null

  const active = {
    digisac: company.has_digisac ?? false,
    website: company.has_website ?? false,
    email_corp: company.has_email_corporate ?? false,
    cloud_server: company.has_cloud_server ?? false,
    management_system: company.has_management_system ?? false,
    ia: company.has_ia ?? false,
    marketing: company.has_marketing ?? false,
  }

  const isActive = active[item as keyof typeof active]

  return isActive ? (
    <div className="relative flex items-center">
      <div className="w-10 h-6 rounded-full opacity-50 bg-emerald-400" />
      <div className="absolute left-5 w-4 h-4 rounded-full shadow bg-light" />
    </div>
  ) : (
    <Link href="https://api.whatsapp.com/send?phone=551530420727" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-accent text-accent hover:bg-accent hover:text-light">
      Contratar
      <ArrowRight className="w-4 h-4" />
    </Link>
  )
}
