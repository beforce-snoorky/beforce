"use client"

import AverageTime from "@/components/digisac/averageTime";
import { Filters } from "@/components/digisac/filter";
import { PerformanceMetrics } from "@/components/digisac/performance";
import { TableDesktop } from "@/components/digisac/tableDesktop";
import { TableMobile } from "@/components/digisac/tableMobile";
import TopUsers from "@/components/digisac/topUsers";
import { useDigisacData } from "@/hooks/useDigisac";
import { useReportFilter } from "@/hooks/useFilterContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChartNoAxesCombined } from "lucide-react";

export default function DigisacPage() {
  const reportFilter = useReportFilter()
  const reportsData = useDigisacData()
  const isMobile = useMediaQuery("(max-width: 767px)")

  return (
    <>
      <div className="flex items-center gap-2 mb-1 md">
        <ChartNoAxesCombined className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Atendimento</h1>
      </div>
      <p className="text-sm">Acompanhe as métricas de atendimento</p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <PerformanceMetrics data={reportsData.filteredReports} />
      </section>

      {!isMobile && (
        <section className="hidden xl:block">
          <Filters reportData={reportsData} reportFilters={reportFilter} />
        </section>
      )}

      {isMobile ? (
        <section className="md:hidden space-y-2">
          <TableMobile data={reportsData.filteredReports} />
        </section>
      ) : (
        <section className="w-full">
          <TableDesktop reportData={reportsData} reportFilters={reportFilter} />
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AverageTime reports={reportsData.filteredReports} />
        <TopUsers reports={reportsData.filteredReports} />
      </section>
    </>
  )
}