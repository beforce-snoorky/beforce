import { handleAction } from "./handleAction"

type CompanyActionType = "createCompany" | "updateCompany" | "deleteCompany"

type CompanyPayload = {
  id?: string
  business_name?: string
  email?: string
  logo?: string | null
  remove_logo?: boolean
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

export function handleCompanyAction(action: CompanyActionType, payload: CompanyPayload) {
  return handleAction<CompanyActionType, CompanyPayload>({
    action,
    payload,
    apiRoute: "/api/companies",
    toastMessages: {
      createCompany: "Criando empresa...",
      updateCompany: "Atualizando empresa...",
      deleteCompany: "Excluindo empresa..."
    }
  })
}