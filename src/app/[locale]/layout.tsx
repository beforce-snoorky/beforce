import { routing } from "@/i18n/routing"
import type { LocaleRouteParams } from "@/types/layout"
import { buildLocaleLayoutMetadata } from "@/utils/metadata"
import type { Metadata, Viewport } from "next"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildLocaleLayoutMetadata(locale)
}

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
		{ media: "(prefers-color-scheme: dark)", color: "#111113" },
	],
	colorScheme: "light dark",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: LocaleRouteParams }) {
	const { locale } = await params

	if (!hasLocale(routing.locales, locale)) notFound()
	setRequestLocale(locale)

	return children
}
