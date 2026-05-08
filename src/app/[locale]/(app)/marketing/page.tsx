import { MarketingEmptyState } from "@/components/states/marketing"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "marketing", pathname: "/marketing" })
}

export default async function MarketingPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const translate = await getTranslations("EmptyStates.marketing")

	return (
		<MarketingEmptyState copy={{ badge: translate("badge"), title: translate("title"), description: translate("description") }} />
	)
}
