"use server"

import { createSupabaseAdminClient } from "@/supabase/admin"
import type {
	ActivateServiceResult,
	CompanyDetailsResult,
	CreateIntegrationResult,
	CreateUserWithCompaniesResult,
	DeactivateServiceResult,
	DigisacIntegrationRow,
	GetCompaniesResult,
	GetCompanyDetailsResult,
	InternalAdminAccessResult,
	InternalAdminAdminClient as AdminClient,
	InternalAdminCompanyListItem,
	InternalAdminCompanySelection,
	InternalAdminCompanyRow as CompanyRow,
	InternalAdminCompanyServiceRow as CompanyServiceRow,
	InternalAdminIntegrationKind,
	InternalAdminPageData,
	PaginationInput,
	ServiceCatalogResult,
	InternalAdminServiceRow as ServiceRow,
	UpdateCompanyResult,
	UpdateIntegrationPayload,
	UpdateIntegrationResult,
	WebsiteIntegrationRow,
} from "@/types/internal-admin"
import type { ServiceCatalogItem } from "@/types/service"
import type { CompanyRole } from "@/types/supabase"
import type { User } from "@supabase/supabase-js"
import { getTranslations } from "next-intl/server"
import { requireUser } from "./auth"

const companyRoles: readonly CompanyRole[] = ["owner", "admin", "member", "viewer"]
const INTERNAL_ADMIN_EMAIL = "suporte@beforce.com.br"
const COMPANY_PAGE_SIZE = 20

let serviceCatalogCache: ServiceCatalogItem[] | null = null

export async function getInternalAdminPageData(): Promise<InternalAdminPageData | null> {
	const translate = await getTranslations("InternalAdmin.server")
	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return null

	const companiesResult = await listCompaniesPage({
		adminClient: accessResult.context.adminClient,
		search: "",
		lastId: null,
		translate,
	})

	if (!companiesResult.ok) {
		throw new Error(companiesResult.error)
	}

	return { adminEmail: accessResult.context.userEmail, initialCompanies: companiesResult.page }
}

export async function getCompanies({ search, lastId }: PaginationInput): Promise<GetCompaniesResult> {
	const translate = await getTranslations("InternalAdmin.server")
	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	return listCompaniesPage({ adminClient: accessResult.context.adminClient, search, lastId, translate })
}

