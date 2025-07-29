"use client"

import { MessageCircleMore, MessageCircleOff, MessageCirclePlus, UsersRound } from "lucide-react"
import { useMemo } from "react"
import Card from "../ui/cards"
import { DigisacReports } from "@/types/digisac"

export function PerformanceMetrics({ data }: { data: DigisacReports[] }) {
  const metricValues = useMemo(() => {
    return {
      opened: data.reduce((acc, report) => acc + Number(report.opened_tickets_count || 0), 0),
      closed: data.reduce((acc, report) => acc + Number(report.closed_tickets_count || 0), 0),
      messages: data.reduce((acc, report) => acc + Number(report.total_messages_count || 0), 0),
      contacts: data.reduce((acc, report) => acc + Number(report.contacts_count || 0), 0),
    }
  }, [data])

  const performanceMetrics = [
    { label: "Chamados abertos", style: "text-green-600 bg-green-100", icon: <MessageCirclePlus className="w-5 h-5" />, value: metricValues.opened },
    { label: "Chamados fechados", style: "text-accent bg-accent-light", icon: <MessageCircleOff className="w-5 h-5" />, value: metricValues.closed },
    { label: "Total de mensagens", style: "text-blue-600 bg-blue-100", icon: <MessageCircleMore className="w-5 h-5" />, value: metricValues.messages },
    { label: "Total de contatos", style: "text-purple-600 bg-purple-100", icon: <UsersRound className="w-5 h-5" />, value: metricValues.contacts }
  ]

  return (
    <>
      {performanceMetrics.map((metric, index) => (
        <Card key={index} style={metric.style}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-light/75`}>
              {metric.icon}
            </div>
            <span className="text-xl font-bold">{metric.value}</span>
          </div>
          <span className="text-sm text-dark/75">{metric.label}</span>
        </Card>
      ))}
    </>
  )
}