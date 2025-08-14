"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type User = {
  id: string
  email: string
  email_confirmed_at?: string
  phone: string
  confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
}

type UseUsersReturn = {
  users: User[]
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

export function useUsers(initialPerPage = 10): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async (p: number, pp: number, q: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "listUsers",
          payload: { page: p, per_page: pp, query: q }
        })
      })
      if (!res.ok) throw new Error("Erro ao carregar usuários")
      const data = await res.json()
      setUsers((data.users as User[]) || [])
      setTotal(data.total ?? 0)
    } catch {
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 1) setPage(1)
      else fetchUsers(1, perPage, search)
    }, 350)
    return () => clearTimeout(t)
  }, [search, perPage, fetchUsers, page])

  useEffect(() => {
    fetchUsers(page, perPage, search)
  }, [page, perPage, search, fetchUsers])

  const refetch = useCallback(() => {
    fetchUsers(page, perPage, search)
  }, [page, perPage, search, fetchUsers])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / perPage)),
    [total, perPage]
  )

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
    refetch,
    totalPages
  }
}