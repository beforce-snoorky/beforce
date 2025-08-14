"use client"

import type { Company } from "@/types/company"
import { CompanyActionButton } from "./actions"
import { Building2, ChevronLeft, ChevronRight, PenLine, Trash2 } from "lucide-react"
import Image from "next/image"
import { Table, TableBody, TableDataCell, TableHead, TableHeaderCell, TableRow } from "../ui/table"
import { Icon } from "../ui/icon"

export function UsersDesktopTable({ companies, onSuccess, pagination }:
  {
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
  const serviceFlags = [
    { key: "has_website", label: "Website" },
    { key: "has_email_corporate", label: "Email" },
    { key: "has_cloud_server", label: "Nuvem" },
    { key: "has_management_system", label: "Sistema" },
    { key: "has_digisac", label: "WhatsApp" },
    { key: "has_ia", label: "Automação" },
    { key: "has_marketing", label: "Marketing" },
  ] as const

  const ToggleDisplay = ({ active }: { active: boolean }) => (
    <div className="relative flex items-center">
      <div className={`w-10 h-5 rounded-full ${active ? "bg-emerald-400" : "bg-gray-300"} opacity-70`} />
      <div className={`absolute size-4 rounded-full shadow bg-light transition-all ${active ? "left-5" : "left-1"}`} />
    </div>
  )

  return (
    <section className="w-full flex-col mt-4">
      <div className="overflow-auto max-h-116 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-116 overflow-y-auto bg-light">
            <Table style="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableHeaderCell style="w-40">Empresa</TableHeaderCell>
                  {serviceFlags.map(flag => (<TableHeaderCell key={flag.key} style="w-12">{flag.label}</TableHeaderCell>))}
                  <TableHeaderCell style="w-14">Ações</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map(company => (
                  <TableRow key={company.id} style="even:bg-gray-100">
                    <TableDataCell style="flex items-center gap-2">
                      {company.logo
                        ? (<Image src={company.logo} alt={`${company.business_name} logo`} width={28} height={28} sizes="50px" />)
                        : (<Icon icon={<Building2 className="size-4" />} />)
                      }
                      <span className="truncate w-40 max-w-40 block">{company.business_name}</span>
                    </TableDataCell>
                    {serviceFlags.map(flag => (
                      <TableDataCell key={flag.key} style="w-12">
                        <ToggleDisplay active={!!company[flag.key]} />
                      </TableDataCell>
                    ))}
                    <TableDataCell style="flex items-center gap-2 w-14">
                      <div className="size-7 p-2 rounded-lg flex items-center justify-center text-blue-500 bg-blue-100">
                        <CompanyActionButton
                          icon={<PenLine className="size-4" />}
                          showLabel={false}
                          label="Atualizar"
                          action="updateCompany"
                          company={company}
                          onSuccess={onSuccess}
                        />
                      </div>
                      <div className="size-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                        <CompanyActionButton
                          icon={<Trash2 className="size-4" />}
                          showLabel={false}
                          label="Excluir"
                          action="deleteCompany"
                          company={company}
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
        <span className="text-sm text-gray-500">Mostrando {Math.min(pagination.total, pagination.page * pagination.perPage)} de {pagination.total}</span>

        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </section>
  )
}
