"use client"

import { useAuth } from "@/hooks/useAuth"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Globe2, Headphones, LayoutDashboard, LockKeyholeIcon, MonitorSmartphone, Server } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"

export type NavItemProps = {
  icon: React.ReactNode
  name: string
  url: string
  visible: boolean
}

export function SideBar() {
  const { company } = useAuth()
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(max-width: 1279px)")

  if (isDesktop) return null

  const routes: NavItemProps[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, name: "Painel", url: "/dashboard", visible: true },
    { icon: <Headphones className="w-5 h-5" />, name: "Digisac", url: "/dashboard/digisac", visible: company?.has_digisac || false },
    { icon: <Globe2 className="w-5 h-5" />, name: "Website", url: "/dashboard/analytics", visible: company?.has_website || false },
    { icon: <Server className="w-5 h-5" />, name: "Sistemas", url: "/dashboard/systems", visible: company?.has_management_system || false },
    { icon: <MonitorSmartphone className="w-5 h-5" />, name: "Marketing", url: "/dashboard/marketing", visible: company?.has_marketing || false },
  ]

  return (
    <>
      <Toaster position="bottom-center" />

      <aside className="max-xl:hidden flex flex-col p-4 max-w-56 border-r border-surface bg-light">
        <nav className="flex flex-col gap-2">
          <span className="text-xs font-semibold pb-1 pt-4 text-dark/75">Geral</span>
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
                href={item.url}
                onClick={handleClick}
                className={`flex items-center gap-1 w-full rounded-full text-sm
                  ${isActive && ("bg-accent")} ${!item.visible && ("cursor-not-allowed")}`}
                tabIndex={item.visible ? 0 : -1}
                aria-disabled={!item.visible}
                aria-label={item.name}
              >
                <span className={`p-2 m-1 rounded-full text-accent ${isActive ? "bg-light" : "bg-accent/15"} ${!item.visible && ("bg-gray-200 text-gray-400")}`}>{item.icon}</span>
                <span className={`${isActive ? "text-light" : "text-dark"} ${!item.visible && ("text-gray-400")}`}>{item.name}</span>
                {!item.visible && <span className="w-full text-accent"><LockKeyholeIcon className="place-self-end w-4 h-4" /></span>}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto">
          <div className="p-2 rounded-xl flex flex-col items-center space-y-2 text-sm text-center bg-green-200">
            <div className="-mt-8 p-2 rounded-full outline-4 outline-light bg-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4.5 h-4.5 text-green-600" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>
            </div>
            <span className="font-semibold">Precisa de ajuda?</span>
            <p>Fale com nosso suporte pelo WhatsApp!</p>
            <Link
              href="https://api.whatsapp.com/send?phone=551530420727"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-sm font-medium py-1.5 rounded-lg bg-green-600 text-light"
            >
              Falar com Suporte
            </Link>
          </div>
          <hr className="mt-2 border-t border-surface" />
          <p className="text-center pt-2 text-xs text-dark/75">© {new Date().getFullYear()} Beforce</p>
        </div>
      </aside>
    </>
  )
}