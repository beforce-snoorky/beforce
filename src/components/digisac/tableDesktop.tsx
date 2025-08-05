"use client"

import { useDigisacData } from "@/hooks/useDigisac"
import { useReportFilter } from "@/hooks/useFilterContext"
import { DigisacReportEntry } from "@/types/digisac"
import { ensureFullPeriodFormat } from "@/utils/data"
import { UsersRound } from "lucide-react"
import { useMemo } from "react"

type TableDesktopProps = {
  reportData: ReturnType<typeof useDigisacData>
  reportFilters: ReturnType<typeof useReportFilter>
}

export function TableDesktop({ reportData, reportFilters }: TableDesktopProps) {
  const period = ensureFullPeriodFormat(reportFilters.selectedPeriod)

  const metrics = useMemo(() => ([
    { label: "Média de chamados", key: "ticket_time", type: "time" },
    { label: "Média da 1ª Espera", key: "waiting_time", type: "time" },
    { label: "Média Após BOT", key: "waiting_time_after_bot", type: "time" },
    { label: "Médio de Espera", key: "waiting_time_avg", type: "time" },
    { label: "Mensagens Enviadas", key: "sent_messages_count", type: "count" },
    { label: "Mensagens Recebidas", key: "received_messages_count", type: "count" },
    { label: "Total Chamados", key: "total_tickets_count", type: "count" },
  ]), [])

  const data = useMemo(() => {
    const reports = reportData.reportsByPeriod[period] || []
    const grouped = new Map<string, { operator: string; department: string; report: DigisacReportEntry }>()

    for (const report of reports) {
      const operator = report.operator_name.trim()
      const department = report.department.trim()
      const key = `${operator}||${department}`
      if (!grouped.has(key)) grouped.set(key, { operator, department, report })
    }

    return Array.from(grouped.values()).map(({ operator, department, report }) => {
      const values = metrics.map(({ key }) => {
        const val = report[key as keyof DigisacReportEntry]
        return val !== undefined && val !== null ? val : "-"
      })

      return { operator, department, key: `${operator}||${department}`, values }
    })
  }, [reportData.reportsByPeriod, period, metrics])

  return (
    <section className="w-full">
      <div className="w-full overflow-auto max-h-104 relative rounded-xl border border-surface bg-light">
        <table className="min-w-max w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="px-3 py-3 text-sm font-medium text-left">Usuários</th>
              <th className="px-3 py-3 text-sm font-medium text-center">Departamento</th>
              {metrics.map((m) => (
                <th key={m.key} className="px-3 py-3 text-sm font-medium text-center">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(({ operator, department, key, values }, index) => {
              const selectedKey = reportFilters.selectedOperatorDepartment.trim()
              const currentKey = key.trim()
              const isDimmed = selectedKey !== "Todos" && selectedKey !== currentKey

              return (
                <tr key={index} className={`border-b last:border-none border-surface even:bg-dark/3 ${isDimmed ? "opacity-40" : "opacity-100"}`}>
                  <td className="px-3 py-3 text-sm flex items-center gap-2 max-w-xs">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                      <UsersRound className="w-4 h-4" />
                    </div>
                    <span className="truncate w-52 max-w-52 block">{operator}</span>
                  </td>
                  <td className="truncate w-40 max-w-40 px-3 py-3 text-sm text-center">{department}</td>
                  {values.map((value, index) => (
                    <td key={index} className="truncate w-48 max-w-48 px-3 py-3 text-sm text-center">{value}</td>
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