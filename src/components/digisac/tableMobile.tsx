"use client"

import { DigisacReportEntry } from "@/types/digisac"
import { calculateAverageTime } from "@/utils/data"
import { Bot, Clock, FileText, Hourglass, MessageCircleMore, MessageSquare, Timer } from "lucide-react"
import { useMemo } from "react"

export function TableMobile({ data }: { data: DigisacReportEntry[] }) {
  const metrics = useMemo(() => ([
    { label: "Tempo médio de chamados", style: "text-sky-600 bg-sky-100", icon: <Hourglass className="w-5 h-5" />, key: "ticket_time", type: "time" },
    { label: "Tempo médio da primeira espera", style: "text-orange-600 bg-orange-100", icon: <Timer className="w-5 h-5" />, key: "waiting_time", type: "time" },
    { label: "Tempo médio após o bot", style: "text-amber-600 bg-amber-100", icon: <Bot className="w-5 h-5" />, key: "waiting_time_after_bot", type: "time" },
    { label: "Tempo médio de espera", style: "text-violet-600 bg-violet-100", icon: <Clock className="w-5 h-5" />, key: "waiting_time_avg", type: "time" },
    { label: "Mensagens enviadas", style: "text-emerald-600 bg-emerald-100", icon: <MessageSquare className="w-5 h-5" />, key: "sent_messages_count", type: "count" },
    { label: "Mensagens recebidas", style: "text-cyan-600 bg-cyan-100", icon: <MessageCircleMore className="w-5 h-5" />, key: "received_messages_count", type: "count" },
    { label: "Total de chamados", style: "text-rose-600 bg-rose-100", icon: <FileText className="w-5 h-5" />, key: "total_tickets_count", type: "count" },
  ]), [])

  const processedData = useMemo(() => {
    if (data.length === 0) return []

    return metrics.map(metric => {
      let value: string | undefined
      if (metric.type === "time") value = calculateAverageTime(data.map(report => report[metric.key as keyof DigisacReportEntry] as string))
      else if (metric.type === "count") value = data.reduce((total, report) => total + Number(report[metric.key as keyof DigisacReportEntry] || 0), 0).toString()

      return { ...metric, value }
    })
  }, [data, metrics])

  return (
    <section className="md:hidden space-y-2">
      {processedData.map((item, index) => (
        <div key={index} className="p-2 rounded-xl border border-surface bg-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.style}`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="font-bold">{item.value}</span>
          </div>
        </div>
      ))}
    </section>
  )
}