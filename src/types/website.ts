import type { ChartCardProps as SharedChartCardProps, SelectOption } from "@/types/ui"

export type getWebsitePageDataProps = { companyId: string; filters: WebsiteFilters }

type WebsiteFilters = { referenceMonth: string | null }

export type WebsiteClientProps = { locale: string }

export type MetricValue = number | string

export type WebsitePageData = {
	companyId: string
	websiteDomain: string | null
	referenceMonths: string[]
	appliedReferenceMonth: string | null
	report: WebsiteReport | null
}

export type WebsiteReport = {
	id: string
	company_id: string
	service_id: string
	reference_month: string
	data: WebsitePayload
	created_at: string | null
}

export type WebsitePayload = {
	users: UsersData
	source: SourceData[]
	system: SystemData[]
	devices: DeviceData[]
	pages: PagesData[]
	city: CityData[]
	country: CountryData[]
}

export type UsersData = {
	totalUsers: MetricValue
	newUsers: MetricValue
	averageSessionDuration: MetricValue
	engagementRate: MetricValue
}

export type SourceData = { sessionDefaultChannelGroup: string; sessions: MetricValue }

export type SystemData = { operatingSystem: string; activeUsers: MetricValue }

export type DeviceData = { deviceCategory: string; activeUsers: MetricValue }

export type PagesData = {
	pagePath: string
	activeUsers: MetricValue
	screenPageViews: MetricValue
	screenPageViewsPerUser: MetricValue
}

export type CityData = { city: string; newUsers: MetricValue; activeUsers: MetricValue; engagedSessions: MetricValue }

export type CountryData = { country: string; activeUsers: MetricValue; newUsers: MetricValue }

export type WebsiteReportRow = {
	id: string
	company_id: string
	service_id: string
	reference_month: string
	payload: unknown
	created_at: string | null
}

export type CachedWebsiteMonth = { data: WebsiteReport; cachedAt: number }

export type WebsiteReportByMonthParams = { companyId: string; referenceMonth: string }

export type TranslateFn = (key: string, values?: Record<string, string | number>) => string

export type WebsiteFiltersProps = {
	monthDraft: string
	onMonthChange: (value: string) => void
	periodOptions: SelectOption[]
	websiteDomain: string | null
	disabled?: boolean
	statusText?: string | null
	translate: TranslateFn
}

export type SourceStatisticsProps = { origem: SourceData[]; translate: TranslateFn }
export type SystemStatisticsProps = { system: SystemData[]; devices: DeviceData[]; translate: TranslateFn }
export type UsersStatisticsProps = { users: UsersData; translate: TranslateFn; locale: string }
export type PagesStatisticsProps = { site: string | null; pages: PagesData[]; translate: TranslateFn; locale: string }
export type CitiesStatisticsProps = { cities: CityData[]; translate: TranslateFn; locale: string }
export type WorldMapProps = { country: CountryData[]; translate: TranslateFn; locale: string }

export type WebsiteChartCardProps = SharedChartCardProps
