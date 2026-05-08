import { RouteIntlProvider } from "@/components/route-intl-provider"
import { WebsiteAnalytics } from "@/components/website/client"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "website", pathname: "/website" })
}

export default async function WebsitePage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<RouteIntlProvider namespaces={["Website"]}>
			<WebsiteAnalytics locale={locale} />
		</RouteIntlProvider>
	)
}
