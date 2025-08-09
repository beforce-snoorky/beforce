"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

export function SolutionsButton({ item }: { item: string }) {
  const { company } = useAuth()

  if (!company) return null

  const active = {
    has_digisac: company.has_digisac ?? false,
    has_website: company.has_website ?? false,
    has_email_corporate: company.has_email_corporate ?? false,
    has_cloud_server: company.has_cloud_server ?? false,
    has_management_system: company.has_management_system ?? false,
    has_ia: company.has_ia ?? false,
    has_marketing: company.has_marketing ?? false,
  }

  const isActive = active[item as keyof typeof active]

  return isActive ? (
    <div className="relative flex items-center">
      <div className="w-10 h-6 rounded-full opacity-50 bg-emerald-400" />
      <div className="absolute left-5 w-4 h-4 rounded-full shadow bg-light" />
    </div>
  ) : (
    <Link href="https://api.whatsapp.com/send?phone=551530420727" className="px-2 py-1.5 rounded-lg text-xs border border-accent text-accent hover:bg-accent hover:text-light">
      Contratar
    </Link>
  )
}