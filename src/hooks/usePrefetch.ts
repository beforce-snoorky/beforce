"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "./useSession"
import { Support } from "@/types/support"
import { createClient } from "@/utils/supabase/client"
import { getCurrentPeriod } from "@/utils/date"
import { getMonthlyCache, setMonthlyCache } from "@/utils/localStorage"

type DashboardCache = {
  reports: Support[]
  // websites: WebsiteData[]
}

export function usePrefetchDashboard() {
  const { session } = useSession()
  const [cache, setCache] = useState<DashboardCache | null>(null)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!session?.company?.id || fetchingRef.current) return

    const period = getCurrentPeriod()
    const businessId = session.company.id

    const cachedReports = getMonthlyCache<Support[]>("reports", period)
    // const cachedWebsites = getMonthlyCache<WebsiteData[]>("websites", period)

    if (cachedReports) {
      setCache({ reports: cachedReports })
      return
    }

    fetchingRef.current = true

    Promise.all([
      cachedReports ? Promise.resolve(cachedReports) : fetchReports(businessId, period),
      // cachedWebsites ? Promise.resolve(cachedWebsites) : fetchWebsites(businessId, period),
    ])
      .then(([reports]) => {
        if (!cachedReports) setMonthlyCache("reports", reports, period)
        // if (!cachedWebsites) setMonthlyCache("websites", websites, period)

        setCache({ reports })
      })
      .catch((err) => {
        console.error("Erro no prefetch", err)
      })
      .finally(() => {
        fetchingRef.current = false
      })
  }, [session?.company?.id])

  return cache
}

export async function fetchReports(businessId: string, period: string): Promise<Support[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("whatsapp_reports")
    .select("*")
    .eq("business_id", businessId)
    .eq("period", period)

  if (error || !data) throw new Error("Erro ao buscar reports")
  return data
}