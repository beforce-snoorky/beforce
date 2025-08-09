"use client"

import { Company } from "@/types/company"
import { CompanyActionButton } from "./actions"
import { Building2, PenLine, Trash2 } from "lucide-react"
import Image from "next/image"

export function UsersDesktopTable({
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
      <div className={`absolute w-4 h-4 rounded-full shadow bg-light transition-all ${active ? "left-5" : "left-1"}`} />
    </div>
  )

  return (
    <section className="w-full hidden md:flex flex-col mt-4">
      <div className="overflow-auto max-h-130 rounded-xl border border-surface bg-light">
        <div className="min-w-full">
          <div className="max-h-130 overflow-y-auto bg-light">
            <table className="w-full table-fixed divide-y divide-surface">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-40 text-gray-500">Empresa</th>
                  {serviceFlags.map(flag => (
                    <th key={flag.key} className="py-3 px-4 text-start text-xs font-medium uppercase w-12 text-gray-500">{flag.label}</th>
                  ))}
                  <th className="py-3 px-4 text-start text-xs font-medium uppercase w-14 text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-sm text-gray-500">Carregando...</td>
                  </tr>
                )}

                {companies.map(company => (
                  <tr key={company.id} className="even:bg-gray-100">
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                      {company.logo ? (
                        <Image
                          src={company.logo}
                          alt={`${company.business_name} logo`}
                          width={28}
                          height={28}
                          sizes="50px"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      <span className="truncate w-40 max-w-40 block">{company.business_name}</span>
                    </td>
                    {serviceFlags.map(flag => (
                      <td key={flag.key} className="py-3 px-4 whitespace-nowrap text-sm w-12 text-gray-800">
                        <ToggleDisplay active={!!company[flag.key]} />
                      </td>
                    ))}
                    <td className="py-3 px-4 flex items-center gap-2 w-14">
                      <div className="w-7 h-7 p-2 rounded-lg flex items-center justify-center text-blue-500 bg-blue-100">
                        <CompanyActionButton
                          icon={<PenLine className="w-4 h-4" />}
                          showLabel={false}
                          label="Atualizar"
                          action="updateCompany"
                          company={company}
                          onSuccess={onSuccess}
                        />
                      </div>
                      <div className="w-7 h-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                        <CompanyActionButton
                          icon={<Trash2 className="w-4 h-4" />}
                          showLabel={false}
                          label="Excluir"
                          action="deleteCompany"
                          company={company}
                          onSuccess={onSuccess}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {companies.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-sm text-dark/50">
                      Nenhuma empresa encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Desktop pagination */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="text-sm">
          Mostrando {(pagination.page - 1) * pagination.perPage + 1} -
          {Math.min(pagination.total, pagination.page * pagination.perPage)} de {pagination.total}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
            className="px-3 py-2 rounded-lg border"
          >
            Anterior
          </button>
          <div className="px-3 py-2 text-sm">Página {pagination.page} / {pagination.totalPages}</div>
          <button
            onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-2 rounded-lg border"
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  )
}
