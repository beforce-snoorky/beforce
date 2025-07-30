"use client"

import { useAuth } from "@/hooks/useAuth"
import { Company } from "@/types/company"
import { useCallback, useEffect, useState } from "react"
import { CompanyActionButton } from "./actions"
import { Building2, PenLine, Trash2 } from "lucide-react"

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
    { key: "has_website", label: "Site" },
    { key: "has_email_corporate", label: "Email" },
    { key: "has_cloud_server", label: "Nuvem" },
    { key: "has_management_system", label: "Gestão" },
    { key: "has_digisac", label: "WhatsApp" },
    { key: "has_ia", label: "IA" },
    { key: "has_marketing", label: "Marketing" },
  ] as const

  const ToggleDisplay = ({ active }: { active: boolean }) => (
    <div className="relative flex items-center">
      <div className={`w-10 h-5 rounded-full ${active ? "bg-emerald-400" : "bg-gray-300"} opacity-70`} />
      <div className={`absolute w-4 h-4 rounded-full shadow bg-light transition-all ${active ? "left-5" : "left-1"}`} />
    </div>
  )

  return (
    <div className="hidden md:block w-full overflow-auto relative rounded-xl border border-surface bg-light">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr className="bg-dark/6">
            <th className="p-3 text-left">Empresa</th>
            <th className="p-3 text-left">Email</th>
            {serviceFlags.map(flag => (
              <th key={flag.key} className="p-3 text-center">{flag.label}</th>
            ))}
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id} className="border-b last:border-none border-surface even:bg-dark/6">
              <td className="p-3 flex items-center gap-2 font-medium">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                  <Building2 className="w-4 h-4" />
                </div>
                {company.business_name}
              </td>
              <td className="p-3">{company.email}</td>

              {serviceFlags.map(flag => (
                <td key={flag.key} className="p-3 text-center">
                  <ToggleDisplay active={!!company[flag.key]} />
                </td>
              ))}

              <td className="p-3 flex items-center gap-3">
                <CompanyActionButton
                  icon={<PenLine className="w-4 h-4" />}
                  showLabel={false}
                  label="Atualizar"
                  action="updateCompany"
                  company={company}
                  onSuccess={refetchCompanies}
                />
                <CompanyActionButton
                  icon={<Trash2 className="w-4 h-4" />}
                  showLabel={false}
                  label="Excluir"
                  action="deleteCompany"
                  company={company}
                  onSuccess={refetchCompanies}
                />
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
  )
}