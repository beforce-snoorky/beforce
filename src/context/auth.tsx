"use client"

import type { AuthContextValue } from "@/types/auth"
import type { ActiveCompany } from "@/types/companies"
import { createContext, useContext } from "react"

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
	user,
	company,
	children,
}: {
	user: AuthContextValue["user"]
	company: ActiveCompany
	children: React.ReactNode
}) {
	return <AuthContext.Provider value={{ user, company }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider")
	}

	return context
}
