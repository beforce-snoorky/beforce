"use client"

import { handleUserAction } from "@/utils/userActions"
import { useEffect, useState } from "react"
import { X, Mail, KeyRound, Phone } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

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

    const payload: Record<string, any> = {
      ...(mode === "update" && user?.id ? { id: user.id } : {}),
      email,
      phone
    }

    // No update a senha é opcional
    if (mode === "create") payload.password = password
    if (mode === "update" && password) payload.password = password

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
    !!email &&
    (mode === "create" ? !!password : true) &&
    !isLoading

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Container (mesmo padrão do Companies) */}
      <div className="fixed inset-0 bottom-6 z-50 flex items-end md:items-center justify-center pointer-events-none">
        <div className="w-full sm:max-w-xl mx-4 sm:mx-auto rounded-xl shadow-xl pointer-events-auto transition-all duration-300 ease-out animate-slide-up border border-surface bg-light">
          {/* Header */}
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

          {/* Conteúdo */}
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
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
