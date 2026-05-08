import { EmailEmptyState } from "@/components/states/email"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "email", pathname: "/email" })
}

export default async function EmailPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const translate = await getTranslations("EmptyStates.email")

	return (
		<EmailEmptyState copy={{ badge: translate("badge"), title: translate("title"), description: translate("description") }} />
	)
}
