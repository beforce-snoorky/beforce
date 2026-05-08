import type { LucideIcon } from "lucide-react"
import { BotMessageSquare, CloudCog, Globe2, Kanban } from "lucide-react"
import { LayoutDashboard, Mails, MonitorSmartphone, Sparkles } from "lucide-react"
import { sidebarMainServiceOrder } from "./services"
import type { SidebarNavigationItem } from "@/types/sidebar"
import { routing } from "@/i18n/routing"

export const serviceIcons: Record<(typeof sidebarMainServiceOrder)[number], LucideIcon> = {
	dashboard: LayoutDashboard,
	digisac: BotMessageSquare,
	website: Globe2,
	crm: Kanban,
	server: CloudCog,
	marketing: MonitorSmartphone,
	email: Mails,
	ia: Sparkles,
}

export function resolveActiveSidebarItem(pathname: string): SidebarNavigationItem["id"] {
	const normalizedPathname = stripLocalePrefix(pathname)

	if (normalizedPathname.startsWith("/digisac")) return "digisac"
	if (normalizedPathname.startsWith("/website")) return "website"
	if (normalizedPathname.startsWith("/crm")) return "crm"
	if (normalizedPathname.startsWith("/server")) return "server"
	if (normalizedPathname.startsWith("/marketing")) return "marketing"
	if (normalizedPathname.startsWith("/email")) return "email"
	if (normalizedPathname.startsWith("/ia")) return "ia"
	if (normalizedPathname.startsWith("/settings")) return "settings"
	if (normalizedPathname.startsWith("/resource")) return "resource"

	return "dashboard"
}

function stripLocalePrefix(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean)
	if (!segments.length) return "/"

	if (routing.locales.includes(segments[0] as (typeof routing.locales)[number])) {
		const withoutLocale = segments.slice(1).join("/")
		return withoutLocale ? `/${withoutLocale}` : "/"
	}

	return pathname
}
