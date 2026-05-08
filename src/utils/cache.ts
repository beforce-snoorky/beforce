import type { CachedMonth } from "@/types/cache"
import { normalizeReferenceMonth } from "@/utils/date"

export function buildCacheKey({
	prefix,
	companyId,
	referenceMonth,
}: {
	prefix: string
	companyId: string
	referenceMonth: string | null | undefined
}): string | null {
	const normalizedReferenceMonth = normalizeReferenceMonth(referenceMonth)
	if (!companyId || !normalizedReferenceMonth) return null

	return `${prefix}${companyId}:${normalizedReferenceMonth}`
}

export function readCachedMonth<T>({
	cacheKey,
	companyId,
	referenceMonth,
	ttl,
	parseData,
	getCompanyId,
	getReferenceMonth,
}: {
	cacheKey: string
	companyId: string
	referenceMonth: string | null | undefined
	ttl: number
	parseData: (value: unknown) => T | null
	getCompanyId: (data: T) => string
	getReferenceMonth: (data: T) => string | null | undefined
}): CachedMonth<T> | null {
	if (!canUseLocalStorage()) return null

	const rawValue = localStorage.getItem(cacheKey)
	if (!rawValue) return null

	const parsedCache = parseCachedMonth({ value: rawValue, parseData })
	if (!parsedCache) {
		localStorage.removeItem(cacheKey)
		return null
	}

	if (Date.now() - parsedCache.cachedAt > ttl) {
		localStorage.removeItem(cacheKey)
		return null
	}

	if (getCompanyId(parsedCache.data) !== companyId) {
		localStorage.removeItem(cacheKey)
		return null
	}

	if (normalizeReferenceMonth(getReferenceMonth(parsedCache.data)) !== normalizeReferenceMonth(referenceMonth)) {
		localStorage.removeItem(cacheKey)
		return null
	}

	return parsedCache
}

export function writeCachedMonth<T>({ cacheKey, data }: { cacheKey: string; data: T }) {
	if (!canUseLocalStorage()) return

	const payload: CachedMonth<T> = { data, cachedAt: Date.now() }
	localStorage.setItem(cacheKey, JSON.stringify(payload))
}

export function cleanupCache<T>({
	prefix,
	ttl,
	maxMonthsPerCompany,
	parseData,
}: {
	prefix: string
	ttl: number
	maxMonthsPerCompany: number
	parseData: (value: unknown) => T | null
}) {
	if (!canUseLocalStorage()) return

	const entriesByCompany = new Map<string, Array<{ key: string; month: string; cachedAt: number }>>()

	for (let index = 0; index < localStorage.length; index += 1) {
		const key = localStorage.key(index)
		if (!key || !key.startsWith(prefix)) continue

		const parsedKey = parseCacheKey({ key, prefix })
		if (!parsedKey) continue

		const rawValue = localStorage.getItem(key)
		if (!rawValue) continue

		const parsedCache = parseCachedMonth({ value: rawValue, parseData })
		if (!parsedCache) {
			localStorage.removeItem(key)
			continue
		}

		if (Date.now() - parsedCache.cachedAt > ttl) {
			localStorage.removeItem(key)
			continue
		}

		const items = entriesByCompany.get(parsedKey.companyId) ?? []
		items.push({ key, month: parsedKey.referenceMonth, cachedAt: parsedCache.cachedAt })
		entriesByCompany.set(parsedKey.companyId, items)
	}

	for (const items of entriesByCompany.values()) {
		items
			.sort((left, right) => {
				if (right.month !== left.month) return right.month.localeCompare(left.month)
				return right.cachedAt - left.cachedAt
			})
			.slice(maxMonthsPerCompany)
			.forEach((entry) => localStorage.removeItem(entry.key))
	}
}

function parseCachedMonth<T>({
	value,
	parseData,
}: {
	value: string
	parseData: (value: unknown) => T | null
}): CachedMonth<T> | null {
	try {
		const parsed = JSON.parse(value) as unknown
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null

		const cachedAt = Number((parsed as { cachedAt?: unknown }).cachedAt)
		if (!Number.isFinite(cachedAt)) return null

		const data = parseData((parsed as { data?: unknown }).data)
		if (data === null) return null

		return { data, cachedAt }
	} catch {
		return null
	}
}

function parseCacheKey({ key, prefix }: { key: string; prefix: string }): { companyId: string; referenceMonth: string } | null {
	const [companyId, referenceMonth] = key.slice(prefix.length).split(":")
	if (!companyId) return null

	const normalizedReferenceMonth = normalizeReferenceMonth(referenceMonth)
	if (!normalizedReferenceMonth) return null

	return { companyId, referenceMonth: normalizedReferenceMonth }
}

function canUseLocalStorage(): boolean {
	return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}
