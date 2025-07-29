"use client"

import { useAuth } from "@/hooks/useAuth"
import { Company } from "@/types/company"
import { Building2, ChevronDown, PenLine, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CompanyActionButton } from "./actions"

export default function UsersMobileList() {
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const { isAdmin } = useAuth()

  const refetchCompanies = async () => {
    if (!isAdmin) return

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "listCompanies", payload: {} }),
    })

    if (!res.ok) throw new Error("Erro ao carregar empresas")
    const { companies } = await res.json()
    setCompanies(companies)
  }

  useEffect(() => {
    refetchCompanies()
  }, [isAdmin])

  if (!isAdmin) return

  const toggleExpand = (id: string) => setExpandedCompanyId(prev => (prev === id ? null : id))

  const serviceFlags = [
    { key: "has_website", label: "Site" },
    { key: "has_email_corporate", label: "Email Corporativo" },
    { key: "has_ia", label: "Automações" },
    { key: "has_cloud_server", label: "Servidor em Nuvem" },
    { key: "has_digisac", label: "WhatsApp" },
    { key: "has_management_system", label: "Sistema de Gestão" },
    { key: "has_marketing", label: "Marketing Digital" },
  ] as const

  return (
    <div className="md:hidden space-y-2">
      {companies.map(company => {
        const isExpanded = expandedCompanyId === company.id

        return (
          <div key={company.id} className="p-3 rounded-xl text-sm border border-surface">
            <div className="flex items-center justify-between" onClick={() => toggleExpand(company.id)}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-semibold">{company.business_name}</span>
              </div>
              <ChevronDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                <p><b>Email:</b> {company.email || "—"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {serviceFlags.map(flag => (
                    <div key={flag.key} className="flex items-center gap-1">
                      <div className="relative flex items-center">
                        <div className={`w-10 h-6 rounded-full opacity-50 ${company[flag.key] ? "bg-emerald-400" : "bg-surface"}`} />
                        <div className={`absolute w-4 h-4 rounded-full shadow ${company[flag.key] ? "left-5" : "left-1"} bg-light`}
                        />
                      </div>
                      <span>{flag.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-surface">
                    <CompanyActionButton
                      icon={<PenLine className="w-4 h-4" />}
                      showLabel={true}
                      label="Atualizar"
                      action="updateCompany"
                      company={company}
                      onSuccess={refetchCompanies}
                    />
                  </div>
                  <div className="flex-1 px-3 py-1.5 rounded-lg border-2 border-accent bg-accent text-light">
                    <CompanyActionButton
                      icon={<Trash2 className="w-4 h-4" />}
                      showLabel={true}
                      label="Excluir"
                      action="deleteCompany"
                      company={company}
                      onSuccess={refetchCompanies}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {companies.length === 0 && (
        <div className="flex items-center justify-center min-h-40">
          <p className="text-sm text-dark/50">Nenhuma empresa encontrada.</p>
        </div>
      )}
    </div>
  )
}