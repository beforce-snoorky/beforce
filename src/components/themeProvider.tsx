"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { defaultTheme, resolveTheme, themeCookieName } from "@/types/theme"
import type { ResolvedTheme, Theme, ThemeContextValue } from "@/types/theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)

const themeCookieMaxAgeSeconds = 60 * 60 * 24 * 365

export function ThemeProvider({ children, initialTheme = defaultTheme }: { children: React.ReactNode; initialTheme?: Theme }) {
	const [theme, setThemeState] = useState<Theme>(resolveTheme(initialTheme))
	const resolvedTheme: ResolvedTheme = theme

	useEffect(() => {
		const root = document.documentElement

		root.classList.remove("light", "dark")
		root.classList.add(resolvedTheme)
	}, [resolvedTheme])

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			resolvedTheme,
			setTheme: (nextTheme) => {
				const resolvedNextTheme = resolveTheme(nextTheme)
				document.cookie = `${themeCookieName}=${resolvedNextTheme}; path=/; max-age=${themeCookieMaxAgeSeconds}; samesite=lax`
				setThemeState(resolvedNextTheme)
			},
		}),
		[theme, resolvedTheme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const context = useContext(ThemeContext)

	if (!context) throw new Error("useTheme must be used within ThemeProvider")

	return context
}
