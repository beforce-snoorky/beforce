"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Network } from "lucide-react"
import { SourceData } from "@/types/website"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function SessionsByOrigin({ origem }: { origem: SourceData[] | undefined }) {
  const data = useMemo(() => {
    if (!origem) return { categories: [], seriesData: [] }
    const sorted = [...origem].sort((a, b) => Number(b.sessions) - Number(a.sessions))

    return {
      categories: sorted.map(item => item.sessionDefaultChannelGroup),
      seriesData: sorted.map(item => Number(item.sessions)),
    }
  }, [origem])

  const series = [{ name: "Sessões", data: data.seriesData }]

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "bar",
      offsetX: -24,
    },
    dataLabels: {
      enabled: true,
      formatter(val) { return `${val} sessões` },
      style: { colors: ["#000000"] },
      background: { enabled: false },
      offsetX: 16,
      textAnchor: "middle",
      distributed: true,
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: "end",
        distributed: true,
      }
    },
    tooltip: { enabled: false },
    xaxis: {
      type: "category",
      categories: data.categories,
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { show: false }
  }

  return (
    <div className="order-1 p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Network className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Sessões por Origem</h2>
      </div>
      <p className="text-sm mb-4">Distribuição das sessões por canal de aquisição</p>
      <hr className="w-full opacity-25" />
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${data.categories.length * 100}px` }}>
          <ReactApexChart options={options} series={series} type="bar" width="100%" height={410} />
        </div>
      </div>
    </div>
  )
}