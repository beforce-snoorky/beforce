"use client"

import { useDigisacData } from "@/hooks/useDigisac"
import { useReportFilter } from "@/hooks/useFilterContext"
import { DigisacReports } from "@/types/digisac"
import { normalizePeriod } from "@/utils/data"
import { UsersRound } from "lucide-react"
import { useMemo } from "react"

type TableDesktopProps = {
  reportData: ReturnType<typeof useDigisacData>
  reportFilters: ReturnType<typeof useReportFilter>
}

export function TableDesktop({ reportData, reportFilters }: TableDesktopProps) {
  const period = normalizePeriod(reportFilters.selectedPeriod)

  const metrics = useMemo(() => ([
    { label: "Tempo médio de chamados", key: "ticket_time", type: "time" },
    { label: "Tempo médio da primeira espera", key: "waiting_time", type: "time" },
    { label: "Tempo médio após o bot", key: "waiting_time_after_bot", type: "time" },
    { label: "Tempo médio de espera", key: "waiting_time_avg", type: "time" },
    { label: "Mensagens enviadas", key: "sent_messages_count", type: "count" },
    { label: "Mensagens recebidas", key: "received_messages_count", type: "count" },
    { label: "Total de chamados", key: "total_tickets_count", type: "count" },
  ]), [])

  const data = useMemo(() => {
    const reports = reportData.reportsByPeriod[period] || []
    const grouped = new Map<string, { operator: string; department: string; report: DigisacReports }>()

    for (const report of reports) {
      const operator = report.operator_name.trim()
      const department = report.department.trim()
      const key = `${operator}||${department}`
      if (!grouped.has(key)) grouped.set(key, { operator, department, report })
    }

    return Array.from(grouped.values()).map(({ operator, department, report }) => {
      const values = metrics.map(({ key }) => {
        const val = report[key as keyof DigisacReports]
        return val !== undefined && val !== null ? val : "-"
      })

      return { operator, department, key: `${operator}||${department}`, values }
    })
  }, [reportData.reportsByPeriod, period, metrics])

  return (
    <section className="w-full">
      <div className="w-full overflow-auto max-h-104 relative rounded-xl border border-surface bg-light">
        <table className="min-w-max w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="bg-dark/6">
              <th className="px-3 py-3 text-sm font-medium text-left">Usuários</th>
              <th className="px-3 py-3 text-sm font-medium text-left">Departamento</th>
              {metrics.map((m) => (
                <th key={m.key} className="px-3 py-3 text-sm font-medium text-left">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(({ operator, department, key, values }, index) => {
              const selectedKey = reportFilters.selectedOperatorDepartment.trim()
              const currentKey = key.trim()
              const isDimmed = selectedKey !== "Todos" && selectedKey !== currentKey

              return (
                <tr key={index} className={`border-b last:border-none border-surface even:bg-dark/6 ${isDimmed ? "opacity-40" : "opacity-100"}`}>
                  <td className="px-3 py-3 text-sm flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                      <UsersRound className="w-4 h-4" />
                    </div>
                    {operator}
                  </td>
                  <td className="px-3 py-3 text-sm">{department}</td>
                  {values.map((value, index) => (
                    <td key={index} className="px-3 py-3 text-sm text-center">{value}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}