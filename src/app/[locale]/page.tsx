import { redirect } from "@/i18n/navigation"
import { getAuthenticatedUser } from "@/features/auth"
import { getActiveCompanyForUser } from "@/features/companies"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "home", pathname: "/" })
}

export default async function LocaleIndexPage() {
	const locale = await getLocale()
	const user = await getAuthenticatedUser()

	if (!user) {
		redirect({ href: "/auth", locale })
		throw new Error("Unable to resolve authenticated user for locale index.")
	}

	const activeCompany = await getActiveCompanyForUser(user.id)

	if (activeCompany.status === "valid") redirect({ href: "/dashboard", locale })

	redirect({ href: "/companies", locale })
}
