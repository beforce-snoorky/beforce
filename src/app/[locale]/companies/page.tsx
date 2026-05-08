import { RouteIntlProvider } from "@/components/route-intl-provider"
import { CompaniesSelector } from "@/components/companySelector"
import { LocaleSwitcher } from "@/components/languageSwitcher"
import { requireUser } from "@/features/auth"
import { getUserCompaniesForUser } from "@/features/companies"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "companies", pathname: "/companies" })
}

export default async function CompaniesPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const user = await requireUser()
	const companies = await getUserCompaniesForUser(user.id)

	return (
		<RouteIntlProvider namespaces={["Companies", "Language"]}>
			<main
				className="relative min-h-svh bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url(/images/background.svg)" }}
			>
				<div className="min-h-svh flex flex-col items-center justify-center px-4 pb-28">
					<div className="absolute inset-0 bg-black/50" />

					<div className="relative w-full max-w-5xl overflow-x-hidden">
						<CompaniesSelector
							companies={companies}
							locale={locale}
						/>
					</div>
				</div>

				<div className="fixed inset-x-0 bottom-0 flex justify-center pb-10">
					<div className="flex items-center gap-4">
						<LocaleSwitcher
							href="/auth"
							variant="primary"
						/>
					</div>
				</div>
			</main>
		</RouteIntlProvider>
	)
}
