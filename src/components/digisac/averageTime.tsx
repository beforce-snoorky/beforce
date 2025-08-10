"use client"

import type { DigisacReportEntry } from "@/types/digisac"
import { calculateAverageTime, toMinutes } from "@/utils/data"
import { Clock } from "lucide-react"
import { useMemo } from "react"
import { BarChart } from "../charts/bars"

export function AverageTime({ reports }: { reports: DigisacReportEntry[] }) {
  const chartData = useMemo(() => {
    const departmentTimesMap = new Map<string, string[]>()

    for (const report of reports) {
      const departmentName = report.department || "Sem Departamento"
      if (!departmentTimesMap.has(departmentName)) departmentTimesMap.set(departmentName, [])
      departmentTimesMap.get(departmentName)!.push(report.ticket_time)
    }

    const departmentsWithAverages = Array.from(departmentTimesMap.entries()).map(([departmentName, ticketTimes]) => {
      const averageTimeString = calculateAverageTime(ticketTimes)
      const averageTimeInMinutes = toMinutes(averageTimeString)
      return { departmentName, averageTimeString, averageTimeInMinutes }
    }).sort((a, b) => b.averageTimeInMinutes - a.averageTimeInMinutes)

    return {
      categories: departmentsWithAverages.map((item) => item.departmentName),
      values: departmentsWithAverages.map((item) => Number(item.averageTimeInMinutes.toFixed(2))),
      labels: departmentsWithAverages.map((item) => item.averageTimeString),
    }
  }, [reports])

  return (
    <div className="p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-accent" />
        <h2 className="text-md font-medium">Atendimento por Departamento</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Acompanhe as métricas de atendimento</p>
      <div className="w-full overflow-x-auto">
        <BarChart
          categories={chartData.categories}
          values={chartData.values}
          tooltipFormatter={(item) => `${item.value} min`}
          labelFormatter={(item) => `${item.value} min`}
        />
      </div>
    </div>
  )
}