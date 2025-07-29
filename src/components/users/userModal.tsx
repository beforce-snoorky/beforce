"use client"

import { handleUserAction } from "@/utils/userActions"
import { useEffect, useState } from "react"
import { Modal } from "../ui/modal"
import { X } from "lucide-react"

type Props = {
  onClose: () => void
  onSuccess?: () => void
  mode: "create" | "update"
  user?: User
}

export type User = {
  id: string
  email: string
  email_confirmed_at?: string
  phone: string
  confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
}

export function UserFormModal({ onClose, onSuccess, mode, user }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mode === "update" && user) setEmail(user.email)
  }, [mode, user])

  const handleSubmit = async () => {
    setIsLoading(true)

    const success = await handleUserAction(mode === "create" ? "createUser" : "updateUser", {
      ...(mode === "update" && user?.id ? { id: user.id } : {}),
      email,
      ...(password ? { password } : {})
    })

    setIsLoading(false)

    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-4 animate-slide-up w-full md:max-w-md md:rounded-2xl md:shadow-xl md:bg-light md:p-6 md:static md:animate-none bg-light">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Criar Usuário" : "Atualizar Usuário"}
          </h2>
          <p className="text-sm">Informe os dados do usuário.</p>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              className="border border-surface rounded-lg px-3 py-2 text-sm"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              {mode === "create" ? "Senha" : "Nova Senha (opcional)"}
            </label>
            <input
              id="password"
              type="password"
              className="border border-surface rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 mt-2 border-t border-surface">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !email || (mode === "create" && !password)}
              className="w-full font-medium flex justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
