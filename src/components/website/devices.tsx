"use client"

import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { MonitorSmartphone } from "lucide-react"
import { DeviceData } from "@/types/website"

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
      offsetY: 16,
    },
    dataLabels: {
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { colors: ["#000000"] },
      dropShadow: { enabled: false },
    },
    labels: data.labels,
    legend: {
      show: true,
      position: "bottom",
      formatter: (val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
      markers: { size: 8 },
    },
    plotOptions: { pie: { expandOnClick: false } },
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
    <div className="order-3 p-4 pb-4 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <MonitorSmartphone className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Usuários por Dispositivo</h2>
      </div>
      <p className="text-sm mb-4">Proporção de usuários ativos por tipo de dispositivo</p>
      <hr className="w-full opacity-25" />
      <ReactApexChart options={options} series={data.seriesData} type="donut" height={380} />
    </div>
  )
}