"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import Card from "../ui/cards"
import { Clock } from "lucide-react"
import { DigisacReportEntry } from "@/types/digisac"
import { calculateAverageTime, toMinutes } from "@/utils/data"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function AverageTime({ reports }: { reports: DigisacReportEntry[] }) {
  const data = useMemo(() => {
    const map = new Map<string, string[]>()

    for (const report of reports) {
      const department = report.department || "Sem Departamento"
      if (!map.has(department)) map.set(department, [])
      map.get(department)!.push(report.ticket_time)
    }

    const items = Array.from(map.entries()).map(([department, times]) => {
      const avgStr = calculateAverageTime(times)
      const avgMin = toMinutes(avgStr)
      return { department, avgTimeStr: avgStr, avgMin }
    }).sort((a, b) => b.avgMin - a.avgMin)

    const seriesData = items.map((item) => Number(item.avgMin.toFixed(2)))
    const maxYValue = Math.ceil(Math.max(...seriesData) / 10) * 10

    return {
      categories: items.map((item) => item.department),
      seriesData,
      formattedLabels: items.map((item) => item.avgTimeStr),
      maxYValue
    }
  }, [reports])

  const series = [{ name: "Tempo médio de atendimento", data: data.seriesData }]

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "bar",
    },
    dataLabels: {
      enabled: true,
      offsetY: 16,
      formatter: (val: string | number | number[]) => {
        const numVal = typeof val === "number" ? val : Number(val)
        return `${numVal.toFixed(0)} min`
      },
      style: { colors: ["#000000"] },
      background: { enabled: false },
      textAnchor: "middle",
      distributed: true,
    },
    grid: { show: false },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 16,
        borderRadiusApplication: "end",
        distributed: true,
      }
    },
    tooltip: { enabled: false },
    xaxis: {
      type: "category",
      categories: data.categories,
      axisTicks: { show: false },
      tickAmount: 6,
      tooltip: { enabled: false },
    },
    yaxis: {
      show: false,
      max: data.maxYValue,
      tickAmount: data.maxYValue,
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Atendimento por Departamento</h2>
      </div>
      <p className="text-sm mb-4">Acompanhe as métricas de atendimento</p>
      <hr className="w-full opacity-25" />
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: `${data.categories.length * 80}px` }}>
          <ReactApexChart options={options} series={series} type="bar" height={410} />
        </div>
      </div>
    </Card>
  )
}