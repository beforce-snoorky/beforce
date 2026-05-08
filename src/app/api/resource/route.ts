import { resolveCompanyRequest } from "@/app/api/_lib/company"
import { getResourcePageData } from "@/features/resource-read"
import { routing } from "@/i18n/routing"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function resolveLocale(locale: string | null): string {
	if (locale && routing.locales.includes(locale as (typeof routing.locales)[number])) {
		return locale
	}

	return routing.defaultLocale
}

export async function GET(request: NextRequest) {
	const companyResult = await resolveCompanyRequest(request.nextUrl.searchParams.get("companyId"))
	if (!companyResult.ok) return companyResult.response

	try {
		const data = await getResourcePageData({
			companyId: companyResult.context.companyId,
			userId: companyResult.context.userId,
			locale: resolveLocale(request.nextUrl.searchParams.get("locale")),
		})

		return NextResponse.json(data)
	} catch (error) {
		console.error("[api.resource] Unable to load resource data", error)

		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load resource data." }, { status: 500 })
	}
}
