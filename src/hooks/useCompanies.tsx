"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type CompanyRaw = any // use seu tipo Company se preferir

type UseCompaniesReturn = {
  companies: CompanyRaw[]
  total: number
  page: number
  perPage: number
  setPage: (p: number) => void
  setPerPage: (p: number) => void
  search: string
  setSearch: (s: string) => void
  loading: boolean
  refetch: () => void
  totalPages: number
}

export function useCompanies(initialPerPage = 10): UseCompaniesReturn {
  const [companies, setCompanies] = useState<CompanyRaw[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [trigger, setTrigger] = useState(0) // for manual refetch

  const fetchCompanies = useCallback(async (p: number, pp: number, q: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "listCompanies",
          payload: { page: p, per_page: pp, query: q }
        })
      })
      if (!res.ok) throw new Error("Erro ao carregar empresas")
      const data = await res.json()
      setCompanies(data.companies || [])
      setTotal(data.total ?? 0)
    } catch (err) {
      console.error(err)
      setCompanies([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchCompanies(1, perPage, search)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // fetch on page/perPage/trigger change
  useEffect(() => {
    fetchCompanies(page, perPage, search)
  }, [page, perPage, fetchCompanies, trigger]) // search handled by debounce

  const refetch = useCallback(() => setTrigger(t => t + 1), [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])

  return {
    companies, total, page, perPage, setPage, setPerPage, search, setSearch, loading, refetch, totalPages
  }
}
