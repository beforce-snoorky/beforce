"use client"

import { getSupabaseClient } from "@/utils/supabase/client"
import { useAuth } from "./useAuth"
import { useReportFilter } from "./useFilterContext"
import { useEffect, useState } from "react"
import { ensureFullPeriodFormat } from "@/utils/data"
import { Websites } from "@/types/website"

const supabaseClient = getSupabaseClient()

export function useWebsiteReports() {
  const { company } = useAuth()
  const reportFilter = useReportFilter()

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [reportsByPeriod, setReportsByPeriod] = useState<Record<string, Websites[]>>({})
  const [filteredReports, setFilteredReports] = useState<Websites[]>([])

  const rawPeriod = reportFilter.selectedPeriod
  const period = ensureFullPeriodFormat(rawPeriod)

  // Buscar períodos disponíveis
  useEffect(() => {
    if (!company?.id) return

    async function loadPeriods() {
      const { data, error } = await supabaseClient.from("websites_reports").select("period").eq("business_id", company?.id)
      if (!error && data) setAvailablePeriods(Array.from(new Set(data.map(report => report.period))))
    }

    loadPeriods()
  }, [company?.id])

  // Carregar relatórios por período
  useEffect(() => {
    if (!company?.id || reportsByPeriod[period]) return

    async function loadReports() {
      const { data, error } = await supabaseClient.from("websites_reports").select("*").eq("business_id", company?.id)
      if (!error && data) setReportsByPeriod((prevCache) => ({ ...prevCache, [period]: data }))
    }

    loadReports()
  }, [company?.id, period, reportsByPeriod])

  // Atualizar os dados filtrados com base no período
  useEffect(() => {
    setFilteredReports(reportsByPeriod[period] || [])
  }, [period, reportsByPeriod])

  return {
    availablePeriods,
    reportsByPeriod,
    filteredReports,
  }
}