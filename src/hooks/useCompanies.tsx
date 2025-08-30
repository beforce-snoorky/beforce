"use client"

import { type Company } from "@/types/company"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useCompanies(initialPerPage = 10) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const fetchCompanies = useCallback(async (pageNumber: number, pageSize: number, searchQuery: string) => {
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    setLoading(true)
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "listCompanies",
          payload: { page: pageNumber, per_page: pageSize, query: searchQuery }
        }),
        signal: abortController.signal
      })

      if (!response.ok) throw new Error("Erro ao carregar empresas")
      const result = await response.json()
      setCompanies(result.companies || [])
      setTotal(result.total ?? 0)
    } catch {
      setCompanies([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimerId = setTimeout(() => {
      setPage(1)
      fetchCompanies(1, perPage, search)
    }, 350)
    return () => clearTimeout(debounceTimerId)
  }, [search, perPage, fetchCompanies])

  useEffect(() => {
    fetchCompanies(page, perPage, search)
  }, [page, fetchCompanies, perPage, search])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])

  return {
    companies,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    search,
    setSearch,
    loading,
    refetch: () => fetchCompanies(page, perPage, search),
    totalPages
  }
}