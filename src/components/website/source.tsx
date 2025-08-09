"use client"

import { SourceData } from "@/types/website"
import { EChartsOption } from "echarts-for-react"
import { Network } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export default function OriginStatistics({ origem }: { origem: SourceData[] | undefined }) {
  const chartData = useMemo(() => {
    if (!origem) return { categories: [], values: [] }

    const sorted = [...origem].sort((a, b) => Number(b.sessions) - Number(a.sessions))

    return {
      categories: sorted.map(item => translateChannel(item.sessionDefaultChannelGroup)),
      values: sorted.map(item => Number(item.sessions)),
    }
  }, [origem])

  const colors = [
    "#155dfc", "#00a63e", "#9810fa", "#e60076",
    "#8b5cf6", "#14b8a6", "#e11d48", "#7c3aed",
    "#f97316", "#0ea5e9", "#10b981", "#f43f5e",
    "#6366f1", "#22c55e", "#a855f7", "#ec4899"
  ]

  const coloredData = chartData.values.map((value, index) => ({
    value,
    itemStyle: { color: colors[index % colors.length] }
  }))

  function translateChannel(channel: string): string {
    const map: Record<string, string> = {
      "Organic Social": "Social",
      "Organic Search": "Orgânico",
      "Referral": "Referência",
      "Direct": "Direto",
      "Paid Search": "Pago",
      "Paid Social": "Social Pago",
      "Display": "Display",
      "Email": "Email",
      "Affiliates": "Afiliados",
      "Other": "Outro",
      "Unassigned": "Não Atribuído"
    }

    return map[channel] || channel
  }

  const options: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (val: any) => `${val.value} sessões`,
    },
    grid: {
      left: 0,
      right: 16,
      bottom: 16,
      top: 32,
      containLabel: true,
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "{value}" }
    },
    xAxis: {
      type: "category",
      data: chartData.categories,
      axisLabel: {
        fontSize: 10,
        overflow: "truncate",
      },
    },
    series: [
      {
        type: "bar",
        data: coloredData,
        itemStyle: { borderRadius: [16, 16, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: (val: any) => `${val.value} sessões`,
          fontSize: 10,
          color: "#242424"
        }
      }
    ]
  }

  return (
    <div className="col-span-8 md:col-span-4 p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Network className="w-5 h-5 text-accent" />
        <h2 className="text-md font-medium">Sessões por Origem</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Distribuição das sessões por canal de aquisição</p>
      <div className="w-full overflow-x-auto">
        <ReactECharts option={options} style={{ height: 410, width: "100%" }} />
      </div>
    </div>
  )
}