"use client"

import { useCallback, useEffect, useState } from "react"
import { UserRound, ChevronDown, UserRoundPen, Trash2 } from "lucide-react"
import { UserActionButton } from "./actions"
import { useAuth } from "@/hooks/useAuth"
import { User } from "./userModal"

export default function UsersMobileList() {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const { isAdmin } = useAuth()

  const refetchUsers = useCallback(async () => {
    if (!isAdmin) return

    const res = await fetch("/api/users", { cache: "no-store" })
    if (!res.ok) throw new Error("Erro ao carregar usuários")
    const users = await res.json()
    setUsers(users)
  }, [isAdmin])

  useEffect(() => {
    refetchUsers()
  }, [refetchUsers])

  if (!isAdmin) return <p>Acesso negado</p>

  const toggleExpand = (id: string) => setExpandedUserId(prev => (prev === id ? null : id))

  return (
    <div className="md:hidden space-y-2">
      {users.map(user => {
        const isExpanded = expandedUserId === user.id

        return (
          <div key={user.id} className="p-3 rounded-xl text-sm border border-surface">
            <div className="flex items-center justify-between" onClick={() => toggleExpand(user.id)}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                  <UserRound className="w-4 h-4" />
                </div>
                <span className="font-semibold">{user.email}</span>
              </div>
              <ChevronDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p><b>Último login:</b> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</p>
                  <p><b>Criado em:</b> {new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-surface">
                    <UserActionButton
                      icon={<UserRoundPen className="w-4 h-4" />}
                      showLabel={true}
                      label="Atualizar"
                      action="updateUser"
                      user={user}
                      onSuccess={refetchUsers}
                    />
                  </div>
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-accent bg-accent text-light">
                    <UserActionButton
                      icon={<Trash2 className="w-4 h-4" />}
                      showLabel={true}
                      label="Excluir"
                      action="deleteUser"
                      user={user}
                      onSuccess={refetchUsers}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {users.length === 0 && (
        <div className="flex items-center justify-center min-h-40">
          <p className="text-sm text-dark/50">Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  )
}