"use client"

import { useEffect, useState } from "react"
import { Modal } from "../ui/modal"
import { X } from "lucide-react"
import { Company } from "@/types/company"
import { handleCompanyAction } from "@/utils/companyActions"

type Props = {
  onClose: () => void
  onSuccess?: () => void
  mode: "create" | "update"
  company?: Company
}

export function CompanyFormModal({ onClose, onSuccess, mode, company }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")

  const [hasWebsite, setHasWebsite] = useState(false)
  const [websiteDomain, setWebsiteDomain] = useState("")
  const [websiteAnalyticsId, setWebsiteAnalyticsId] = useState("")

  const [hasDigisac, setHasDigisac] = useState(false)
  const [digisacToken, setDigisacToken] = useState("")
  const [digisacUrl, setDigisacUrl] = useState("")

  const [hasEmailCorporate, setHasEmailCorporate] = useState(false)
  const [hasIa, setHasIa] = useState(false)
  const [hasCloudServer, setHasCloudServer] = useState(false)
  const [hasManagementSystem, setHasManagementSystem] = useState(false)
  const [hasMarketing, setHasMarketing] = useState(false)

  useEffect(() => {
    if (mode === "update" && company) {
      setBusinessName(company.business_name || "")
      setEmail(company.email || "")
      setHasWebsite(company.has_website || false)
      setWebsiteDomain(company.website_domain || "")
      setWebsiteAnalyticsId(company.website_analytics_id || "")
      setHasDigisac(company.has_digisac || false)
      setDigisacToken(company.digisac_token || "")
      setDigisacUrl(company.digisac_url || "")
      setHasEmailCorporate(company.has_email_corporate || false)
      setHasIa(company.has_ia || false)
      setHasCloudServer(company.has_cloud_server || false)
      setHasManagementSystem(company.has_management_system || false)
      setHasMarketing(company.has_marketing || false)
    }
  }, [mode, company])

  const handleSubmit = async () => {
    setIsLoading(true)

    const payload = {
      ...(mode === "update" ? { id: company?.id } : {}),
      business_name: businessName,
      email,

      has_website: hasWebsite,
      website_domain: websiteDomain,
      website_analytics_id: websiteAnalyticsId,

      has_digisac: hasDigisac,
      digisac_token: digisacToken,
      digisac_url: digisacUrl,

      has_email_corporate: hasEmailCorporate,
      has_ia: hasIa,
      has_cloud_server: hasCloudServer,
      has_management_system: hasManagementSystem,
      has_marketing: hasMarketing
    }

    const success = await handleCompanyAction(mode === "create" ? "createCompany" : "updateCompany", payload)

    setIsLoading(false)

    if (success) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-4 animate-slide-up w-full md:max-w-md md:rounded-2xl md:shadow-xl md:bg-light md:p-6 md:static md:animate-none bg-light">
        <div className="relative mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Criar Empresa" : "Atualizar Empresa"}
          </h2>
          <p className="text-sm">Informe os dados da empresa.</p>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nome da empresa</label>
            <input
              className="border border-surface rounded-lg px-3 py-2 text-sm"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="border border-surface rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* === TOGGLES === */}
          <div className="flex items-center justify-between">
            <span>Website</span>
            <input type="checkbox" checked={hasWebsite} onChange={() => setHasWebsite(!hasWebsite)} />
          </div>
          {hasWebsite && (
            <>
              <input
                className="border border-surface rounded-lg px-3 py-2 text-sm"
                placeholder="Domínio do site"
                value={websiteDomain}
                onChange={(e) => setWebsiteDomain(e.target.value)}
              />
              <input
                className="border border-surface rounded-lg px-3 py-2 text-sm"
                placeholder="Analytics ID"
                value={websiteAnalyticsId}
                onChange={(e) => setWebsiteAnalyticsId(e.target.value)}
              />
            </>
          )}

          <div className="flex items-center justify-between">
            <span>WhatsApp / Digisac</span>
            <input type="checkbox" checked={hasDigisac} onChange={() => setHasDigisac(!hasDigisac)} />
          </div>
          {hasDigisac && (
            <>
              <input
                className="border border-surface rounded-lg px-3 py-2 text-sm"
                placeholder="Digisac Token"
                value={digisacToken}
                onChange={(e) => setDigisacToken(e.target.value)}
              />
              <input
                className="border border-surface rounded-lg px-3 py-2 text-sm"
                placeholder="Digisac URL"
                value={digisacUrl}
                onChange={(e) => setDigisacUrl(e.target.value)}
              />
            </>
          )}

          {/* Toggles simples */}
          <ToggleRow label="Email Corporativo" checked={hasEmailCorporate} onChange={setHasEmailCorporate} />
          <ToggleRow label="IA / Automações" checked={hasIa} onChange={setHasIa} />
          <ToggleRow label="Servidor em Nuvem" checked={hasCloudServer} onChange={setHasCloudServer} />
          <ToggleRow label="Sistema de Gestão" checked={hasManagementSystem} onChange={setHasManagementSystem} />
          <ToggleRow label="Marketing Digital" checked={hasMarketing} onChange={setHasMarketing} />

          <div className="pt-4 mt-2 border-t border-surface">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !businessName || !email}
              className="w-full font-medium flex justify-center items-center p-3 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 bg-accent text-light"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
    </div>
  )
}