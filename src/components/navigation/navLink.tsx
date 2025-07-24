import { NavLinkProps } from "@/types/navigation"
import Link from "next/link"

export function NavLink({ item, pathname, isMobile = false }: NavLinkProps) {
  const isActive = pathname === item.url

  const baseClasses = isMobile
    ? `relative z-10 gap-2 py-2 px-3 font-medium ${isActive && "bg-accent text-light"}`
    : `gap-1 w-full text-sm ${isActive && "bg-accent"}`

  const iconWrapper = isMobile ? null : (
    <span className={`p-2 m-1 rounded-full text-accent ${isActive ? "bg-light" : "bg-accent/15"}`}>
      {item.icon}
    </span>
  )

  return (
    <Link href={item.url} className={`flex items-center rounded-full ${baseClasses}`}>
      {isMobile ? item.icon : iconWrapper}
      <span className={isMobile && !isActive ? "sr-only" : isActive ? "text-light" : "text-dark"}>
        {item.name}
      </span>
    </Link>
  )
}