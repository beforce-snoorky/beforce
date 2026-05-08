import { resolveCompanyRequest } from "@/app/api/_lib/company"
import { getCompanyServicesOverview } from "@/features/dashboard"
import type { DashboardPageData } from "@/types/dashboard"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
	const companyResult = await resolveCompanyRequest(request.nextUrl.searchParams.get("companyId"))
	if (!companyResult.ok) return companyResult.response

	try {
		const services = await getCompanyServicesOverview(companyResult.context.companyId)
		const response: DashboardPageData = { services }

		return NextResponse.json(response)
	} catch (error) {
		console.error("[api.dashboard] Unable to load dashboard data", error)

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to load dashboard data." },
			{ status: 500 }
		)
	}
}
