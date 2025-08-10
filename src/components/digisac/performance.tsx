"use client"

import type { DigisacReportEntry } from "@/types/digisac"
import { EChartsOption } from "echarts-for-react"
import { MessageCircleMore, MessageCircleOff, MessageCirclePlus, UsersRound } from "lucide-react"
import { Card } from "../ui/cards"
import dynamic from "next/dynamic"

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

export function PerformanceMetrics({ digisacReports }: { digisacReports: DigisacReportEntry[] }) {
  const performanceMetrics = [
    { label: "Chamados abertos", key: "opened_tickets_count", style: "text-blue-600 bg-blue-100", icon: <MessageCirclePlus className="size-5" />, color: "#155dfc" },
    { label: "Chamados fechados", key: "closed_tickets_count", style: "text-green-600 bg-green-100", icon: <MessageCircleOff className="size-5" />, color: "#00a63e" },
    { label: "Total de mensagens", key: "total_messages_count", style: "text-purple-600 bg-purple-100", icon: <MessageCircleMore className="size-5" />, color: "#9810fa" },
    { label: "Total de contatos", key: "contacts_count", style: "text-pink-600 bg-pink-100", icon: <UsersRound className="size-5" />, color: "#e60076" },
  ]

  return (
    <>
      {performanceMetrics.map((metric, index) => {
        const values = digisacReports.map((entry) => Number(entry[metric.key as keyof DigisacReportEntry] || 0))
        const total = values.reduce((acc, value) => acc + value, 0)

        const option: EChartsOption = {
          grid: { left: 0, right: 0, top: 10, bottom: 0 },
          xAxis: { type: "category", show: false, data: values.map((_, index) => index) },
          yAxis: { type: "value", show: false },
          series: [{
            data: values,
            type: "line",
            smooth: true,
            symbol: "none",
            lineStyle: { color: metric.color, width: 2 },
            areaStyle: { color: `${metric.color}22` },
          }],
          tooltip: { show: false }
        }

        return (
          <Card key={index}>
            <div className="flex max-lg:flex-col lg:items-center justify-between lg:gap-4">
              <div className="lg:w-1/2">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${metric.style}`}>
                    {metric.icon}
                  </div>
                  <span className="text-xl font-medium text-gray-900">{total}</span>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">{metric.label}</span>
              </div>
              <div className="lg:w-1/2">
                <ReactECharts option={option} style={{ height: 60, width: "100%" }} />
              </div>
            </div>
          </Card>
        )
      })}
    </>
  )
}