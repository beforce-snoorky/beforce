import { routing } from "@/i18n/routing"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export type MetadataRouteKey =
	| "home"
	| "auth"
	| "companies"
	| "dashboard"
	| "digisac"
	| "website"
	| "settings"
	| "resource"
	| "crm"
	| "email"
	| "ia"
	| "marketing"
	| "server"
	| "internalAdmin"

const DEFAULT_SITE_URL = "https://dashboard.beforce.com.br/"
const DEFAULT_OG_IMAGE = "/og-default.png"

type RouteMetadataOptions = { locale: string; route: MetadataRouteKey; pathname: string; robots?: Metadata["robots"] }

function ensureUrlProtocol(value: string): string {
	if (value.startsWith("http://") || value.startsWith("https://")) return value
	return `https://${value}`
}

export function resolveMetadataBase(): URL {
	const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL
	const normalizedUrl = new URL(ensureUrlProtocol(configuredSiteUrl))
	return new URL(normalizedUrl.origin)
}

function normalizePathname(pathname: string): string {
	const trimmed = pathname.trim()
	if (!trimmed || trimmed === "/") return "/"
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

function shouldPrefixLocale(locale: string): boolean {
	const localePrefix = String(routing.localePrefix ?? "always")
	if (localePrefix === "never") return false
	if (localePrefix === "as-needed") return locale !== routing.defaultLocale
	return true
}

export function localizePathname(pathname: string, locale: string): string {
	const normalizedPathname = normalizePathname(pathname)

	if (!shouldPrefixLocale(locale)) return normalizedPathname
	return `/${locale}${normalizedPathname === "/" ? "" : normalizedPathname}`
}

function buildLanguageAlternates(pathname: string): Record<string, string> {
	return Object.fromEntries(routing.locales.map((locale) => [locale, localizePathname(pathname, locale)]))
}

function buildAbsoluteUrl(pathname: string, locale: string): string {
	const localizedPathname = localizePathname(pathname, locale)
	return new URL(localizedPathname, resolveMetadataBase()).toString()
}

export async function buildLocaleLayoutMetadata(locale: string): Promise<Metadata> {
	const translate = await getTranslations({ locale, namespace: "Metadata" })

	const title = translate("defaultTitle")
	const description = translate("defaultDescription")
	const appName = translate("appName")

	return {
		metadataBase: resolveMetadataBase(),
		applicationName: appName,
		manifest: "/manifest.webmanifest",
		appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: appName },
		formatDetection: { telephone: false },
		icons: {
			apple: [{ url: "/icons/icon-192.png" }],
			icon: [
				{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
				{ url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
			],
		},
		title: { default: title, template: `${appName} | %s` },
		description,
		openGraph: {
			type: "website",
			locale,
			title,
			description,
			siteName: appName,
			url: buildAbsoluteUrl("/", locale),
			images: [DEFAULT_OG_IMAGE],
		},
		twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
		robots: { index: true, follow: true },
		alternates: {
			canonical: localizePathname("/", locale),
			languages: { ...buildLanguageAlternates("/"), "x-default": localizePathname("/", routing.defaultLocale) },
		},
	}
}

export async function buildRouteMetadata({
	locale,
	route,
	pathname,
	robots = { index: true, follow: true },
}: RouteMetadataOptions): Promise<Metadata> {
	const translate = await getTranslations({ locale, namespace: "Metadata" })
	const routeTranslate = await getTranslations({ locale, namespace: `Metadata.routes.${route}` })

	const appName = translate("appName")
	const title = routeTranslate("title")
	const description = routeTranslate("description")

	return {
		title,
		description,
		openGraph: {
			type: "website",
			locale,
			title,
			description,
			siteName: appName,
			url: buildAbsoluteUrl(pathname, locale),
			images: [DEFAULT_OG_IMAGE],
		},
		twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
		robots,
		alternates: {
			canonical: localizePathname(pathname, locale),
			languages: { ...buildLanguageAlternates(pathname), "x-default": localizePathname(pathname, routing.defaultLocale) },
		},
	}
}
