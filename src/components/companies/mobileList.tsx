"use client"

import { Company } from "@/types/company"
import { useState } from "react"
import { Card } from "../ui/cards"
import Image from "next/image"
import { Icon } from "../ui/icon"
import { Building2, ChevronDown, ChevronLeft, ChevronRight, PenLine, Trash2 } from "lucide-react"
import { solutions } from "@/constants/solutions"
import { CompanyActionButton } from "./actions"

type UserMobileListProps = {
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
}

export function UsersMobileList({ companies, loading, onSuccess, pagination }: UserMobileListProps) {
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)
  const toggleExpand = (id: string) => setExpandedCompanyId(prev => (prev === id ? null : id))

  return (
    <Card>
      <div className="space-y-2">
        {loading && <div className="text-sm text-gray-500 py-4">Carregando...</div>}

        {companies.length === 0 ? (
          <div className="flex items-center justify-center min-h-32">
            <p className="text-sm text-muted">Nenhuma empresa encontrada.</p>
          </div>
        ) : (
          companies.map(company => {
            const isExpanded = expandedCompanyId === company.id

            return (
              <Card key={company.id}>
                <div className="flex items-center justify-between" onClick={() => toggleExpand(company.id)}>
                  <div className="flex items-center gap-2">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={`${company.business_name} logo`}
                        width={28}
                        height={28}
                        sizes="50px"
                        className="rounded-full"
                      />
                    ) : (
                      <Icon icon={<Building2 className="size-4" />} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm leading-tight">{company.business_name}</span>
                      <span className="text-xs text-gray-500 leading-tight">{company.email || "—"}</span>
                    </div>
                  </div>
                  <ChevronDown className={`size-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {solutions.map(item => (
                        <div key={item.key} className="flex items-center gap-1">
                          <div className="relative flex items-center">
                            <div className={`w-10 h-6 rounded-full opacity-50 ${company[item.key] ? "bg-emerald-400" : "bg-surface"}`} />
                            <div className={`absolute size-4 rounded-full shadow ${company[item.key] ? "left-5" : "left-1"} bg-light`} />
                          </div>
                          <span className="text-xs">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors duration-200 border border-surface bg-light text-gray-800">
                        <CompanyActionButton
                          icon={<PenLine className="size-4" />}
                          showLabel={true}
                          label="Atualizar"
                          action="updateCompany"
                          company={company}
                          onSuccess={onSuccess}
                        />
                      </div>
                      <div className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors duration-200 border border-accent bg-accent text-white">
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
              </Card>
            )
          }))}

        <nav className="flex items-center justify-center mt-4" aria-label="Pagination">
          <button
            type="button"
            onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
            className="size-9 rounded-lg inline-flex justify-center items-center text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Previous"
          >
            <ChevronLeft className="shrink-0 size-3.5" />
          </button>

          <div className="flex items-center gap-x-1">
            <span className="text-sm size-9 rounded-lg inline-flex justify-center items-center border border-gray-200 text-gray-800">{pagination.page}</span>
            <span className="text-sm rounded-lg inline-flex justify-center items-center text-gray-500">de</span>
            <span className="text-sm size-9 rounded-lg inline-flex justify-center items-center text-gray-500">{pagination.totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="size-9 rounded-lg inline-flex justify-center items-center text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Next"
          >
            <ChevronRight className="shrink-0 size-3.5" />
          </button>
        </nav>
      </div>
    </Card>
  )
}