import "server-only"

import { createSupabaseAdminClient } from "@/supabase/admin"
import { createSupabaseServerClient } from "@/supabase/server"
import type { CompanyMember, SettingsAdminClient, SettingsCompanyMemberRow, SettingsPageData } from "@/types/settings"

export async function getSettingsPageData({
	companyId,
	userId,
}: {
	companyId: string
	userId: string
}): Promise<SettingsPageData> {
	const supabase = await createSupabaseServerClient()

	const { data: membersData, error: membersError } = await supabase
		.from("company_members")
		.select("id, company_id, user_id, role, is_active")
		.eq("company_id", companyId)
		.order("created_at", { ascending: true })

	if (membersError) {
		throw new Error("Unable to load company members for settings page.")
	}

	const memberRows = (membersData as SettingsCompanyMemberRow[] | null) ?? []
	const currentUserMembership =
		memberRows.find((memberRow) => memberRow.user_id === userId && memberRow.is_active === true) ??
		memberRows.find((memberRow) => memberRow.user_id === userId)

	if (!currentUserMembership) {
		throw new Error("Authenticated user is not an active member of the selected company.")
	}

	const emailsByUserId = await getEmailsByUserIds(memberRows.map((memberRow) => memberRow.user_id))
	const members = memberRows.map((memberRow) => mapCompanyMemberRow(memberRow, emailsByUserId))
	members.sort((left, right) => {
		if (left.isActive !== right.isActive) return left.isActive ? -1 : 1
		return left.email.localeCompare(right.email)
	})

	return { members, currentUserId: userId, currentUserRole: currentUserMembership.role }
}

function mapCompanyMemberRow(memberRow: SettingsCompanyMemberRow, emailsByUserId: Record<string, string>): CompanyMember {
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

function tryCreateSupabaseAdminClient(): SettingsAdminClient | null {
	try {
		return createSupabaseAdminClient()
	} catch {
		return null
	}
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase()
}

function getMemberEmailFallback(userId: string): string {
	return `user-${userId.slice(0, 8)}@indisponivel.local`
}
