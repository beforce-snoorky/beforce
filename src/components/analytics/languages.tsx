"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Languages } from "lucide-react"
import { LanguageData } from "@/types/analytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function LanguageGroupedChart({ language }: { language: LanguageData[] }) {
  const data = useMemo(() => {
    const categories = language.map(l => l.language)
    const newUsers = language.map(l => Number(l.newUsers || 0))
    const activeUsers = language.map(l => Number(l.activeUsers || 0))
    const allValues = [...newUsers, ...activeUsers]
    const maxYValue = Math.ceil(Math.max(...allValues) / 10) * 10

    return { categories, newUsers, activeUsers, maxYValue }
  }, [language])

  const series = [
    { name: "Novos Usuários", data: data.newUsers },
    { name: "Usuários Ativos", data: data.activeUsers },
  ]

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "bar",
      offsetX: 16,
    },
    dataLabels: {
      offsetY: 16,
      style: { colors: ["#000000"] },
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        borderRadiusApplication: "end",
        distributed: false,
      }
    },
    tooltip: {
      shared: true,
      intersect: false
    },
    xaxis: {
      type: "category",
      categories: data.categories,
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      show: true,
      tickAmount: 10,
    }
  }

  return (
    <div className="order-6 md:order-4 w-full p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Languages className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Distribuição por Idioma</h2>
      </div>
      <p className="text-sm mb-4">Comparativo de usuários por idioma</p>
      <hr className="w-full opacity-25" />
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${data.categories.length * 100}px` }}>
          <ReactApexChart options={options} series={series} type="bar" width="100%" height={410} />
        </div>
      </div>
    </div>
  )
}
