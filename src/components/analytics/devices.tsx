"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import Card from "../ui/cards"
import { Smartphone } from "lucide-react"
import { DeviceData } from "@/types/analytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function UsersByDevice({ devices }: { devices: DeviceData[] | undefined }) {
  const data = useMemo(() => {
    if (!devices) return { labels: [], seriesData: [] }

    const total = devices.reduce((sum, item) => sum + Number(item.activeUsers), 0)

    return {
      labels: devices.map(item => item.deviceCategory),
      seriesData: devices.map(item =>
        total === 0 ? 0 : +(Number(item.activeUsers) / total * 100).toFixed(2)
      ),
    }
  }, [devices])

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "donut",
    },
    dataLabels: { formatter: (val: number) => `${val.toFixed(1)}%` },
    labels: data.labels,
    legend: {
      show: true,
      position: "bottom",
      formatter: (val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
      markers: { size: 8 },
    },
    plotOptions: {
      pie: { expandOnClick: false },
    },
    tooltip: { enabled: false },
    xaxis: {
      type: "category",
      categories: data.seriesData,
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { show: false }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Usuários por Dispositivo</h2>
      </div>
      <p className="text-sm mb-4">Proporção de usuários ativos por tipo de dispositivo</p>
      <ReactApexChart options={options} series={data.seriesData} type="donut" height={410} />
    </Card>
  )
}