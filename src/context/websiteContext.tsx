"use client"

import { createContext, useContext, useState } from "react"

type WebsiteFilterContextType = {
  selectedPeriod: string
  selectedOperatorDepartment: string
  setSelectedPeriod: (period: string) => void
  setSelectedOperatorDepartment: (value: string) => void
}

const WebsiteFilterContext = createContext<WebsiteFilterContextType | undefined>(undefined)

export function WebsiteFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [selectedOperatorDepartment, setSelectedOperatorDepartment] = useState("Todos")

  const updateSelectedPeriod = (period: string) => {
    setSelectedPeriod(period)
    setSelectedOperatorDepartment("Todos")
  }

  return (
    <WebsiteFilterContext.Provider value={{
      selectedPeriod,
      selectedOperatorDepartment,
      setSelectedPeriod: updateSelectedPeriod,
      setSelectedOperatorDepartment,
    }}>
      {children}
    </WebsiteFilterContext.Provider>
  )
}

export function useWebsiteFilter() {
  const context = useContext(WebsiteFilterContext)
  if (!context) throw new Error("useWebsiteFilter must be used inside WebsiteFilterProvider")
  return context
}