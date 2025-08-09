"use client"

import { useAuth } from "@/hooks/useAuth"
import { Company } from "@/types/company"
import { useCallback, useEffect, useState } from "react"
import { CompanyActionButton } from "./actions"
import { Building2, PenLine, Trash2 } from "lucide-react"
import Image from "next/image"

export default function UsersDesktopTable() {
  const [companies, setCompanies] = useState<Company[]>([])
  const { isAdmin } = useAuth()

  const refetchCompanies = useCallback(async () => {
    if (!isAdmin) return

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listCompanies", payload: {} }),
    })

    if (!res.ok) throw new Error("Erro ao carregar empresas")
    const { companies } = await res.json()
    setCompanies(companies)
  }, [isAdmin])

  useEffect(() => {
    refetchCompanies()
  }, [refetchCompanies])

  if (!isAdmin) return

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
    <section className="w-full flex flex-col">
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
                          onSuccess={refetchCompanies}
                        />
                      </div>
                      <div className="w-7 h-7 p-2 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                        <CompanyActionButton
                          icon={<Trash2 className="w-4 h-4" />}
                          showLabel={false}
                          label="Excluir"
                          action="deleteCompany"
                          company={company}
                          onSuccess={refetchCompanies}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {companies.length === 0 && (
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
    </section>
  )
}