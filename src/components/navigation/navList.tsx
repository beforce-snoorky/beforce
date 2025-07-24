import { NavListProps } from "@/types/navigation"
import { NavLink } from "./navLink"

export function NavList({ title, items, pathname, isMobile = false }: NavListProps) {
  return (
    <nav className={`flex gap-2 ${!isMobile && "flex-col"}`}>
      {title && (
        <span className="text-xs font-semibold pb-1 pt-4 text-dark/75">{title}</span>
      )}
      {items.map((item, index) => (
        <NavLink key={index} item={item} pathname={pathname} isMobile={isMobile} />
      ))}
    </nav>
  )
}