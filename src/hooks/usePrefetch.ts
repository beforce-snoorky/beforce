"use client"

import { DigisacReports } from "@/types/support"
import { useSession } from "./useSession"
import { useEffect, useRef, useState } from "react"
import { getCurrentPeriod, normalizePeriod } from "@/utils/date"
import { getMonthlyCache, setMonthlyCache } from "@/utils/localStorage"
import { createClient } from "@/utils/supabase/client"

type DashboardCache = {
  reports: DigisacReports[]
  // websites: WebsiteData[]
}

export function usePrefetch() {
  const { session } = useSession()
  const [cache, setCache] = useState<DashboardCache | null>(null)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!session?.company?.id || fetchingRef.current) return

    const rawPeriod = getCurrentPeriod()
    const period = normalizePeriod(rawPeriod)
    const businessId = session.company.id

    const cachedReports = getMonthlyCache<DigisacReports[]>("reports", period)
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
      .catch((err) => { console.error("Erro no prefetch", err) })
      .finally(() => { fetchingRef.current = false })
  }, [session?.company?.id])

  return cache
}

export async function fetchReports(businessId: string, rawPeriod: string): Promise<DigisacReports[]> {
  const supabase = createClient()
  const period = normalizePeriod(rawPeriod)
  const { data, error } = await supabase.from("digisac_reports").select("*").eq("business_id", businessId).eq("period", period)
  if (error || !data) throw new Error("Erro ao buscar reports")
  return data
}