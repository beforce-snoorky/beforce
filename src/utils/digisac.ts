import type { buildClientPageProps, CachedDigisacMonth, DigisacCardsSummary, DigisacDepartmentChartItem } from "@/types/digisac"
import type { DigisacPageData, DigisacTableRow, DigisacTopOperatorChartItem } from "@/types/digisac"
import type { MonthlyReport, PayloadDigisac, readCachedMonthProps } from "@/types/digisac"
import {
	buildCacheKey as buildGenericCacheKey,
	cleanupCache,
	readCachedMonth as readGenericCachedMonth,
	writeCachedMonth as writeGenericCachedMonth,
} from "@/utils/cache"
import { formatMonthYear, normalizeReferenceMonth } from "@/utils/date"
import { asNullableString, asString } from "@/utils/parsing"

const CACHE_PREFIX = "digisac:reports:"
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const CACHE_MAX_MONTHS_PER_COMPANY = 6
export const DIGISAC_SERVICE_ID = "c282abbe-e692-4a03-baae-6652ebd44957"
export { normalizeReferenceMonth }

export function cleanupDigisacCache({ ttl, maxMonthsPerCompany }: { ttl: number; maxMonthsPerCompany: number }) {
	cleanupCache({ prefix: CACHE_PREFIX, ttl, maxMonthsPerCompany, parseData: normalizeMonthlyReport })
}

function normalizeMonthlyReport(value: unknown): MonthlyReport | null {
	if (!value || typeof value !== "object") return null

	const report = value as Record<string, unknown>
	const referenceMonth = normalizeReferenceMonth(asString(report.reference_month))
	if (!referenceMonth) return null

	return {
		id: asString(report.id),
		company_id: asString(report.company_id),
		service_id: asString(report.service_id),
		reference_month: referenceMonth,
		payload: normalizePayload(report.payload),
		created_at: asNullableString(report.created_at),
	}
}

export function normalizePayload(payload: unknown): PayloadDigisac[] {
	if (!Array.isArray(payload)) return []

	return payload
		.filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
		.map((entry) => ({
			operator_name: sanitizeOperatorName(asString(entry.operator_name)),
			department: asString(entry.department),
			ticket_time: normalizeDuration(asString(entry.ticket_time)) ?? "00:00:00",
			waiting_time: normalizeDuration(asString(entry.waiting_time)) ?? "00:00:00",
			waiting_time_after_bot: normalizeDuration(asString(entry.waiting_time_after_bot)) ?? "00:00:00",
			waiting_time_avg: normalizeDuration(asString(entry.waiting_time_avg)) ?? "00:00:00",
			sent_messages_count: asNumber(entry.sent_messages_count),
			received_messages_count: asNumber(entry.received_messages_count),
			total_messages_count: asNumber(entry.total_messages_count),
			opened_tickets_count: asNumber(entry.opened_tickets_count),
			closed_tickets_count: asNumber(entry.closed_tickets_count),
			total_tickets_count: asNumber(entry.total_tickets_count),
			contacts_count: asNumber(entry.contacts_count),
		}))
}

export function sanitizeOperatorName(value: string | null | undefined): string {
	return (value ?? "").trim()
}

function normalizeDuration(value: string | null | undefined): string | null {
	const normalized = (value ?? "").trim()
	const match = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
	if (!match) return null

	const hours = Number(match[1])
	const minutes = Number(match[2])
	const seconds = Number(match[3] ?? "0")

	if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
	if (minutes > 59 || seconds > 59) return null

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function asNumber(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)

	if (typeof value === "string") {
		const parsed = Number(value)
		if (Number.isFinite(parsed)) return Math.max(0, parsed)
	}

	return 0
}

export function buildCacheKey(companyId: string, referenceMonth: string | null): string | null {
	return buildGenericCacheKey({ prefix: CACHE_PREFIX, companyId, referenceMonth })
}

export function readCachedMonth({ cacheKey, companyId, referenceMonth, ttl }: readCachedMonthProps): CachedDigisacMonth | null {
	return readGenericCachedMonth({
		cacheKey,
		companyId,
		referenceMonth,
		ttl,
		parseData: normalizeMonthlyReport,
		getCompanyId: (report) => report.company_id,
		getReferenceMonth: (report) => report.reference_month,
	})
}

