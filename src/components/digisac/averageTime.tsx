"use client"

import { DigisacReportEntry } from "@/types/digisac"
import { calculateAverageTime, toMinutes } from "@/utils/data"
import { EChartsOption } from "echarts-for-react"
import { CallbackDataParams } from "echarts/types/dist/shared"
import { Clock } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

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

  const chartColors = [
    "#155dfc", "#00a63e", "#9810fa", "#e60076",
    "#8b5cf6", "#14b8a6", "#e11d48", "#7c3aed",
    "#f97316", "#0ea5e9", "#10b981", "#f43f5e",
    "#6366f1", "#22c55e", "#a855f7", "#ec4899"
  ]

  const chartValuesWithColors = chartData.values.map((value, index) => (
    { value, itemStyle: { color: chartColors[index % chartColors.length] } }
  ))

  const options: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: CallbackDataParams) => `${params.value} min`,
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 16,
      top: 32,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.categories,
      axisLabel: {
        interval: 0,
        rotate: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "{value} min" }
    },
    series: [
      {
        type: "bar",
        data: chartValuesWithColors,
        itemStyle: { borderRadius: [16, 16, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: (params: CallbackDataParams) => `${params.value} min`,
          fontSize: 10,
          color: "#242424"
        }
      }
    ]
  }

  return (
    <div className="p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <h2 className="text-md font-medium">Atendimento por Departamento</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Acompanhe as métricas de atendimento</p>
      <div className="w-full overflow-x-auto">
        <ReactECharts option={options} style={{ height: 410, width: "100%" }} />
      </div>
    </div>
  )
}