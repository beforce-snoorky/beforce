import type { Tables } from "@/types/db"
import type { CompanyStatus } from "@/types/supabase"

export type SelectCompanyResult = { ok: true } | { ok: false }

export type CompanySummary = { id: string; displayName: string; logoUrl: string | null }

export type UserCompany = CompanySummary

export type ActiveCompanyResult =
	| { status: "missing" }
	| { status: "invalid" }
	| { status: "valid"; companyId: string; companyName: string; companyStatus: string | null; membershipId: string }

export type ActiveCompany = Extract<ActiveCompanyResult, { status: "valid" }>

export type CompanyListRow = Pick<Tables<"companies">, "id" | "display_name" | "logo_url">
export type CompanyNameRow = Pick<Tables<"companies">, "id" | "display_name">
export type CompanyMemberRow = Pick<Tables<"company_members">, "id" | "company_id" | "user_id" | "role" | "is_active">

export type CompanyMemberCompanyRow = { company: Array<{ id: string; display_name: string; logo_url: string | null }> | null }

export type CompanyMembershipStatusRow = Pick<Tables<"company_members">, "id" | "is_active"> & {
	company: { status: CompanyStatus | null } | null
}

export type CompanyMembershipWithCompanyRow = Pick<Tables<"company_members">, "id" | "is_active"> & {
	company: Pick<Tables<"companies">, "id" | "display_name" | "status"> | null
}

export type CompanyServiceWithServiceRow = { services: { code: string | null } | Array<{ code: string | null }> | null }
