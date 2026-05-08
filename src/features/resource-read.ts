import "server-only"

import { createSupabaseAdminClient } from "@/supabase/admin"
import { createSupabaseServerClient } from "@/supabase/server"
import type {
	FeatureCard,
	ResourceAdminClient,
	ResourceMembershipRow,
	ResourcePageData,
	ResourceRow,
	ResourceServerClient,
} from "@/types/resource"
import { getTranslations } from "next-intl/server"
import { isMissingTableError, normalizeResourceEmail, normalizeResourceText, resolveFeatureStatus } from "@/utils/resource"

export async function getResourcePageData({
	companyId,
	userId,
	locale,
}: {
	companyId: string
	userId: string
	locale: string
}): Promise<ResourcePageData> {
	const supabase = await createSupabaseServerClient()
	const translate = await getTranslations({ locale, namespace: "Resource.server" })

	const membership = await getActiveMembershipInCompany({ supabase, companyId, userId })
	if (!membership) {
		throw new Error("Authenticated user is not an active member of the selected company.")
	}

	const isAdmin = membership.role === "admin"
	const features = await getFeaturesForBoard({
		supabase,
		includeHidden: isAdmin,
		includeSource: isAdmin,
		untitledLabel: translate("fallback.untitled"),
		globalCompanyLabel: translate("fallback.globalCompany"),
	})

	return { features, isAdmin }
}

async function getFeaturesForBoard({
	supabase,
	includeHidden,
	includeSource,
	untitledLabel,
	globalCompanyLabel,
}: {
	supabase: ResourceServerClient
	includeHidden: boolean
	includeSource: boolean
	untitledLabel: string
	globalCompanyLabel: string
}): Promise<FeatureCard[]> {
	const { data: resources, error: resourcesError } = await supabase
		.from("resources")
		.select("id, owner, title, description, status, is_visible, created_at")
		.order("created_at", { ascending: false })

	if (resourcesError) {
		if (isMissingTableError(resourcesError)) return []
		throw new Error("Unable to load resources for roadmap board.")
	}

	const mappedFeatures = ((resources as ResourceRow[] | null) ?? []).map((resourceRow) =>
		mapResourceRow(resourceRow, untitledLabel)
	)
	const visibleFeatures = includeHidden ? mappedFeatures : mappedFeatures.filter((feature) => feature.isVisible)

	return attachFeatureSources({ supabase, features: visibleFeatures, includeSource, globalCompanyLabel })
}

async function attachFeatureSources({
	supabase,
	features,
	includeSource,
	globalCompanyLabel,
}: {
	supabase: ResourceServerClient
	features: FeatureCard[]
	includeSource: boolean
	globalCompanyLabel: string
}): Promise<FeatureCard[]> {
	if (!includeSource) return features.map((feature) => ({ ...feature, source: null }))

	const ownerIds = Array.from(
		new Set(features.map((feature) => feature.ownerId).filter((ownerId): ownerId is string => Boolean(ownerId)))
	)

	if (!ownerIds.length) return features

	const [emailsByUserId, companyByUserId] = await Promise.all([
		getEmailsByUserIds(ownerIds),
		getOwnerCompanyNamesByUserIds({ supabase, ownerIds, globalCompanyLabel }),
	])

	return features.map((feature) => ({
		...feature,
		source: {
			requestId: feature.id,
			userEmail: emailsByUserId[feature.ownerId] ?? getUserEmailFallback(feature.ownerId),
			companyName: companyByUserId[feature.ownerId] ?? globalCompanyLabel,
		},
	}))
}

async function getOwnerCompanyNamesByUserIds({
	supabase,
	ownerIds,
	globalCompanyLabel,
}: {
	supabase: ResourceServerClient
	ownerIds: string[]
	globalCompanyLabel: string
}): Promise<Record<string, string>> {
	if (!ownerIds.length) return {}

	const { data: memberships, error: membershipsError } = await supabase
		.from("company_members")
		.select("user_id, company:companies(display_name)")
		.in("user_id", ownerIds)
		.eq("is_active", true)
		.order("created_at", { ascending: true })

	if (membershipsError) return {}

	type MembershipWithCompany = {
		user_id: string | null
		company: { display_name: string | null } | Array<{ display_name: string | null }> | null
	}

	const rows = (memberships as MembershipWithCompany[] | null) ?? []
	const result: Record<string, string> = {}

	for (const row of rows) {
		if (!row.user_id) continue
		if (result[row.user_id]) continue

		if (Array.isArray(row.company)) {
			result[row.user_id] = row.company[0]?.display_name ?? globalCompanyLabel
			continue
		}

		result[row.user_id] = row.company?.display_name ?? globalCompanyLabel
	}

	return result
}

async function getActiveMembershipInCompany({
	supabase,
	companyId,
	userId,
}: {
	supabase: ResourceServerClient
	companyId: string
	userId: string
}): Promise<ResourceMembershipRow | null> {
	const { data: membership, error: membershipError } = await supabase
		.from("company_members")
		.select("id, company_id, user_id, role, is_active")
		.eq("company_id", companyId)
		.eq("user_id", userId)
		.eq("is_active", true)
		.maybeSingle<ResourceMembershipRow>()

	if (membershipError) return null
	return membership
}

async function getEmailsByUserIds(userIds: string[]): Promise<Record<string, string>> {
	if (!userIds.length) return {}

	const adminClient = tryCreateSupabaseAdminClient()
	if (!adminClient) {
		return Object.fromEntries(userIds.map((userId) => [userId, getUserEmailFallback(userId)]))
	}

	const emailEntries = await Promise.all(
		userIds.map(async (userId): Promise<[string, string]> => {
			const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)

			if (userError || !userData.user?.email) return [userId, getUserEmailFallback(userId)]
			return [userId, normalizeResourceEmail(userData.user.email)]
		})
	)

	return Object.fromEntries(emailEntries)
}

function mapResourceRow(row: ResourceRow, untitledLabel: string): FeatureCard {
	const ownerId = row.owner ? String(row.owner) : ""

	return {
		id: String(row.id),
		ownerId,
		title: normalizeResourceText(row.title) || untitledLabel,
		description: normalizeResourceText(row.description),
		status: resolveFeatureStatus(row.status),
		isVisible: row.is_visible === true,
		sourceRequestId: row.id ? String(row.id) : null,
		source: null,
	}
}

function tryCreateSupabaseAdminClient(): ResourceAdminClient | null {
	try {
		return createSupabaseAdminClient()
	} catch {
		return null
	}
}

function getUserEmailFallback(userId: string): string {
	return `user-${userId.slice(0, 8)}@indisponivel.local`
}
