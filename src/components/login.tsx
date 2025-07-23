"use client"

import { login } from "@/auth/actions"
import { useTransition } from "react"
import toast from "react-hot-toast"

export function Login() {
  const [isPending, startTransition] = useTransition()

  const handleLogin = (formData: FormData) => {
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) toast.error(result.error)
      else toast.success("Login realizado com sucesso!")
    })
  }

  return (
    <form
      action={handleLogin}
      className="min-w-80 md:w-md p-8 space-y-4 rounded-2xl backdrop-blur-xl border border-surface/10 bg-light/5 text-light"
    >
      <label htmlFor="email" className="block font-medium mb-1">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="seu@email.com"
        className="w-full p-3 rounded-lg outline-none border border-light/25 bg-gray-800 focus:border-accent"
        autoComplete="username"
        required
      />

      <label htmlFor="password" className="block font-medium mb-1">
        Senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        className="w-full p-3 rounded-lg outline-none border border-light/25 bg-gray-800 focus:border-accent"
        autoComplete="current-password"
        required
      />

      <button
        type="submit"
        className="w-full font-medium flex justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <div className="animate-spin w-5 h-5 mr-2 rounded-full border-solid border-2 border-current border-r-transparent" />
            <span>Entrando...</span>
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  )
}