import { useDigisacData } from "@/hooks/useDigisac"
import { useDigisacFilter } from "@/hooks/useDigisacFilterContext"
import { DigisacReportEntry } from "@/types/digisac"
import { ensureFullPeriodFormat } from "@/utils/data"
import { UsersRound } from "lucide-react"
import { useMemo } from "react"

type TableDesktopProps = {
  reportData: ReturnType<typeof useDigisacData>
  reportFilters: ReturnType<typeof useDigisacFilter>
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
    const grouped = new Map<string, {
      operator: string
      department: string
      report: DigisacReportEntry
    }>()

    for (const report of reports) {
      const operator = report.operator_name.trim()
      const department = report.department.trim()
      const rowKey = `${operator}||${department}`
      if (!grouped.has(rowKey)) grouped.set(rowKey, { operator, department, report })
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
    <section className="flex flex-col">
      <div className="overflow-auto max-h-107 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-107 overflow-y-auto bg-light">
            <table className="min-w-full divide-y divide-surface">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-48 text-gray-500">Usuário</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-48 text-gray-500">Departamento</th>
                  {metrics.map((item) => (
                    <th key={item.key} className="py-3 px-4 text-center text-xs font-medium uppercase w-24 text-gray-500">
                      <div className="w-24">{item.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(({ operator, department, key, values }, index) => {
                  const selectedKey = reportFilters.selectedOperatorDepartment.trim()
                  const currentKey = key.trim()
                  const isDimmed = selectedKey !== "Todos" && selectedKey !== currentKey

                  return (
                    <tr key={index} className={`${isDimmed ? "opacity-40" : "opacity-100"} even:bg-gray-100`}>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <UsersRound className="w-4 h-4" />
                        </div>
                        <span className="truncate w-48 max-w-48 block">{operator}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 w-48 max-w-48">{department}</td>
                      {values.map((value, index) => (
                        <td key={index} className="py-3 px-4 whitespace-nowrap text-sm text-center text-gray-800 w-24">
                          <div className="w-24">{value}</div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}