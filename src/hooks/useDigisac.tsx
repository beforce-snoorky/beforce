"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "./useAuth"
import { useReportFilter } from "./useFilterContext"
import { DigisacReports } from "@/types/digisac"
import { ensureFullPeriodFormat } from "@/utils/data"
import { getSupabaseClient } from "@/utils/supabase/client"

const supabaseClient = getSupabaseClient()

export function useDigisacData() {
  const { company } = useAuth()
  const reportFilter = useReportFilter()

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [reportsByPeriod, setReportsByPeriod] = useState<Record<string, DigisacReports[]>>({})
  const [filteredReports, setFilteredReports] = useState<DigisacReports[]>([])

  const rawPeriod = reportFilter.selectedPeriod
  const period = ensureFullPeriodFormat(rawPeriod)

  // Buscar períodos disponíveis
  useEffect(() => {
    if (!company?.id) return

    async function loadPeriods() {
      const { data, error } = await supabaseClient.from("digisac_reports").select("period").eq("business_id", company?.id)
      if (!error && data) {
        const periods = Array.from(new Set(data.map((report) => report.period)))
        setAvailablePeriods(periods)
        if (periods.at(0) && !reportFilter.selectedPeriod) reportFilter.setSelectedPeriod(periods.at(0))
      }
    }

    loadPeriods()
  }, [company?.id, reportFilter])

  // Carrega relatórios do período
  useEffect(() => {
    if (!company?.id || reportsByPeriod[period]) return

    async function loadReports() {
      const { data, error } = await supabaseClient.from("digisac_reports").select("*").eq("business_id", company?.id).eq("period", period)
      if (!error && data) setReportsByPeriod((prevCache) => ({ ...prevCache, [period]: data }))
    }

    loadReports()
  }, [company?.id, period, reportsByPeriod])

  // Aplica filtro de operador + departamento
  useEffect(() => {
    const reportsForPeriod = reportsByPeriod[period] || []

    if (reportFilter.selectedOperatorDepartment === "Todos") setFilteredReports(reportsForPeriod)
    else {
      const [operator, department] = reportFilter.selectedOperatorDepartment.split("||")
      setFilteredReports(reportsForPeriod.filter((report) => report.operator_name === operator && report.department === department))
    }
  }, [reportFilter.selectedOperatorDepartment, period, reportsByPeriod])

  // Geração de opções únicas de operador/departamento
  const operatorOptions = useMemo(() => {
    const reports = reportsByPeriod[period] || []
    const seen = new Set<string>()
    const options = []

    for (const report of reports) {
      const key = `${report.operator_name}||${report.department}`

      if (!seen.has(key)) {
        seen.add(key)
        options.push({ label: `${report.operator_name} (${report.department})`, value: key })
      }
    }

    return [{ label: "Todos", value: "Todos" }, ...options]
  }, [reportsByPeriod, period])

  return {
    availablePeriods,
    reportsByPeriod,
    filteredReports,
    operatorOptions,
  }
}