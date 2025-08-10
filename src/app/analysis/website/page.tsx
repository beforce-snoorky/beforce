"use client"

import { Select } from "@/components/ui/select"
import CitiesStatistics from "@/components/website/city"
import WorldMap from "@/components/website/country"
import SourceStatistics from "@/components/website/source"
import PagesStatistics from "@/components/website/pages"
import SystemStatistics from "@/components/website/system"
import { UsersStatistics } from "@/components/website/users"
import { useAuth } from "@/hooks/useAuth"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { NoDataFallback } from "@/hooks/useNoDataFallback"
import { useWebsiteReports } from "@/hooks/useWebsite"
import { useWebsiteFilter } from "@/hooks/useWebsiteFilterContext"
import { formatPeriodToMonthYear } from "@/utils/data"
import { ExternalLink, Globe2 } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const { company } = useAuth()
  const websiteReportFilters = useWebsiteFilter()
  const websiteReportsData = useWebsiteReports()
  const isMobileViewport = useMediaQuery("(max-width: 1079px)")

  if (websiteReportsData.loading) return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="animate-spin size-8 mr-2 rounded-full border-4 border-accent-light border-r-accent" />
    </div>
  )

  if (!company || !websiteReportsData.filteredReports || websiteReportsData.filteredReports.length === 0) return (<NoDataFallback />)

  const currentWebsiteReport = websiteReportsData.filteredReports[0]

  const availablePeriodOptions = websiteReportsData.availablePeriods.map((period) => ({
    label: formatPeriodToMonthYear(period),
    value: period,
  }))

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="size-6 text-accent" />
            <h1 className="text-xl md:text-2xl font-bold">Site Corporativo</h1>
          </div>
          <p className="text-sm">Acompanhe as métricas do seu site</p>
        </div>

        <div className="flex items-center gap-4">
          {!isMobileViewport && (
            <Select
              id="periods"
              label="Períodos"
              options={availablePeriodOptions}
              value={websiteReportFilters.selectedPeriod}
              onChange={(period) => { websiteReportFilters.setSelectedPeriod(period) }}
            />
          )}

          <Link
            href={`https://${company.website_domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center text-sm font-medium px-4 py-3 rounded-lg gap-2 bg-accent text-light"
          >
            <ExternalLink className="size-4" />
            Ver site
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-8 gap-4">
        <UsersStatistics users={currentWebsiteReport.data.users} />
        <SourceStatistics origem={currentWebsiteReport.data.source} />
        <SystemStatistics system={currentWebsiteReport.data.system} devices={currentWebsiteReport.data.devices} />
        <PagesStatistics site={company.website_domain} pages={currentWebsiteReport.data.pages} />
        <CitiesStatistics cities={currentWebsiteReport.data?.city} />
        <WorldMap country={currentWebsiteReport.data?.country} />
      </section>
    </>
  )
}