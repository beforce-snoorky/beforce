import type { DashboardPageData } from "@/types/dashboard"
import type { DigisacApiResponse } from "@/types/digisac"
import type { ResourcePageData } from "@/types/resource"
import type { SettingsPageData } from "@/types/settings"
import type { WebsitePageData } from "@/types/website"

export class ApiError extends Error {
	status: number

	constructor(message: string, status: number) {
		super(message)
		this.name = "ApiError"
		this.status = status
	}
}

function buildSearchParams(params: Record<string, string | null | undefined>) {
	const searchParams = new URLSearchParams()

	for (const [key, value] of Object.entries(params)) {
		if (!value) continue
		searchParams.set(key, value)
	}

	return searchParams.toString()
}

async function apiFetch<T>(path: string, { signal }: { signal?: AbortSignal } = {}): Promise<T> {
	const response = await fetch(path, { method: "GET", cache: "no-store", credentials: "same-origin", signal })

	if (!response.ok) {
		let message = `Request failed with status ${response.status}.`

		try {
			const payload = (await response.json()) as { error?: string }
			if (payload.error) message = payload.error
		} catch {}

		throw new ApiError(message, response.status)
	}

	return (await response.json()) as T
}

export function fetchDashboardPageData({
	companyId,
	signal,
}: {
	companyId: string
	signal?: AbortSignal
}): Promise<DashboardPageData> {
	const searchParams = buildSearchParams({ companyId })
	return apiFetch<DashboardPageData>(`/api/dashboard?${searchParams}`, { signal })
}

export function fetchDigisacPageData({
	companyId,
	month,
	signal,
}: {
	companyId: string
	month?: string | null
	signal?: AbortSignal
}): Promise<DigisacApiResponse> {
	const searchParams = buildSearchParams({ companyId, month })
	return apiFetch<DigisacApiResponse>(`/api/digisac?${searchParams}`, { signal })
}

export function fetchWebsitePageData({
	companyId,
	month,
	signal,
}: {
	companyId: string
	month?: string | null
	signal?: AbortSignal
}): Promise<WebsitePageData> {
	const searchParams = buildSearchParams({ companyId, month })
	return apiFetch<WebsitePageData>(`/api/website?${searchParams}`, { signal })
}

export function fetchSettingsPageData({
	companyId,
	signal,
}: {
	companyId: string
	signal?: AbortSignal
}): Promise<SettingsPageData> {
	const searchParams = buildSearchParams({ companyId })
	return apiFetch<SettingsPageData>(`/api/settings?${searchParams}`, { signal })
}

export function fetchResourcePageData({
	companyId,
	locale,
	signal,
}: {
	companyId: string
	locale?: string | null
	signal?: AbortSignal
}): Promise<ResourcePageData> {
	const searchParams = buildSearchParams({ companyId, locale })
	return apiFetch<ResourcePageData>(`/api/resource?${searchParams}`, { signal })
}
