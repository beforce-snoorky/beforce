"use server"

import { getActiveCompanyForUser } from "@/features/companies"
import { createSupabaseAdminClient } from "@/supabase/admin"
import { createSupabaseServerClient } from "@/supabase/server"
import {
	type AddMemberResult,
	type SettingsActionContextResult,
	type SettingsAdminClient as AdminClient,
	type CompanyMember,
	type SettingsCompanyMemberRow as CompanyMemberRow,
	companyRoleOptions,
	type SettingsServerClient as ServerClient,
	type ToggleMemberStatusResult,
	type UpdateMemberRoleResult,
} from "@/types/settings"
import type { CompanyRole } from "@/types/supabase"
import { getTranslations } from "next-intl/server"
import { requireUser } from "./auth"

export async function updateMemberRole({
	memberId,
	role,
}: {
	memberId: string
	role: CompanyRole
}): Promise<UpdateMemberRoleResult> {
	const translate = await getTranslations("Settings.server")
	if (!memberId) return { ok: false, error: translate("errors.invalidMember") }
	if (!isCompanyRole(role)) return { ok: false, error: translate("errors.invalidRole") }

	const contextResult = await resolveSettingsActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }

	const targetMembership = await getCompanyMemberById({
		supabase: contextResult.context.supabase,
		companyId: contextResult.context.companyId,
		memberId,
	})

	if (!targetMembership) return { ok: false, error: translate("errors.memberNotFound") }

	if (!canUpdateRole(contextResult.context.actorRole, targetMembership.role)) {
		return { ok: false, error: translate("errors.noPermissionToUpdateUser") }
	}

	if (targetMembership.role === role) {
		const emailsByUserId = await getEmailsByUserIds([targetMembership.user_id])
		return { ok: true, member: mapCompanyMemberRow(targetMembership, emailsByUserId) }
	}

	const { data: updatedMembership, error: updateError } = await contextResult.context.supabase
		.from("company_members")
		.update({ role })
		.eq("id", targetMembership.id)
		.eq("company_id", contextResult.context.companyId)
		.select("id, company_id, user_id, role, is_active")
		.maybeSingle<CompanyMemberRow>()

	if (updateError || !updatedMembership) {
		return { ok: false, error: translate("errors.updateRoleFailed") }
	}

	const emailsByUserId = await getEmailsByUserIds([updatedMembership.user_id])
	return { ok: true, member: mapCompanyMemberRow(updatedMembership, emailsByUserId) }
}

export async function toggleMemberStatus({
	memberId,
	isActive,
}: {
	memberId: string
	isActive: boolean
}): Promise<ToggleMemberStatusResult> {
	const translate = await getTranslations("Settings.server")
	if (!memberId) return { ok: false, error: translate("errors.invalidMember") }

	const contextResult = await resolveSettingsActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }

	if (!canRemoveMember(contextResult.context.actorRole)) {
		return { ok: false, error: translate("errors.toggleStatusAdminOnly") }
	}

	const targetMembership = await getCompanyMemberById({
		supabase: contextResult.context.supabase,
		companyId: contextResult.context.companyId,
		memberId,
	})

	if (!targetMembership) return { ok: false, error: translate("errors.memberNotFound") }

	if (!isActive && targetMembership.user_id === contextResult.context.actorUserId) {
		return { ok: false, error: translate("errors.cannotDeactivateSelf") }
	}

	const { data: updatedMembership, error: toggleError } = await contextResult.context.supabase
		.from("company_members")
		.update({ is_active: isActive })
		.eq("id", targetMembership.id)
		.eq("company_id", contextResult.context.companyId)
		.select("id, company_id, user_id, role, is_active")
		.maybeSingle<CompanyMemberRow>()

	if (toggleError || !updatedMembership) {
		return { ok: false, error: translate("errors.updateStatusFailed") }
	}

	const emailsByUserId = await getEmailsByUserIds([updatedMembership.user_id])
	return { ok: true, member: mapCompanyMemberRow(updatedMembership, emailsByUserId) }
}

