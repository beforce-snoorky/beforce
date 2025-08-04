"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import Card from "../ui/cards"
import { Clock } from "lucide-react"
import { DigisacReportEntry } from "@/types/digisac"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function TopUsers({ reports }: { reports: DigisacReportEntry[] }) {

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
    chart: {
      toolbar: { show: false },
      type: "radialBar",
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
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Melhores Atendentes</h2>
      </div>
      <p className="text-sm mb-4">Distribuição proporcional dos atendimentos</p>
      <hr className="w-full opacity-25" />
      <ReactApexChart options={options} series={data.series} type="radialBar" height={410} />
    </Card>
  )
}