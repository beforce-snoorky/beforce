import type { ActiveCompany, ActiveCompanyResult, UserCompany } from "@/types/companies"
import type { User } from "@supabase/supabase-js"

export type SignInErrorReason = "missing_fields" | "invalid_credentials" | "rate_limited" | "unknown"

export type SignInActionState = { status: "idle" } | { status: "error"; reason: SignInErrorReason }

export type AuthContextValue = { user: User; company: ActiveCompany }

export type AppAuthState = { user: User; userCompanies: UserCompany[]; activeCompany: ActiveCompanyResult }

export type AppAuthContext = { user: User; company: ActiveCompany; userCompanies: UserCompany[] }
