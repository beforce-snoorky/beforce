import { CrmEmptyState } from "@/components/states/crm"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "crm", pathname: "/crm" })
}

export default async function CrmPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const translate = await getTranslations("EmptyStates.crm")

	return <CrmEmptyState copy={{ badge: translate("badge"), title: translate("title"), description: translate("description") }} />
}
