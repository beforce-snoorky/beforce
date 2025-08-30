"use client"

import type { User } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useUsers(initialPerPage = 10) {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const fetchUsers = useCallback(async (pageNumber: number, pageSize: number, searchQuery: string) => {
    abortRef.current?.abort()
    const abortController = new AbortController()
    abortRef.current = abortController

    setLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "listUsers",
          payload: { page: pageNumber, per_page: pageSize, query: searchQuery }
        }),
        signal: abortController.signal
      })

      if (!response.ok) throw new Error("Erro ao carregar usuários")
      const result = await response.json()
      setUsers(result.users || [])
      setTotal(result.total ?? 0)
    } catch {
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimerId = setTimeout(() => {
      setPage(1)
      fetchUsers(1, perPage, search)
    }, 350)
    return () => clearTimeout(debounceTimerId)
  }, [search, perPage, fetchUsers])

  useEffect(() => {
    fetchUsers(page, perPage, search)
  }, [page, fetchUsers, perPage, search])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total, perPage])

  return {
    users,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    search,
    setSearch,
    loading,
    refetch: () => fetchUsers(page, perPage, search),
    totalPages
  }
}