export async function addMember({
	email,
	password,
	role,
}: {
	email: string
	password: string
	role: CompanyRole
}): Promise<AddMemberResult> {
	const translate = await getTranslations("Settings.server")
	const normalizedEmail = normalizeEmail(email)
	const normalizedPassword = password.trim()

	if (!isValidEmail(normalizedEmail)) return { ok: false, error: translate("errors.invalidEmail") }
	if (normalizedPassword.length < 8) return { ok: false, error: translate("errors.passwordMin") }
	if (!isCompanyRole(role)) return { ok: false, error: translate("errors.invalidRole") }

	const contextResult = await resolveSettingsActionContext(translate)
	if (!contextResult.ok) return { ok: false, error: contextResult.error }

	if (!canAddMember(contextResult.context.actorRole)) {
		return { ok: false, error: translate("errors.addMemberAdminOnly") }
	}

	const adminClient = tryCreateSupabaseAdminClient()
	if (!adminClient) {
		return { ok: false, error: translate("errors.adminConfigUnavailable") }
	}

	let resolvedUserId = await findUserIdByEmail(normalizedEmail)

	if (!resolvedUserId) {
		const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
			email: normalizedEmail,
			password: normalizedPassword,
			email_confirm: true,
		})

		if (createUserError) {
			if (isUserAlreadyExistsError(createUserError)) {
				resolvedUserId = await findUserIdByEmail(normalizedEmail)
			}

			if (!resolvedUserId) {
				return { ok: false, error: translate("errors.createAuthUserFailed") }
			}
		} else {
			resolvedUserId = createdUserData.user?.id ?? null
		}
	}

	if (!resolvedUserId) return { ok: false, error: translate("errors.userIdMissing") }

	const { data: existingMembership, error: existingMembershipError } = await contextResult.context.supabase
		.from("company_members")
		.select("id, company_id, user_id, role, is_active")
		.eq("company_id", contextResult.context.companyId)
		.eq("user_id", resolvedUserId)
		.maybeSingle<CompanyMemberRow>()

	if (existingMembershipError) {
		return { ok: false, error: translate("errors.validateMembershipFailed") }
	}

	if (existingMembership?.is_active === true) {
		return { ok: false, error: translate("errors.userAlreadyActiveMember") }
	}

	if (existingMembership) {
		const { data: reactivatedMembership, error: reactivateError } = await contextResult.context.supabase
			.from("company_members")
			.update({ role, is_active: true })
			.eq("id", existingMembership.id)
			.eq("company_id", contextResult.context.companyId)
			.select("id, company_id, user_id, role, is_active")
			.maybeSingle<CompanyMemberRow>()

		if (reactivateError || !reactivatedMembership) {
			return { ok: false, error: translate("errors.reactivateMemberFailed") }
		}

		return {
			ok: true,
			member: {
				id: reactivatedMembership.id,
				userId: reactivatedMembership.user_id,
				email: normalizedEmail,
				role,
				isActive: true,
			},
		}
	}

	const { data: insertedMembership, error: insertError } = await contextResult.context.supabase
		.from("company_members")
		.insert({ company_id: contextResult.context.companyId, user_id: resolvedUserId, role, is_active: true })
		.select("id, company_id, user_id, role, is_active")
		.maybeSingle<CompanyMemberRow>()

	if (insertError || !insertedMembership) {
		return { ok: false, error: translate("errors.linkUserFailed") }
	}

	return {
		ok: true,
		member: { id: insertedMembership.id, userId: insertedMembership.user_id, email: normalizedEmail, role, isActive: true },
	}
}

