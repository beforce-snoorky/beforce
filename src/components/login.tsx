"use client"

import { useLogin } from "@/hooks/useLogin"
import { User, LockKeyhole } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function Login() {
  const response = useLogin()

  return (
    <>
      <Toaster position="bottom-center" />
      <form onSubmit={response.handleSubmit} className="w-sm md:w-md p-8 space-y-4 rounded-2xl backdrop-blur-xl border border-surface/10 bg-white/5 text-white">
        <h1 className="sr-only">Acesse sua conta!</h1>
        <label htmlFor="email" className="block mb-1">Email</label>
        <Input
          id="email"
          icon={<User className="size-5 text-gray-500" />}
          name="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="username"
          value={response.email}
          onChange={(e) => response.setEmail(e.target.value)}
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
          value={response.password}
          onChange={(e) => response.setPassword(e.target.value)}
          required
        />
        <Button isPending={response.isLoading} type="submit" variant="primary">Entrar</Button>
      </form>
    </>
  )
}