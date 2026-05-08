import "server-only"

import { createSupabaseServerClient } from "@/supabase/server"
import type {
	getWebsitePageDataProps,
	WebsitePageData,
	WebsitePayload,
	WebsiteReport,
	WebsiteReportByMonthParams,
	WebsiteReportRow,
} from "@/types/website"
import { isCompanyId } from "@/utils/company"
import {
	asNullableString,
	asString,
	emptyWebsitePageData,
	normalizeCityData,
	normalizeCountryData,
	normalizeDeviceData,
	normalizePagesData,
	normalizeReferenceMonth,
	normalizeSourceData,
	normalizeSystemData,
	normalizeUsersData,
	sanitizeDomain,
	unwrapPayloadRoot,
	WEBSITE_SERVICE_ID,
} from "@/utils/website"

const REFERENCE_MONTH_LIMIT = 24

export async function getWebsitePageData({ companyId, filters }: getWebsitePageDataProps): Promise<WebsitePageData> {
	if (!isCompanyId(companyId)) return emptyWebsitePageData(companyId)

	const [referenceMonths, websiteDomain] = await Promise.all([
		fetchWebsiteReferenceMonthsForCompany(companyId),
		fetchWebsiteDomainForCompany(companyId),
	])
	const appliedReferenceMonth = resolveAppliedReferenceMonth(filters.referenceMonth, referenceMonths)
	const report = appliedReferenceMonth
		? await fetchWebsiteReportByMonth({ companyId, referenceMonth: appliedReferenceMonth })
		: null

	return { companyId, websiteDomain, referenceMonths, appliedReferenceMonth, report }
}

async function fetchWebsiteReferenceMonthsForCompany(companyId: string): Promise<string[]> {
	if (!isCompanyId(companyId)) return []

	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("monthly_reports")
		.select("reference_month")
		.eq("company_id", companyId)
		.eq("service_id", WEBSITE_SERVICE_ID)
		.order("reference_month", { ascending: false })
		.limit(REFERENCE_MONTH_LIMIT)

	if (error) {
		console.error("[website] Supabase error while loading reference months", {
			companyId,
			serviceId: WEBSITE_SERVICE_ID,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		})
		return []
	}

	return getReferenceMonths((data ?? []) as Array<Pick<WebsiteReportRow, "reference_month">>)
}

function mapWebsiteReportRow(row: WebsiteReportRow): WebsiteReport | null {
	const normalizedReferenceMonth = normalizeReferenceMonth(row.reference_month)
	if (!normalizedReferenceMonth) return null

	return {
		id: asString(row.id),
		company_id: asString(row.company_id),
		service_id: asString(row.service_id),
		reference_month: normalizedReferenceMonth,
		data: normalizeWebsitePayload(row.payload),
		created_at: asNullableString(row.created_at),
	}
}

function normalizeWebsitePayload(value: unknown): WebsitePayload {
	const root = unwrapPayloadRoot(value)

	return {
		users: normalizeUsersData(root.users),
		source: normalizeSourceData(root.source),
		system: normalizeSystemData(root.system),
		devices: normalizeDeviceData(root.devices),
		pages: normalizePagesData(root.pages),
		city: normalizeCityData(root.city),
		country: normalizeCountryData(root.country),
	}
}

async function fetchWebsiteDomainForCompany(companyId: string): Promise<string | null> {
	if (!isCompanyId(companyId)) return null

	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("integrations_website")
		.select("domain")
		.eq("company_id", companyId)
		.maybeSingle<{ domain: string | null }>()

	if (error) {
		console.error("[website] Supabase error while loading company domain", {
			companyId,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		})
		return null
	}

	return sanitizeDomain(data?.domain)
}

function getReferenceMonths(entries: Array<{ reference_month: string }>): string[] {
	const monthSet = new Set<string>()
	const referenceMonths: string[] = []

	for (const entry of entries) {
		const normalizedReferenceMonth = normalizeReferenceMonth(entry.reference_month)
		if (!normalizedReferenceMonth || monthSet.has(normalizedReferenceMonth)) continue

		monthSet.add(normalizedReferenceMonth)
		referenceMonths.push(normalizedReferenceMonth)
	}

	return referenceMonths
}

function resolveAppliedReferenceMonth(referenceMonth: string | null, referenceMonths: string[]): string | null {
	const normalizedMonth = normalizeReferenceMonth(referenceMonth)

	if (normalizedMonth && referenceMonths.includes(normalizedMonth)) return normalizedMonth

	return referenceMonths[0] ?? null
}

export async function getWebsiteReportByMonth({
	companyId,
	referenceMonth,
}: WebsiteReportByMonthParams): Promise<WebsiteReport | null> {
	if (!isCompanyId(companyId)) return null

	const normalizedReferenceMonth = normalizeReferenceMonth(referenceMonth)
	if (!normalizedReferenceMonth) return null

	return fetchWebsiteReportByMonth({ companyId, referenceMonth: normalizedReferenceMonth })
}

async function fetchWebsiteReportByMonth({
	companyId,
	referenceMonth,
}: WebsiteReportByMonthParams): Promise<WebsiteReport | null> {
	if (!isCompanyId(companyId)) return null

	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("monthly_reports")
		.select("id, company_id, service_id, reference_month, payload, created_at")
		.eq("company_id", companyId)
		.eq("service_id", WEBSITE_SERVICE_ID)
		.eq("reference_month", referenceMonth)
		.maybeSingle<WebsiteReportRow>()

	if (error) {
		console.error("[website] Supabase error while loading monthly report by month", {
			companyId,
			referenceMonth,
			serviceId: WEBSITE_SERVICE_ID,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		})
		return null
	}

	return data ? mapWebsiteReportRow(data) : null
}
