import { RouteIntlProvider } from "@/components/route-intl-provider"
import { DashboardClient } from "@/components/dashboard/client"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "dashboard", pathname: "/dashboard" })
}

export default async function DashboardPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<RouteIntlProvider namespaces={["Dashboard"]}>
			<DashboardClient />
		</RouteIntlProvider>
	)
}
