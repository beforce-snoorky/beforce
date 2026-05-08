import type { MetadataRoute } from "next"

const defaultSiteUrl = "https://dashboard.beforce.com.br/"

function resolveSiteOrigin(): string {
	const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? defaultSiteUrl

	try {
		return new URL(configuredSiteUrl).origin
	} catch {
		return new URL(`https://${configuredSiteUrl}`).origin
	}
}

export default function robots(): MetadataRoute.Robots {
	const siteOrigin = resolveSiteOrigin()

	return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteOrigin}/sitemap.xml` }
}
