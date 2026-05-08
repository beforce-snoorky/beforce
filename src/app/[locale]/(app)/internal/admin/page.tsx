import { RouteIntlProvider } from "@/components/route-intl-provider"
import { InternalAdminPanel } from "@/components/internal-admin"
import { getInternalAdminPageData } from "@/features/internal-admin"
import { redirect } from "@/i18n/navigation"
import type { LocaleRouteParams } from "@/types/layout"
import { buildRouteMetadata } from "@/utils/metadata"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

export async function generateMetadata({ params }: { params: LocaleRouteParams }): Promise<Metadata> {
	const { locale } = await params
	return buildRouteMetadata({ locale, route: "internalAdmin", pathname: "/internal/admin" })
}

export default async function InternalAdminPage({ params }: { params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const adminData = await getInternalAdminPageData()

	if (!adminData) {
		redirect({ href: "/dashboard", locale })
		throw new Error("Unauthorized access to internal admin page.")
	}

	return (
		<RouteIntlProvider namespaces={["InternalAdmin"]}>
			<InternalAdminPanel data={adminData} />
		</RouteIntlProvider>
	)
}
