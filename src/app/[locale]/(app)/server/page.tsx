import { ServerEmptyState } from "@/components/states/server"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "server", pathname: "/server" })
}

export default async function ServerPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const translate = await getTranslations("EmptyStates.server")

	return (
		<ServerEmptyState copy={{ badge: translate("badge"), title: translate("title"), description: translate("description") }} />
	)
}
