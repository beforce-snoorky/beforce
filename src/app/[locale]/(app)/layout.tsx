import { PwaInstallModal } from "@/components/pwa-modal"
import { RouteIntlProvider } from "@/components/route-intl-provider"
import { TabBar } from "@/components/tabbar"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/context/auth"
import { getAppAuthState } from "@/features/app-auth"
import { getActiveServicesForCompany } from "@/features/companies"
import { redirect } from "@/i18n/navigation"
import type { ActiveCompanyResult } from "@/types/companies"
import type { LocaleRouteParams } from "@/types/layout"
import type { SidebarProps } from "@/types/sidebar"
import { setRequestLocale } from "next-intl/server"

export default async function AppLayout({ children, params }: { children: React.ReactNode; params: LocaleRouteParams }) {
	const { locale } = await params
	setRequestLocale(locale)

	const { user, userCompanies, activeCompany } = await getAppAuthState()

	if (!isValidActiveCompany(activeCompany)) {
		redirect({ href: "/companies", locale })
		throw new Error("Unable to resolve an active company for protected app routes.")
	}

	const enabledServices = await getActiveServicesForCompany(activeCompany.companyId)

	return (
		<AuthProvider
			user={user}
			company={activeCompany}
		>
			<RouteIntlProvider namespaces={["Sidebar", "Language", "PwaInstall"]}>
				<AppShell
					locale={locale}
					companies={userCompanies}
					activeCompanyId={activeCompany.companyId}
					enabledServices={enabledServices}
				>
					{children}
				</AppShell>
			</RouteIntlProvider>
		</AuthProvider>
	)
}

type AppShellProps = SidebarProps & { children: React.ReactNode }

function AppShell({ children, ...navigationProps }: AppShellProps) {
	return (
		<div className="relative min-h-svh bg-background text-foreground md:flex md:h-svh md:overflow-hidden md:gap-4">
			<div className="hidden md:block">
				<Sidebar {...navigationProps} />
			</div>

			<main className="min-h-svh bg-background-muted p-4 pb-32 md:mt-16 md:h-[calc(100svh-4rem)] md:min-h-0 md:min-w-0 md:flex-1 md:overflow-y-auto md:rounded-tl-4xl md:p-8 md:pb-8">
				{children}
			</main>

			<div className="md:hidden">
				<TabBar {...navigationProps} />
			</div>

			<PwaInstallModal />
		</div>
	)
}

function isValidActiveCompany(
	activeCompany: ActiveCompanyResult
): activeCompany is Extract<ActiveCompanyResult, { status: "valid" }> {
	return activeCompany.status === "valid"
}
