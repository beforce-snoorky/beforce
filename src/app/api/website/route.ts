import { resolveCompanyRequest } from "@/app/api/_lib/company"
import { getWebsitePageData } from "@/features/website"
import { normalizeReferenceMonth } from "@/utils/website"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
	const companyResult = await resolveCompanyRequest(request.nextUrl.searchParams.get("companyId"))
	if (!companyResult.ok) return companyResult.response

	const requestedMonth = request.nextUrl.searchParams.get("month")
	const normalizedMonth = requestedMonth ? normalizeReferenceMonth(requestedMonth) : null

	if (requestedMonth && !normalizedMonth) {
		return NextResponse.json({ error: "A valid month query parameter is required." }, { status: 400 })
	}

	try {
		const data = await getWebsitePageData({
			companyId: companyResult.context.companyId,
			filters: { referenceMonth: normalizedMonth },
		})

		return NextResponse.json(data)
	} catch (error) {
		console.error("[api.website] Unable to load website data", error)

		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load website data." }, { status: 500 })
	}
}
