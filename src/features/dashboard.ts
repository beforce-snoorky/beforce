import "server-only"

import { createSupabaseServerClient } from "@/supabase/server"
import type { CompanyServiceOverview, CompanyServiceStatusRow } from "@/types/dashboard"
import type { ServiceCatalogItem } from "@/types/service"

export async function getCompanyServicesOverview(companyId: string): Promise<CompanyServiceOverview[]> {
	const [catalog, companyRows] = await Promise.all([fetchServicesCatalog(), fetchCompanyServiceStatusRows(companyId)])

	return mapCompanyServices(catalog, companyRows)
}

async function fetchServicesCatalog(): Promise<ServiceCatalogItem[]> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase.from("services").select("id, name, code")

	if (error) throw new Error("Failed to load services catalog.")

	return (data ?? []) as ServiceCatalogItem[]
}

async function fetchCompanyServiceStatusRows(companyId: string): Promise<CompanyServiceStatusRow[]> {
	const supabase = await createSupabaseServerClient()

	const { data, error } = await supabase.from("company_services").select("service_id, is_active").eq("company_id", companyId)

	if (error) throw new Error("Failed to load company services.")

	return (data ?? []) as CompanyServiceStatusRow[]
}

function mapCompanyServices(catalog: ServiceCatalogItem[], companyRows: CompanyServiceStatusRow[]): CompanyServiceOverview[] {
	const companyServiceMap = new Map(companyRows.map((row) => [row.service_id, row.is_active === true]))

	return catalog
		.map((service) => ({ ...service, isActive: companyServiceMap.get(service.id) ?? false }))
		.sort((left, right) => left.name.localeCompare(right.name))
}
