"use client"

import { createContext, useContext, useState } from "react"

type DigisacFilterContextType = {
  selectedPeriod: string
  selectedOperatorDepartment: string
  setSelectedPeriod: (period: string) => void
  setSelectedOperatorDepartment: (value: string) => void
}

const DigisacFilterContext = createContext<DigisacFilterContextType | undefined>(undefined)

export function DigisacFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [selectedOperatorDepartment, setSelectedOperatorDepartment] = useState("Todos")

  const updateSelectedPeriod = (period: string) => {
    setSelectedPeriod(period)
    setSelectedOperatorDepartment("Todos")
  }

  return (
    <DigisacFilterContext.Provider value={{
      selectedPeriod,
      selectedOperatorDepartment,
      setSelectedPeriod: updateSelectedPeriod,
      setSelectedOperatorDepartment,
    }}>
      {children}
    </DigisacFilterContext.Provider>
  )
}

export function useDigisacFilter() {
  const context = useContext(DigisacFilterContext)
  if (!context) throw new Error("useDigisacFilter must be used inside DigisacFilterProvider")
  return context
}