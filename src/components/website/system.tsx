"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Server } from "lucide-react"
import { SystemData } from "@/types/website"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function UsersBySystem({ system }: { system: SystemData[] | undefined }) {
  const data = useMemo(() => {
    if (!system || system.length === 0) return { labels: [], seriesData: [], originalValues: [] }
    const sorted = [...system].sort((a, b) => Number(b.activeUsers) - Number(a.activeUsers))
    const max = Number(sorted[0]?.activeUsers || 1)

    return {
      labels: sorted.map(item => item.operatingSystem),
      originalValues: sorted.map(item => Number(item.activeUsers)),
      seriesData: sorted.map(item => (Number(item.activeUsers) / max) * 100),
    }
  }, [system])


  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "radialBar",
      offsetY: 16,
    },
    labels: data.labels,
    plotOptions: {
      radialBar: {
        endAngle: 270,
        hollow: {
          margin: 8,
          size: "30%",
        },
        dataLabels: { show: false },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -16,
          fontWeight: 600,
          fontSize: "14px",
        },
      },
    },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      y: {
        formatter: (_val, opts) => {
          const index = opts.seriesIndex
          const value = data.originalValues?.[index]
          return `${value} usuários`
        },
      },
    }
  }

  return (
    <div className="order-2 p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Server className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Usuários por Sistema Operacional</h2>
      </div>
      <p className="text-sm mb-4">Distribuição de usuários ativos por sistema</p>
      <hr className="w-full opacity-25" />
      <ReactApexChart options={options} series={data.seriesData} type="radialBar" height={410} />
    </div>
  )
}