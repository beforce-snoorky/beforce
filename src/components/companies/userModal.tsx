"use client"

import { Company } from "@/types/company"
import { handleCompanyAction } from "@/utils/companyActions"
import { slugify } from "@/utils/data"
import { getSupabaseClient } from "@/utils/supabase/client"
import { BarChart3, Building2, Globe2, Headphones, KeyRound, LayoutDashboard, Link2, Mail, PanelsTopLeft, X } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FileUploadNice } from "../ui/fileUpload"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

type CompanyFormModalProps = {
  onClose: () => void
  onSuccess?: () => void
  mode: "create" | "update"
  company?: Company
}

const supabase = getSupabaseClient()

export function CompanyFormModal({ onClose, onSuccess, mode, company }: CompanyFormModalProps) {
  const [isSaving, setIsSaving] = useState(false)

  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [shouldRemoveLogo, setShouldRemoveLogo] = useState(false)

  const [hasWebsite, setHasWebsite] = useState(false)
  const [websiteDomain, setWebsiteDomain] = useState("")
  const [websiteAnalyticsId, setWebsiteAnalyticsId] = useState("")

  const [hasDigisac, setHasDigisac] = useState(false)
  const [digisacToken, setDigisacToken] = useState("")
  const [digisacUrl, setDigisacUrl] = useState("")

  const [hasEmailCorporate, setHasEmailCorporate] = useState(false)
  const [hasAutomations, setHasAutomations] = useState(false)
  const [hasCloudServer, setHasCloudServer] = useState(false)
  const [hasManagementSystem, setHasManagementSystem] = useState(false)
  const [hasMarketing, setHasMarketing] = useState(false)

  const tabs = [
    { id: "tab-geral", label: "Geral", icon: PanelsTopLeft },
    { id: "tab-website", label: "Website", icon: Globe2 },
    { id: "tab-digisac", label: "Digisac", icon: Headphones },
    { id: "tab-servicos", label: "Serviços", icon: LayoutDashboard },
  ] as const

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("tab-geral")

  useEffect(() => {
    if (mode === "update" && company) {
      setBusinessName(company.business_name || "")
      setEmail(company.email || "")
      setLogoPreview(company.logo || null)
      setShouldRemoveLogo(false)

      setHasWebsite(company.has_website || false)
      setWebsiteDomain(company.website_domain || "")
      setWebsiteAnalyticsId(company.website_analytics_id || "")

      setHasDigisac(company.has_digisac || false)
      setDigisacToken(company.digisac_token || "")
      setDigisacUrl(company.digisac_url || "")

      setHasEmailCorporate(company.has_email_corporate || false)
      setHasAutomations(company.has_ia || false)
      setHasCloudServer(company.has_cloud_server || false)
      setHasManagementSystem(company.has_management_system || false)
      setHasMarketing(company.has_marketing || false)
    }
  }, [mode, company])

  const uploadLogoIfNeeded = async (): Promise<string | null> => {
    if (!logoFile || !businessName) return company?.logo || null

    const fileExtension = logoFile.name.split(".").pop()
    const safeCompanyName = slugify(businessName)
    const filePath = `${safeCompanyName}.${fileExtension}`

    const { data: existingFiles, error: listError } = await supabase.storage.from("business-logo").list("", { search: filePath })

    if (listError) console.error("Erro ao verificar arquivos existentes:", listError)

    if (existingFiles && existingFiles.length > 0) {
      toast.error("Já existe um logo com esse nome. Por favor, renomeie a empresa ou use outro arquivo.")
      return null
    }

    const { error: uploadError } = await supabase.storage.from("business-logo").upload(filePath, logoFile)

    if (uploadError) {
      toast.error("Não foi possível enviar o logo. Tente novamente.")
      return null
    }

    const { data } = supabase.storage.from("business-logo").getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSaveCompany = async () => {
    setIsSaving(true)

    let logoUrl: string | null = company?.logo || null

    if (logoFile && businessName) {
      const uploadedLogo = await uploadLogoIfNeeded()
      if (!uploadedLogo) {
        setIsSaving(false)
        return
      }
      logoUrl = uploadedLogo
    }

    if (shouldRemoveLogo && !logoFile) logoUrl = null

    const requestPayload = {
      ...(mode === "update" ? { id: company?.id } : {}),
      business_name: businessName,
      email,
      logo: logoUrl,
      remove_logo: shouldRemoveLogo,

      has_website: hasWebsite,
      website_domain: websiteDomain,
      website_analytics_id: websiteAnalyticsId,

      has_digisac: hasDigisac,
      digisac_token: digisacToken,
      digisac_url: digisacUrl,

      has_email_corporate: hasEmailCorporate,
      has_ia: hasAutomations,
      has_cloud_server: hasCloudServer,
      has_management_system: hasManagementSystem,
      has_marketing: hasMarketing
    }

    const wasSuccessful = await handleCompanyAction(mode === "create" ? "createCompany" : "updateCompany", requestPayload)

    setIsSaving(false)

    if (wasSuccessful) {
      onSuccess?.()
      onClose()
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setShouldRemoveLogo(true)
  }

  const getTabButtonClassName = (id: string) => `py-3 px-2 inline-flex items-center gap-2 text-sm whitespace-nowrap ${activeTab === id ? "text-accent" : "text-gray-500"}`

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 bottom-6 z-50 flex items-end md:items-center justify-center pointer-events-none">
        <div className="w-full sm:max-w-xl mx-4 sm:mx-auto rounded-xl shadow-xl pointer-events-auto transition-all duration-300 ease-out animate-slide-up border border-surface bg-light">
          <div className="flex justify-between items-center py-3 px-4 border-b border-surface">
            <div>
              <h3 className="font-bold text-lg">{mode === "create" ? "Criar Empresa" : "Atualizar Empresa"}</h3>
              <p className="text-xs text-gray-500">Informe os dados da empresa.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 inline-flex justify-center items-center rounded-full bg-surface"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="border-b border-gray-200 px-4">
            <nav className="flex gap-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
              {tabs.map(({ id, label, icon: IconTab }) => (
                <button
                  key={id}
                  type="button"
                  id={`${id}-btn`}
                  aria-controls={id}
                  aria-selected={activeTab === id}
                  role="tab"
                  className={getTabButtonClassName(id)}
                  onClick={() => setActiveTab(id)}
                >
                  <IconTab className="shrink-0 size-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 space-y-4">
            <div id="tab-geral" role="tabpanel" aria-labelledby="tab-geral-btn" className={activeTab === "tab-geral" ? "" : "hidden"}>
              <div className="space-y-4">
                <FileUploadNice
                  accept="image/*"
                  maxSizeMB={2}
                  value={logoFile}
                  previewUrl={logoPreview}
                  disabled={isSaving}
                  onChange={(file, url) => {
                    setLogoFile(file)
                    setLogoPreview(url)
                    setShouldRemoveLogo(false)
                  }}
                  onRemove={handleRemoveLogo}
                />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Nome da empresa"
                  icon={<Building2 className="size-4 text-gray-500" />}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Email"
                  icon={<Mail className="size-4 text-gray-500" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div id="tab-website" role="tabpanel" aria-labelledby="tab-website-btn" className={activeTab === "tab-website" ? "" : "hidden"}>
              <div className="space-y-3">
                <ToggleRow label="Possui website" checked={hasWebsite} onChange={setHasWebsite} />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Domínio do site"
                  icon={<Globe2 className="size-4 text-gray-500" />}
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomain(e.target.value)}
                  disabled={!hasWebsite}
                  required
                />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Analytics ID"
                  icon={<BarChart3 className="size-4 text-gray-500" />}
                  value={websiteAnalyticsId}
                  onChange={(e) => setWebsiteAnalyticsId(e.target.value)}
                  disabled={!hasWebsite}
                  required
                />
              </div>
            </div>

            <div id="tab-digisac" role="tabpanel" aria-labelledby="tab-digisac-btn" className={activeTab === "tab-digisac" ? "" : "hidden"}>
              <div className="space-y-3">
                <ToggleRow label="Integrado ao Digisac" checked={hasDigisac} onChange={setHasDigisac} />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Digisac Token"
                  icon={<KeyRound className="size-4 text-gray-500" />}
                  value={digisacToken}
                  onChange={(e) => setDigisacToken(e.target.value)}
                  disabled={!hasDigisac}
                  required
                />
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  className="border-surface bg-light text-gray-500 placeholder:text-gray-500"
                  placeholder="Digisac URL"
                  icon={<Link2 className="size-4 text-gray-500" />}
                  value={digisacUrl}
                  onChange={(e) => setDigisacUrl(e.target.value)}
                  disabled={!hasDigisac}
                  required
                />
              </div>
            </div>

            <div id="tab-servicos" role="tabpanel" aria-labelledby="tab-servicos-btn" className={activeTab === "tab-servicos" ? "" : "hidden"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToggleRow label="Email Corporativo" checked={hasEmailCorporate} onChange={setHasEmailCorporate} />
                <ToggleRow label="IA / Automações" checked={hasAutomations} onChange={setHasAutomations} />
                <ToggleRow label="Servidor em Nuvem" checked={hasCloudServer} onChange={setHasCloudServer} />
                <ToggleRow label="Sistema de Gestão" checked={hasManagementSystem} onChange={setHasManagementSystem} />
                <ToggleRow label="Marketing Digital" checked={hasMarketing} onChange={setHasMarketing} />
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 py-3 px-4 border-t border-surface">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="button" variant="primary" onClick={handleSaveCompany} isPending={isSaving} className="min-w-32">
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        className={`relative w-10 h-6 rounded-full opacity-70 transition-colors ${checked ? "bg-emerald-400" : "bg-gray-300"}`}
        aria-pressed={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span className={`absolute top-1 left-1 size-4 rounded-full shadow transition-all ${checked && "translate-x-4"} bg-light`} />
      </button>
    </div>
  )
}