"use client"

import { UserRound, UserRoundPen, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableDataCell } from "../ui/table"
import { UserActionButton } from "./actions"
import { Icon } from "../ui/icon"
import type { User } from "@supabase/supabase-js"

export function UsersDesktopTable({
  users,
  loading,
  onSuccess,
  pagination
}: {
  users: User[]
  loading?: boolean
  onSuccess?: () => void
  pagination: {
    page: number
    perPage: number
    setPage: (p: number) => void
    setPerPage: (p: number) => void
    total: number
    totalPages: number
  }
}) {
  const formatted = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—"

  const skeletonRows = Array.from({ length: Math.min(pagination.perPage, 5) }, (_, i) => i)

  return (
    <section className="w-full flex-col mt-4">
      <div className="overflow-auto max-h-116 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-116 overflow-y-auto bg-light">
            <Table style="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="w-60">Email</TableHeaderCell>
                  <TableHeaderCell style="w-20">Último login</TableHeaderCell>
                  <TableHeaderCell style="w-20">Criado em</TableHeaderCell>
                  <TableHeaderCell style="w-14">Ações</TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? skeletonRows.map((k) => (
                    <TableRow key={`skeleton-${k}`} style="even:bg-gray-100 animate-pulse">
                      <TableDataCell style="flex items-center gap-2">
                        <div className="size-6 rounded bg-gray-200" />
                        <div className="h-4 w-48 rounded bg-gray-200" />
                      </TableDataCell>
                      <TableDataCell><div className="h-4 w-20 rounded bg-gray-200" /></TableDataCell>
                      <TableDataCell><div className="h-4 w-20 rounded bg-gray-200" /></TableDataCell>
                      <TableDataCell style="flex items-center gap-2">
                        <div className="size-7 rounded bg-gray-200" />
                        <div className="size-7 rounded bg-gray-200" />
                      </TableDataCell>
                    </TableRow>
                  ))
                  : users.map((user) => (
                    <TableRow key={user.id} style="even:bg-gray-100">
                      <TableDataCell style="flex items-center gap-2">
                        <Icon icon={<UserRound className="size-4" />} />
                        <span className="truncate w-60 max-w-60 block">{user.email}</span>
                      </TableDataCell>
                      <TableDataCell style="w-20">{formatted(user.last_sign_in_at)}</TableDataCell>
                      <TableDataCell style="w-20">{formatted(user.created_at)}</TableDataCell>
                      <TableDataCell style="flex items-center gap-2 w-14">
                        <div className="size-7 p-2 rounded-lg flex items-center justify-center text-blue-500 bg-blue-100">
                          <UserActionButton
                            icon={<UserRoundPen className="size-4" />}
                            showLabel={false}
                            label="Atualizar"
                            action="updateUser"
                            user={user}
                            onSuccess={onSuccess}
                          />
                        </div>
                        <div className="size-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <UserActionButton
                            icon={<Trash2 className="size-4" />}
                            showLabel={false}
                            label="Excluir"
                            action="deleteUser"
                            user={user}
                            onSuccess={onSuccess}
                          />
                        </div>
                      </TableDataCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          Mostrando {Math.min(pagination.total, pagination.page * pagination.perPage)} de {pagination.total}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1 || loading}
            className="size-9 rounded-lg inline-flex justify-center items-center text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Previous"
          >
            <ChevronLeft className="shrink-0 size-3.5" />
          </button>

          <div className="flex items-center gap-x-1">
            <span className="text-sm size-9 rounded-lg inline-flex justify-center items-center border border-gray-200 text-gray-800">
              {pagination.page}
            </span>
            <span className="text-sm rounded-lg inline-flex justify-center items-center text-gray-500">de</span>
            <span className="text-sm size-9 rounded-lg inline-flex justify-center items-center text-gray-500">
              {pagination.totalPages}
            </span>
          </div>

          <button
            type="button"
            onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="size-9 rounded-lg inline-flex justify-center items-center text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Next"
          >
            <ChevronRight className="shrink-0 size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}