async function resolveSettingsActionContext(
	translate: Awaited<ReturnType<typeof getTranslations>>
): Promise<SettingsActionContextResult> {
	const user = await requireUser()
	const activeCompany = await getActiveCompanyForUser(user.id)

	if (activeCompany.status !== "valid") {
		return { ok: false, error: translate("errors.selectActiveCompany") }
	}

	const supabase = await createSupabaseServerClient()

	const { data: actorMembership, error: actorMembershipError } = await supabase
		.from("company_members")
		.select("id, company_id, user_id, role, is_active")
		.eq("company_id", activeCompany.companyId)
		.eq("user_id", user.id)
		.eq("is_active", true)
		.maybeSingle<CompanyMemberRow>()

	if (actorMembershipError || !actorMembership) {
		return { ok: false, error: translate("errors.noCompanyManagePermission") }
	}

	return {
		ok: true,
		context: { supabase, companyId: activeCompany.companyId, actorRole: actorMembership.role, actorUserId: user.id },
	}
}

async function getCompanyMemberById({
	supabase,
	companyId,
	memberId,
}: {
	supabase: ServerClient
	companyId: string
	memberId: string
}): Promise<CompanyMemberRow | null> {
	const { data: companyMember, error: companyMemberError } = await supabase
		.from("company_members")
		.select("id, company_id, user_id, role, is_active")
		.eq("id", memberId)
		.eq("company_id", companyId)
		.maybeSingle<CompanyMemberRow>()

	if (companyMemberError) return null

	return companyMember
}

function canUpdateRole(actorRole: CompanyRole, targetRole: CompanyRole): boolean {
	if (actorRole === "admin") return true
	if (actorRole === "owner") return targetRole !== "admin"
	return false
}

function canRemoveMember(actorRole: CompanyRole): boolean {
	return actorRole === "admin"
}

function canAddMember(actorRole: CompanyRole): boolean {
	return actorRole === "admin"
}

function isCompanyRole(value: string): value is CompanyRole {
	return companyRoleOptions.includes(value as CompanyRole)
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function mapCompanyMemberRow(memberRow: CompanyMemberRow, emailsByUserId: Record<string, string>): CompanyMember {
	return {
		id: memberRow.id,
		userId: memberRow.user_id,
		email: emailsByUserId[memberRow.user_id] ?? getMemberEmailFallback(memberRow.user_id),
		role: memberRow.role,
		isActive: memberRow.is_active === true,
	}
}

async function getEmailsByUserIds(userIds: string[]): Promise<Record<string, string>> {
	const uniqueUserIds = Array.from(new Set(userIds))
	const adminClient = tryCreateSupabaseAdminClient()

	const emailEntries = await Promise.all(
		uniqueUserIds.map(async (userId): Promise<[string, string]> => {
			if (!adminClient) return [userId, getMemberEmailFallback(userId)]

			const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)

			if (userError || !userData.user?.email) {
				return [userId, getMemberEmailFallback(userId)]
			}

			return [userId, normalizeEmail(userData.user.email)]
		})
	)

	return Object.fromEntries(emailEntries)
}

function tryCreateSupabaseAdminClient(): AdminClient | null {
	try {
		return createSupabaseAdminClient()
	} catch {
		return null
	}
}

async function findUserIdByEmail(email: string): Promise<string | null> {
	const adminClient = tryCreateSupabaseAdminClient()
	if (!adminClient) return null

	let page = 1
	const perPage = 200

	while (true) {
		const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
		if (error) return null

		const users = data.users ?? []
		const matchedUser = users.find((user) => normalizeEmail(user.email ?? "") === email)

		if (matchedUser) return matchedUser.id
		if (users.length < perPage) return null

		page += 1
	}
}

function getMemberEmailFallback(userId: string): string {
	return `user-${userId.slice(0, 8)}@indisponivel.local`
}

function isUserAlreadyExistsError(error: { message?: string; code?: string | number | null }): boolean {
	const normalizedMessage = (error.message ?? "").toLowerCase()
	const normalizedCode = String(error.code ?? "").toLowerCase()

	return (
		normalizedMessage.includes("already registered") ||
		normalizedMessage.includes("already exists") ||
		normalizedMessage.includes("duplicate") ||
		normalizedCode.includes("email_exists") ||
		normalizedCode === "23505"
	)
}
