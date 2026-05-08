"use server"

import { getActiveCompanyForUser } from "@/features/companies"
import { createSupabaseAdminClient } from "@/supabase/admin"
import { createSupabaseServerClient } from "@/supabase/server"
import type {
	CreateFeatureRequestResult,
	FeatureCard,
	FeatureRequestWebhookPayload,
	FeatureStatus,
	ResourceActionContextResult,
	ResourceAdminClient,
	ResourceMembershipRow,
	ResourceRow,
	ResourceServerClient,
	UpdateFeaturePayload,
	UpdateFeatureResult,
	UpdateFeatureStatusResult,
} from "@/types/resource"
import { getTranslations } from "next-intl/server"
import {
	isFeatureStatus,
	isMissingTableError,
	normalizeResourceEmail,
	normalizeResourceText,
	resolveFeatureStatus,
	validateSuggestionInput,
} from "@/utils/resource"
import { requireUser } from "./auth"

export async function createFeatureRequest({
	title,
	description,
}: {
	title: string
	description: string
}): Promise<CreateFeatureRequestResult> {
	const translate = await getTranslations("Resource.server")
	const validationError = validateSuggestionInput({ title, description })
	if (validationError) return { ok: false, error: getResourceValidationErrorMessage(translate, validationError) }

	const contextResult = await resolveResourceActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }

	const normalizedTitle = normalizeResourceText(title)
	const normalizedDescription = normalizeResourceText(description)

	const { data: createdResource, error: createResourceError } = await contextResult.context.supabase
		.from("resources")
		.insert({
			owner: contextResult.context.actorUserId,
			title: normalizedTitle,
			description: normalizedDescription,
			status: "backlog",
			is_visible: false,
		})
		.select("id, owner, title, description, status, is_visible, created_at")
		.maybeSingle<ResourceRow>()

	if (createResourceError || !createdResource) {
		if (isMissingTableError(createResourceError)) {
			return { ok: false, error: translate("errors.resourcesTableMissing") }
		}

		return { ok: false, error: getSupabaseErrorMessage(createResourceError, translate("errors.createFailed")) }
	}

	const request = mapResourceRowToRequest(createdResource)

	await sendFeatureRequestWebhook({
		requestId: request.id,
		title: request.title,
		description: request.description,
		companyId: contextResult.context.companyId,
		companyName: contextResult.context.companyName,
		userId: contextResult.context.actorUserId,
		userEmail: contextResult.context.actorEmail,
	})

	return { ok: true, request }
}

export async function updateFeatureStatus({
	featureId,
	status,
}: {
	featureId: string
	status: FeatureStatus
}): Promise<UpdateFeatureStatusResult> {
	const translate = await getTranslations("Resource.server")
	if (!featureId) return { ok: false, error: translate("errors.invalidFeature") }
	if (!isFeatureStatus(status)) return { ok: false, error: translate("errors.invalidStatus") }

	const contextResult = await resolveResourceActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }
	if (!contextResult.context.isAdmin) return { ok: false, error: translate("errors.updateStatusAdminOnly") }

	const { data: updatedResource, error: updateError } = await contextResult.context.supabase
		.from("resources")
		.update({ status })
		.eq("id", featureId)
		.select("id, owner, title, description, status, is_visible, created_at")
		.maybeSingle<ResourceRow>()

	if (updateError || !updatedResource) {
		if (isMissingTableError(updateError)) {
			return { ok: false, error: translate("errors.resourcesTableMissing") }
		}

		return { ok: false, error: getSupabaseErrorMessage(updateError, translate("errors.updateStatusFailed")) }
	}

	const feature = mapResourceRow(updatedResource, translate("fallback.untitled"))
	const withSource = await attachFeatureSources({
		supabase: contextResult.context.supabase,
		features: [feature],
		includeSource: true,
		globalCompanyLabel: translate("fallback.globalCompany"),
	})

	return { ok: true, feature: withSource[0] ?? feature }
}

