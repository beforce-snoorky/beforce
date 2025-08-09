"use client"

import { DigisacReportEntry } from "@/types/digisac"
import { EChartsOption } from "echarts-for-react"
import { Clock } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export function TopUsers({ reports }: { reports: DigisacReportEntry[] }) {
  const chartData = useMemo(() => {
    const map = new Map<string, number>()

    for (const report of reports) {
      const user = report.operator_name || "Sem Usuário"
      const current = map.get(user) || 0
      map.set(user, current + (report.closed_tickets_count || 0))
    }

    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return sorted.map(([name, value]) => ({ value, name }))
  }, [reports])

  const colors = ["#2563eb", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"]

  const options: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 16,
      textStyle: { fontSize: 11 },
    },
    series: [{
      name: "Atendimentos",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      padAngle: 4,
      itemStyle: { borderRadius: 16 },
      center: ["50%", "40%"],
      label: { show: false },
      data: chartData.map((item, index) => ({
        ...item,
        itemStyle: { color: colors[index % colors.length] }
      }))
    }]
  }

  return (
    <div className="p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-accent" />
        <h2 className="text-md font-medium">Melhores Atendentes</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Distribuição proporcional dos atendimentos</p>
      <ReactECharts option={options} style={{ height: 410, width: "100%" }} />
    </div>
  )
}