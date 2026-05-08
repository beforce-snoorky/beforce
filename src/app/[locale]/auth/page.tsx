import { RouteIntlProvider } from "@/components/route-intl-provider"
import { LocaleSwitcher } from "@/components/languageSwitcher"
import { LoginForm } from "@/components/login"
import { redirectAuthenticatedUserFromAuthPage } from "@/features/auth"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "auth", pathname: "/auth" })
}

export default async function AuthPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)
	const translate = await getTranslations("Brand")

	await redirectAuthenticatedUserFromAuthPage(locale)

	return (
		<RouteIntlProvider namespaces={["Auth", "Language"]}>
			<main
				className="relative min-h-svh bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url(/images/background.svg)" }}
			>
				<div className="min-h-svh flex flex-col items-center justify-center px-4 pb-28">
					<div className="w-full max-w-sm flex flex-col items-center gap-8">
						<Image
							src="/images/logo.png"
							alt={translate("logoAlt")}
							className="h-auto w-35"
							width={160}
							height={48}
							priority
						/>

						<LoginForm locale={locale} />
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
