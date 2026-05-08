import type { CompanyStatus } from "@/types/supabase"

const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const allowedActiveCompanyStatus: readonly CompanyStatus[] = ["active", "trial"]

export function isCompanyId(value: string): boolean {
	return regexUUID.test(value)
}

export function isAllowedActiveCompanyStatus(status: CompanyStatus | null | undefined): boolean {
	if (!status) return true

	return allowedActiveCompanyStatus.includes(status)
}

export function getCompanyInitials(displayName: string): string {
	const parts = displayName.trim().split(/\s+/).filter(Boolean)

	if (!parts.length) return "CO"
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}
