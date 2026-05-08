import { resolveCompanyRequest } from "@/app/api/_lib/company"
import { getDigisacPageData } from "@/features/digisac"
import type { DigisacApiResponse } from "@/types/digisac"
import { normalizeReferenceMonth } from "@/utils/digisac"
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
		const data = await getDigisacPageData({
			companyId: companyResult.context.companyId,
			filters: { referenceMonth: normalizedMonth, operatorName: null },
		})
		const response: DigisacApiResponse = {
			companyId: data.companyId,
			referenceMonths: data.referenceMonths,
			appliedReferenceMonth: data.appliedReferenceMonth,
			report: data.report,
		}

		return NextResponse.json(response)
	} catch (error) {
		console.error("[api.digisac] Unable to load Digisac data", error)

		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load Digisac data." }, { status: 500 })
	}
}
