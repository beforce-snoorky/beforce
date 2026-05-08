import { resolveCompanyRequest } from "@/app/api/_lib/company"
import { getSettingsPageData } from "@/features/settings-read"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
	const companyResult = await resolveCompanyRequest(request.nextUrl.searchParams.get("companyId"))
	if (!companyResult.ok) return companyResult.response

	try {
		const data = await getSettingsPageData({ companyId: companyResult.context.companyId, userId: companyResult.context.userId })

		return NextResponse.json(data)
	} catch (error) {
		console.error("[api.settings] Unable to load settings data", error)

		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load settings data." }, { status: 500 })
	}
}
