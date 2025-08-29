"use client"

import { getSupabaseClient } from "@/utils/supabase/client"
import { useAuth } from "../context/authContext"
import { useDigisacFilter } from "../context/digisacContext"
import { useEffect, useMemo, useState } from "react"
import type { DigisacReportEntry, DigisacReports } from "@/types/digisac"
import { ensureFullPeriodFormat } from "@/utils/data"

const supabaseClient = getSupabaseClient()

export function useDigisacData() {
  const { company } = useAuth()
  const reportFilter = useDigisacFilter()

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [reportsByPeriod, setReportsByPeriod] = useState<Record<string, DigisacReportEntry[]>>({})
  const [filteredReports, setFilteredReports] = useState<DigisacReportEntry[]>([])
  const [loading, setLoading] = useState(true)

  const period = ensureFullPeriodFormat(reportFilter.selectedPeriod)

  useEffect(() => {
    if (!company?.id) return

    setLoading(true)

    async function loadPeriods() {
      const { data, error } = await supabaseClient.from("digisac_reports").select("period").eq("business_id", company?.id)

      if (!error && data) {
        const periods = Array.from(new Set(data.map((report) => report.period)))
        setAvailablePeriods(periods)
        if (periods.at(0) && !reportFilter.selectedPeriod) reportFilter.setSelectedPeriod(periods[0])
      }

      setLoading(false)
    }

    loadPeriods()
  }, [company?.id, reportFilter])

  useEffect(() => {
    if (!company?.id || !period || reportsByPeriod[period]) return

    setLoading(true)

    async function loadReports() {
      const { data, error } = await supabaseClient.from("digisac_reports").select("*").eq("business_id", company?.id).eq("period", period)

      if (!error && data) {
        const flatReports: DigisacReportEntry[] = data.flatMap((record: DigisacReports) =>
          record.data.map((entry) => ({
            ...entry,
            department: entry.department ?? "Desconhecido",
            period: record.period,
            business_id: record.business_id,
            created_at: record.created_at,
          }))
        )
        setReportsByPeriod((prevCache) => ({ ...prevCache, [period]: flatReports }))
      }

      setLoading(false)
    }

    loadReports()
  }, [company?.id, period, reportsByPeriod])

  useEffect(() => {
    const reportsForPeriod = reportsByPeriod[period] || []

    if (reportFilter.selectedOperatorDepartment === "Todos") setFilteredReports(reportsForPeriod)
    else {
      const [operator, department] = reportFilter.selectedOperatorDepartment.split("||")
      setFilteredReports(reportsForPeriod.filter((report) => report.operator_name === operator && report.department === department))
    }
  }, [reportFilter.selectedOperatorDepartment, period, reportsByPeriod])

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
    loading
  }
}