"use client"

import type { CompanySwitcherProps, SidebarNavigationItem, SidebarProps } from "@/types/sidebar"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "./themeProvider"
import { ChevronDown, ChevronFirst, ChevronsUpDown, GitGraph, LogOut, Moon, Search, SlidersHorizontal, Sun } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { serviceRouteByCode, sidebarMainServiceOrder } from "@/features/services"
import { resolveActiveSidebarItem, serviceIcons } from "@/features/navigation"
import { Link, usePathname } from "@/i18n/navigation"
import type { LocaleSwitcherProps } from "@/types/sidebar"
import { BrazilFlag, UnitedStatesFlag } from "./languageSwitcher"
import { routing } from "@/i18n/routing"
import { switchCompanyFromSidebar } from "@/features/companies"
import { getCompanyInitials } from "@/utils/company"
import { Input } from "./ui/input"
import { createClient } from "@/supabase/client"

export function Sidebar({ locale, companies, activeCompanyId, enabledServices }: SidebarProps) {
	const pathname = usePathname()
	const [collapse, setCollapse] = useState(true)
	const activeItem = useMemo(() => resolveActiveSidebarItem(pathname), [pathname])
	const supabase = createClient()

	const handleLogout = async () => {
	const { error } = await supabase.auth.signOut()

	if (error) {
		console.error("Erro ao fazer logout:", error)
		return
	}

	window.location.href = `/${locale}/auth`
}

	const { theme } = useTheme()
	const translate = useTranslations("Sidebar")

	const mainNavigation: SidebarNavigationItem[] = sidebarMainServiceOrder.map((service) => ({
		id: service,
		label: translate(service),
		icon: serviceIcons[service],
		href: serviceRouteByCode[service],
		enabled: service === "dashboard" || enabledServices.includes(service),
	}))

	const isNavigationActive = (id: string) => id === activeItem

	const secundaryNavigation: SidebarNavigationItem[] = [
		{ id: "resource", label: translate("resource"), icon: GitGraph, href: "/resource" },
		{ id: "settings", label: translate("settings"), icon: SlidersHorizontal, href: "/settings" },
	]

	return (
		<aside className={`flex h-svh shrink-0 flex-col py-4 ${collapse ? "w-20" : "w-44"}`}>
			<div className={`relative flex px-6 h-10 ${collapse ? "justify-center" : "justify-start"}`}>
				{collapse ? (
					<Image
						src="/images/icon.png"
						alt={translate("brandLogoAlt")}
						width={0}
						height={0}
						sizes="100vw"
						className="w-35 h-auto object-contain"
					/>
				) : theme === "dark" ? (
					<Image
						src="/images/logo-branca.png"
						alt={translate("brandLogoAlt")}
						className="h-10 w-auto object-contain"
						width={500}
						height={85}
					/>
				) : (
					<Image
						src="/images/logo-preta.png"
						alt={translate("brandLogoAlt")}
						className="h-10 w-auto object-contain"
						width={500}
						height={85}
					/>
				)}

				<div
					className="group absolute top-1/2 -translate-y-1/2 -right-12 size-8 rounded-xl flex items-center justify-center bg-background-muted"
					onClick={() => setCollapse(!collapse)}
				>
					<ChevronFirst className={`size-4 ${collapse ? "rotate-180" : ""}`} />
				</div>
			</div>

			<hr className="w-full mx-2 my-6 border-1.5 border-background-muted" />

			<div className="flex flex-col gap-2 flex-1">
				{mainNavigation.map((item) => {
					return (
						<SidebarNavigation
							key={item.id}
							id={item.id}
							label={item.label}
							icon={item.icon}
							href={item.href}
							active={isNavigationActive(item.id)}
							collapse={collapse}
							locale={locale}
							enabled={item.enabled}
						/>
					)
				})}
			</div>

			<hr className="w-full mx-2 my-6 border-1.5 border-background-muted" />

			<div className="space-y-2">
				{secundaryNavigation.map((item) => {
					return (
						<SidebarNavigation
							key={item.id}
							id={item.id}
							label={item.label}
							icon={item.icon}
							href={item.href}
							active={isNavigationActive(item.id)}
							collapse={collapse}
							locale={locale}
							enabled={true}
						/>
					)
				})}

				<div className="px-3.5 py-2 space-y-2">
					<ThemeToggle collapse={collapse} />
					<LocaleSwitcher
						href={pathname || "/dashboard"}
						variant="secondary"
						collapse={collapse}
					/>
					<CompanySwitcher
						locale={locale}
						companies={companies}
						activeCompanyId={activeCompanyId}
						collapse={collapse}
					/>

					<button
	type="button"
	onClick={handleLogout}
	className={`flex items-center gap-2 rounded-xl p-2 hover:bg-background-muted ${
		collapse ? "mx-auto" : "w-full px-3"
	}`}
	aria-label="Sair"
>
	<LogOut className="size-5" />

	{!collapse && (
		<span>Sair</span>
	)}
</button>
				</div>
			</div>
		</aside>
	)
}

