import { useTranslations } from "next-intl"
import type { FormEvent } from "react"
import type { ChartCardProps as SharedChartCardProps } from "@/types/ui"

export type DigisacClientProps = { locale: string }

export type DigisacApiResponse = {
	companyId: string
	referenceMonths: string[]
	appliedReferenceMonth: string | null
	report: MonthlyReport | null
}

export type DigisacPageData = {
	companyId: string
	referenceMonths: string[]
	appliedReferenceMonth: string | null
	appliedOperator: string
	operatorOptions: string[]
	report: MonthlyReport | null
	rows: DigisacTableRow[]
	cards: DigisacCardsSummary
	departmentChart: DigisacDepartmentChartItem[]
	topOperatorsChart: DigisacTopOperatorChartItem[]
}

export type MonthlyReport = {
	id: string
	company_id: string
	service_id: string
	reference_month: string
	payload: PayloadDigisac[]
	created_at: string | null
}

export type PayloadDigisac = {
	operator_name: string
	department: string
	ticket_time: string
	waiting_time: string
	waiting_time_after_bot: string
	waiting_time_avg: string
	sent_messages_count: number
	received_messages_count: number
	total_messages_count: number
	opened_tickets_count: number
	closed_tickets_count: number
	total_tickets_count: number
	contacts_count: number
}

export type DigisacTableRow = {
	id: string
	operatorName: string
	department: string
	ticketTime: string
	waitingTime: string
	waitingTimeAfterBot: string
	waitingTimeAvg: string
	sentMessagesCount: number
	receivedMessagesCount: number
	totalMessagesCount: number
	openedTicketsCount: number
	closedTicketsCount: number
	totalTicketsCount: number
	contactsCount: number
}

export type DigisacCardsSummary = {
	openedTickets: number
	closedTickets: number
	totalMessages: number
	totalContacts: number
	openedSeries: number[]
	closedSeries: number[]
	messagesSeries: number[]
	contactsSeries: number[]
}

export type DigisacDepartmentChartItem = {
	department: string
	averageSeconds: number
	averageMinutes: number
	averageDuration: string
}

export type DigisacTopOperatorChartItem = { operatorName: string; totalTicketsCount: number }

export type CachedDigisacMonth = { data: MonthlyReport; cachedAt: number }

export type readCachedMonthProps = { cacheKey: string; companyId: string; referenceMonth: string; ttl: number }

export type buildClientPageProps = { baseData: DigisacApiResponse; operatorName: string }

export type MetricCardDefinition = {
	label: string
	value: number
	series: number[]
	iconClassName: string
	stroke: string
	icon: React.ComponentType<{ className?: string }>
}

export type getDigisacPageDataProps = { companyId: string; filters: DigisacFilters }

type DigisacFilters = { referenceMonth: string | null; operatorName: string | null }

export type MonthlyReportRow = {
	id: string
	company_id: string
	service_id: string
	reference_month: string
	payload: unknown
	created_at: string | null
}

export type ReportMonth = { companyId: string; referenceMonth: string }

export type MetricCardProps = {
	label: string
	value: string
	icon: React.ComponentType<{ className?: string }>
	iconClassName: string
	series: number[]
	stroke: string
}

export type TableDesktopProps = {
	rows: DigisacTableRow[]
	numberFormatter: Intl.NumberFormat
	translate: ReturnType<typeof useTranslations<"Digisac">>
}

export type AccordionMobileProps = TableDesktopProps

export type DigisacChartsProps = {
	departmentChart: DigisacDepartmentChartItem[]
	topOperatorsChart: DigisacTopOperatorChartItem[]
	translate: TableDesktopProps["translate"]
}

export type DigisacFiltersProps = {
	operatorDraft: string
	setOperatorDraft: (value: string) => void
	monthDraft: string
	setMonthDraft: (value: string) => void
	handleSubmit: (event: FormEvent<HTMLFormElement>) => void
	hasAnyMonth: boolean
	isApplying: boolean
	operatorOptions: string[]
	referenceMonths: string[]
	locale: string
	translate: TableDesktopProps["translate"]
}

export type DigisacMetricsProps = { metricCards: MetricCardDefinition[]; numberFormatter: Intl.NumberFormat }

export type ChartCardProps = SharedChartCardProps
