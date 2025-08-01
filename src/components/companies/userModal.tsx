"use client"

import { useEffect, useState } from "react"
import { Modal } from "../ui/modal"
import { Building2, X } from "lucide-react"
import { Company } from "@/types/company"
import { handleCompanyAction } from "@/utils/companyActions"
import { getSupabaseClient } from "@/utils/supabase/client"
import { slugify } from "@/utils/data"
import toast from "react-hot-toast"

type Props = {
  onClose: () => void
  onSuccess?: () => void
  mode: "create" | "update"
  company?: Company
}

const supabase = getSupabaseClient()

export function CompanyFormModal({ onClose, onSuccess, mode, company }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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
      setLogoPreview(company.logo || null)
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

    let logo = company?.logo || null

    if (logoFile && businessName) {
      const fileExt = logoFile.name.split(".").pop()
      const safeName = slugify(businessName)
      const filePath = `${safeName}.${fileExt}`

      const { data: existing, error: listError } = await supabase.storage.from("business-logo").list("", { search: filePath })

      if (listError) console.error("Erro ao verificar arquivos existentes:", listError)

      if (existing && existing.length > 0) {
        toast.error("Já existe um logo com esse nome. Por favor, renomeie a empresa ou use outro arquivo.")
        setIsLoading(false)
        return
      }

      const { error: uploadError } = await supabase.storage.from("business-logo").upload(filePath, logoFile)

      if (!uploadError) {
        const { data } = supabase.storage.from("business-logo").getPublicUrl(filePath)
        logo = data.publicUrl
      }
    }

    const payload = {
      ...(mode === "update" ? { id: company?.id } : {}),
      business_name: businessName,
      email,
      logo,

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
          {/* LOGO */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Logo da empresa</label>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain mb-2" />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-accent bg-accent/10">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setLogoFile(file)
                if (file) setLogoPreview(URL.createObjectURL(file))
              }}
              disabled={isLoading}
            />
          </div>

          <Input label="Nome da empresa" value={businessName} onChange={setBusinessName} disabled={isLoading} />
          <Input label="Email" type="email" value={email} onChange={setEmail} disabled={isLoading} />

          {/* === TOGGLES === */}
          <ToggleRow label="Website" checked={hasWebsite} onChange={setHasWebsite} />
          {hasWebsite && (
            <>
              <Input placeholder="Domínio do site" value={websiteDomain} onChange={setWebsiteDomain} />
              <Input placeholder="Analytics ID" value={websiteAnalyticsId} onChange={setWebsiteAnalyticsId} />
            </>
          )}

          <ToggleRow label="WhatsApp / Digisac" checked={hasDigisac} onChange={setHasDigisac} />
          {hasDigisac && (
            <>
              <Input placeholder="Digisac Token" value={digisacToken} onChange={setDigisacToken} />
              <Input placeholder="Digisac URL" value={digisacUrl} onChange={setDigisacUrl} />
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

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled
}: {
  label?: string
  type?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type}
        className="border border-surface rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}