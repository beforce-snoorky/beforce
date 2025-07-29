import toast from "react-hot-toast"

type CompanyActionType = "createCompany" | "updateCompany" | "deleteCompany"

type Payload = {
  id?: string
  business_name?: string
  email?: string

  has_website?: boolean
  website_domain?: string
  website_analytics_id?: string

  has_digisac?: boolean
  digisac_token?: string
  digisac_url?: string

  has_email_corporate?: boolean
  has_ia?: boolean
  has_cloud_server?: boolean
  has_management_system?: boolean
  has_marketing?: boolean
}

export async function handleCompanyAction(action: CompanyActionType, payload: Payload) {
  const toastMessages = {
    createCompany: "Criando empresa...",
    updateCompany: "Atualizando empresa...",
    deleteCompany: "Excluindo empresa..."
  }

  const toastId = toast.loading(toastMessages[action] || "Processando...")

  try {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    })

    if (!res.ok) throw new Error()

    toast.success("Ação realizada com sucesso.", { id: toastId })
    return true
  } catch {
    toast.error("Erro ao processar ação.", { id: toastId })
    return false
  }
}