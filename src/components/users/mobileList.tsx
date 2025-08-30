"use client"

import type { User } from "./userModal"
import { useState } from "react"
import { Icon } from "../ui/icon"
import { UserRound, ChevronDown, ChevronLeft, ChevronRight, UserRoundPen, Trash2 } from "lucide-react"
import { UserActionButton } from "./actions"

type UsersMobileListProps = {
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
}

export function UsersMobileList({
  users,
  loading,
  onSuccess,
  pagination
}: UsersMobileListProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const toggleExpand = (id: string) => setExpandedUserId(prev => (prev === id ? null : id))

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—")

  return (
    <div className="p-4 rounded-xl border border-surface bg-light">
      <div className="space-y-2">
        {loading && <div className="text-sm text-gray-500 py-4">Carregando...</div>}

        {users.length === 0 ? (
          <div className="flex items-center justify-center min-h-32">
            <p className="text-sm text-muted">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          users.map(user => {
            const isExpanded = expandedUserId === user.id

            return (
              <div className="p-4 rounded-xl border border-surface bg-light" key={user.id}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={<UserRound className="size-4" />} />
                    <div className="flex flex-col">
                      <span className="text-sm leading-tight">{user.email}</span>
                      <span className="text-xs text-gray-500 leading-tight">
                        Criado em: {fmt(user.created_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`size-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Último login:</span>{" "}
                        <span className="font-medium">{fmt(user.last_sign_in_at)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Email confirmado:</span>{" "}
                        <span className="font-medium">{user.email_confirmed_at ? "Sim" : "Não"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors duration-200 border border-surface bg-light text-gray-800">
                        <UserActionButton
                          icon={<UserRoundPen className="size-4" />}
                          showLabel={true}
                          label="Atualizar"
                          action="updateUser"
                          user={user}
                          onSuccess={onSuccess}
                        />
                      </div>
                      <div className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors duration-200 border border-accent bg-accent text-white">
                        <UserActionButton
                          icon={<Trash2 className="size-4" />}
                          showLabel={true}
                          label="Excluir"
                          action="deleteUser"
                          user={user}
                          onSuccess={onSuccess}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Paginação (igual ao Companies) */}
        <nav className="flex items-center justify-center mt-4" aria-label="Pagination">
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
        </nav>
      </div>
    </div>
  )
}
