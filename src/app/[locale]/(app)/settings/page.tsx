import { RouteIntlProvider } from "@/components/route-intl-provider"
import { SettingsPage } from "@/components/settings"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "settings", pathname: "/settings" })
}

export default async function SettingsRoutePage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<RouteIntlProvider namespaces={["Settings"]}>
			<SettingsPage />
		</RouteIntlProvider>
	)
}
