import "@/app/globals.css"

import { QueryProvider } from "@/components/queryProvider"
import { ThemeProvider } from "@/components/themeProvider"
import { resolveTheme, themeCookieName } from "@/types/theme"
import { buildLocaleLayoutMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { getLocale } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale()
	return buildLocaleLayoutMetadata(locale)
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const locale = await getLocale()
	const cookieStore = await cookies()
	const theme = resolveTheme(cookieStore.get(themeCookieName)?.value)
	const documentLanguage = locale === "pt" ? "pt-BR" : locale

	return (
		<html
			lang={documentLanguage}
			className={theme}
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider initialTheme={theme}>
					<QueryProvider>{children}</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