function SidebarNavigation({ label, icon: Icon, href, enabled, active, collapse, onClick, locale }: SidebarNavigationItem) {
	const handleNavigationClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!enabled) {
			event.preventDefault()
			event.stopPropagation()
			return
		}

		onClick?.()
	}

	return (
		<div className={`group relative flex text-sm ${collapse ? "justify-center" : "pl-4"}`}>
			<div className={`absolute left-0 rounded-r-4xl h-full ${active && enabled ? "border-2 border-primary" : ""}`} />

			<Link
				href={enabled ? href : ""}
				locale={locale}
				prefetch={false}
				aria-disabled={!enabled}
				tabIndex={!enabled ? -1 : 0}
				className={`flex items-center gap-2 p-2 rounded-xl ${collapse ? "" : "px-3"} ${!enabled ? "opacity-20 cursor-default text-foreground-muted" : active ? "bg-primary text-primary-foreground" : "hover:bg-background-muted"}`}
				onClick={handleNavigationClick}
			>
				<Icon className="size-5" />
				<span className={collapse ? "hidden" : ""}>{label}</span>
			</Link>

			{collapse && enabled && (
				<div className="opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 z-50 left-full px-3 py-2 whitespace-nowrap text-xs font-medium rounded-xl border border-foreground-muted/10 bg-background-muted pointer-events-none">
					{label}
				</div>
			)}
		</div>
	)
}

function ThemeToggle({ collapse }: { collapse: boolean }) {
	const { resolvedTheme, setTheme } = useTheme()
	const isDarkMode = resolvedTheme === "dark"

	return (
		<div className={`flex p-1 rounded-2xl ${collapse ? "flex-col w-fit mx-auto gap-1" : "w-auto"} bg-background-muted`}>
			<button
				className={`flex items-center justify-center rounded-xl transition-all duration-200 ${collapse ? "" : "flex-1"} ${isDarkMode ? "bg-background" : "opacity-60 hover:opacity-100"}`}
				onClick={() => setTheme("dark")}
			>
				<Moon className="size-4 text-foreground" />
			</button>

			<button
				className={`flex items-center justify-center rounded-xl transition-all duration-200 ${collapse ? "" : "flex-1"} ${!isDarkMode ? "bg-background" : "opacity-60 hover:opacity-100"}`}
				onClick={() => setTheme("light")}
			>
				<Sun className="size-4 text-foreground" />
			</button>
		</div>
	)
}

function LocaleSwitcher({ href, collapse }: LocaleSwitcherProps) {
	const locale = useLocale()
	const translate = useTranslations("Language")

	const [open, setOpen] = useState(false)

	const getLabel = (item: string) => (item === "pt" ? translate("pt") : translate("en"))

	return (
		<div className={`relative rounded-2xl text-sm cursor-pointer ${collapse ? "w-14 p-1" : "p-2"} bg-background-muted`}>
			<div
				className={`w-full flex items-center justify-center gap-1 ${collapse ? "p-1" : "gap-2"} `}
				onClick={() => setOpen((prev) => !prev)}
			>
				<div className="size-5">{locale === "pt" ? <BrazilFlag /> : <UnitedStatesFlag />}</div>
				{!collapse && <span>{getLabel(locale)}</span>}
				<ChevronDown className={`size-4 text-foreground-muted ${open ? "rotate-180" : ""}`} />
			</div>

			{open ? (
				<div
					className={`absolute p-2 rounded-3xl bottom-0 left-full z-50 ml-1 border border-foreground-muted/10 bg-background-muted`}
				>
					<ul className="flex flex-col gap-1">
						{routing.locales.map((item) => {
							const label = getLabel(item)

							return (
								<li key={item}>
									<Link
										href={href}
										locale={item}
										prefetch={false}
										className="flex items-center gap-2 p-2 rounded-3xl hover:bg-background"
										onClick={() => setOpen(false)}
									>
										<div className="size-5">{item === "pt" ? <BrazilFlag /> : <UnitedStatesFlag />}</div>
										<span>{label}</span>
									</Link>
								</li>
							)
						})}
					</ul>
				</div>
			) : null}
		</div>
	)
}

