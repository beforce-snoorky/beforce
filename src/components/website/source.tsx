"use client"

import { SourceData } from "@/types/website"
import { useMemo } from "react"
import { BarChart } from "../charts/bars"
import { Network } from "lucide-react"

export function SourceStatistics({ origem }: { origem: SourceData[] | undefined }) {
  const chartData = useMemo(() => {
    if (!origem) return { categories: [], values: [] }

    const sorted = [...origem].sort((a, b) => Number(b.sessions) - Number(a.sessions))

    return {
      categories: sorted.map(item => translateChannel(item.sessionDefaultChannelGroup)),
      values: sorted.map(item => Number(item.sessions)),
    }
  }, [origem])

  function translateChannel(channel: string): string {
    const map: Record<string, string> = {
      "Organic Social": "Social",
      "Organic Search": "Orgânico",
      "Referral": "Referência",
      "Direct": "Direto",
      "Paid Search": "Pago",
      "Paid Social": "Social Pago",
      "Display": "Display",
      "Email": "Email",
      "Affiliates": "Afiliados",
      "Other": "Outro",
      "Unassigned": "Não Atribuído"
    }

    return map[channel] || channel
  }

  return (
    <div className="col-span-8 md:col-span-4 p-4 pb-0 rounded-xl border border-surface bg-light">
      <div className="flex items-center gap-2">
        <Network className="size-5 text-accent" />
        <h2 className="text-md font-medium">Sessões por Origem</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">Distribuição das sessões por canal de aquisição</p>
      <BarChart
        categories={chartData.categories}
        values={chartData.values}
        tooltipFormatter={(item) => `${item.value} sessões`}
        labelFormatter={(item) => `${item.value} sessões`}
      />
    </div>
  )
}