import { RouteIntlProvider } from "@/components/route-intl-provider"
import { DigisacClient } from "@/components/digisac/client"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "digisac", pathname: "/digisac" })
}

export default async function DigisacPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<RouteIntlProvider namespaces={["Digisac"]}>
			<DigisacClient locale={locale} />
		</RouteIntlProvider>
	)
}
