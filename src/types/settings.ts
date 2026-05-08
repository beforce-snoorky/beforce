import type { createSupabaseAdminClient } from "@/supabase/admin"
import type { createSupabaseServerClient } from "@/supabase/server"
import type { ActionResult } from "@/types/common"
import type { CompanyMemberRow, CompanyListRow } from "@/types/companies"
import type { CompanyRole } from "@/types/supabase"

export type CompanyMember = { id: string; userId: string; email: string; role: CompanyRole; isActive: boolean }

export type SettingsServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>
export type SettingsAdminClient = ReturnType<typeof createSupabaseAdminClient>

export type SettingsCompanyRow = CompanyListRow
export type SettingsCompanyMemberRow = CompanyMemberRow

export type SettingsActionContext = {
	supabase: SettingsServerClient
	companyId: string
	actorRole: CompanyRole
	actorUserId: string
}

export type SettingsActionContextResult = ActionResult<{ context: SettingsActionContext }>

export type SettingsPageData = { members: CompanyMember[]; currentUserId: string; currentUserRole: CompanyRole }

export type UpdateMemberRoleResult = ActionResult<{ member: CompanyMember }>
export type AddMemberResult = ActionResult<{ member: CompanyMember }>
export type ToggleMemberStatusResult = ActionResult<{ member: CompanyMember }>

export const companyRoleOptions: readonly CompanyRole[] = ["owner", "admin", "member", "viewer"]