function CompanySwitcher({ locale, companies, activeCompanyId, collapse }: CompanySwitcherProps) {
	const [query, setQuery] = useState("")
	const [isOpen, setIsOpen] = useState(false)
	const companySwitcherRef = useRef<HTMLDivElement>(null)
	const translate = useTranslations("Sidebar")

	const activeCompany = useMemo(() => {
		if (!companies.length) return null
		if (!activeCompanyId) return companies[0]

		return companies.find((company) => company.id === activeCompanyId) ?? companies[0]
	}, [activeCompanyId, companies])

	const filteredCompanies = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase()
		if (!normalizedQuery) return companies

		return companies.filter((company) => company.displayName.toLowerCase().includes(normalizedQuery))
	}, [companies, query])

	useEffect(() => {
		if (!isOpen) return

		function handleOutsideClick(event: MouseEvent) {
			if (!companySwitcherRef.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		window.addEventListener("mousedown", handleOutsideClick)
		return () => window.removeEventListener("mousedown", handleOutsideClick)
	}, [isOpen])

	return (
		<div
			ref={companySwitcherRef}
			className={`group relative rounded-2xl ${collapse ? "w-14 h-12" : "w-full"} cursor-pointer text-sm bg-background-muted`}
		>
			<button
				className="flex items-center gap-3 w-full h-full px-2 text-foreground"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<div className={`relative shrink-0 ${collapse ? "size-14" : "size-10"}`}>
					{activeCompany?.logoUrl ? (
						<Image
							src={activeCompany.logoUrl}
							alt={translate("companyLogoAlt", { name: activeCompany.displayName })}
							className="object-cover invert"
							fill
						/>
					) : (
						<span className="flex items-center justify-center size-full font-semibold">
							{activeCompany ? getCompanyInitials(activeCompany.displayName) : translate("companyInitialFallback")}
						</span>
					)}
				</div>

				{!collapse && (
					<>
						<span className="truncate flex-1">{activeCompany?.displayName ?? translate("selectCompany")}</span>
						<ChevronsUpDown className="size-4 shrink-0" />
					</>
				)}
			</button>

			{isOpen && (
				<div className="absolute left-full bottom-0 z-50 ml-1 min-w-52 w-auto p-2 rounded-4xl border border-foreground-muted/10 bg-background-muted">
					<div className="relative mb-2">
						<Input
							type="text"
							value={query}
							primary
							placeholder={translate("searchPlaceholder")}
							icon={<Search className="size-4" />}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>

					<ul className="space-y-1 max-h-56 overflow-y-auto">
						{filteredCompanies.length ? (
							filteredCompanies.map((company) => {
								const isActive = company.id === activeCompanyId

								return (
									<li key={company.id}>
										<form
											action={switchCompanyFromSidebar}
											onSubmit={() => setIsOpen(false)}
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
												className={`w-full justify-start gap-2 p-1 ${isActive ? "border border-primary bg-primary/75" : "hover:bg-background"} bg-background text-foreground`}
											>
												<div className="relative size-8 shrink-0">
													{company.logoUrl ? (
														<Image
															src={company.logoUrl}
															alt={translate("companyLogoAlt", { name: company.displayName })}
															className="object-cover invert"
															fill
														/>
													) : (
														<span className="flex items-center justify-center size-full rounded-2xl font-semibold bg-primary text-xs">
															{getCompanyInitials(company.displayName)}
														</span>
													)}
												</div>

												<span className={`pr-2 truncate ${isActive ? "font-semibold" : ""}`}>{company.displayName}</span>
											</button>
										</form>
									</li>
								)
							})
						) : (
							<li className="text-center text-muted-foreground py-2">{translate("noFoundCompanies")}</li>
						)}
					</ul>
				</div>
			)}
		</div>
	)
}