export function buildClientPageData({ baseData, operatorName }: buildClientPageProps): DigisacPageData {
	const operatorOptions = getOperatorOptions(baseData.report?.payload ?? [])
	const appliedOperator = resolveAppliedOperator(operatorName, operatorOptions)
	const rows = buildTableRows(baseData.report?.payload ?? [], appliedOperator)

	return {
		...baseData,
		appliedOperator,
		operatorOptions,
		rows,
		cards: buildCardsSummary(rows),
		departmentChart: buildDepartmentChart(rows),
		topOperatorsChart: buildTopOperatorChart(rows),
	}
}

export function getOperatorOptions(payload: PayloadDigisac[]): string[] {
	const options = new Set<string>()

	for (const row of payload) {
		const operatorName = sanitizeOperatorName(row.operator_name)
		if (operatorName) options.add(operatorName)
	}

	return Array.from(options).sort((left, right) => left.localeCompare(right))
}

export function resolveAppliedOperator(operatorName: string | null, options: string[]): string {
	const normalizedOperator = sanitizeOperatorName(operatorName)
	if (!normalizedOperator) return ""

	const found = options.find((option) => option.toLowerCase() === normalizedOperator.toLowerCase())
	return found ?? ""
}

export function buildTableRows(payload: PayloadDigisac[], appliedOperator: string): DigisacTableRow[] {
	const normalizedOperator = sanitizeOperatorName(appliedOperator).toLowerCase()
	const grouped = new Map<
		string,
		{
			operatorName: string
			department: string
			ticketTimeSeconds: number
			ticketTimeCount: number
			waitingTimeSeconds: number
			waitingTimeCount: number
			waitingTimeAfterBotSeconds: number
			waitingTimeAfterBotCount: number
			waitingTimeAvgSeconds: number
			waitingTimeAvgCount: number
			sentMessagesCount: number
			receivedMessagesCount: number
			totalMessagesCount: number
			openedTicketsCount: number
			closedTicketsCount: number
			totalTicketsCount: number
			contactsCount: number
		}
	>()

	for (const row of payload) {
		const operatorName = sanitizeOperatorName(row.operator_name) || "-"
		if (normalizedOperator && operatorName.toLowerCase() !== normalizedOperator) continue

		const department = row.department.trim() || "-"
		const groupKey = `${operatorName}::${department}`
		const current = grouped.get(groupKey) ?? {
			operatorName,
			department,
			ticketTimeSeconds: 0,
			ticketTimeCount: 0,
			waitingTimeSeconds: 0,
			waitingTimeCount: 0,
			waitingTimeAfterBotSeconds: 0,
			waitingTimeAfterBotCount: 0,
			waitingTimeAvgSeconds: 0,
			waitingTimeAvgCount: 0,
			sentMessagesCount: 0,
			receivedMessagesCount: 0,
			totalMessagesCount: 0,
			openedTicketsCount: 0,
			closedTicketsCount: 0,
			totalTicketsCount: 0,
			contactsCount: 0,
		}

		current.ticketTimeSeconds += durationToSeconds(row.ticket_time)
		current.ticketTimeCount += 1
		current.waitingTimeSeconds += durationToSeconds(row.waiting_time)
		current.waitingTimeCount += 1
		current.waitingTimeAfterBotSeconds += durationToSeconds(row.waiting_time_after_bot)
		current.waitingTimeAfterBotCount += 1
		current.waitingTimeAvgSeconds += durationToSeconds(row.waiting_time_avg)
		current.waitingTimeAvgCount += 1
		current.sentMessagesCount += asNumber(row.sent_messages_count)
		current.receivedMessagesCount += asNumber(row.received_messages_count)
		current.totalMessagesCount += asNumber(row.total_messages_count)
		current.openedTicketsCount += asNumber(row.opened_tickets_count)
		current.closedTicketsCount += asNumber(row.closed_tickets_count)
		current.totalTicketsCount += asNumber(row.total_tickets_count)
		current.contactsCount += asNumber(row.contacts_count)

		grouped.set(groupKey, current)
	}

	return Array.from(grouped.entries()).map(([groupKey, row]) => ({
		id: groupKey,
		operatorName: row.operatorName,
		department: row.department,
		ticketTime: secondsToDuration(row.ticketTimeSeconds / Math.max(row.ticketTimeCount, 1)),
		waitingTime: secondsToDuration(row.waitingTimeSeconds / Math.max(row.waitingTimeCount, 1)),
		waitingTimeAfterBot: secondsToDuration(row.waitingTimeAfterBotSeconds / Math.max(row.waitingTimeAfterBotCount, 1)),
		waitingTimeAvg: secondsToDuration(row.waitingTimeAvgSeconds / Math.max(row.waitingTimeAvgCount, 1)),
		sentMessagesCount: row.sentMessagesCount,
		receivedMessagesCount: row.receivedMessagesCount,
		totalMessagesCount: row.totalMessagesCount,
		openedTicketsCount: row.openedTicketsCount,
		closedTicketsCount: row.closedTicketsCount,
		totalTicketsCount: row.totalTicketsCount,
		contactsCount: row.contactsCount,
	}))
}

