"use client"

import { login } from "@/auth/actions"
import { useTransition } from "react"
import toast from "react-hot-toast"
import { Button } from "./button"
import { Input } from "./input"

export function Login() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-80 md:w-md p-8 space-y-4 rounded-2xl backdrop-blur-xl border border-surface/10 bg-light/5 text-light">
      <h1 className="sr-only">Acesse sua conta!</h1>

      <label htmlFor="email" className="block font-medium mb-1">Email</label>
      <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="username" required />

      <label htmlFor="password" className="block font-medium mb-1">Senha</label>
      <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />

      <Button type="submit" isPending={isPending}>Entrar</Button>
    </form>
  )
}