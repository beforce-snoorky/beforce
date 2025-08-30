"use client"

import { handleUserAction } from "@/utils/userActions"
import { useEffect, useState } from "react"
import { X, Mail, KeyRound, Phone } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import type { User } from "@supabase/supabase-js"

type Props = {
  onClose: () => void
  onSuccess?: () => void
  mode: "create" | "update"
  user?: User
}

type CreatePayload = {
  email: string
  phone?: string
  password: string
}
type UpdatePayload = {
  id: string
  email: string
  phone?: string
  password?: string
}

export function UserFormModal({ onClose, onSuccess, mode, user }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (mode === "update" && user) {
      setEmail(user.email || "")
      setPhone(user.phone || "")
    }
  }, [mode, user])

  const handleSubmit = async () => {
    setIsLoading(true)

    if (mode === "update" && !user?.id) {
      setIsLoading(false)
      return
    }

    const payload: CreatePayload | UpdatePayload =
      mode === "create"
        ? { email, phone: phone || undefined, password }
        : {
          id: user!.id,
          email,
          phone: phone || undefined,
          ...(password ? { password } : {})
        }

    const success = await handleUserAction(
      mode === "create" ? "createUser" : "updateUser",
      payload
    )

    setIsLoading(false)

    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  const canSubmit =
    !!email && (mode === "create" ? !!password : true) && !isLoading

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 bottom-6 z-50 flex items-end md:items-center justify-center pointer-events-none">
        <div className="w-full sm:max-w-xl mx-4 sm:mx-auto rounded-xl shadow-xl pointer-events-auto transition-all duration-300 ease-out animate-slide-up border border-surface bg-light">
          <div className="flex justify-between items-center py-3 px-4 border-b border-surface">
            <div>
              <h3 className="font-bold text-lg">
                {mode === "create" ? "Criar Usuário" : "Atualizar Usuário"}
              </h3>
              <p className="text-xs text-gray-500">Informe os dados do usuário.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 inline-flex justify-center items-center rounded-full bg-surface"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                placeholder="Email"
                icon={<Mail className="size-4 text-gray-500" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                placeholder="Telefone (opcional)"
                icon={<Phone className="size-4 text-gray-500" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />

              <Input
                id="password"
                name="password"
                type="password"
                className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                placeholder={mode === "create" ? "Senha" : "Nova senha (opcional)"}
                icon={<KeyRound className="size-4 text-gray-500" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required={mode === "create"}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-4 py-3 px-4 border-t border-surface">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isPending={isLoading}
              className="min-w-32"
              aria-disabled={!canSubmit}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}