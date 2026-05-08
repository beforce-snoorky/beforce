"use client"

import {
	activateService,
	createIntegration,
	createUserWithCompanies,
	deactivateService,
	getCompanies,
	getCompanyDetails,
	updateCompany,
	updateIntegration,
} from "@/features/internal-admin"
import type {
	InternalAdminCompanyDetails,
	InternalAdminCompanyListItem,
	InternalAdminCompanySelectionState,
	InternalAdminIntegrationKind,
	InternalAdminPageData,
	InternalAdminTab,
	UserCreationStep,
} from "@/types/internal-admin"
import type { CompanyRole } from "@/types/supabase"
import { Building2, KeyRound, Loader2, Mail, Search, ShieldAlert, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const companyRoleOptions: readonly CompanyRole[] = ["owner", "admin", "member", "viewer"]

export function InternalAdminPanel({ data }: { data: InternalAdminPageData }) {
	const translate = useTranslations("InternalAdmin")

	const [activeTab, setActiveTab] = useState<InternalAdminTab>("users")
	const [feedback, setFeedback] = useState<string | null>(null)

	const [companies, setCompanies] = useState<InternalAdminCompanyListItem[]>(data.initialCompanies.items)
	const [nextCompanyCursor, setNextCompanyCursor] = useState<string | null>(data.initialCompanies.nextCursor)
	const [companySearchInput, setCompanySearchInput] = useState("")
	const [appliedCompanySearch, setAppliedCompanySearch] = useState("")
	const [loadingCompanySearch, setLoadingCompanySearch] = useState(false)
	const [loadingMoreCompanies, setLoadingMoreCompanies] = useState(false)

	const [userCreationStep, setUserCreationStep] = useState<UserCreationStep>(1)
	const [newUserEmail, setNewUserEmail] = useState("")
	const [newUserPassword, setNewUserPassword] = useState("")
	const [submittingNewUser, setSubmittingNewUser] = useState(false)
	const [companySelectionById, setCompanySelectionById] = useState<InternalAdminCompanySelectionState>(() =>
		buildInitialCompanySelection(data.initialCompanies.items)
	)

	const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
	const [selectedCompany, setSelectedCompany] = useState<InternalAdminCompanyDetails | null>(null)
	const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false)

	const [companyNameDraft, setCompanyNameDraft] = useState("")
	const [companyLogoDraft, setCompanyLogoDraft] = useState("")
	const [digisacTokenDraft, setDigisacTokenDraft] = useState("")
	const [digisacBaseUrlDraft, setDigisacBaseUrlDraft] = useState("")
	const [websiteDomainDraft, setWebsiteDomainDraft] = useState("")
	const [websiteAnalyticsDraft, setWebsiteAnalyticsDraft] = useState("")

	const [savingCompanyData, setSavingCompanyData] = useState(false)
	const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null)
	const [creatingIntegrationName, setCreatingIntegrationName] = useState<InternalAdminIntegrationKind | null>(null)
	const [savingIntegrationName, setSavingIntegrationName] = useState<InternalAdminIntegrationKind | null>(null)

	const isModalMutating =
		savingCompanyData || Boolean(togglingServiceId) || Boolean(creatingIntegrationName) || Boolean(savingIntegrationName)
	const selectedCompanyCount = Object.values(companySelectionById).filter((selection) => selection.selected).length
	const digisacService = selectedCompany?.services.find((service) => service.code === "digisac") ?? null
	const websiteService = selectedCompany?.services.find((service) => service.code === "website") ?? null
	const digisacEnabled = digisacService?.isSelected === true
	const websiteEnabled = websiteService?.isSelected === true

	function getRoleLabel(role: CompanyRole): string {
		if (role === "owner") return translate("roles.owner")
		if (role === "admin") return translate("roles.admin")
		if (role === "member") return translate("roles.member")
		return translate("roles.viewer")
	}

	async function fetchCompanies({ search, lastId, append }: { search: string; lastId: string | null; append: boolean }) {
		if (append) {
			setLoadingMoreCompanies(true)
		} else {
			setLoadingCompanySearch(true)
		}

		const result = await getCompanies({ search, lastId })

		if (append) {
			setLoadingMoreCompanies(false)
		} else {
			setLoadingCompanySearch(false)
		}

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		setFeedback(null)
		setAppliedCompanySearch(search)
		setNextCompanyCursor(result.page.nextCursor)
		setCompanies((currentCompanies) => {
			if (!append) return result.page.items

			const byId = new Map(currentCompanies.map((company) => [company.id, company]))
			for (const company of result.page.items) {
				byId.set(company.id, company)
			}

			return Array.from(byId.values())
		})

		setCompanySelectionById((currentSelectionById) => {
			const nextSelectionById = { ...currentSelectionById }
			for (const company of result.page.items) {
				if (!nextSelectionById[company.id]) {
					nextSelectionById[company.id] = { selected: false, role: "member" }
				}
			}
			return nextSelectionById
		})
	}

	async function handleSearchCompanies(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (loadingCompanySearch || loadingMoreCompanies) return

		await fetchCompanies({ search: companySearchInput.trim(), lastId: null, append: false })
	}

	async function handleClearSearch() {
		if (loadingCompanySearch || loadingMoreCompanies) return

		setCompanySearchInput("")
		await fetchCompanies({ search: "", lastId: null, append: false })
	}

	async function handleLoadMoreCompanies() {
		if (!nextCompanyCursor) return
		if (loadingCompanySearch || loadingMoreCompanies) return

		await fetchCompanies({ search: appliedCompanySearch, lastId: nextCompanyCursor, append: true })
	}

	function handleContinueUserCreationStep() {
		const normalizedEmail = newUserEmail.trim().toLowerCase()
		const normalizedPassword = newUserPassword.trim()

		if (!normalizedEmail || !normalizedPassword) {
			setFeedback(translate("feedback.credentialsRequired"))
			return
		}

		setFeedback(null)
		setUserCreationStep(2)
	}

	function handleBackUserCreationStep() {
		setFeedback(null)
		setUserCreationStep(1)
	}

	function handleToggleCompanySelection(companyId: string, selected: boolean) {
		setCompanySelectionById((currentSelectionById) => ({
			...currentSelectionById,
			[companyId]: { selected, role: currentSelectionById[companyId]?.role ?? "member" },
		}))
	}

	function handleCompanyRoleSelection(companyId: string, role: CompanyRole) {
		setCompanySelectionById((currentSelectionById) => ({
			...currentSelectionById,
			[companyId]: { selected: currentSelectionById[companyId]?.selected ?? false, role },
		}))
	}

	function selectAllLoadedCompanies() {
		setCompanySelectionById((currentSelectionById) => {
			const nextSelectionById = { ...currentSelectionById }
			for (const company of companies) {
				nextSelectionById[company.id] = { selected: true, role: currentSelectionById[company.id]?.role ?? "member" }
			}
			return nextSelectionById
		})
	}

	function clearLoadedCompanySelection() {
		setCompanySelectionById((currentSelectionById) => {
			const nextSelectionById = { ...currentSelectionById }
			for (const company of companies) {
				nextSelectionById[company.id] = { selected: false, role: currentSelectionById[company.id]?.role ?? "member" }
			}
			return nextSelectionById
		})
	}

	async function handleCreateUserWithCompanies(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (submittingNewUser) return

		const normalizedEmail = newUserEmail.trim().toLowerCase()
		const normalizedPassword = newUserPassword.trim()
		const selectedCompanies = Object.entries(companySelectionById)
			.filter(([, selection]) => selection.selected)
			.map(([companyId, selection]) => ({ companyId, role: selection.role }))

		setFeedback(null)
		setSubmittingNewUser(true)

		const result = await createUserWithCompanies({
			email: normalizedEmail,
			password: normalizedPassword,
			companies: selectedCompanies,
		})
		setSubmittingNewUser(false)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		setFeedback(translate("feedback.userCreated"))
		setNewUserEmail("")
		setNewUserPassword("")
		setCompanySelectionById(buildInitialCompanySelection(companies))
		setUserCreationStep(1)
	}

	async function openCompanyModal(companyId: string) {
		if (isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setSelectedCompanyId(companyId)
		setSelectedCompany(null)
		setLoadingCompanyDetails(true)

		const result = await getCompanyDetails(companyId)
		setLoadingCompanyDetails(false)

		if (!result.ok) {
			setFeedback(result.error)
			setSelectedCompanyId(null)
			return
		}

		applyCompanyDetails(result.company)
	}

	function closeCompanyModal() {
		if (isModalMutating || loadingCompanyDetails) return
		setSelectedCompanyId(null)
		setSelectedCompany(null)
	}

	async function handleSaveCompanyData(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!selectedCompanyId || isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setSavingCompanyData(true)

		const result = await updateCompany({ companyId: selectedCompanyId, displayName: companyNameDraft, logoUrl: companyLogoDraft })
		setSavingCompanyData(false)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		applyCompanyDetails(result.company)
	}

	async function handleToggleService({ serviceId, enabled }: { serviceId: string; enabled: boolean }) {
		if (!selectedCompanyId || isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setTogglingServiceId(serviceId)

		const result = enabled
			? await activateService({ companyId: selectedCompanyId, serviceId })
			: await deactivateService({ companyId: selectedCompanyId, serviceId })
		setTogglingServiceId(null)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		applyCompanyDetails(result.company)
	}

	async function handleCreateIntegration(service: InternalAdminIntegrationKind) {
		if (!selectedCompanyId || isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setCreatingIntegrationName(service)

		const result = await createIntegration({ companyId: selectedCompanyId, service })
		setCreatingIntegrationName(null)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		applyCompanyDetails(result.company)
	}

	async function handleSaveDigisacIntegration(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!selectedCompanyId || isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setSavingIntegrationName("digisac")

		const result = await updateIntegration({
			companyId: selectedCompanyId,
			service: "digisac",
			data: { token: digisacTokenDraft, baseUrl: digisacBaseUrlDraft },
		})
		setSavingIntegrationName(null)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		applyCompanyDetails(result.company)
	}

	async function handleSaveWebsiteIntegration(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!selectedCompanyId || isModalMutating || loadingCompanyDetails) return

		setFeedback(null)
		setSavingIntegrationName("website")

		const result = await updateIntegration({
			companyId: selectedCompanyId,
			service: "website",
			data: { domain: websiteDomainDraft, analyticsId: websiteAnalyticsDraft },
		})
		setSavingIntegrationName(null)

		if (!result.ok) {
			setFeedback(result.error)
			return
		}

		applyCompanyDetails(result.company)
	}

	function applyCompanyDetails(company: InternalAdminCompanyDetails) {
		setSelectedCompany(company)
		hydrateCompanyDrafts(company)
		setCompanies((currentCompanies) => {
			const hasExistingCompany = currentCompanies.some((currentCompany) => currentCompany.id === company.id)
			const nextCompanies = hasExistingCompany
				? currentCompanies.map((currentCompany) => (currentCompany.id === company.id ? company : currentCompany))
				: [company, ...currentCompanies]
			return nextCompanies
		})
	}

	function hydrateCompanyDrafts(company: InternalAdminCompanyDetails) {
		setCompanyNameDraft(company.displayName)
		setCompanyLogoDraft(company.logoUrl ?? "")
		setDigisacTokenDraft(company.digisacIntegration?.token ?? "")
		setDigisacBaseUrlDraft(company.digisacIntegration?.baseUrl ?? "")
		setWebsiteDomainDraft(company.websiteIntegration?.domain ?? "")
		setWebsiteAnalyticsDraft(company.websiteIntegration?.analyticsId ?? "")
	}

	return (
		<section className="space-y-4">
			<header className="space-y-1">
				<h1 className="flex items-center gap-2 text-xl lg:text-2xl font-semibold tracking-tight">
					<ShieldAlert className="size-6 lg:size-8 text-primary" /> {translate("title")}
				</h1>
				<p className="text-sm lg:text-base text-muted-foreground">{translate("subtitle")}</p>
				<p className="text-xs text-foreground-muted">{translate("loggedAs", { email: data.adminEmail })}</p>
			</header>

			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => {
						setFeedback(null)
						setActiveTab("users")
					}}
					className={`border ${activeTab === "users" ? "bg-background border-primary/40" : "bg-background-muted border-border"}`}
				>
					<Users className="size-4" />
					{translate("tabs.users")}
				</button>

				<button
					type="button"
					onClick={() => {
						setFeedback(null)
						setActiveTab("companies")
					}}
					className={`border ${activeTab === "companies" ? "bg-background border-primary/40" : "bg-background-muted border-border"}`}
				>
					<Building2 className="size-4" />
					{translate("tabs.companies")}
				</button>
			</div>

			<section className="p-4 rounded-4xl bg-background space-y-3">
				<header className="space-y-1">
					<h2 className="font-semibold">{translate("companies.listTitle", { count: companies.length })}</h2>
					<p className="text-sm text-foreground-muted">{translate("companies.listSubtitle")}</p>
				</header>

				<form
					onSubmit={handleSearchCompanies}
					className="flex flex-col lg:flex-row gap-2"
				>
					<Input
						id="internal-admin-company-search"
						name="search"
						value={companySearchInput}
						onChange={(event) => setCompanySearchInput(event.target.value)}
						placeholder={translate("companies.searchPlaceholder")}
						icon={<Search className="size-4" />}
						disabled={loadingCompanySearch || loadingMoreCompanies || submittingNewUser}
						primary
					/>

					<div className="flex items-center gap-2">
						<Button
							type="submit"
							variant="primary"
							disabled={loadingCompanySearch || loadingMoreCompanies || submittingNewUser}
							loading={loadingCompanySearch}
						>
							{translate("actions.search")}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={loadingCompanySearch || loadingMoreCompanies || submittingNewUser}
							onClick={() => void handleClearSearch()}
						>
							{translate("actions.clear")}
						</Button>
					</div>
				</form>

				{nextCompanyCursor ? (
					<div className="flex justify-end">
						<Button
							type="button"
							variant="secondary"
							disabled={loadingCompanySearch || loadingMoreCompanies || submittingNewUser}
							loading={loadingMoreCompanies}
							onClick={() => void handleLoadMoreCompanies()}
						>
							{translate("actions.loadMore")}
						</Button>
					</div>
				) : null}
			</section>

			{activeTab === "users" ? (
				<section className="p-4 rounded-4xl bg-background space-y-4">
					<header className="space-y-1">
						<h2 className="font-semibold">{translate("users.title")}</h2>
						<p className="text-sm text-foreground-muted">{translate("users.step", { step: userCreationStep, total: 2 })}</p>
					</header>

					<form
						onSubmit={handleCreateUserWithCompanies}
						className="space-y-4"
					>
						{userCreationStep === 1 ? (
							<div className="space-y-3">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
									<Input
										id="internal-admin-user-email"
										name="email"
										type="email"
										value={newUserEmail}
										onChange={(event) => setNewUserEmail(event.target.value)}
										placeholder={translate("users.emailPlaceholder")}
										icon={<Mail className="size-4" />}
										disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
										primary
									/>

									<Input
										id="internal-admin-user-password"
										name="password"
										type="password"
										value={newUserPassword}
										onChange={(event) => setNewUserPassword(event.target.value)}
										placeholder={translate("users.passwordPlaceholder")}
										icon={<KeyRound className="size-4" />}
										disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
										primary
									/>
								</div>

								<div className="flex justify-end">
									<Button
										type="button"
										variant="primary"
										disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
										onClick={handleContinueUserCreationStep}
									>
										{translate("users.continueToCompanies")}
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm text-foreground-muted">
										{translate("users.selectedCompanies", { count: selectedCompanyCount })}
									</p>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="secondary"
											disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
											onClick={selectAllLoadedCompanies}
										>
											{translate("users.selectLoaded")}
										</Button>
										<Button
											type="button"
											variant="secondary"
											disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
											onClick={clearLoadedCompanySelection}
										>
											{translate("users.clearLoaded")}
										</Button>
									</div>
								</div>

								<ul className="space-y-2 max-h-88 overflow-auto pr-1">
									{companies.map((company) => {
										const selection = companySelectionById[company.id] ?? { selected: false, role: "member" as CompanyRole }

										return (
											<li
												key={company.id}
												className="p-3 rounded-3xl border border-border bg-background-muted/40"
											>
												<div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-center">
													<label className="flex items-center gap-2 text-sm">
														<input
															type="checkbox"
															checked={selection.selected}
															onChange={(event) => handleToggleCompanySelection(company.id, event.target.checked)}
															disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
															className="size-4 p-0 m-0 rounded-md border border-border"
														/>
														<span className="font-medium">{company.displayName}</span>
													</label>

													<select
														value={selection.role}
														onChange={(event) => handleCompanyRoleSelection(company.id, event.target.value as CompanyRole)}
														disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies || !selection.selected}
														className="rounded-4xl py-2 px-4 outline-none border border-border bg-background text-foreground"
													>
														{companyRoleOptions.map((role) => (
															<option
																key={role}
																value={role}
															>
																{getRoleLabel(role)}
															</option>
														))}
													</select>
												</div>
											</li>
										)
									})}
								</ul>

								<div className="flex justify-between gap-2">
									<Button
										type="button"
										variant="secondary"
										disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
										onClick={handleBackUserCreationStep}
									>
										{translate("actions.back")}
									</Button>

									<Button
										type="submit"
										variant="primary"
										disabled={submittingNewUser || loadingCompanySearch || loadingMoreCompanies}
										loading={submittingNewUser}
									>
										{translate("users.createAndLink")}
									</Button>
								</div>
							</div>
						)}
					</form>
				</section>
			) : (
				<section className="p-4 rounded-4xl bg-background space-y-3">
					<header className="space-y-1">
						<h2 className="font-semibold">{translate("companies.title")}</h2>
						<p className="text-sm text-foreground-muted">{translate("companies.subtitle")}</p>
					</header>

					<ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
						{companies.map((company) => (
							<li key={company.id}>
								<button
									type="button"
									onClick={() => void openCompanyModal(company.id)}
									disabled={loadingCompanyDetails || isModalMutating}
									className="w-full justify-between border border-border bg-background-muted/40 text-foreground"
								>
									<div className="flex items-center gap-3 text-left">
										<div className="size-8 rounded-full border border-border bg-background-muted flex items-center justify-center text-xs font-semibold">
											{company.displayName.slice(0, 1).toUpperCase()}
										</div>
										<div>
											<p className="font-medium">{company.displayName}</p>
											<p className="text-xs text-foreground-muted">{translate("companies.id", { id: company.id })}</p>
										</div>
									</div>
									<span className="text-xs text-foreground-muted">{translate("companies.details")}</span>
								</button>
							</li>
						))}
					</ul>
				</section>
			)}

			{feedback ? (
				<p
					role="alert"
					className="text-sm text-foreground"
				>
					{feedback}
				</p>
			) : null}

			{selectedCompanyId ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
					onClick={closeCompanyModal}
				>
					<div
						className="w-full max-w-2xl p-4 rounded-4xl bg-background space-y-4 max-h-[92vh] overflow-auto"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-center justify-between gap-2">
							<h2 className="text-lg font-semibold">{selectedCompany?.displayName ?? translate("modal.companyFallback")}</h2>
							<Button
								type="button"
								variant="secondary"
								disabled={isModalMutating || loadingCompanyDetails}
								onClick={closeCompanyModal}
							>
								{translate("actions.close")}
							</Button>
						</div>

						{loadingCompanyDetails ? (
							<div className="py-8 flex items-center justify-center text-sm text-foreground-muted gap-2">
								<Loader2 className="size-4 animate-spin" />
								{translate("modal.loadingCompanyDetails")}
							</div>
						) : selectedCompany ? (
							<>
								<form
									onSubmit={handleSaveCompanyData}
									className="space-y-3 p-3 rounded-3xl border border-border"
								>
									<h3 className="font-medium">{translate("modal.sections.companyData.title")}</h3>

									<Input
										id="internal-admin-company-name"
										name="displayName"
										value={companyNameDraft}
										onChange={(event) => setCompanyNameDraft(event.target.value)}
										placeholder={translate("modal.sections.companyData.namePlaceholder")}
										disabled={isModalMutating}
										primary
									/>

									<Input
										id="internal-admin-company-logo"
										name="logoUrl"
										value={companyLogoDraft}
										onChange={(event) => setCompanyLogoDraft(event.target.value)}
										placeholder={translate("modal.sections.companyData.logoPlaceholder")}
										disabled={isModalMutating}
										primary
									/>

									<div className="flex justify-end">
										<Button
											type="submit"
											variant="primary"
											disabled={isModalMutating}
											loading={savingCompanyData}
										>
											{translate("actions.saveCompany")}
										</Button>
									</div>
								</form>

								<section className="space-y-3 p-3 rounded-3xl border border-border">
									<h3 className="font-medium">{translate("modal.sections.services.title")}</h3>
									<ul className="space-y-2">
										{selectedCompany.services.map((service) => (
											<li
												key={service.id}
												className="p-2 rounded-2xl border border-border bg-background-muted/40"
											>
												<label className="flex items-center justify-between gap-3 cursor-pointer">
													<div className="flex items-center gap-2">
														<input
															type="checkbox"
															checked={service.isSelected}
															onChange={(event) =>
																void handleToggleService({ serviceId: service.id, enabled: event.target.checked })
															}
															disabled={isModalMutating}
															className="size-4 p-0 m-0 rounded-md border border-border"
														/>
														<span className="font-medium text-sm">{service.name}</span>
													</div>
													<span className="text-xs text-foreground-muted">{service.code}</span>
												</label>
											</li>
										))}
									</ul>
									<p className="text-xs text-foreground-muted">
										{translate.rich("modal.sections.services.hint", { code: (chunks) => <code>{chunks}</code> })}
									</p>
								</section>

								<section className="space-y-3 p-3 rounded-3xl border border-border">
									<h3 className="font-medium">{translate("modal.sections.digisac.title")}</h3>

									{!digisacEnabled ? (
										<p className="text-sm text-foreground-muted">{translate("modal.sections.digisac.enableServiceHint")}</p>
									) : !selectedCompany.digisacIntegration ? (
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm text-foreground-muted">{translate("modal.integrationNotCreated")}</p>
											<Button
												type="button"
												variant="primary"
												disabled={isModalMutating}
												loading={creatingIntegrationName === "digisac"}
												onClick={() => void handleCreateIntegration("digisac")}
											>
												{translate("actions.createDigisacIntegration")}
											</Button>
										</div>
									) : (
										<form
											onSubmit={handleSaveDigisacIntegration}
											className="space-y-3"
										>
											<Input
												id="internal-admin-digisac-token"
												name="token"
												value={digisacTokenDraft}
												onChange={(event) => setDigisacTokenDraft(event.target.value)}
												placeholder={translate("modal.sections.digisac.tokenPlaceholder")}
												disabled={isModalMutating}
												primary
											/>

											<Input
												id="internal-admin-digisac-base-url"
												name="baseUrl"
												value={digisacBaseUrlDraft}
												onChange={(event) => setDigisacBaseUrlDraft(event.target.value)}
												placeholder={translate("modal.sections.digisac.baseUrlPlaceholder")}
												disabled={isModalMutating}
												primary
											/>

											<div className="flex justify-end">
												<Button
													type="submit"
													variant="primary"
													disabled={isModalMutating}
													loading={savingIntegrationName === "digisac"}
												>
													{translate("actions.saveDigisac")}
												</Button>
											</div>
										</form>
									)}
								</section>

								<section className="space-y-3 p-3 rounded-3xl border border-border">
									<h3 className="font-medium">{translate("modal.sections.website.title")}</h3>

									{!websiteEnabled ? (
										<p className="text-sm text-foreground-muted">{translate("modal.sections.website.enableServiceHint")}</p>
									) : !selectedCompany.websiteIntegration ? (
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm text-foreground-muted">{translate("modal.integrationNotCreated")}</p>
											<Button
												type="button"
												variant="primary"
												disabled={isModalMutating}
												loading={creatingIntegrationName === "website"}
												onClick={() => void handleCreateIntegration("website")}
											>
												{translate("actions.createWebsiteIntegration")}
											</Button>
										</div>
									) : (
										<form
											onSubmit={handleSaveWebsiteIntegration}
											className="space-y-3"
										>
											<Input
												id="internal-admin-website-domain"
												name="domain"
												value={websiteDomainDraft}
												onChange={(event) => setWebsiteDomainDraft(event.target.value)}
												placeholder={translate("modal.sections.website.domainPlaceholder")}
												disabled={isModalMutating}
												primary
											/>

											<Input
												id="internal-admin-website-analytics-id"
												name="analyticsId"
												value={websiteAnalyticsDraft}
												onChange={(event) => setWebsiteAnalyticsDraft(event.target.value)}
												placeholder={translate("modal.sections.website.analyticsPlaceholder")}
												disabled={isModalMutating}
												primary
											/>

											<div className="flex justify-end">
												<Button
													type="submit"
													variant="primary"
													disabled={isModalMutating}
													loading={savingIntegrationName === "website"}
												>
													{translate("actions.saveWebsite")}
												</Button>
											</div>
										</form>
									)}
								</section>
							</>
						) : null}
					</div>
				</div>
			) : null}
		</section>
	)
}

function buildInitialCompanySelection(
	companies: InternalAdminCompanyListItem[]
): Record<string, { selected: boolean; role: CompanyRole }> {
	return Object.fromEntries(companies.map((company) => [company.id, { selected: false, role: "member" }]))
}
