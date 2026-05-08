import type { createSupabaseAdminClient } from "@/supabase/admin"
import type { ActionResult } from "@/types/common"
import type { CompanyListRow, CompanySummary } from "@/types/companies"
import type { ServiceCatalogItem } from "@/types/service"
import type { CompanyRole } from "@/types/supabase"
import type { User } from "@supabase/supabase-js"

export type InternalAdminIntegrationKind = "digisac" | "website"

export type InternalAdminTab = "users" | "companies"
export type UserCreationStep = 1 | 2

export type InternalAdminCompanySelectionState = Record<string, { selected: boolean; role: CompanyRole }>

export type InternalAdminCompanyListItem = CompanySummary

export type InternalAdminCompanyListPage = { items: InternalAdminCompanyListItem[]; nextCursor: string | null }

export type InternalAdminCompanyService = { id: string; code: string; name: string; isSelected: boolean }

export type InternalAdminAdminClient = ReturnType<typeof createSupabaseAdminClient>

export type InternalAdminCompanyRow = CompanyListRow
export type InternalAdminCompanyServiceRow = { service_id: string | null; is_active: boolean | null }
export type InternalAdminServiceRow = { id: string; code: string | null; name: string | null }
export type DigisacIntegrationRow = { company_id: string | null; token: string | null; base_url: string | null }
export type WebsiteIntegrationRow = { company_id: string | null; domain: string | null; analytics_id: string | null }

export type DigisacIntegration = { token: string; baseUrl: string }
export type WebsiteIntegration = { domain: string; analyticsId: string }

export type InternalAdminCompanyDetails = InternalAdminCompanyListItem & {
	services: InternalAdminCompanyService[]
	digisacIntegration: DigisacIntegration | null
	websiteIntegration: WebsiteIntegration | null
}

export type InternalAdminCompanySelection = { companyId: string; role: CompanyRole }

export type InternalAdminPageData = { adminEmail: string; initialCompanies: InternalAdminCompanyListPage }

export type InternalAdminAccessContext = { adminClient: InternalAdminAdminClient; user: User; userEmail: string }
export type InternalAdminAccessResult = ActionResult<{ context: InternalAdminAccessContext }>

export type CompanyDetailsResult = ActionResult<{ company: InternalAdminCompanyDetails }>
export type ServiceCatalogResult = ActionResult<{ services: ServiceCatalogItem[] }>

export type PaginationInput = { search: string; lastId: string | null }

export type GetCompaniesResult = ActionResult<{ page: InternalAdminCompanyListPage }>
export type GetCompanyDetailsResult = ActionResult<{ company: InternalAdminCompanyDetails }>

export type CreateUserWithCompaniesResult = ActionResult<{ userId: string }>
export type UpdateCompanyResult = ActionResult<{ company: InternalAdminCompanyDetails }>

export type ActivateServiceResult = ActionResult<{ company: InternalAdminCompanyDetails }>
export type DeactivateServiceResult = ActionResult<{ company: InternalAdminCompanyDetails }>
export type CreateIntegrationResult = ActionResult<{ company: InternalAdminCompanyDetails }>

export type UpdateIntegrationPayload = Partial<DigisacIntegration & WebsiteIntegration>

export type UpdateIntegrationResult = ActionResult<{ company: InternalAdminCompanyDetails }>
