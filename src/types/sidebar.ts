import type { LucideIcon } from "lucide-react"
import type { UserCompany } from "./companies"
import type { Service } from "./service"

export type SidebarProps = {
	locale: string
	companies: UserCompany[]
	activeCompanyId: string | null
	enabledServices: Service[]
}

export type SidebarNavigationItem = {
	id: SidebarRouteId
	label: string
	icon: LucideIcon
	href: string
	enabled?: boolean
	active?: boolean
	locale?: string
	collapse?: boolean
	onClick?: () => void
}

type SidebarRouteId = Service | "settings" | "resource" | "design" | "colors" | "typography" | "builder"

export type CompanySwitcherProps = { locale: string; companies: UserCompany[]; activeCompanyId: string | null; collapse: boolean }

export type LocaleSwitcherProps = { href: string; collapse?: boolean; variant: "primary" | "secondary" }

export type ServiceMenuItem = { id: Service; label: string; href: `/${string}`; enabled: boolean }
