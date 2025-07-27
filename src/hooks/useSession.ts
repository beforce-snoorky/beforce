"use client"

import { Company } from "@/types/company"
import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

type SessionData = {
  user: User
  company: Company | null
  isAdmin: boolean
}

const CACHE_KEY = "session_cache"
const CACHE_TTL = 1000 * 60 * 60 * 24

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      setLoading(true)

      try {
        const cached = localStorage.getItem(CACHE_KEY)

        if (cached) {
          const parsed = JSON.parse(cached)
          const isExpired = Date.now() - parsed.timestamp > CACHE_TTL

          if (!isExpired) {
            setSession(parsed.data)
            setLoading(false)
            return
          }
        }

        const res = await fetch("/api/session")
        if (!res.ok) throw new Error("Falha ao buscar sessão")
        const data = await res.json()

        setSession(data)
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        )
        setLoading(false)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Erro desconhecido")
        }
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { session, loading, error }
}