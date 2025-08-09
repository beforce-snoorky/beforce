"use client"

import { Company } from "@/types/company"
import { Building2, ChevronDown, PenLine, Trash2 } from "lucide-react"
import { useState } from "react"
import { CompanyActionButton } from "./actions"
import { solutions } from "@/constants/solutions"
import Image from "next/image"
import { Icon } from "../ui/icon"

export function UsersMobileList({
  companies,
  loading,
  onSuccess,
  pagination
}: {
  companies: Company[]
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
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpandedCompanyId(prev => (prev === id ? null : id))

  return (
    <div className="md:hidden space-y-2">
      {loading && <div className="text-sm text-gray-500 py-4">Carregando...</div>}

      {companies.map(company => {
        const isExpanded = expandedCompanyId === company.id

        return (
          <div key={company.id} className="p-3 rounded-xl text-sm border border-surface">
            <div className="flex items-center justify-between" onClick={() => toggleExpand(company.id)}>
              <div className="flex items-center gap-2">
                {company.logo
                  ? (<Image src={company.logo} alt={`${company.business_name} logo`} width={28} height={28} sizes="50px" />)
                  : (<Icon icon={<Building2 className="size-4" />} />)
                }
                <span className="font-semibold">{company.business_name}</span>
              </div>
              <ChevronDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                <p><b>Email:</b> {company.email || "—"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {solutions.map(item => (
                    <div key={item.key} className="flex items-center gap-1">
                      <div className="relative flex items-center">
                        <div className={`w-10 h-6 rounded-full opacity-50 ${company[item.key] ? "bg-emerald-400" : "bg-surface"}`} />
                        <div className={`absolute size-4 rounded-full shadow ${company[item.key] ? "left-5" : "left-1"} bg-light`} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-surface">
                    <CompanyActionButton
                      icon={<PenLine className="size-4" />}
                      showLabel={true}
                      label="Atualizar"
                      action="updateCompany"
                      company={company}
                      onSuccess={onSuccess}
                    />
                  </div>
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-accent bg-accent text-light">
                    <CompanyActionButton
                      icon={<Trash2 className="size-4" />}
                      showLabel={true}
                      label="Excluir"
                      action="deleteCompany"
                      company={company}
                      onSuccess={onSuccess}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {companies.length === 0 && !loading && (
        <div className="flex items-center justify-center min-h-40">
          <p className="text-sm text-dark/50">Nenhuma empresa encontrada.</p>
        </div>
      )}

      {/* Pagination (mobile simple) */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
          className="px-3 py-2 rounded-lg border"
        >
          Anterior
        </button>

        <div className="text-sm">Página {pagination.page} / {pagination.totalPages}</div>

        <button
          onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
          disabled={pagination.page >= pagination.totalPages}
          className="px-3 py-2 rounded-lg border"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}