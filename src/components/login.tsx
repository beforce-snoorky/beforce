"use client"

import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useLogin } from "@/hooks/useLogin"
import { Toaster } from "react-hot-toast"

export function Login() {
  const response = useLogin()

  return (
    <>
      <Toaster position="bottom-center" />
      <form onSubmit={response.handleSubmit} className="min-w-80 md:w-md p-8 space-y-4 rounded-2xl backdrop-blur-xl border border-surface/10 bg-light/5 text-light">
        <h1 className="sr-only">Acesse sua conta!</h1>
        <label htmlFor="email" className="block font-medium mb-1">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="username"
          value={response.email}
          onChange={(e) => response.setEmail(e.target.value)}
          required
        />
        <label htmlFor="password" className="block font-medium mb-1">Senha</label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={response.password}
          onChange={(e) => response.setPassword(e.target.value)}
          required
        />
        <Button type="submit" isPending={response.isLoading}>Entrar</Button>
      </form>
    </>
  )
}
