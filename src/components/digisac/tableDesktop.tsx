import { useDigisacData } from "@/hooks/useDigisac"
import { useDigisacFilter } from "@/context/digisacContext"
import type { DigisacReportEntry } from "@/types/digisac"
import { ensureFullPeriodFormat } from "@/utils/data"
import { UsersRound } from "lucide-react"
import { useMemo } from "react"
import { Table, TableBody, TableDataCell, TableHead, TableHeaderCell, TableRow } from "../ui/table"
import { Icon } from "../ui/icon"

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
            <Table style="min-w-full">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="w-48">Usuário</TableHeaderCell>
                  <TableHeaderCell style="w-48">Departamento</TableHeaderCell>
                  {metrics.map((item) => (
                    <TableHeaderCell key={item.key} style="w-24"><div className="w-24">{item.label}</div></TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(({ operator, department, key, values }, index) => {
                  const selectedKey = reportFilters.selectedOperatorDepartment.trim()
                  const currentKey = key.trim()
                  const isDimmed = selectedKey !== "Todos" && selectedKey !== currentKey

                  return (
                    <TableRow key={index} style={`${isDimmed ? "opacity-40" : "opacity-100"} even:bg-gray-100`}>
                      <TableDataCell style="flex items-center gap-2">
                        <Icon icon={<UsersRound className="size-4" />} />
                        <span className="truncate w-48 max-w-48 block">{operator}</span>
                      </TableDataCell>
                      <TableDataCell style="w-48 max-w-48">{department}</TableDataCell>
                      {values.map((value, index) => (
                        <TableDataCell key={index} style="w-24">
                          <div className="w-24">{value}</div>
                        </TableDataCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}