export async function updateFeature({
	featureId,
	data,
}: {
	featureId: string
	data: UpdateFeaturePayload
}): Promise<UpdateFeatureResult> {
	const translate = await getTranslations("Resource.server")
	if (!featureId) return { ok: false, error: translate("errors.invalidFeature") }

	const contextResult = await resolveResourceActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }
	if (!contextResult.context.isAdmin) return { ok: false, error: translate("errors.updateFeatureAdminOnly") }

	const payload: Record<string, string | boolean> = {}

	if (typeof data.title === "string") {
		const normalizedTitle = normalizeResourceText(data.title)
		if (normalizedTitle.length < 3) return { ok: false, error: translate("errors.titleMin") }
		payload.title = normalizedTitle
	}

	if (typeof data.description === "string") {
		const normalizedDescription = normalizeResourceText(data.description)
		if (normalizedDescription.length < 8) return { ok: false, error: translate("errors.descriptionMin") }
		payload.description = normalizedDescription
	}

	if (typeof data.isVisible === "boolean") {
		payload.is_visible = data.isVisible
	}

	if (Object.keys(payload).length === 0) {
		return { ok: false, error: translate("errors.noValidChanges") }
	}

	const { data: updatedResource, error: updateError } = await contextResult.context.supabase
		.from("resources")
		.update(payload)
		.eq("id", featureId)
		.select("id, owner, title, description, status, is_visible, created_at")
		.maybeSingle<ResourceRow>()

	if (updateError || !updatedResource) {
		if (isMissingTableError(updateError)) {
			return { ok: false, error: translate("errors.resourcesTableMissing") }
		}

		return { ok: false, error: getSupabaseErrorMessage(updateError, translate("errors.updateFeatureFailed")) }
	}

	const feature = mapResourceRow(updatedResource, translate("fallback.untitled"))
	const withSource = await attachFeatureSources({
		supabase: contextResult.context.supabase,
		features: [feature],
		includeSource: true,
		globalCompanyLabel: translate("fallback.globalCompany"),
	})

	return { ok: true, feature: withSource[0] ?? feature }
}

async function resolveResourceActionContext(
	translate: Awaited<ReturnType<typeof getTranslations>>
): Promise<ResourceActionContextResult> {
	try {
		const user = await requireUser()
		const activeCompany = await getActiveCompanyForUser(user.id)

		if (activeCompany.status !== "valid") {
			return { ok: false, error: translate("errors.selectActiveCompany") }
		}

		const supabase = await createSupabaseServerClient()
		const membership = await getActiveMembershipInCompany({ supabase, companyId: activeCompany.companyId, userId: user.id })

		if (!membership) {
			return { ok: false, error: translate("errors.noCompanyPermission") }
		}

		return {
			ok: true,
			context: {
				supabase,
				actorUserId: user.id,
				actorEmail: normalizeResourceEmail(user.email ?? ""),
				companyId: activeCompany.companyId,
				companyName: activeCompany.companyName,
				isAdmin: membership.role === "admin",
			},
		}
	} catch {
		return { ok: false, error: translate("errors.sessionExpired") }
	}
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

function mapResourceRowToRequest(row: ResourceRow) {
	return {
		id: String(row.id),
		userId: row.owner ? String(row.owner) : "",
		title: normalizeResourceText(row.title),
		description: normalizeResourceText(row.description),
		createdAt: row.created_at,
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

function getSupabaseErrorMessage(error: { message?: string | null } | null, fallback: string): string {
	const message = normalizeResourceText(error?.message)
	if (!message) return fallback
	return `${fallback} (${message})`
}

function getResourceValidationErrorMessage(
	translate: Awaited<ReturnType<typeof getTranslations>>,
	validationError: "title_min" | "description_min"
): string {
	if (validationError === "title_min") return translate("validation.title_min")
	return translate("validation.description_min")
}

async function sendFeatureRequestWebhook(payload: FeatureRequestWebhookPayload): Promise<void> {
	const webhookUrl = process.env.FEATURE_REQUEST_WEBHOOK_URL ?? process.env.N8N_FEATURE_REQUEST_WEBHOOK_URL
	if (!webhookUrl) return

	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
			cache: "no-store",
		})

		if (!response.ok) {
			console.error("[resource] Feature request webhook returned non-2xx status", {
				status: response.status,
				requestId: payload.requestId,
			})
		}
	} catch (error) {
		console.error("[resource] Unable to send feature request webhook", { requestId: payload.requestId, error })
	}
}
