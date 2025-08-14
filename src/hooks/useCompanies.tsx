"use client"

import { Company } from "@/types/company"
import { useCallback, useEffect, useMemo, useState } from "react"

type UseCompaniesReturn = {
  companies: Company[]
  total: number
  page: number
  perPage: number
  search: string
  loading: boolean
  totalPages: number
  setPage: (p: number) => void
  setPerPage: (p: number) => void
  setSearch: (s: string) => void
  refetch: () => void
}

export function useCompanies(initialPerPage = 10): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchCompanies = useCallback(async (p: number, pp: number, q: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "listCompanies",
          payload: { page: p, per_page: pp, query: q }
        })
      })
      if (!res.ok) throw new Error("Erro ao carregar empresas")
      const data = await res.json()
      setCompanies(data.companies || [])
      setTotal(data.total ?? 0)
    } catch {
      setCompanies([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1)
      else fetchCompanies(1, perPage, search)
    }, 350)
    return () => clearTimeout(t)
  }, [search, perPage, fetchCompanies, page])

  useEffect(() => {
    fetchCompanies(page, perPage, search)
  }, [page, perPage, search, fetchCompanies])

  const refetch = useCallback(() => {
    fetchCompanies(page, perPage, search)
  }, [page, perPage, search, fetchCompanies])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])

  return {
    companies, total, page, perPage, setPage, setPerPage, search, setSearch, loading, refetch, totalPages
  }
}