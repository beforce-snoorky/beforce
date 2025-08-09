"use client"

import { useCallback, useEffect, useState } from "react"
import { User } from "./userModal"
import { Trash2, UserRound, UserRoundPen } from "lucide-react"
import { UserActionButton } from "./actions"
import { useAuth } from "@/hooks/useAuth"

export default function UsersDesktopTable() {
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

  return (
    <section className="w-full flex flex-col">
      <div className="overflow-auto max-h-130 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-130 overflow-y-auto bg-light">
            <table className="w-full table-fixed divide-y divide-surface">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-60 text-gray-500">Email</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-12 text-gray-500">Último login</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-12 text-gray-500">Criado em</th>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-10 text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => {
                  return (
                    <tr key={user.id} className="even:bg-gray-100">
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <UserRound className="w-4 h-4" />
                        </div>
                        <span className="truncate w-60 max-w-60 block">{user.email}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm w-12 text-gray-800">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm w-12 text-gray-800">{new Date(user.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4 flex items-center gap-2 w-10">
                        <div className="w-7 h-7 p-2 rounded-lg flex items-center justify-center text-blue-500 bg-blue-100">
                          <UserActionButton
                            icon={<UserRoundPen className="w-4 h-4" />}
                            showLabel={false}
                            label="Atualizar"
                            action="updateUser"
                            user={user}
                            onSuccess={refetchUsers}
                          />
                        </div>
                        <div className="w-7 h-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <UserActionButton
                            icon={<Trash2 className="w-4 h-4" />}
                            showLabel={false}
                            label="Excluir"
                            action="deleteUser"
                            user={user}
                            onSuccess={refetchUsers}
                          />
                        </div>
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
        </div>
      </div>
    </section>
  )
}
