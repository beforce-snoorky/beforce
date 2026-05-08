import "server-only"

import { getActiveCompanyForUser } from "@/features/companies"
import { createSupabaseServerClient } from "@/supabase/server"
import { isCompanyId } from "@/utils/company"
import { NextResponse } from "next/server"

type CompanyRequestContext = { companyId: string; userId: string }

export async function resolveCompanyRequest(
	companyId: string | null
): Promise<{ ok: true; context: CompanyRequestContext } | { ok: false; response: NextResponse<{ error: string }> }> {
	if (!companyId || !isCompanyId(companyId)) {
		return {
			ok: false,
			response: NextResponse.json({ error: "A valid companyId query parameter is required." }, { status: 400 }),
		}
	}

	const supabase = await createSupabaseServerClient()
	const { data, error } = await supabase.auth.getUser()
	const user = data.user

	if (error || !user) {
		return { ok: false, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
	}

	const activeCompany = await getActiveCompanyForUser(user.id)

	if (activeCompany.status !== "valid") {
		return { ok: false, response: NextResponse.json({ error: "No active company selected." }, { status: 403 }) }
	}

	if (activeCompany.companyId !== companyId) {
		return { ok: false, response: NextResponse.json({ error: "Forbidden company access." }, { status: 403 }) }
	}

	return { ok: true, context: { companyId: activeCompany.companyId, userId: user.id } }
}
