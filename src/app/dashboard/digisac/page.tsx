import AverageTime from "@/components/digisac/averageTime";
import { Filters } from "@/components/digisac/filter";
import { PerformanceMetrics } from "@/components/digisac/performance";
import { TableDesktop } from "@/components/digisac/tableDesktop";
import { TableMobile } from "@/components/digisac/tableMobile";
import TopUsers from "@/components/digisac/topUsers";
import { ChartNoAxesCombined } from "lucide-react";

export default function DigisacPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-1 md">
        <ChartNoAxesCombined className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Atendimento</h1>
      </div>
      <p className="text-sm">Acompanhe as métricas de atendimento</p>

      <Filters />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <PerformanceMetrics />
      </section>

      <TableMobile />

      <TableDesktop />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AverageTime />
        <TopUsers />
      </section>
    </>
  )
}