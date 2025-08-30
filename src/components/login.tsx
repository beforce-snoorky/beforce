"use client"

import { getSupabaseClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { Input } from "./ui/input"
import { LockKeyhole, User } from "lucide-react"
import { Button } from "./ui/button"

export function Login() {
  const supabaseClient = getSupabaseClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (session?.user) router.replace("/analysis")
    }
    checkSession()
  }, [supabaseClient, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) toast.error("Credenciais inválidas")
    else router.push("/analysis")

    setIsLoading(false)
  }

  return (
    <>
      <Toaster position="bottom-center" />
      <form onSubmit={handleSubmit} className="w-sm md:w-md p-8 space-y-4 rounded-2xl backdrop-blur-xl border border-surface/10 bg-white/5 text-white">
        <h1 className="sr-only">Acesse sua conta!</h1>
        <label htmlFor="email" className="block mb-1">Email</label>
        <Input
          id="email"
          icon={<User className="size-5 text-gray-500" />}
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password" className="block mb-1">Senha</label>
        <Input
          id="password"
          icon={<LockKeyhole className="size-5 text-gray-500" />}
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button isPending={isLoading} type="submit" variant="primary">Entrar</Button>
      </form>
    </>
  )
}