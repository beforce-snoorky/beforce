"use client"

import { useDigisacData } from "@/hooks/useDigisac"
import { useReportFilter } from "@/hooks/useFilterContext"
import { useEffect, useState } from "react"
import Card from "../ui/cards"
import { SlidersHorizontal } from "lucide-react"
import { Select } from "../ui/select"
import { formatPeriodToMonthYear } from "@/utils/data"

type FilterSectionProps = {
  reportData: ReturnType<typeof useDigisacData>
  reportFilters: ReturnType<typeof useReportFilter>
}

export function Filters({ reportData, reportFilters }: FilterSectionProps) {
  const [localPeriod, setLocalPeriod] = useState(() => {
    return reportFilters.selectedPeriod || reportData.availablePeriods.at(-1) || ""
  })

  const [localOperator, setLocalOperator] = useState(() => {
    return reportFilters.selectedOperatorDepartment || "Todos"
  })

  useEffect(() => {
    setLocalPeriod(reportFilters.selectedPeriod || reportData.availablePeriods.at(-1) || "")
    setLocalOperator(reportFilters.selectedOperatorDepartment || "Todos")
  }, [reportFilters.selectedPeriod, reportFilters.selectedOperatorDepartment, reportData.availablePeriods])

  const handleApplyFilters = () => {
    reportFilters.setSelectedPeriod(localPeriod)
    reportFilters.setSelectedOperatorDepartment(localOperator)
  }

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
          options={reportData.availablePeriods.map((period) => ({ label: formatPeriodToMonthYear(period), value: period }))}
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