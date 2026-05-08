import { RouteIntlProvider } from "@/components/route-intl-provider"
import { ResourcePage } from "@/components/resource"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "resource", pathname: "/resource" })
}

export default async function ResourceRoutePage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<RouteIntlProvider namespaces={["Resource"]}>
			<ResourcePage />
		</RouteIntlProvider>
	)
}
