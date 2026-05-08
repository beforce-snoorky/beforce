"use client"

import { switchCompanyFromSidebar } from "@/features/companies"
import { resolveActiveSidebarItem, serviceIcons } from "@/features/navigation"
import { serviceRouteByCode, sidebarMainServiceOrder } from "@/features/services"
import { Link, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import type { SidebarNavigationItem, SidebarProps } from "@/types/sidebar"
import { BrazilFlag, UnitedStatesFlag } from "./languageSwitcher"
import { useTheme } from "./themeProvider"
import { type LucideIcon, Building2, ChevronDown, GitGraph, Moon, SlidersHorizontal, Sun } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react"

type OpenMenu = "company" | "navigation" | null
type MenuKey = Exclude<OpenMenu, null>

type MobileNavigationItem = { id: SidebarNavigationItem["id"]; label: string; href: string; icon: LucideIcon }

const secondaryButtonClassName = "shrink-0 text-foreground-muted"

const primaryButtonClassName =
	"ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-4xl px4 py-3 text-left bg-primary text-foreground"

const dropdownPanelClassName =
	"absolute z-50 bottom-full mb-4 rounded-4xl p-4 transition-all duration-200 border border-background-muted bg-background"

const dropdownItemClassName = "flex w-full items-center gap-2 p-2 rounded-2xl text-foreground"

const utilityNavigationItems: Array<Pick<MobileNavigationItem, "id" | "href" | "icon">> = [
	{ id: "resource", href: "/resource", icon: GitGraph },
	{ id: "settings", href: "/settings", icon: SlidersHorizontal },
]

export function TabBar({ locale, companies, activeCompanyId, enabledServices }: SidebarProps) {
	const pathname = usePathname()
	const currentLocale = useLocale()

	return (
		<TabBarContent
			key={`${pathname}:${currentLocale}`}
			locale={locale}
			companies={companies}
			activeCompanyId={activeCompanyId}
			enabledServices={enabledServices}
			pathname={pathname}
			currentLocale={currentLocale}
		/>
	)
}

type TabBarContentProps = SidebarProps & { pathname: string; currentLocale: string }

function TabBarContent({ locale, companies, activeCompanyId, enabledServices, pathname, currentLocale }: TabBarContentProps) {
	const activeItem = useMemo(() => resolveActiveSidebarItem(pathname), [pathname])
	const translate = useTranslations("Sidebar")

	const [openMenu, setOpenMenu] = useState<OpenMenu>(null)

	const companyButtonRef = useRef<HTMLButtonElement>(null)
	const companyPanelRef = useRef<HTMLDivElement>(null)
	const navigationButtonRef = useRef<HTMLButtonElement>(null)
	const navigationPanelRef = useRef<HTMLDivElement>(null)

	const companyPanelId = useId()
	const navigationPanelId = useId()

	const { resolvedTheme, setTheme } = useTheme()
	const nextTheme = resolvedTheme === "dark" ? "light" : "dark"

	const navigationMenuItems = useMemo<MobileNavigationItem[]>(
		() => [
			...sidebarMainServiceOrder
				.filter((service) => service === "dashboard" || enabledServices.includes(service))
				.map((service) => ({
					id: service,
					label: translate(service),
					href: serviceRouteByCode[service],
					icon: serviceIcons[service],
				})),
			...utilityNavigationItems.map((item) => ({ id: item.id, label: translate(item.id), href: item.href, icon: item.icon })),
		],
		[enabledServices, translate]
	)

	const activeNavigationItem = useMemo<MobileNavigationItem>(() => {
		return (
			navigationMenuItems.find((item) => item.id === activeItem) ?? {
				id: "dashboard",
				label: translate("dashboard"),
				href: serviceRouteByCode.dashboard,
				icon: serviceIcons.dashboard,
			}
		)
	}, [activeItem, navigationMenuItems, translate])

	const activeCompany = useMemo(() => {
		if (!companies.length) return null
		if (!activeCompanyId) return companies[0]

		return companies.find((company) => company.id === activeCompanyId) ?? companies[0]
	}, [activeCompanyId, companies])

	const currentCompanyLabel = activeCompany?.displayName ?? translate("companyFallback")
	const ActiveNavigationIcon = activeNavigationItem.icon

	useEffect(() => {
		if (!openMenu) return

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node

			const activeButton = openMenu === "company" ? companyButtonRef.current : navigationButtonRef.current

			const activePanel = openMenu === "company" ? companyPanelRef.current : navigationPanelRef.current

			if (!activeButton?.contains(target) && !activePanel?.contains(target)) {
				setOpenMenu(null)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return

			event.preventDefault()
			const previousMenu = openMenu
			setOpenMenu(null)

			window.requestAnimationFrame(() => {
				if (previousMenu === "company") companyButtonRef.current?.focus()
				if (previousMenu === "navigation") navigationButtonRef.current?.focus()
			})
		}

		window.addEventListener("pointerdown", handlePointerDown)
		window.addEventListener("keydown", handleKeyDown)

		return () => {
			window.removeEventListener("pointerdown", handlePointerDown)
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [openMenu])

	function handleMenuToggle(menu: MenuKey) {
		setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu))
	}

	function handleMenuTriggerKeyDown(menu: MenuKey, event: ReactKeyboardEvent<HTMLButtonElement>) {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return

		event.preventDefault()
		setOpenMenu(menu)

		window.requestAnimationFrame(() => {
			if (menu === "company") companyPanelRef.current?.focus()
			if (menu === "navigation") navigationPanelRef.current?.focus()
		})
	}

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 p-4">
			<nav
				aria-label={translate("navigation")}
				className="w-fit mx-auto relative flex items-center gap-4 rounded-4xl px-4 py-2 text-sm border border-background-muted bg-background"
			>
				<button
					type="button"
					aria-label={resolvedTheme === "dark" ? translate("switchToLightTheme") : translate("switchToDarkTheme")}
					onClick={() => setTheme(nextTheme)}
					className={secondaryButtonClassName}
				>
					{resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
				</button>

				<div className="relative shrink-0">
					<button
						ref={companyButtonRef}
						type="button"
						aria-label={`${translate("selectCompany")}: ${currentCompanyLabel}`}
						aria-expanded={openMenu === "company"}
						aria-controls={companyPanelId}
						onClick={() => handleMenuToggle("company")}
						onKeyDown={(event) => handleMenuTriggerKeyDown("company", event)}
						className={`${secondaryButtonClassName} ${openMenu === "company" ? "bg-background text-foreground" : ""}`}
					>
						<Building2 className="size-5" />
					</button>

					<div
						id={companyPanelId}
						ref={companyPanelRef}
						tabIndex={-1}
						aria-label={translate("company")}
						className={`${dropdownPanelClassName} left-0 w-fit origin-bottom ${openMenu === "company" ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"}`}
					>
						<p className="pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">{translate("company")}</p>

						<ul className="max-h-64 overflow-y-auto">
							{companies.length ? (
								companies.map((company) => {
									const isActive = company.id === activeCompany?.id

									return (
										<li
											key={company.id}
											className="my-1"
										>
											<hr className="border-background-muted" />

											<form
												action={switchCompanyFromSidebar}
												onSubmit={() => setOpenMenu(null)}
											>
												<input
													type="hidden"
													name="companyId"
													value={company.id}
												/>
												<input
													type="hidden"
													name="locale"
													value={locale}
												/>
												<button
													type="submit"
													className={`${dropdownItemClassName} ${isActive ? "text-primary font-medium" : ""}`}
												>
													<span className="mr-auto block max-w-full truncate text-left">{company.displayName}</span>
												</button>
											</form>
										</li>
									)
								})
							) : (
								<li className="px-3 py-3 text-sm text-foreground-muted">{translate("noFoundCompanies")}</li>
							)}
						</ul>
					</div>
				</div>

				<div className="relative min-w-0">
					<button
						ref={navigationButtonRef}
						type="button"
						aria-label={`${translate("openNavigationMenu")}: ${activeNavigationItem.label}`}
						aria-expanded={openMenu === "navigation"}
						aria-controls={navigationPanelId}
						onClick={() => handleMenuToggle("navigation")}
						onKeyDown={(event) => handleMenuTriggerKeyDown("navigation", event)}
						className={`${primaryButtonClassName} ${openMenu === "navigation" ? "bg-primary" : ""}`}
					>
						<ActiveNavigationIcon className="size-5 shrink-0 text-primary-foreground" />

						<div className="min-w-0">
							<span className="block font-semibold text-primary-foreground">{activeNavigationItem.label}</span>
						</div>

						<ChevronDown
							className={`size-4 shrink-0 text-primary-foreground transition-transform duration-200 ${openMenu === "navigation" ? "rotate-180" : ""}`}
						/>
					</button>

					<div
						id={navigationPanelId}
						ref={navigationPanelRef}
						tabIndex={-1}
						aria-label={translate("navigation")}
						className={`${dropdownPanelClassName} right-0 w-fit origin-bottom-right ${openMenu === "navigation" ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"}`}
					>
						<p className="pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
							{translate("navigation")}
						</p>

						<ul className="space-y-1">
							{navigationMenuItems.map((item) => {
								const isActive = item.id === activeItem
								const Icon = item.icon

								return (
									<li key={item.id}>
										<Link
											href={item.href}
											locale={locale}
											prefetch={false}
											aria-current={isActive ? "page" : undefined}
											onClick={() => setOpenMenu(null)}
											className={`${dropdownItemClassName} ${isActive ? "text-primary font-medium" : ""}`}
										>
											<Icon className="size-4 shrink-0" />
											<span className="block max-w-full text-left">{item.label}</span>
										</Link>
									</li>
								)
							})}
						</ul>

						<hr className="my-3 border-background-muted" />

						<LocaleSegmentedControl
							pathname={pathname}
							currentLocale={currentLocale}
							onSelect={() => setOpenMenu(null)}
						/>
					</div>
				</div>
			</nav>
		</div>
	)
}

function LocaleSegmentedControl({
	pathname,
	currentLocale,
	onSelect,
}: {
	pathname: string
	currentLocale: string
	onSelect: () => void
}) {
	const translate = useTranslations("Sidebar")
	const translateLanguage = useTranslations("Language")

	return (
		<div className="space-y-2">
			<p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">{translate("language")}</p>

			<div className="flex rounded-2xl bg-background-muted p-1">
				{routing.locales.map((item) => {
					const isActive = item === currentLocale
					const Flag = item === "pt" ? BrazilFlag : UnitedStatesFlag
					const label = item === "pt" ? translateLanguage("pt") : translateLanguage("en")

					return (
						<Link
							key={item}
							href={pathname || "/dashboard"}
							locale={item}
							prefetch={false}
							onClick={onSelect}
							aria-label={label}
							className={`flex flex-1 items-center justify-center rounded-xl p-2 transition-all duration-200 ${isActive ? "bg-background" : "opacity-60 hover:opacity-100"}`}
						>
							<div className="size-5">
								<Flag />
							</div>
							<span className="sr-only">{label}</span>
						</Link>
					)
				})}
			</div>
		</div>
	)
}
