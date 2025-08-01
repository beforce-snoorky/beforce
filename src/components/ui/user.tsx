"use client"

import { useAuth } from "@/hooks/useAuth"
import { getSupabaseClient } from "@/utils/supabase/client"
import { Brain, Building2, LogOut, Receipt, User2, Users2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function UserMenu() {
  const supabaseClient = getSupabaseClient()
  const { user, company, loading, isAdmin } = useAuth()
  const router = useRouter()

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading) return

    if (!company || !user) router.replace("/")
  }, [user, company, loading, router])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    router.push("/")
  }

  if (loading) return null
  if (!company || !user) return null

  console.log(company)

  return (
    <div className="relative" ref={dropdown}>
      <button className="flex items-center gap-3 cursor-pointer" aria-label="Menu do usuário" onClick={() => setShowDropdown((prev) => !prev)}>
        <div className="text-right leading-tight">
          <p className="font-semibold text-sm">{company.business_name}</p>
          <p className="text-[10px] md:text-xs text-gray-500">{user.email}</p>
        </div>
        {company.logo ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-surface">
            <Image
              src={company.logo}
              alt={`${company.business_name} logo`}
              width={28}
              height={28}
              style={{ height: "auto" }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
            <User2 className="w-5 h-5 text-white" />
          </div>
        )}

      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 z-50 p-3 rounded-xl text-sm border border-surface bg-light">
          <Link href="/dashboard/billing" className="flex items-center py-1 gap-2">
            <Receipt className="w-4 h-4" />
            <span>Boletos</span>
          </Link>

          {isAdmin && (
            <>
              <Link href="/dashboard/companies" className="flex items-center py-1 gap-2">
                <Building2 className="w-4 h-4" />
                <span>Empresas</span>
              </Link>
              <Link href="/dashboard/users" className="flex items-center py-1 gap-2">
                <Users2 className="w-4 h-4" />
                <span>Usuários</span>
              </Link>
              <Link href="/dashboard/chatbot" className="flex items-center py-1 gap-2">
                <Brain className="w-4 h-4" />
                <span>Chatbot</span>
              </Link>
            </>
          )}
          <form action={handleLogout}>
            <button className="w-full flex items-center gap-2 mt-2 pt-2 border-t border-surface text-accent" aria-label="Sair">
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
