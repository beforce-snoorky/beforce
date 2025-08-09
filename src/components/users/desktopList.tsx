"use client"

import { useCallback, useEffect, useState } from "react"
import { User } from "./userModal"
import { Trash2, UserRound, UserRoundPen } from "lucide-react"
import { UserActionButton } from "./actions"
import { useAuth } from "@/hooks/useAuth"
import { Table, TableBody, TableDataCell, TableHead, TableHeaderCell, TableRow } from "../ui/table"
import { Icon } from "../ui/icon"

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
            <Table style="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="w-60">Email</TableHeaderCell>
                  <TableHeaderCell style="w-12">Último login</TableHeaderCell>
                  <TableHeaderCell style="w-12">Criado em</TableHeaderCell>
                  <TableHeaderCell style="w-10">Ações</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => {
                  return (
                    <TableRow key={user.id} style="even:bg-gray-100">
                      <TableDataCell style="flex items-center gap-2">
                        <Icon icon={<UserRound className="size-4" />} />
                        <span className="truncate w-60 max-w-60 block">{user.email}</span>
                      </TableDataCell>
                      <TableDataCell style="w-12">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</TableDataCell>
                      <TableDataCell style="w-12">{new Date(user.created_at).toLocaleDateString("pt-BR")}</TableDataCell>
                      <TableDataCell style="flex items-center gap-2 w-10">
                        <div className="size-7 p-2 rounded-lg flex items-center justify-center text-blue-500 bg-blue-100">
                          <UserActionButton
                            icon={<UserRoundPen className="size-4" />}
                            showLabel={false}
                            label="Atualizar"
                            action="updateUser"
                            user={user}
                            onSuccess={refetchUsers}
                          />
                        </div>
                        <div className="size-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <UserActionButton
                            icon={<Trash2 className="size-4" />}
                            showLabel={false}
                            label="Excluir"
                            action="deleteUser"
                            user={user}
                            onSuccess={refetchUsers}
                          />
                        </div>
                      </TableDataCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
