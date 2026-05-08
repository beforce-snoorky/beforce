export type Theme = "light" | "dark"

export type ResolvedTheme = Theme

export type ThemeContextValue = { theme: Theme; resolvedTheme: ResolvedTheme; setTheme: (theme: Theme) => void }

export const themeCookieName = "theme"

export const defaultTheme: Theme = "dark"

export function isTheme(value: string | null | undefined): value is Theme {
	return value === "light" || value === "dark"
}

export function resolveTheme(value: string | null | undefined): Theme {
	if (isTheme(value)) return value

	return defaultTheme
}
