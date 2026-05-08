"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryErrorState } from "@/components/ui/queryErrorState"
import { useAuth } from "@/context/auth"
import { fetchDigisacPageData } from "@/lib/api"
import type { DigisacClientProps, DigisacPageData, MetricCardDefinition } from "@/types/digisac"
import { buildClientPageData, normalizeReferenceMonth, sanitizeOperatorName } from "@/utils/digisac"
import { ChartNoAxesCombined, MessageCircleMore, MessageCircleOff, MessageCirclePlus, UsersRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { DigisacCharts } from "./charts"
import { DigisacFilters } from "./filters"
import { DigisacMetrics } from "./metrics"
import { DigisacSkeleton } from "./skeleton"
import { TableDesktop } from "./table"
import { Card } from "../ui/card"

const REPORT_STALE_TIME_MS = 5 * 60 * 1000

export function DigisacClient({ locale }: DigisacClientProps) {
	const { company } = useAuth()
	const translate = useTranslations("Digisac")
	const [requestedMonth, setRequestedMonth] = useState<string | null>(null)
	const [draftMonth, setDraftMonth] = useState<string | null>(null)
	const [appliedOperator, setAppliedOperator] = useState("")
	const [operatorDraft, setOperatorDraft] = useState("")
	const [isOperatorDraftDirty, setIsOperatorDraftDirty] = useState(false)

	const digisacQuery = useQuery({
		queryKey: ["digisac", company.companyId, requestedMonth ?? "latest"],
		queryFn: ({ signal }) => fetchDigisacPageData({ companyId: company.companyId, month: requestedMonth, signal }),
		placeholderData: (previousData) => previousData,
		refetchOnWindowFocus: false,
		staleTime: REPORT_STALE_TIME_MS,
	})

	const currentData = useMemo<DigisacPageData | null>(() => {
		if (!digisacQuery.data) return null

		return buildClientPageData({ baseData: digisacQuery.data, operatorName: appliedOperator })
	}, [appliedOperator, digisacQuery.data])

	const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

	const metricCards = useMemo<MetricCardDefinition[]>(
		() => [
			{
				label: translate("cards.openedTickets"),
				value: currentData?.cards.openedTickets ?? 0,
				series: currentData?.cards.openedSeries ?? [],
				icon: MessageCirclePlus,
				iconClassName: "text-blue-600 bg-blue-500/10",
				stroke: "#155dfc",
			},
			{
				label: translate("cards.closedTickets"),
				value: currentData?.cards.closedTickets ?? 0,
				series: currentData?.cards.closedSeries ?? [],
				icon: MessageCircleOff,
				iconClassName: "text-green-600 bg-green-500/10",
				stroke: "#00a63e",
			},
			{
				label: translate("cards.totalMessages"),
				value: currentData?.cards.totalMessages ?? 0,
				series: currentData?.cards.messagesSeries ?? [],
				icon: MessageCircleMore,
				iconClassName: "text-purple-600 bg-purple-500/10",
				stroke: "#9810fa",
			},
			{
				label: translate("cards.totalContacts"),
				value: currentData?.cards.totalContacts ?? 0,
				series: currentData?.cards.contactsSeries ?? [],
				icon: UsersRound,
				iconClassName: "text-pink-600 bg-pink-500/10",
				stroke: "#e60076",
			},
		],
		[currentData, translate]
	)

	if (digisacQuery.isPending && !digisacQuery.data) {
		return <DigisacSkeleton />
	}

	if (digisacQuery.error && !digisacQuery.data) {
		return (
			<QueryErrorState
				title={translate("states.failedToLoad")}
				description={translate("states.failedToLoadDescription")}
				actionLabel={translate("states.retry")}
				onRetry={() => void digisacQuery.refetch()}
			/>
		)
	}

	if (!currentData) {
		return <DigisacSkeleton />
	}

	const hasAnyMonth = currentData.referenceMonths.length > 0
	const appliedReferenceMonth = currentData.appliedReferenceMonth
	const monthDraft = draftMonth ?? currentData.appliedReferenceMonth ?? ""
	const visibleOperatorDraft = isOperatorDraftDirty ? operatorDraft : currentData.appliedOperator

	function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!hasAnyMonth) return

		const normalizedOperator = sanitizeOperatorName(visibleOperatorDraft)
		const normalizedMonth = normalizeReferenceMonth(monthDraft)

		setAppliedOperator(normalizedOperator)
		setOperatorDraft(normalizedOperator)
		setIsOperatorDraftDirty(false)
		setDraftMonth(normalizedMonth)

		if (normalizedMonth && normalizedMonth !== appliedReferenceMonth) {
			setRequestedMonth(normalizedMonth)
		}
	}

	return (
		<section className="space-y-4">
			<div className="mb-7 justify-between space-y-4 lg:flex">
				<header className="space-y-1">
					<h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl">
						<ChartNoAxesCombined className="size-6 text-primary lg:size-8" /> {translate("title")}
					</h1>
					<p className="text-sm text-muted-foreground lg:text-base">{translate("subtitle")}</p>
				</header>

				<DigisacFilters
					operatorDraft={visibleOperatorDraft}
					setOperatorDraft={(value) => {
						setOperatorDraft(value)
						setIsOperatorDraftDirty(true)
					}}
					monthDraft={monthDraft}
					setMonthDraft={(value) => setDraftMonth(value)}
					handleSubmit={handleApplyFilters}
					hasAnyMonth={hasAnyMonth}
					isApplying={digisacQuery.isFetching}
					operatorOptions={currentData.operatorOptions}
					referenceMonths={currentData.referenceMonths}
					locale={locale}
					translate={translate}
				/>
			</div>

			{!hasAnyMonth ? (
				<Card>
					<p className="text-sm text-foreground-muted">{translate("states.noMonthsAvailable")}</p>
				</Card>
			) : !currentData.report ? (
				<Card>
					<p className="text-sm text-foreground-muted">{translate("states.noReportForMonth")}</p>
				</Card>
			) : (
				<>
					<DigisacMetrics
						metricCards={metricCards}
						numberFormatter={numberFormatter}
					/>

					<TableDesktop
						rows={currentData.rows}
						numberFormatter={numberFormatter}
						translate={translate}
					/>

					<DigisacCharts
						departmentChart={currentData.departmentChart}
						topOperatorsChart={currentData.topOperatorsChart}
						translate={translate}
					/>
				</>
			)}
		</section>
	)
}
