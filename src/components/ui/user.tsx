"use client"

import { useAuth } from "@/hooks/useAuth"
import { getSupabaseClient } from "@/utils/supabase/client"
import { Brain, Building2, LogOut, Receipt, User2, Users2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function UserMenu() {
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    router.push("/")
  }

  if (loading || !company || !user) return null

  return (
    <div className="relative inline-flex" ref={dropdown}>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="size-9.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none dark:text-white"
        aria-haspopup="menu"
        aria-expanded={showDropdown}
        aria-label="Dropdown"
      >
        {company.logo ? (
          <div className="relative shrink-0 size-9.5 rounded-full border border-surface overflow-hidden">
            <Image
              src={company.logo}
              alt={`${company.business_name} logo`}
              className="object-contain p-1"
              sizes="40px"
              fill
            />
          </div>
        ) : (
          <div className="flex items-center justify-center size-9.5 rounded-full bg-accent">
            <User2 className="size-5 text-white" />
          </div>
        )}
      </button>

      {showDropdown && (
        <div
          className="absolute top-full right-0 z-50 mt-2 min-w-60 shadow-md rounded-lg bg-light">
          <div className="py-3 px-5 rounded-t-lg bg-gray-50">
            <p className="text-sm text-gray-500">Logado como</p>
            <p className="text-sm font-medium truncate max-w-48 text-gray-800">{user.email}</p>
          </div>

          <div className="p-1.5 space-y-0.5">
            <Link href="/analysis/billing" className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm focus:outline-hidden text-gray-800 hover:bg-gray-100">
              <Receipt className="shrink-0 size-4" />
              Boletos
            </Link>

            {isAdmin && (
              <>
                <Link href="/analysis/companies" className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm focus:outline-hidden text-gray-800 hover:bg-gray-100">
                  <Building2 className="shrink-0 size-4" />
                  Empresas
                </Link>
                <Link href="/analysis/users" className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm focus:outline-hidden text-gray-800 hover:bg-gray-100">
                  <Users2 className="shrink-0 size-4" />
                  Usuários
                </Link>
                <Link href="/analysis/chatbot" className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm focus:outline-hidden text-gray-800 hover:bg-gray-100">
                  <Brain className="shrink-0 size-4" />
                  Chatbot
                </Link>
              </>
            )}

            <form action={handleLogout}>
              <button type="submit" className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm focus:outline-hidden text-accent hover:bg-accent-light" aria-label="Sair">
                <LogOut className="shrink-0 size-4" />
                <span className="font-medium">Sair</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}