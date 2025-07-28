"use client"

import { useReportFilter } from "@/context/reportFilter"
import { useDigisacData } from "@/hooks/useDigisacData"
import { useEffect, useState } from "react"
import Card from "../ui/cards"
import { SlidersHorizontal } from "lucide-react"
import { Select } from "../ui/select"
import { formatPeriod } from "@/utils/period"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export function Filters() {
  const reportData = useDigisacData()
  const reportFilters = useReportFilter()
  const isDesktop = useMediaQuery("(max-width: 1279px)")

  const [localPeriod, setLocalPeriod] = useState(reportFilters.selectedPeriod)
  const [localOperator, setLocalOperator] = useState(reportFilters.selectedOperatorDepartment)

  useEffect(() => {
    setLocalPeriod(reportFilters.selectedPeriod)
    setLocalOperator(reportFilters.selectedOperatorDepartment)
  }, [reportFilters.selectedPeriod, reportFilters.selectedOperatorDepartment])

  const handleApplyFilters = () => {
    reportFilters.setSelectedPeriod(localPeriod)
    reportFilters.setSelectedOperatorDepartment(localOperator)
  }

  if (isDesktop) return null

  return (
    <Card>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Filtros e Métricas</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Select
          id="operators"
          label="Funcionários"
          options={reportData.operatorOptions}
          value={localOperator}
          onChange={setLocalOperator}
        />

        <Select
          id="periods"
          label="Períodos"
          options={reportData.availablePeriods.map((period) => ({ label: formatPeriod(period), value: period }))}
          value={localPeriod}
          onChange={(period) => {
            setLocalPeriod(period)
            setLocalOperator("Todos")
          }}
        />

        <button
          onClick={handleApplyFilters}
          className="self-end w-full max-h-11 flex text-sm justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light"
        >
          Aplicar Filtros
        </button>
      </div>
    </Card>
  )
}