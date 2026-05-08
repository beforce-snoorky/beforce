"use server"

import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { createSupabaseServerClient } from "@/supabase/server"
import type { SignInActionState, SignInErrorReason } from "@/types/auth"
import type { AuthError, User } from "@supabase/supabase-js"
import { hasLocale } from "next-intl"
import { getUserCompaniesForUser, selectCompany } from "./companies"
import { getLocale } from "next-intl/server"
import { cache } from "react"

export async function redirectAuthenticatedUserFromAuthPage(locale: string): Promise<void> {
	const user = await getAuthenticatedUser()

	if (!user) return

	redirect({ href: "/companies", locale })
}

const getAuthenticatedUserCached = cache(async (): Promise<User | null> => {
	const supabase = await createSupabaseServerClient()
	const { data } = await supabase.auth.getUser()

	return data.user ?? null
})

export async function getAuthenticatedUser(): Promise<User | null> {
	return getAuthenticatedUserCached()
}

export async function signInWithPassword(_prevState: SignInActionState, formData: FormData): Promise<SignInActionState> {
	const email = normalizeEmail(getFieldAsString(formData, "email"))
	const password = getFieldAsString(formData, "password")
	const requestedLocale = getFieldAsString(formData, "locale")

	const locale = resolveLocale(requestedLocale || routing.defaultLocale)

	if (hasMissingCredentials(email, password)) return { status: "error", reason: "missing_fields" }

	const signInResult = await signInUser(email, password)

	if ("reason" in signInResult) return { status: "error", reason: signInResult.reason }

	return redirectAuthenticatedUserAfterSignIn(signInResult.userId, locale)
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase()
}

function getFieldAsString(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "")
}

function resolveLocale(value: string): string {
	if (hasLocale(routing.locales, value)) return value
	return routing.defaultLocale
}

function hasMissingCredentials(email: string, password: string): boolean {
	return email.length === 0 || password.length === 0
}

async function signInUser(email: string, password: string): Promise<{ userId: string } | { reason: SignInErrorReason }> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase.auth.signInWithPassword({ email, password })

	if (error) return { reason: mapAuthErrorToReason(error) }

	if (!data.user) return { reason: "unknown" }

	return { userId: data.user.id }
}

function mapAuthErrorToReason(error: AuthError): SignInErrorReason {
	const normalizedMessage = error.message.toLowerCase()

	if (error.status === 429) return "rate_limited"

	if (normalizedMessage.includes("invalid") || normalizedMessage.includes("credentials")) return "invalid_credentials"

	return "unknown"
}

async function redirectAuthenticatedUserAfterSignIn(userId: string, locale: string): Promise<SignInActionState> {
	const companies = await getUserCompaniesForUser(userId)

	if (companies.length === 1) {
		const selection = await selectCompany(companies[0].id)

		if (selection.ok) return redirect({ href: "/dashboard", locale })
	}

	return redirect({ href: "/companies", locale })
}

export async function requireUser(): Promise<User> {
	const user = await getAuthenticatedUser()

	if (!user) {
		const locale = await getLocale()
		redirect({ href: "/auth", locale })
		throw new Error("Unable to resolve authenticated user.")
	}

	return user
}
