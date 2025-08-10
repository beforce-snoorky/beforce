"use client"

import type { DigisacReportEntry } from "@/types/digisac"
import { calculateAverageTime } from "@/utils/data"
import { Bot, ChevronDown, Clock, FileText, Hourglass, MessageCircleMore, MessageSquare, Search, Timer, UsersRound } from "lucide-react"
import { useMemo, useState } from "react"
import { Card } from "../ui/cards"
import { Input } from "../ui/input"
import { Icon } from "../ui/icon"

export function TableMobile({ data }: { data: DigisacReportEntry[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const metrics = useMemo(() => ([
    { label: "Tempo médio de chamados", style: "text-sky-600 bg-sky-100", icon: <Hourglass className="size-4" />, key: "ticket_time", type: "time" },
    { label: "Tempo médio da 1ª espera", style: "text-orange-600 bg-orange-100", icon: <Timer className="size-4" />, key: "waiting_time", type: "time" },
    { label: "Tempo após BOT", style: "text-amber-600 bg-amber-100", icon: <Bot className="size-4" />, key: "waiting_time_after_bot", type: "time" },
    { label: "Tempo médio de espera", style: "text-violet-600 bg-violet-100", icon: <Clock className="size-4" />, key: "waiting_time_avg", type: "time" },
    { label: "Mensagens enviadas", style: "text-emerald-600 bg-emerald-100", icon: <MessageSquare className="size-4" />, key: "sent_messages_count", type: "count" },
    { label: "Mensagens recebidas", style: "text-cyan-600 bg-cyan-100", icon: <MessageCircleMore className="size-4" />, key: "received_messages_count", type: "count" },
    { label: "Total de chamados", style: "text-rose-600 bg-rose-100", icon: <FileText className="size-4" />, key: "total_tickets_count", type: "count" }
  ]), [])

  const groupedData = useMemo(() => {
    const grouped = new Map<string, DigisacReportEntry[]>()

    for (const report of data) {
      const operator = report.operator_name?.trim() || "Sem nome"
      const department = report.department?.trim() || "Sem departamento"
      const rowKey = `${operator}||${department}`

      if (!grouped.has(rowKey)) grouped.set(rowKey, [])
      grouped.get(rowKey)!.push(report)
    }

    return Array.from(grouped.entries()).map(([key, reports]) => {
      const [operator, department] = key.split("||")

      const values = metrics.map(metric => {
        if (metric.type === "time") return calculateAverageTime(reports.map(item => item[metric.key as keyof DigisacReportEntry] as string))
        else return reports.reduce((acc, r) => acc + Number(r[metric.key as keyof DigisacReportEntry] || 0), 0).toString()
      })

      return { key, operator, department, values }
    })
  }, [data, metrics])

  const toggleExpand = (key: string) => setExpandedKey(prev => (prev === key ? null : key))

  const filteredData = useMemo(() => {
    if (!searchTerm) return groupedData

    return groupedData.filter(({ operator, department }) => {
      const lower = searchTerm.toLowerCase()
      return operator.toLowerCase().includes(lower) || department.toLowerCase().includes(lower)
    })
  }, [groupedData, searchTerm])

  if (groupedData.length === 0) {
    return (
      <div className="md:hidden flex items-center justify-center min-h-40">
        <p className="text-sm text-dark/50">Nenhum dado encontrado.</p>
      </div>
    )
  }

  return (
    <Card>
      <div className="space-y-2">
        <Input
          id="search"
          icon={<Search className="size-5 text-gray-500" />}
          name="search"
          type="text"
          placeholder="Buscar por atendente ou departamento.."
          autoComplete="search"
          className="placeholder:text-sm border border-surface bg-light text-gray-800"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center min-h-32">
            <p className="text-sm text-muted">Nenhum resultado encontrado.</p>
          </div>
        ) : (
          filteredData.map(({ key, operator, department, values }) => {
            const isExpanded = expandedKey === key

            return (
              <Card key={key}>
                <div className="flex items-center justify-between" onClick={() => toggleExpand(key)}>
                  <div className="flex items-center gap-2">
                    <Icon icon={<UsersRound className="size-4" />} />
                    <div className="flex flex-col">
                      <span className="text-sm leading-tight">{operator}</span>
                      <span className="text-xs text-gray-500 leading-tight">{department}</span>
                    </div>
                  </div>
                  <ChevronDown className={`size-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    {metrics.map((item, index) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon={item.icon} style={item.style} />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <span className="font-medium">{values[index]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </Card>
  )
}