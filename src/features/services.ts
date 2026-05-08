import type { Service } from "@/types/service"

export function resolveServiceCode(serviceCode: string): Service | null {
	const normalizedCode = serviceCode.trim().toLowerCase()

	if (Object.hasOwn(serviceRouteByCode, normalizedCode)) return normalizedCode as Service

	return serviceCodeAliases[normalizedCode] ?? null
}

export const serviceRouteByCode: Record<Service, `/${string}`> = {
	dashboard: "/dashboard",
	digisac: "/digisac",
	website: "/website",
	server: "/server",
	marketing: "/marketing",
	email: "/email",
	crm: "/crm",
	ia: "/ia",
}

export const sidebarMainServiceOrder: readonly Service[] = [
	"dashboard",
	"digisac",
	"website",
	"server",
	"marketing",
	"email",
	"crm",
	"ia",
]

const serviceCodeAliases: Partial<Record<string, Service>> = { servidor: "server" }
