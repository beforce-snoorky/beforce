"use client"

import { useDigisacData } from "@/hooks/useDigisac"
import { useDigisacFilter } from "@/hooks/useDigisacFilterContext"
import { useEffect, useState } from "react"
import { Card } from "../ui/cards"
import { Select } from "../ui/select"
import { Button } from "../ui/button"
import { formatPeriodToMonthYear } from "@/utils/data"
import { SlidersHorizontal } from "lucide-react"

interface FiltersProps {
  digisacReportData: ReturnType<typeof useDigisacData>
  digisacReportFilters: ReturnType<typeof useDigisacFilter>
}

const allOperators = "Todos"

export function Filters({ digisacReportData, digisacReportFilters }: FiltersProps) {
  const [selectedPeriodLocal, setSelectedPeriodLocal] = useState(() =>
    digisacReportFilters.selectedPeriod || digisacReportData.availablePeriods.at(-1) || ""
  )

  const [selectedOperatorDepartmentLocal, setSelectedOperatorDepartmentLocal] = useState(() =>
    digisacReportFilters.selectedOperatorDepartment || allOperators
  )

  useEffect(() => {
    setSelectedPeriodLocal(digisacReportFilters.selectedPeriod || digisacReportData.availablePeriods.at(-1) || "")
    setSelectedOperatorDepartmentLocal(digisacReportFilters.selectedOperatorDepartment || allOperators)
  }, [digisacReportFilters.selectedPeriod, digisacReportFilters.selectedOperatorDepartment, digisacReportData.availablePeriods])

  const availablePeriodOptions = digisacReportData.availablePeriods.map((period) => ({
    label: formatPeriodToMonthYear(period),
    value: period,
  }))

  const handleApplyFilters = () => {
    digisacReportFilters.setSelectedPeriod(selectedPeriodLocal)
    digisacReportFilters.setSelectedOperatorDepartment(selectedOperatorDepartmentLocal)
  }

  return (
    <Card>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <Select
          id="operators"
          label="Funcionários"
          options={digisacReportData.operatorOptions}
          value={selectedOperatorDepartmentLocal}
          onChange={setSelectedOperatorDepartmentLocal}
        />
        <Select
          id="periods"
          label="Períodos"
          options={availablePeriodOptions}
          value={selectedPeriodLocal}
          onChange={(period) => {
            setSelectedPeriodLocal(period)
            setSelectedOperatorDepartmentLocal(allOperators)
          }}
        />
        <Button className="col-span-2 xl:col-span-1" onClick={handleApplyFilters} variant="primary">
          <SlidersHorizontal className="w-4 h-4" />
          Aplicar Filtros
        </Button>
      </div>
    </Card>
  )
}