"use client"

import { AverageTime } from "@/components/digisac/averageTime"
import { Filters } from "@/components/digisac/filter"
import { PerformanceMetrics } from "@/components/digisac/performance"
import { TableDesktop } from "@/components/digisac/tableDesktop"
import { TableMobile } from "@/components/digisac/tableMobile"
import { TopUsers } from "@/components/digisac/topUsers"
import { useDigisacData } from "@/hooks/useDigisac"
import { useDigisacFilter } from "@/hooks/useDigisacFilterContext"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { NoDataFallback } from "@/hooks/useNoDataFallback"
import { ChartNoAxesCombined } from "lucide-react"

export default function DigisacPage() {
  const digisacReportFilters = useDigisacFilter()
  const digisacReportsData = useDigisacData()
  const isMobileViewport = useMediaQuery("(max-width: 767px)")
  const isDesktopViewport = useMediaQuery("(min-width: 1280px)")

  if (digisacReportsData.loading) return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="animate-spin size-8 mr-2 rounded-full border-4 border-accent-light border-r-accent" />
    </div>
  )

  if (!digisacReportsData.filteredReports || digisacReportsData.filteredReports.length === 0) return (<NoDataFallback />)

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <ChartNoAxesCombined className="size-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Atendimento</h1>
      </div>
      <p className="text-sm">Acompanhe as métricas de atendimento</p>

      {isDesktopViewport && (
        <section className="hidden xl:block">
          <Filters digisacReportData={digisacReportsData} digisacReportFilters={digisacReportFilters} />
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PerformanceMetrics digisacReports={digisacReportsData.filteredReports} />
      </section>

      {isMobileViewport ? (
        <section className="md:hidden">
          <TableMobile data={digisacReportsData.filteredReports} />
        </section>
      ) : (
        <section className="hidden md:block w-full">
          <TableDesktop reportData={digisacReportsData} reportFilters={digisacReportFilters} />
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AverageTime reports={digisacReportsData.filteredReports} />
        <TopUsers reports={digisacReportsData.filteredReports} />
      </section>
    </>
  )
}