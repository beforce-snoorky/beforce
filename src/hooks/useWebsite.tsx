"use client"

import { getSupabaseClient } from "@/utils/supabase/client"
import { useAuth } from "../context/authContext"
import { useWebsiteFilter } from "../context/websiteContext"
import { useEffect, useState } from "react"
import type { Websites } from "@/types/website"
import { ensureFullPeriodFormat } from "@/utils/data"

const supabaseClient = getSupabaseClient()

export function useWebsiteReports() {
  const { company } = useAuth()
  const reportFilter = useWebsiteFilter()

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [reportsByPeriod, setReportsByPeriod] = useState<Record<string, Websites[]>>({})
  const [filteredReports, setFilteredReports] = useState<Websites[]>([])
  const [loading, setLoading] = useState(true)

  const period = ensureFullPeriodFormat(reportFilter.selectedPeriod)

  useEffect(() => {
    if (!company?.id) return

    setLoading(true)

    async function loadPeriods() {
      const { data, error } = await supabaseClient.from("websites_reports").select("period").eq("business_id", company?.id)

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
      const { data, error } = await supabaseClient.from("websites_reports").select("*").eq("business_id", company?.id).eq("period", period)
      if (!error && data) setReportsByPeriod((prevCache) => ({ ...prevCache, [period]: data }))
      setLoading(false)
    }

    loadReports()
  }, [company?.id, period, reportsByPeriod])

  useEffect(() => {
    setFilteredReports(reportsByPeriod[period] || [])
  }, [period, reportsByPeriod])

  return {
    availablePeriods,
    reportsByPeriod,
    filteredReports,
    loading
  }
}