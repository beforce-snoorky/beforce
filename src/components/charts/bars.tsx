"use client"

import dynamic from "next/dynamic"
import type { EChartsOption } from "echarts-for-react"
import { CallbackDataParams } from "echarts/types/dist/shared"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

type BarChartProps = {
  categories: string[]
  values: number[]
  tooltipFormatter?: (params: CallbackDataParams) => string
  labelFormatter?: (params: CallbackDataParams) => string
  height?: number
}

export function BarChart({
  categories,
  values,
  tooltipFormatter = (p) => `${p.value}`,
  labelFormatter = (p) => `${p.value}`,
  height = 410
}: BarChartProps) {

  const colors = [
    "#155dfc", "#00a63e", "#9810fa", "#e60076",
    "#8b5cf6", "#14b8a6", "#e11d48", "#7c3aed",
    "#f97316", "#0ea5e9", "#10b981", "#f43f5e",
    "#6366f1", "#22c55e", "#a855f7", "#ec4899"
  ]

  const coloredData = values.map((value, index) => ({
    value,
    itemStyle: { color: colors[index % colors.length] }
  }))

  const options: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: tooltipFormatter,
    },
    grid: {
      left: 0,
      right: 16,
      bottom: 16,
      top: 32,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        fontSize: 10,
        interval: 0,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "{value}" }
    },
    series: [
      {
        type: "bar",
        data: coloredData,
        itemStyle: { borderRadius: [16, 16, 0, 0] },
        label: {
          show: true,
          position: "top",
          formatter: labelFormatter,
          fontSize: 10,
          color: "#242424"
        }
      }
    ]
  }

  const pxPerBar = 80

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: categories.length * pxPerBar }}>
        <ReactECharts option={options} style={{ height, width: "100%" }} />
      </div>
    </div>
  )
}
