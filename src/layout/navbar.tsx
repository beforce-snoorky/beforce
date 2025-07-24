"use client"

import { NavButton } from "@/components/navigation/navButton"
import { NavList } from "@/components/navigation/navList"
import { NavItemProps } from "@/types/navigation"
import { LayoutDashboard, Headphones, Globe2, Users, Building2, UserCog, SlidersHorizontal, Search, UserPlus } from "lucide-react"
import { useState } from "react"

const userNavigation: NavItemProps[] = [
  { icon: <LayoutDashboard className="w-4.5 h-4.5" />, name: "Dashboard", url: "/dashboard" },
  { icon: <Headphones className="w-4.5 h-4.5" />, name: "Atendimento", url: "/dashboard/report" },
  { icon: <Globe2 className="w-4.5 h-4.5" />, name: "Website", url: "/dashboard/website" },
  { icon: <Users className="w-4.5 h-4.5" />, name: "Equipe", url: "/dashboard/team" },
]

export function Navbar({ pathname, isAdmin }: { pathname: string, isAdmin: boolean }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(false)

  const shouldShowFilter = ["/dashboard", "/dashboard/report", "/dashboard/website"].includes(pathname)
  const shouldShowSearch = ["/dashboard/team", "/dashboard/companies"].includes(pathname)
  const shouldShowAddUser = ["/dashboard/users"].includes(pathname)

  return (
    <>
      <aside className="xl:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1 text-sm">
        <div className="flex items-center justify-between p-1 rounded-full shadow-sm border border-surface bg-light">
          <NavList items={userNavigation} pathname={pathname} isMobile />
        </div>

        {shouldShowFilter && (
          <NavButton
            onClick={() => setIsFilterOpen(true)}
            label="Filtrar"
            icon={<SlidersHorizontal className="w-4.5 h-4.5" />}
          />
        )}
        {shouldShowSearch && (
          <NavButton
            onClick={() => setIsSearchOpen(true)}
            label="Buscar"
            icon={<Search className="w-4.5 h-4.5" />}
          />
        )}
        {shouldShowAddUser && (
          <NavButton
            onClick={() => setIsUsersOpen(true)}
            label="Adicionar usuário"
            icon={<UserPlus className="w-4.5 h-4.5" />}
          />
        )}
      </aside>
    </>
  )
}