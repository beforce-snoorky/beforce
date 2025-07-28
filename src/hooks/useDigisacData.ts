"use client"

import { createClient } from "@/utils/supabase/client"
import { useSession } from "./useSession"
import { useReportFilter } from "@/context/reportFilter"
import { useEffect, useMemo, useState } from "react"
import { DigisacReports } from "@/types/support"
import { getMonthlyCache, setMonthlyCache } from "@/utils/localStorage"
import { normalizePeriod } from "@/utils/date"

export function useDigisacData() {
  const supabase = createClient()
  const { session } = useSession()
  const company = session?.company
  const reportFilter = useReportFilter()

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [reportsByPeriod, setReportsByPeriod] = useState<Record<string, DigisacReports[]>>({})
  const [filteredReports, setFilteredReports] = useState<DigisacReports[]>([])

  useEffect(() => {
    if (!company?.id) return

    const cacheKey = `${company?.id}-availablePeriods`
    const cached = getMonthlyCache<string[]>(cacheKey, "all")

    if (cached) {
      setAvailablePeriods(cached)
      return
    }

    async function loadPeriods() {
      const { data, error } = await supabase.from("digisac_reports").select("period").eq("business_id", company?.id)

      if (!error && data) {
        const uniquePeriods = Array.from(new Set(data.map((report) => normalizePeriod(report.period)))).sort()
        setAvailablePeriods(uniquePeriods)
        setMonthlyCache(cacheKey, uniquePeriods, "all")
      }
    }

    loadPeriods()
  }, [company?.id])

  // 2. Carrega relatórios do período com cache
  useEffect(() => {
    if (!company?.id) return

    const period = reportFilter.selectedPeriod ? normalizePeriod(reportFilter.selectedPeriod) : ""
    if (!period || reportsByPeriod[period]) return

    const cacheKey = `${company.id}-${period}`
    const cached = getMonthlyCache<DigisacReports[]>(cacheKey, period)

    if (cached) {
      setReportsByPeriod((previous) => ({ ...previous, [period]: cached }))
      return
    }

    async function loadReports() {
      const { data, error } = await supabase.from("digisac_reports").select("*").eq("business_id", company?.id).eq("period", period)

      if (!error && data) {
        setReportsByPeriod((previous) => ({ ...previous, [period]: data }))
        setMonthlyCache(cacheKey, data, period)
      }
    }

    loadReports()
  }, [company?.id, reportFilter.selectedPeriod, reportsByPeriod])

  // 3. Filtragem
  useEffect(() => {
    const period = reportFilter.selectedPeriod ? normalizePeriod(reportFilter.selectedPeriod) : ""
    const reports = reportsByPeriod[period] || []

    if (reportFilter.selectedOperatorDepartment === "Todos") setFilteredReports(reports)
    else {
      const [operator, department] = reportFilter.selectedOperatorDepartment.split("||")
      setFilteredReports(reports.filter((report) => report.operator_name === operator && report.department === department))
    }
  }, [reportFilter.selectedOperatorDepartment, reportFilter.selectedPeriod, reportsByPeriod])

  // 4. Geração de opções
  const operatorOptions = useMemo(() => {
    const period = reportFilter.selectedPeriod ? normalizePeriod(reportFilter.selectedPeriod) : ""
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
  }, [reportsByPeriod, reportFilter.selectedPeriod])

  return {
    availablePeriods,
    reportsByPeriod,
    filteredReports,
    operatorOptions
  }
}