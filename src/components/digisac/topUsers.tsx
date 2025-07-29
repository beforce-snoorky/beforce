"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import Card from "../ui/cards"
import { Clock } from "lucide-react"
import { DigisacReports } from "@/types/digisac"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function TopUsers({ reports }: { reports: DigisacReports[] }) {

  const data = useMemo(() => {
    const map = new Map<string, number>()

    for (const report of reports) {
      const user = report.operator_name || "Sem Usuário"
      map.set(user, (map.get(user) || 0) + report.closed_tickets_count || 0)
    }

    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const labels = sorted.map(([name]) => name)
    const series = sorted.map(([, value]) => value)

    return { labels, series }
  }, [reports])

  const options: ApexOptions = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 10,
          size: "16%",
        },
        dataLabels: {
          name: { show: false },
          value: { show: true },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -16,
          fontSize: "14px",
          formatter: function (seriesName: string) {
            return `${seriesName}`
          },
        },
      },
    },
    labels: data.labels,
    legend: { show: false },
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Melhores Atendentes</h2>
      </div>
      <p className="text-sm mb-2">Distribuição proporcional dos atendimentos</p>
      <ReactApexChart options={options} series={data.series} type="radialBar" height={350} />
    </Card>
  )
}