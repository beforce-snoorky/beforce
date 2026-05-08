"use server"

import { createSupabaseServerClient } from "@/supabase/server"
import type { ActiveCompanyResult, SelectCompanyResult, UserCompany } from "@/types/companies"
import type {
	CompanyMemberCompanyRow,
	CompanyMembershipStatusRow,
	CompanyMembershipWithCompanyRow,
	CompanyServiceWithServiceRow,
} from "@/types/companies"
import { isAllowedActiveCompanyStatus, isCompanyId } from "@/utils/company"
import { requireUser } from "./auth"
import { getActiveCompanyId, setActiveCompanyId } from "@/utils/tenant"
import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { hasLocale } from "next-intl"
import type { Service } from "@/types/service"
import { resolveServiceCode } from "./services"

export async function getUserCompaniesForUser(userId: string): Promise<UserCompany[]> {
	const rows = await fetchCompanyMembershipRows(userId)
	return mapMembershipRowsToUserCompanies(rows)
}

async function fetchCompanyMembershipRows(userId: string): Promise<CompanyMemberCompanyRow[]> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("company_members")
		.select("company:companies(id, display_name, logo_url)")
		.eq("user_id", userId)
		.eq("is_active", true)

	if (error) throw new Error("Failed to load companies.")

	return data as unknown as CompanyMemberCompanyRow[]
}

function mapMembershipRowsToUserCompanies(rows: CompanyMemberCompanyRow[]): UserCompany[] {
	return rows
		.map((row) => getCompanyFromMembershipRow(row))
		.filter((company): company is NonNullable<ReturnType<typeof getCompanyFromMembershipRow>> => Boolean(company))
		.map((company) => ({ id: company.id, displayName: company.display_name, logoUrl: company.logo_url }))
		.sort((left, right) => left.displayName.localeCompare(right.displayName))
}

function getCompanyFromMembershipRow(
	row: CompanyMemberCompanyRow
): { id: string; display_name: string; logo_url: string | null } | null {
	const company = row.company

	if (!company) return null

	if (Array.isArray(company)) return company[0] ?? null

	return company
}

export async function selectCompany(companyId: string): Promise<SelectCompanyResult> {
	if (!isCompanyId(companyId)) return { ok: false }

	const user = await requireUser()
	const membership = await fetchMembershipForCompanySelection(user.id, companyId)

	if (!isCompanySelectionEligible(membership)) return { ok: false }

	await setActiveCompanyId(companyId)

	return { ok: true }
}

async function fetchMembershipForCompanySelection(userId: string, companyId: string): Promise<CompanyMembershipStatusRow | null> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("company_members")
		.select("id, is_active, company:companies(status)")
		.eq("company_id", companyId)
		.eq("user_id", userId)
		.maybeSingle<CompanyMembershipStatusRow>()

	if (error) return null

	return data
}

function isCompanySelectionEligible(membership: CompanyMembershipStatusRow | null): boolean {
	if (!membership || membership.is_active !== true) return false

	return isAllowedActiveCompanyStatus(membership.company?.status ?? null)
}

export async function getActiveCompanyForUser(userId: string): Promise<ActiveCompanyResult> {
	const activeCompanyId = await getActiveCompanyId()

	if (!activeCompanyId) return { status: "missing" }

	if (!isCompanyId(activeCompanyId)) return { status: "invalid" }

	const membership = await fetchActiveCompanyMembership(userId, activeCompanyId)

	if (!membership || !membership.company || membership.is_active !== true) return { status: "invalid" }

	if (!isAllowedActiveCompanyStatus(membership.company.status ?? null)) return { status: "invalid" }

	return mapMembershipToActiveCompanyResult(membership)
}

async function fetchActiveCompanyMembership(userId: string, companyId: string): Promise<CompanyMembershipWithCompanyRow | null> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("company_members")
		.select("id, is_active, company:companies(id, display_name, status)")
		.eq("company_id", companyId)
		.eq("user_id", userId)
		.maybeSingle<CompanyMembershipWithCompanyRow>()

	if (error) return null

	return data
}

function mapMembershipToActiveCompanyResult(membership: CompanyMembershipWithCompanyRow): ActiveCompanyResult {
	if (!membership.company) return { status: "invalid" }

	return {
		status: "valid",
		companyId: membership.company.id,
		companyName: membership.company.display_name,
		companyStatus: membership.company.status ?? null,
		membershipId: membership.id,
	}
}

export async function confirmCompanySelection(_prevState: SelectCompanyResult, formData: FormData): Promise<SelectCompanyResult> {
	const locale = resolveLocaleFromFormData(formData)
	const companyId = String(formData.get("companyId") ?? "")

	const result = await selectCompany(companyId)

	if (!result.ok) return result

	return redirect({ href: "/dashboard", locale })
}

function resolveLocaleFromFormData(formData: FormData): string {
	const requestedLocale = String(formData.get("locale") ?? routing.defaultLocale)

	if (hasLocale(routing.locales, requestedLocale)) return requestedLocale

	return routing.defaultLocale
}

export async function switchCompanyFromSidebar(formData: FormData): Promise<void> {
	const locale = resolveLocaleFromFormData(formData)
	const companyId = String(formData.get("companyId") ?? "")

	const result = await selectCompany(companyId)

	if (result.ok) redirect({ href: "/dashboard", locale })
}

export async function getActiveServicesForCompany(companyId: string): Promise<Service[]> {
	if (!isCompanyId(companyId)) return []

	const supabase = await createSupabaseServerClient()

	const { data: companyServiceRows, error: companyServiceError } = await supabase
		.from("company_services")
		.select("services(code)")
		.eq("company_id", companyId)
		.eq("is_active", true)

	if (companyServiceError) throw new Error("Failed to load active services for company.")

	const normalizedServices = (companyServiceRows as CompanyServiceWithServiceRow[] | null)
		?.flatMap((row) => {
			if (!row.services) return []
			if (Array.isArray(row.services)) return row.services
			return [row.services]
		})
		.map((serviceRow) => resolveServiceCode(serviceRow.code ?? ""))
		.filter((service): service is Service => service !== null)

	return Array.from(new Set(normalizedServices ?? []))
}
