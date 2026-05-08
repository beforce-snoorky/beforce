import type { FeatureStatus } from "@/types/resource"

const featureStatusesSet: ReadonlySet<FeatureStatus> = new Set(["backlog", "planned", "in_progress", "done"])
export type SuggestionValidationErrorCode = "title_min" | "description_min"

export function normalizeResourceText(value: string | null | undefined): string {
	return String(value ?? "").trim()
}

export function normalizeResourceEmail(value: string | null | undefined): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
}

export function validateSuggestionInput({
	title,
	description,
}: {
	title: string
	description: string
}): SuggestionValidationErrorCode | null {
	const normalizedTitle = normalizeResourceText(title)
	const normalizedDescription = normalizeResourceText(description)

	if (normalizedTitle.length < 3) return "title_min"
	if (normalizedDescription.length < 8) return "description_min"

	return null
}

export function isFeatureStatus(value: string | null | undefined): value is FeatureStatus {
	if (!value) return false
	return featureStatusesSet.has(value as FeatureStatus)
}

export function resolveFeatureStatus(value: string | null | undefined): FeatureStatus {
	if (isFeatureStatus(value)) return value
	return "backlog"
}

export function isMissingTableError(error: { code?: string | null } | null): boolean {
	if (!error) return false
	const normalizedCode = String(error.code ?? "").toUpperCase()
	return normalizedCode === "PGRST205" || normalizedCode === "42P01"
}
