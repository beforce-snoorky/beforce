import "server-only"

import { getActiveCompanyForUser, getUserCompaniesForUser } from "@/features/companies"
import type { AppAuthContext, AppAuthState } from "@/types/auth"
import { cache } from "react"
import { requireUser } from "./auth"

export type { AppAuthContext } from "@/types/auth"

const getAppAuthStateCached = cache(async (): Promise<AppAuthState> => {
	const user = await requireUser()
	const [userCompanies, activeCompany] = await Promise.all([getUserCompaniesForUser(user.id), getActiveCompanyForUser(user.id)])

	return { user, userCompanies, activeCompany }
})

export async function getAppAuthState(): Promise<AppAuthState> {
	return getAppAuthStateCached()
}

export async function requireAppAuthContext(): Promise<AppAuthContext> {
	const state = await getAppAuthState()

	if (state.activeCompany.status !== "valid") {
		throw new Error("Active company should be valid inside protected app routes.")
	}

	return { user: state.user, company: state.activeCompany, userCompanies: state.userCompanies }
}
