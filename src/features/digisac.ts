import "server-only"

import { createSupabaseServerClient } from "@/supabase/server"
import type { DigisacPageData, getDigisacPageDataProps, MonthlyReport, MonthlyReportRow, ReportMonth } from "@/types/digisac"
import { isCompanyId } from "@/utils/company"
import { buildCardsSummary, buildDepartmentChart, buildTableRows, buildTopOperatorChart } from "@/utils/digisac"
import { DIGISAC_SERVICE_ID, emptyCardsSummary, getOperatorOptions } from "@/utils/digisac"
import { normalizePayload, normalizeReferenceMonth, resolveAppliedOperator } from "@/utils/digisac"

const REFERENCE_MONTH_LIMIT = 24

export async function getDigisacPageData({ companyId, filters }: getDigisacPageDataProps): Promise<DigisacPageData> {
	if (!isCompanyId(companyId)) {
		return {
			companyId,
			referenceMonths: [],
			appliedReferenceMonth: null,
			appliedOperator: "",
			operatorOptions: [],
			report: null,
			rows: [],
			cards: emptyCardsSummary(),
			departmentChart: [],
			topOperatorsChart: [],
		}
	}

	const referenceMonths = await fetchDigisacReferenceMonthsForCompany(companyId)
	const appliedReferenceMonth = resolveAppliedReferenceMonth(filters.referenceMonth, referenceMonths)
	const report = appliedReferenceMonth
		? await fetchDigisacReportByMonth({ companyId, referenceMonth: appliedReferenceMonth })
		: null

	const operatorOptions = getOperatorOptions(report?.payload ?? [])
	const appliedOperator = resolveAppliedOperator(filters.operatorName, operatorOptions)
	const rows = buildTableRows(report?.payload ?? [], appliedOperator)

	return {
		companyId,
		referenceMonths,
		appliedReferenceMonth,
		appliedOperator,
		operatorOptions,
		report,
		rows,
		cards: buildCardsSummary(rows),
		departmentChart: buildDepartmentChart(rows),
		topOperatorsChart: buildTopOperatorChart(rows),
	}
}

async function fetchDigisacReferenceMonthsForCompany(companyId: string): Promise<string[]> {
	if (!isCompanyId(companyId)) {
		console.error("[digisac] Invalid company id while loading reference months", { companyId })
		return []
	}

	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("monthly_reports")
		.select("reference_month")
		.eq("company_id", companyId)
		.eq("service_id", DIGISAC_SERVICE_ID)
		.order("reference_month", { ascending: false })
		.limit(REFERENCE_MONTH_LIMIT)

	if (error) {
		console.error("[digisac] Supabase error while loading reference months", {
			companyId,
			serviceId: DIGISAC_SERVICE_ID,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		})
		return []
	}

	return getReferenceMonths((data ?? []) as Array<Pick<MonthlyReportRow, "reference_month">>)
}

function mapMonthlyReportRow(row: MonthlyReportRow): MonthlyReport | null {
	const normalizedReferenceMonth = normalizeReferenceMonth(row.reference_month)
	if (!normalizedReferenceMonth) return null

	return {
		id: row.id,
		company_id: row.company_id,
		service_id: row.service_id,
		reference_month: normalizedReferenceMonth,
		payload: normalizePayload(row.payload),
		created_at: row.created_at,
	}
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

	if (normalizedMonth && referenceMonths.includes(normalizedMonth)) {
		return normalizedMonth
	}

	return referenceMonths[0] ?? null
}

export async function getDigisacReportByMonth({ companyId, referenceMonth }: ReportMonth): Promise<MonthlyReport | null> {
	if (!isCompanyId(companyId)) return null

	const normalizedReferenceMonth = normalizeReferenceMonth(referenceMonth)
	if (!normalizedReferenceMonth) return null

	return fetchDigisacReportByMonth({ companyId, referenceMonth: normalizedReferenceMonth })
}

async function fetchDigisacReportByMonth({ companyId, referenceMonth }: ReportMonth): Promise<MonthlyReport | null> {
	if (!isCompanyId(companyId)) return null

	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase
		.from("monthly_reports")
		.select("id, company_id, service_id, reference_month, payload, created_at")
		.eq("company_id", companyId)
		.eq("service_id", DIGISAC_SERVICE_ID)
		.eq("reference_month", referenceMonth)
		.maybeSingle<MonthlyReportRow>()

	if (error) {
		console.error("[digisac] Supabase error while loading monthly report by month", {
			companyId,
			referenceMonth,
			serviceId: DIGISAC_SERVICE_ID,
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		})
		return null
	}

	return data ? mapMonthlyReportRow(data) : null
}
