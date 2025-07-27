"use client"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Company } from "@/types/company"
import { Globe2, Headphones, LayoutDashboard, MonitorSmartphone, Server, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"

export type NavItemProps = {
  icon: React.ReactNode
  name: string
  url: string
  visible: boolean
}

export function NavBar({ company }: { company: Company }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 1280px)")

  const shouldShowFilter = ["/dashboard/support", "/dashboard/analytics"].includes(pathname)

  const routes: NavItemProps[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, name: "Painel", url: "/dashboard", visible: true },
    { icon: <Headphones className="w-5 h-5" />, name: "WhatsApp", url: "/dashboard/support", visible: company.has_whatsapp },
    { icon: <Globe2 className="w-5 h-5" />, name: "Website", url: "/dashboard/analytics", visible: company.has_website },
    { icon: <Server className="w-5 h-5" />, name: "Sistemas", url: "/dashboard/systems", visible: company.has_management_system },
    { icon: <MonitorSmartphone className="w-5 h-5" />, name: "Marketing", url: "/dashboard/marketing", visible: company.has_mkt_digital },
  ]

  if (!isMobile) return null

  return (
    <>
      <Toaster position="bottom-center" />

      <aside className="xl:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 min-w-sm w-full flex items-center gap-1 text-sm">
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
                  ${isActive && ("bg-accent text-light")} ${!item.visible && ("cursor-not-allowed bg-gray-200 text-gray-400 mx-1")}
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

        {shouldShowFilter && (
          <button className="py-3 px-3 rounded-full shadow-sm border border-surface bg-accent text-light">
            <span className="w-4.5 h-4.5" aria-label="Filtrar">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </span>
          </button>
        )}
      </aside>
    </>
  )
}