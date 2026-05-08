import type { ServiceCatalogItem } from "@/types/service"

export type CompanyServiceStatusRow = { service_id: string; is_active: boolean | null }

export type CompanyServiceOverview = ServiceCatalogItem & { isActive: boolean }

export type DashboardPageData = { services: CompanyServiceOverview[] }
