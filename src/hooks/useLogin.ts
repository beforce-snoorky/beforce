"use client"

import { supabaseClient } from "@/utils/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export function useLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session?.user) router.replace("/dashboard")
    }
    checkSession()
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

    if (error) {
      const message = "Credenciais inválidas"
      toast.error(message)
      setError(message)
    } else router.push("/dashboard")

    setIsLoading(false)
  }

  return {
    email, setEmail,
    password, setPassword,
    isLoading,
    error,
    handleSubmit
  }
}