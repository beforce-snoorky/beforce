export function normalizeReferenceMonth(value: string | null | undefined): string | null {
	if (!value) return null

	const normalized = value.trim()
	const match = normalized.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
	if (!match) return null

	const year = Number(match[1])
	const month = Number(match[2])

	if (!Number.isFinite(year) || !Number.isFinite(month)) return null
	if (month < 1 || month > 12) return null

	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`
}

export function formatMonthYear(date: Date, locale: string): string {
	const month = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(date)
	const year = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: "UTC" }).format(date)
	const formatted = `${month} ${year}`

	return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