function durationToSeconds(value: string): number {
	const normalized = normalizeDuration(value)
	if (!normalized) return 0

	const [hours, minutes, seconds] = normalized.split(":").map((entry) => Number(entry) || 0)
	return hours * 3600 + minutes * 60 + seconds
}

function secondsToDuration(totalSeconds: number): string {
	const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0
	const hours = Math.floor(safeSeconds / 3600)
	const minutes = Math.floor((safeSeconds % 3600) / 60)
	const seconds = safeSeconds % 60

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function buildCardsSummary(rows: DigisacTableRow[]): DigisacCardsSummary {
	if (!rows.length) return emptyCardsSummary()

	return rows.reduce<DigisacCardsSummary>((accumulator, row) => {
		accumulator.openedTickets += row.openedTicketsCount
		accumulator.closedTickets += row.closedTicketsCount
		accumulator.totalMessages += row.totalMessagesCount
		accumulator.totalContacts += row.contactsCount
		accumulator.openedSeries.push(row.openedTicketsCount)
		accumulator.closedSeries.push(row.closedTicketsCount)
		accumulator.messagesSeries.push(row.totalMessagesCount)
		accumulator.contactsSeries.push(row.contactsCount)

		return accumulator
	}, emptyCardsSummary())
}

export function emptyCardsSummary(): DigisacCardsSummary {
	return {
		openedTickets: 0,
		closedTickets: 0,
		totalMessages: 0,
		totalContacts: 0,
		openedSeries: [],
		closedSeries: [],
		messagesSeries: [],
		contactsSeries: [],
	}
}

export function buildDepartmentChart(rows: DigisacTableRow[]): DigisacDepartmentChartItem[] {
	const grouped = new Map<string, { totalSeconds: number; count: number }>()

	for (const row of rows) {
		const current = grouped.get(row.department) ?? { totalSeconds: 0, count: 0 }
		grouped.set(row.department, {
			totalSeconds: current.totalSeconds + durationToSeconds(row.ticketTime),
			count: current.count + 1,
		})
	}

	return Array.from(grouped.entries())
		.map(([department, value]) => {
			const averageSeconds = value.count ? value.totalSeconds / value.count : 0

			return {
				department,
				averageSeconds,
				averageMinutes: Number((averageSeconds / 60).toFixed(2)),
				averageDuration: secondsToDuration(averageSeconds),
			}
		})
		.sort((left, right) => right.averageSeconds - left.averageSeconds)
}

export function buildTopOperatorChart(rows: DigisacTableRow[]): DigisacTopOperatorChartItem[] {
	const grouped = new Map<string, number>()

	for (const row of rows) {
		grouped.set(row.operatorName, (grouped.get(row.operatorName) ?? 0) + row.totalTicketsCount)
	}

	return Array.from(grouped.entries())
		.map(([operatorName, totalTicketsCount]) => ({ operatorName, totalTicketsCount }))
		.sort((left, right) => right.totalTicketsCount - left.totalTicketsCount)
		.slice(0, 5)
}

export function writeCachedMonth({ cacheKey, report }: { cacheKey: string; report: MonthlyReport }) {
	writeGenericCachedMonth({ cacheKey, data: report })
}

export function formatReferenceMonthLabel(referenceMonth: string, locale: string): string {
	const normalized = normalizeReferenceMonth(referenceMonth)
	if (!normalized) return referenceMonth

	const [year, month] = normalized.split("-")
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1))

	return formatMonthYear(date, locale)
}
