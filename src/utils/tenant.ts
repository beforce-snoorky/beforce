import { cookies } from "next/headers"

const activeCompanyCookie = "active_company_id"

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax" as const,
	secure: process.env.NODE_ENV === "production",
	path: "/",
	maxAge: 60 * 60 * 24 * 30,
}

export async function getActiveCompanyId(): Promise<string | null> {
	const cookieStore = await cookies()
	return cookieStore.get(activeCompanyCookie)?.value ?? null
}

export async function setActiveCompanyId(companyId: string): Promise<void> {
	const cookieStore = await cookies()
	cookieStore.set(activeCompanyCookie, companyId, COOKIE_OPTIONS)
}

export async function clearActiveCompanyId(): Promise<void> {
	const cookieStore = await cookies()
	cookieStore.set(activeCompanyCookie, "", { ...COOKIE_OPTIONS, maxAge: 0 })
}
