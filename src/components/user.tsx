"use client"

import { logout } from "@/auth/actions"
import { Company } from "@/types/user"
import { User } from "@supabase/supabase-js"
import { LogOut, User2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface UserMenuProps {
  user: User | null
  company: Company | null
}

export default function UserMenu({ user, company }: UserMenuProps) {
  const dropdown = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdown.current && !dropdown.current.contains(event.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdown}>
      <button
        className="flex items-center gap-3 cursor-pointer p-2"
        aria-label="Menu do usuário"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <div className="text-right hidden lg:block leading-tight">
          <p className="font-semibold text-sm">{company?.business_name}</p>
          <p className="text-xs text-gray-500">{user?.email || 'Bem-vindo...'}</p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
          <User2 className="w-5 h-5 text-white" />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 z-50 p-3 rounded-xl text-sm border border-surface bg-light">
          <form action={logout}>
            <button className="w-full flex items-center gap-2 text-accent" aria-label="Sair">
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair</span>
            </button>
          </form>
        </div>
      )}
    </div >
  )
}