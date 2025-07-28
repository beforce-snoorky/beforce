"use client"

import { getPreviousMonthPeriod } from "@/utils/period"
import { createContext, ReactNode, useContext, useState } from "react"

type ReportFilterProps = {
  selectedPeriod: string
  selectedOperatorDepartment: string
  setSelectedPeriod: (period: string) => void
  setSelectedOperatorDepartment: (value: string) => void
}

const ReportFilterContext = createContext<ReportFilterProps | undefined>(undefined)

export function ReportFilterProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState(getPreviousMonthPeriod())
  const [selectedOperatorDepartment, setSelectedOperatorDepartment] = useState("Todos")

  const updateSelectedPeriod = (period: string) => {
    setSelectedPeriod(period)
    setSelectedOperatorDepartment("Todos")
  }

  return (
    <ReportFilterContext.Provider
      value={{
        selectedPeriod,
        selectedOperatorDepartment,
        setSelectedPeriod: updateSelectedPeriod,
        setSelectedOperatorDepartment,
      }}>
      {children}
    </ReportFilterContext.Provider>
  )
}

export function useReportFilter() {
  const context = useContext(ReportFilterContext)
  if (!context) throw new Error("useReportFilter must be used inside ReportFilterProvider")
  return context
}