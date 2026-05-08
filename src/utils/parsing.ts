export function asString(value: unknown): string {
	if (typeof value === "string") return value.trim()
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	return ""
}

export function asNullableString(value: unknown): string | null {
	if (typeof value === "string") return value
	return null
}
