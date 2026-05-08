import type { createSupabaseAdminClient } from "@/supabase/admin"
import type { createSupabaseServerClient } from "@/supabase/server"
import type { ActionResult } from "@/types/common"
import type { CompanyMemberRow } from "@/types/companies"

export type FeatureStatus = "backlog" | "planned" | "in_progress" | "done"

export type FeatureRequest = { id: string; userId: string; title: string; description: string; createdAt: string | null }

export type FeatureSource = { requestId: string; userEmail: string; companyName: string }

export type FeatureCard = {
	id: string
	ownerId: string
	title: string
	description: string
	status: FeatureStatus
	isVisible: boolean
	sourceRequestId: string | null
	source: FeatureSource | null
}

export type ResourceServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>
export type ResourceAdminClient = ReturnType<typeof createSupabaseAdminClient>

export type ResourceMembershipRow = Pick<CompanyMemberRow, "id" | "company_id" | "user_id" | "role" | "is_active">

export type ResourceRow = {
	id: string
	owner: string | null
	title: string | null
	description: string | null
	status: string | null
	is_visible: boolean | null
	created_at: string | null
}

export type ResourcePageData = { features: FeatureCard[]; isAdmin: boolean }

export type ResourceActionContext = {
	supabase: ResourceServerClient
	actorUserId: string
	actorEmail: string
	companyId: string
	companyName: string
	isAdmin: boolean
}

export type ResourceActionContextResult = ActionResult<{ context: ResourceActionContext }>

export type CreateFeatureRequestResult = ActionResult<{ request: FeatureRequest }>
export type UpdateFeatureStatusResult = ActionResult<{ feature: FeatureCard }>
export type UpdateFeatureResult = ActionResult<{ feature: FeatureCard }>

export type UpdateFeaturePayload = Partial<Pick<FeatureCard, "title" | "description" | "isVisible">>

export type FeatureRequestWebhookPayload = {
	requestId: string
	title: string
	description: string
	companyId: string
	companyName: string
	userId: string
	userEmail: string
}

export const featureStatuses: readonly FeatureStatus[] = ["backlog", "planned", "in_progress", "done"]