export async function getCompanyDetails(companyId: string): Promise<GetCompanyDetailsResult> {
	const translate = await getTranslations("InternalAdmin.server")
	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

export async function createUserWithCompanies({
	email,
	password,
	companies,
}: {
	email: string
	password: string
	companies: InternalAdminCompanySelection[]
}): Promise<CreateUserWithCompaniesResult> {
	const translate = await getTranslations("InternalAdmin.server")
	const normalizedEmail = normalizeEmail(email)
	const normalizedPassword = password.trim()
	const normalizedCompanies = normalizeCompanySelections(companies)

	if (!isValidEmail(normalizedEmail)) return { ok: false, error: translate("errors.invalidEmail") }
	if (normalizedPassword.length < 8) return { ok: false, error: translate("errors.passwordMin") }
	if (!normalizedCompanies.length) return { ok: false, error: translate("errors.selectAtLeastOneCompany") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const { data: createdUserData, error: createUserError } = await accessResult.context.adminClient.auth.admin.createUser({
		email: normalizedEmail,
		password: normalizedPassword,
		email_confirm: true,
	})

	if (createUserError) {
		if (isUserAlreadyExistsError(createUserError)) {
			return { ok: false, error: translate("errors.userAlreadyExists") }
		}

		return { ok: false, error: translate("errors.createAuthUserFailed") }
	}

	const createdUserId = createdUserData.user?.id
	if (!createdUserId) return { ok: false, error: translate("errors.createdUserIdMissing") }

	const membershipRows = normalizedCompanies.map((companySelection) => ({
		company_id: companySelection.companyId,
		user_id: createdUserId,
		role: companySelection.role,
		is_active: true,
	}))

	const { error: membershipInsertError } = await accessResult.context.adminClient.from("company_members").insert(membershipRows)

	if (membershipInsertError) {
		await accessResult.context.adminClient.auth.admin.deleteUser(createdUserId)
		return { ok: false, error: translate("errors.linkUserToCompaniesFailed") }
	}

	return { ok: true, userId: createdUserId }
}

export async function updateCompany({
	companyId,
	displayName,
	logoUrl,
}: {
	companyId: string
	displayName: string
	logoUrl: string
}): Promise<UpdateCompanyResult> {
	const translate = await getTranslations("InternalAdmin.server")
	const normalizedDisplayName = displayName.trim()
	const normalizedLogoUrl = logoUrl.trim()

	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }
	if (normalizedDisplayName.length < 2) return { ok: false, error: translate("errors.companyNameMin") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const { error: updateCompanyError } = await accessResult.context.adminClient
		.from("companies")
		.update({ display_name: normalizedDisplayName, logo_url: normalizedLogoUrl || null })
		.eq("id", companyId)

	if (updateCompanyError) return { ok: false, error: translate("errors.updateCompanyFailed") }

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

export async function activateService({
	companyId,
	serviceId,
}: {
	companyId: string
	serviceId: string
}): Promise<ActivateServiceResult> {
	const translate = await getTranslations("InternalAdmin.server")
	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }
	if (!serviceId) return { ok: false, error: translate("errors.invalidService") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const catalogResult = await getServiceCatalog(accessResult.context.adminClient, translate)
	if (!catalogResult.ok) return { ok: false, error: catalogResult.error }

	const service = catalogResult.services.find((catalogItem) => catalogItem.id === serviceId)
	if (!service) return { ok: false, error: translate("errors.serviceNotFound") }

	const { error: upsertError } = await accessResult.context.adminClient
		.from("company_services")
		.upsert(
			{ company_id: companyId, service_id: service.id, is_active: true, activated_at: new Date().toISOString() },
			{ onConflict: "company_id,service_id" }
		)

	if (upsertError) {
		return { ok: false, error: translate("errors.activateServiceFailed") }
	}

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

export async function deactivateService({
	companyId,
	serviceId,
}: {
	companyId: string
	serviceId: string
}): Promise<DeactivateServiceResult> {
	const translate = await getTranslations("InternalAdmin.server")
	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }
	if (!serviceId) return { ok: false, error: translate("errors.invalidService") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const catalogResult = await getServiceCatalog(accessResult.context.adminClient, translate)
	if (!catalogResult.ok) return { ok: false, error: catalogResult.error }

	const service = catalogResult.services.find((catalogItem) => catalogItem.id === serviceId)
	if (!service) return { ok: false, error: translate("errors.serviceNotFound") }

	const { error: deleteServiceError } = await accessResult.context.adminClient
		.from("company_services")
		.delete()
		.eq("company_id", companyId)
		.eq("service_id", service.id)

	if (deleteServiceError) {
		return { ok: false, error: translate("errors.deactivateServiceFailed") }
	}

	if (service.code === "digisac") {
		const { error: deleteDigisacError } = await accessResult.context.adminClient
			.from("integrations_digisac")
			.delete()
			.eq("company_id", companyId)

		if (deleteDigisacError && !isMissingTableError(deleteDigisacError)) {
			return { ok: false, error: translate("errors.removeDigisacIntegrationAfterServiceFailed") }
		}
	}

	if (service.code === "website") {
		const { error: deleteWebsiteError } = await accessResult.context.adminClient
			.from("integrations_website")
			.delete()
			.eq("company_id", companyId)

		if (deleteWebsiteError && !isMissingTableError(deleteWebsiteError)) {
			return { ok: false, error: translate("errors.removeWebsiteIntegrationAfterServiceFailed") }
		}
	}

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

export async function createIntegration({
	companyId,
	service,
}: {
	companyId: string
	service: InternalAdminIntegrationKind
}): Promise<CreateIntegrationResult> {
	const translate = await getTranslations("InternalAdmin.server")
	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }
	if (!isIntegrationKind(service)) return { ok: false, error: translate("errors.invalidIntegration") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const serviceByCodeResult = await getServiceByCode({ adminClient: accessResult.context.adminClient, code: service, translate })
	if (!serviceByCodeResult.ok) return { ok: false, error: serviceByCodeResult.error }

	const serviceEnabledResult = await isServiceEnabledForCompany({
		adminClient: accessResult.context.adminClient,
		companyId,
		serviceId: serviceByCodeResult.service.id,
		translate,
	})
	if (!serviceEnabledResult.ok) return { ok: false, error: serviceEnabledResult.error }
	if (!serviceEnabledResult.enabled) {
		return { ok: false, error: translate("errors.enableServiceBeforeIntegrationCreate") }
	}

	if (service === "digisac") {
		const { error: upsertError } = await accessResult.context.adminClient
			.from("integrations_digisac")
			.upsert({ company_id: companyId, token: "", base_url: "" }, { onConflict: "company_id" })

		if (upsertError) {
			return { ok: false, error: translate("errors.createDigisacIntegrationFailed") }
		}
	}

	if (service === "website") {
		const { error: upsertError } = await accessResult.context.adminClient
			.from("integrations_website")
			.upsert({ company_id: companyId, domain: "", analytics_id: "" }, { onConflict: "company_id" })

		if (upsertError) {
			return { ok: false, error: translate("errors.createWebsiteIntegrationFailed") }
		}
	}

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

export async function updateIntegration({
	companyId,
	service,
	data,
}: {
	companyId: string
	service: InternalAdminIntegrationKind
	data: UpdateIntegrationPayload
}): Promise<UpdateIntegrationResult> {
	const translate = await getTranslations("InternalAdmin.server")
	if (!companyId) return { ok: false, error: translate("errors.invalidCompany") }
	if (!isIntegrationKind(service)) return { ok: false, error: translate("errors.invalidService") }

	const accessResult = await resolveInternalAdminAccess(translate)
	if (!accessResult.ok) return { ok: false, error: accessResult.error }

	const serviceByCodeResult = await getServiceByCode({ adminClient: accessResult.context.adminClient, code: service, translate })
	if (!serviceByCodeResult.ok) return { ok: false, error: serviceByCodeResult.error }

	const serviceEnabledResult = await isServiceEnabledForCompany({
		adminClient: accessResult.context.adminClient,
		companyId,
		serviceId: serviceByCodeResult.service.id,
		translate,
	})
	if (!serviceEnabledResult.ok) return { ok: false, error: serviceEnabledResult.error }
	if (!serviceEnabledResult.enabled) {
		return { ok: false, error: translate("errors.enableServiceBeforeIntegrationSave") }
	}

	const integrationUpdateResult = await persistIntegrationData({
		adminClient: accessResult.context.adminClient,
		companyId,
		service,
		data,
		translate,
	})
	if (!integrationUpdateResult.ok) return { ok: false, error: integrationUpdateResult.error }

	const companyResult = await loadCompanyDetails({ adminClient: accessResult.context.adminClient, companyId, translate })
	if (!companyResult.ok) return { ok: false, error: companyResult.error }

	return { ok: true, company: companyResult.company }
}

async function resolveInternalAdminAccess(
	translate: Awaited<ReturnType<typeof getTranslations>>
): Promise<InternalAdminAccessResult> {
	const user = await requireUser()
	const userEmail = normalizeEmail(user.email ?? "")

	if (!isInternalAdminUser({ user, userEmail })) {
		return { ok: false, error: translate("errors.noInternalAdminPermission") }
	}

	const adminClient = tryCreateSupabaseAdminClient()
	if (!adminClient) {
		return { ok: false, error: translate("errors.serviceRoleConfigUnavailable") }
	}

	return { ok: true, context: { adminClient, user, userEmail } }
}

function isInternalAdminUser({ user, userEmail }: { user: User; userEmail: string }): boolean {
	if (!user) return false
	if (!userEmail) return false

	return userEmail === INTERNAL_ADMIN_EMAIL
}

async function listCompaniesPage({
	adminClient,
	search,
	lastId,
	translate,
}: {
	adminClient: AdminClient
	search: string
	lastId: string | null
	translate: Awaited<ReturnType<typeof getTranslations>>
}): Promise<GetCompaniesResult> {
	const normalizedSearch = search.trim()
	const normalizedLastId = normalizeCursor(lastId)

	let query = adminClient
		.from("companies")
		.select("id, display_name, logo_url")
		.order("id", { ascending: true })
		.limit(COMPANY_PAGE_SIZE)

	if (normalizedSearch) {
		query = query.ilike("display_name", `%${escapeLikePattern(normalizedSearch)}%`)
	}

	if (normalizedLastId) {
		query = query.gt("id", normalizedLastId)
	}

	const { data: companyRows, error: companyError } = await query
	if (companyError) {
		return { ok: false, error: translate("errors.loadCompaniesFailed") }
	}

	const rows = ((companyRows as CompanyRow[] | null) ?? []).filter((companyRow) => Boolean(companyRow.id))
	const items = rows.map((companyRow) => mapCompanyRowToListItem(companyRow, translate("fallback.company")))
	const nextCursor = rows.length === COMPANY_PAGE_SIZE ? (rows[rows.length - 1]?.id ?? null) : null

	return { ok: true, page: { items, nextCursor } }
}

async function loadCompanyDetails({
	adminClient,
	companyId,
	translate,
}: {
	adminClient: AdminClient
	companyId: string
	translate: Awaited<ReturnType<typeof getTranslations>>
}): Promise<CompanyDetailsResult> {
	const { data: companyRow, error: companyError } = await adminClient
		.from("companies")
		.select("id, display_name, logo_url")
		.eq("id", companyId)
		.maybeSingle<CompanyRow>()

	if (companyError || !companyRow) return { ok: false, error: translate("errors.companyNotFound") }

	const catalogResult = await getServiceCatalog(adminClient, translate)
	if (!catalogResult.ok) return { ok: false, error: catalogResult.error }

	const [companyServicesResult, digisacResult, websiteResult] = await Promise.all([
		adminClient.from("company_services").select("service_id, is_active").eq("company_id", companyId).eq("is_active", true),
		adminClient
			.from("integrations_digisac")
			.select("company_id, token, base_url")
			.eq("company_id", companyId)
			.maybeSingle<DigisacIntegrationRow>(),
		adminClient
			.from("integrations_website")
			.select("company_id, domain, analytics_id")
			.eq("company_id", companyId)
			.maybeSingle<WebsiteIntegrationRow>(),
	])

	if (companyServicesResult.error && !isMissingTableError(companyServicesResult.error)) {
		return { ok: false, error: translate("errors.loadCompanyServicesFailed") }
	}

	if (digisacResult.error && !isMissingTableError(digisacResult.error)) {
		return { ok: false, error: translate("errors.loadDigisacIntegrationFailed") }
	}

	if (websiteResult.error && !isMissingTableError(websiteResult.error)) {
		return { ok: false, error: translate("errors.loadWebsiteIntegrationFailed") }
	}

	const companyServices = isMissingTableError(companyServicesResult.error)
		? []
		: ((companyServicesResult.data as CompanyServiceRow[] | null) ?? [])

	const selectedServiceIds = new Set(
		companyServices
			.filter((companyService) => companyService.is_active === true && Boolean(companyService.service_id))
			.map((companyService) => String(companyService.service_id))
	)

	const services = catalogResult.services.map((service) => ({
		id: service.id,
		code: service.code,
		name: service.name,
		isSelected: selectedServiceIds.has(service.id),
	}))

	const digisacIntegration = isMissingTableError(digisacResult.error)
		? null
		: digisacResult.data
			? { token: String(digisacResult.data.token ?? ""), baseUrl: String(digisacResult.data.base_url ?? "") }
			: null

	const websiteIntegration = isMissingTableError(websiteResult.error)
		? null
		: websiteResult.data
			? { domain: String(websiteResult.data.domain ?? ""), analyticsId: String(websiteResult.data.analytics_id ?? "") }
			: null

	return {
		ok: true,
		company: {
			...mapCompanyRowToListItem(companyRow, translate("fallback.company")),
			services,
			digisacIntegration,
			websiteIntegration,
		},
	}
}

async function getServiceCatalog(
	adminClient: AdminClient,
	translate: Awaited<ReturnType<typeof getTranslations>>
): Promise<ServiceCatalogResult> {
	if (serviceCatalogCache) return { ok: true, services: serviceCatalogCache }

	const { data: serviceRows, error: serviceError } = await adminClient.from("services").select("id, code, name").order("name")

	if (serviceError) {
		return { ok: false, error: translate("errors.loadServiceCatalogFailed") }
	}

	const services = ((serviceRows as ServiceRow[] | null) ?? [])
		.filter((serviceRow) => Boolean(serviceRow.id) && Boolean(serviceRow.code))
		.map((serviceRow) => ({ id: serviceRow.id, code: String(serviceRow.code), name: String(serviceRow.name ?? serviceRow.code) }))

	serviceCatalogCache = services
	return { ok: true, services }
}

async function getServiceByCode({
	adminClient,
	code,
	translate,
}: {
	adminClient: AdminClient
	code: InternalAdminIntegrationKind
	translate: Awaited<ReturnType<typeof getTranslations>>
}): Promise<{ ok: true; service: ServiceCatalogItem } | { ok: false; error: string }> {
	const catalogResult = await getServiceCatalog(adminClient, translate)
	if (!catalogResult.ok) return { ok: false, error: catalogResult.error }

	const service = catalogResult.services.find((catalogItem) => catalogItem.code === code)
	if (!service) return { ok: false, error: translate("errors.serviceCodeNotFoundInCatalog", { code }) }

	return { ok: true, service }
}

async function isServiceEnabledForCompany({
	adminClient,
	companyId,
	serviceId,
	translate,
}: {
	adminClient: AdminClient
	companyId: string
	serviceId: string
	translate: Awaited<ReturnType<typeof getTranslations>>
}): Promise<{ ok: true; enabled: boolean } | { ok: false; error: string }> {
	const { data: companyServiceRow, error: companyServiceError } = await adminClient
		.from("company_services")
		.select("service_id, is_active")
		.eq("company_id", companyId)
		.eq("service_id", serviceId)
		.eq("is_active", true)
		.maybeSingle<CompanyServiceRow>()

	if (companyServiceError && !isNotFoundError(companyServiceError)) {
		return { ok: false, error: translate("errors.validateCompanyServiceFailed") }
	}

	return { ok: true, enabled: Boolean(companyServiceRow?.service_id) }
}

async function persistIntegrationData({
	adminClient,
	companyId,
	service,
	data,
	translate,
}: {
	adminClient: AdminClient
	companyId: string
	service: InternalAdminIntegrationKind
	data: UpdateIntegrationPayload
	translate: Awaited<ReturnType<typeof getTranslations>>
}): Promise<{ ok: true } | { ok: false; error: string }> {
	if (service === "digisac") {
		const token = String(data.token ?? "").trim()
		const baseUrl = String(data.baseUrl ?? "").trim()

		if (!token) return { ok: false, error: translate("errors.digisacTokenRequired") }
		if (!baseUrl) return { ok: false, error: translate("errors.digisacBaseUrlRequired") }

		const { error: upsertError } = await adminClient
			.from("integrations_digisac")
			.upsert({ company_id: companyId, token, base_url: baseUrl }, { onConflict: "company_id" })

		if (upsertError) {
			return { ok: false, error: translate("errors.saveDigisacIntegrationFailed") }
		}

		return { ok: true }
	}

	const domain = String(data.domain ?? "").trim()
	const analyticsId = String(data.analyticsId ?? "").trim()

	if (!domain) return { ok: false, error: translate("errors.websiteDomainRequired") }
	if (!analyticsId) return { ok: false, error: translate("errors.websiteAnalyticsIdRequired") }

	const { error: upsertError } = await adminClient
		.from("integrations_website")
		.upsert({ company_id: companyId, domain, analytics_id: analyticsId }, { onConflict: "company_id" })

	if (upsertError) {
		return { ok: false, error: translate("errors.saveWebsiteIntegrationFailed") }
	}

	return { ok: true }
}

function mapCompanyRowToListItem(companyRow: CompanyRow, fallbackDisplayName: string): InternalAdminCompanyListItem {
	return { id: companyRow.id, displayName: String(companyRow.display_name ?? fallbackDisplayName), logoUrl: companyRow.logo_url }
}

function normalizeCompanySelections(companies: InternalAdminCompanySelection[]): InternalAdminCompanySelection[] {
	const normalizedByCompanyId = new Map<string, InternalAdminCompanySelection>()

	for (const company of companies) {
		const companyId = String(company.companyId ?? "").trim()
		const role = String(company.role ?? "") as CompanyRole
		if (!companyId) continue
		if (!isCompanyRole(role)) continue

		normalizedByCompanyId.set(companyId, { companyId, role })
	}

	return Array.from(normalizedByCompanyId.values())
}

function isIntegrationKind(value: string): value is InternalAdminIntegrationKind {
	return value === "digisac" || value === "website"
}

function isCompanyRole(value: string): value is CompanyRole {
	return companyRoles.includes(value as CompanyRole)
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(value: string): string {
	return value.trim().toLowerCase()
}

function normalizeCursor(value: string | null): string | null {
	if (typeof value !== "string") return null
	const normalizedValue = value.trim()
	return normalizedValue || null
}

function escapeLikePattern(value: string): string {
	return value.replace(/[%_]/g, (character) => `\\${character}`)
}

function tryCreateSupabaseAdminClient(): AdminClient | null {
	try {
		return createSupabaseAdminClient()
	} catch {
		return null
	}
}

function isMissingTableError(error: { code?: string | null } | null): boolean {
	if (!error) return false
	return String(error.code ?? "").toUpperCase() === "PGRST205"
}

function isNotFoundError(error: { code?: string | null } | null): boolean {
	if (!error) return false
	return String(error.code ?? "").toUpperCase() === "PGRST116"
}

function isUserAlreadyExistsError(error: { message?: string; code?: string | number | null }): boolean {
	const normalizedMessage = String(error.message ?? "").toLowerCase()
	const normalizedCode = String(error.code ?? "").toLowerCase()

	return (
		normalizedMessage.includes("already registered") ||
		normalizedMessage.includes("already exists") ||
		normalizedMessage.includes("duplicate") ||
		normalizedCode.includes("email_exists") ||
		normalizedCode === "23505"
	)
}
