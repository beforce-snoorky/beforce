"use client"

import { useAuth } from "@/hooks/useAuth"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Globe2, Headphones, LayoutDashboard, MonitorSmartphone, Server, SlidersHorizontal, UserPlus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { FilterModalDigisac } from "../digisac/filterModal"
import { UserFormModal } from "../users/userModal"
import { FilterModalWebsite } from "../website/filterModal"

export type NavItemProps = {
  icon: React.ReactNode
  name: string
  url: string
  visible: boolean
}

export function NavBar() {
  const { company } = useAuth()
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 1280px)")

  const [isFilterOpenDigisac, setIsFilterOpenDigisac] = useState(false)
  const [isFilterOpenWebsite, setIsFilterOpenWebsite] = useState(false)
  const [isUsersOpen, setIsUsersOpen] = useState(false)

  const shouldShowFilterDigisac = ["/analysis/digisac"].includes(pathname)
  const shouldShowFilterWebsite = ["/analysis/website"].includes(pathname)
  const shouldShowAddUser = ["/analysis/users"].includes(pathname)

  if (!isMobile) return null

  const routes: NavItemProps[] = [
    { icon: <LayoutDashboard className="size-5" />, name: "Painel", url: "/analysis", visible: true },
    { icon: <Headphones className="size-5" />, name: "Digisac", url: "/analysis/digisac", visible: company?.has_digisac || false },
    { icon: <Globe2 className="size-5" />, name: "Website", url: "/analysis/website", visible: company?.has_website || false },
    { icon: <Server className="size-5" />, name: "Sistemas", url: "/analysis/systems", visible: company?.has_management_system || false },
    { icon: <MonitorSmartphone className="size-5" />, name: "Marketing", url: "/analysis/marketing", visible: company?.has_marketing || false },
  ]

  return (
    <>
      <Toaster position="bottom-center" />

      <aside className="xl:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 min-w-sm w-full max-w-lg flex items-center gap-1 text-sm">
        <div className="flex flex-1 items-center justify-between p-1 rounded-full shadow-sm border border-surface bg-light">
          {routes.map((item, index) => {
            const isActive = pathname === item.url

            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (!item.visible) {
                e.preventDefault()
                toast("Este recurso está disponível apenas para contratantes.", { icon: "🔒" })
              }
            }

            return (
              <Link
                key={index}
                href={item.visible ? item.url : "#"}
                onClick={handleClick}
                className={`relative z-10 flex items-center justify-center grow gap-2 py-2 px-3 rounded-full font-medium
                  ${isActive && ("bg-accent text-light")} ${!item.visible && ("bg-gray-200 text-gray-400 mx-1 last:mr-0")}
                `}
                tabIndex={item.visible ? 0 : -1}
                aria-disabled={!item.visible}
                aria-label={item.name}
              >
                {item.icon}
                <span className={!isActive ? "sr-only" : ""}>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {shouldShowFilterDigisac && (
          <button onClick={() => setIsFilterOpenDigisac(true)} className="py-3 px-3 rounded-full shadow-sm border border-surface bg-accent text-light">
            <span className="w-4.5 h-4.5" aria-label="Filtrar">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </span>
          </button>
        )}

        {shouldShowFilterWebsite && (
          <button onClick={() => setIsFilterOpenWebsite(true)} className="py-3 px-3 rounded-full shadow-sm border border-surface bg-accent text-light">
            <span className="w-4.5 h-4.5" aria-label="Filtrar">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </span>
          </button>
        )}

        {shouldShowAddUser && (
          <button onClick={() => setIsUsersOpen(true)} className="py-3 px-3 rounded-full shadow-sm border border-surface bg-accent text-light">
            <span className="w-4.5 h-4.5" aria-label="Filtrar">
              <UserPlus className="w-4.5 h-4.5" />
            </span>
          </button>
        )}
      </aside>

      {isFilterOpenDigisac && <FilterModalDigisac onClose={() => setIsFilterOpenDigisac(false)} />}
      {isFilterOpenWebsite && <FilterModalWebsite onClose={() => setIsFilterOpenWebsite(false)} />}
      {isUsersOpen && (<UserFormModal mode="create" onClose={() => setIsUsersOpen(false)} onSuccess={() => setIsUsersOpen(false)} />)}
    </>
  )
}