"use client"

import { useQuery } from "@tanstack/react-query"
import { QueryErrorState } from "@/components/ui/queryErrorState"
import { useAuth } from "@/context/auth"
import { fetchWebsitePageData } from "@/lib/api"
import type { WebsiteClientProps } from "@/types/website"
import { formatReferenceMonthLabel, normalizeReferenceMonth } from "@/utils/website"
import { Globe2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CitiesStatistics } from "./cities"
import { WebsiteFilters } from "./filters"
import { PagesStatistics } from "./pages"
import { WebsiteSkeleton } from "./skeleton"
import { SourceStatistics } from "./source"
import { SystemStatistics } from "./system"
import { UsersStatistics } from "./users"
import { WorldMap } from "./world"
import { Card } from "../ui/card"

const REPORT_STALE_TIME_MS = 5 * 60 * 1000

export function WebsiteAnalytics({ locale }: WebsiteClientProps) {
	const { company } = useAuth()
	const translate = useTranslations("Website")
	const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

	const websiteQuery = useQuery({
		queryKey: ["website", company.companyId, selectedMonth ?? "latest"],
		queryFn: ({ signal }) => fetchWebsitePageData({ companyId: company.companyId, month: selectedMonth, signal }),
		placeholderData: (previousData) => previousData,
		refetchOnWindowFocus: false,
		staleTime: REPORT_STALE_TIME_MS,
	})

	const periodOptions = useMemo(
		() =>
			(websiteQuery.data?.referenceMonths ?? []).map((referenceMonth) => ({
				value: referenceMonth,
				label: formatReferenceMonthLabel(referenceMonth, locale),
			})),
		[locale, websiteQuery.data?.referenceMonths]
	)

	if (websiteQuery.isPending && !websiteQuery.data) {
		return <WebsiteSkeleton />
	}

	if (websiteQuery.error && !websiteQuery.data) {
		return (
			<QueryErrorState
				title={translate("states.failedToLoad")}
				description={translate("states.failedToLoadDescription")}
				actionLabel={translate("states.retry")}
				onRetry={() => void websiteQuery.refetch()}
			/>
		)
	}

	if (!websiteQuery.data) {
		return <WebsiteSkeleton />
	}

	const hasAnyMonth = websiteQuery.data.referenceMonths.length > 0
	const currentWebsiteReport = websiteQuery.data.report
	const monthDraft = selectedMonth ?? websiteQuery.data.appliedReferenceMonth ?? ""

	function handleMonthChange(value: string) {
		const normalizedMonth = normalizeReferenceMonth(value)
		if (!normalizedMonth || normalizedMonth === websiteQuery.data?.appliedReferenceMonth) return

		setSelectedMonth(normalizedMonth)
	}

	return (
		<section className="space-y-4">
			<div className="mb-7 justify-between space-y-4 lg:flex">
				<header className="space-y-1">
					<h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl">
						<Globe2 className="size-6 text-primary lg:size-8" /> {translate("title")}
					</h1>
					<p className="text-sm text-muted-foreground lg:text-base">{translate("subtitle")}</p>
				</header>

				<WebsiteFilters
					monthDraft={monthDraft}
					onMonthChange={handleMonthChange}
					periodOptions={periodOptions}
					websiteDomain={websiteQuery.data.websiteDomain}
					disabled={!hasAnyMonth || websiteQuery.isFetching}
					statusText={websiteQuery.isFetching ? translate("states.applying") : null}
					translate={translate}
				/>
			</div>

			{!hasAnyMonth ? (
				<Card>
					<p className="text-sm text-foreground-muted">{translate("states.noMonthsAvailable")}</p>
				</Card>
			) : !currentWebsiteReport ? (
				<Card>
					<p className="text-sm text-foreground-muted">{translate("states.noReportForMonth")}</p>
				</Card>
			) : (
				<>
					<section className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
						<UsersStatistics
							users={currentWebsiteReport.data.users}
							translate={translate}
							locale={locale}
						/>
					</section>

					<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<SourceStatistics
							origem={currentWebsiteReport.data.source}
							translate={translate}
						/>

						<SystemStatistics
							system={currentWebsiteReport.data.system}
							devices={currentWebsiteReport.data.devices}
							translate={translate}
						/>
					</section>

					<section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
						<PagesStatistics
							site={websiteQuery.data.websiteDomain}
							pages={currentWebsiteReport.data.pages}
							translate={translate}
							locale={locale}
						/>

						<CitiesStatistics
							cities={currentWebsiteReport.data.city}
							translate={translate}
							locale={locale}
						/>
					</section>

					<section className="grid grid-cols-1 gap-4">
						<WorldMap
							country={currentWebsiteReport.data.country}
							translate={translate}
							locale={locale}
						/>
					</section>
				</>
			)}
		</section>
	)
}
