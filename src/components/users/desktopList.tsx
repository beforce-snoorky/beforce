"use client"

import { useEffect, useState } from "react"
import { User } from "./userModal"
import { Trash2, UserRound, UserRoundPen } from "lucide-react"
import { UserActionButton } from "./actions"
import { useAuth } from "@/hooks/useAuth"

export default function UsersDesktopTable() {
  const [users, setUsers] = useState<User[]>([])
  const { isAdmin } = useAuth()

  const refetchUsers = async () => {
    if (!isAdmin) return

    const res = await fetch("/api/users", { cache: "no-store" })
    if (!res.ok) throw new Error("Erro ao carregar usuários")
    const users = await res.json()
    setUsers(users)
  }

  useEffect(() => {
    refetchUsers()
  }, [isAdmin])

  if (!isAdmin) return <p>Acesso negado</p>

  return (
    <div className="hidden md:block w-full overflow-auto relative rounded-xl border border-surface bg-light">
      <table className="min-w-max w-full">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr className="text-left text-sm bg-dark/6">
            <th className="p-3">Email</th>
            <th className="p-3">Último login</th>
            <th className="p-3">Criado em</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            return (
              <tr key={user.id} className="text-sm border-b last:border-none border-surface even:bg-dark/6">
                <td className="flex items-center gap-2 p-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                    <UserRound className="w-4 h-4" />
                  </div>
                  {user.email}
                </td>
                <td className="p-3">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="p-3">{new Date(user.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="p-3 flex items-start gap-4">
                  <UserActionButton
                    icon={<UserRoundPen className="w-4 h-4" />}
                    showLabel={false}
                    label="Atualizar"
                    action="updateUser"
                    user={user}
                    onSuccess={refetchUsers}
                  />
                  <UserActionButton
                    icon={<Trash2 className="w-4 h-4" />}
                    showLabel={false}
                    label="Excluir"
                    action="deleteUser"
                    user={user}
                    onSuccess={refetchUsers}
                  />
                </td>
              </tr>
            )
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-sm text-dark/50">Nenhum usuário encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
