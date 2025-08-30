import { Company } from "@/types/company"
import { getSupabaseAdmin } from "@/utils/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

type ListCompaniesPayload = {
  page?: number | string
  per_page?: number | string
  query?: string
}

type CreateCompanyPayload = Omit<Company, "id"> & {
  website_domain?: string | null
  website_analytics_id?: string | null
  digisac_token?: string | null
  digisac_url?: string | null
}

type UpdateCompanyPayload = CreateCompanyPayload & { id: string; remove_logo?: boolean }
type DeleteCompanyPayload = { id: string }

function extractStoragePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const bucketPrefix = "/storage/v1/object/public/business-logo/"
    const startIndex = url.pathname.indexOf(bucketPrefix)

    if (startIndex === -1) return null
    return decodeURIComponent(url.pathname.slice(startIndex + bucketPrefix.length))
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.json()
  const { action, payload } = body as { action?: string; payload?: unknown }

  if (!action || payload === undefined) return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })

  try {
    switch (action) {
      case "listCompanies": {
        const { page: pageRaw, per_page: perPageRaw, query: queryRaw } = payload as ListCompaniesPayload

        const pageNumber = Number(pageRaw ?? 1)
        const per_page = Number(perPageRaw ?? 10)
        const searchQuery = String(queryRaw ?? "").trim()

        if (Number.isNaN(pageNumber) || Number.isNaN(per_page) || pageNumber < 1 || per_page < 1)
          return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })

        const startIndex = (pageNumber - 1) * per_page
        const endIndex = startIndex + per_page - 1

        const companySelectColumns = `
          id,
          business_name,
          email,
          logo,
          websites (domain, analytics_id),
          digisac (token, url),
          cloud_server (id),
          email_corporate (id),
          ia (id),
          management_system (id),
          marketing (id)
        `

        let companiesQuery = supabaseAdmin.from("business").select(companySelectColumns, { count: "estimated" })

        if (searchQuery.length > 0) companiesQuery = companiesQuery.ilike("business_name", `%${searchQuery}%`)

        const { data, count, error } = await companiesQuery.range(startIndex, endIndex)
        if (error) throw error

        const companies: Company[] = (data ?? []).map((row) => ({
          id: row.id,
          business_name: row.business_name,
          email: row.email,
          logo: row.logo,
          has_website: !!(row.websites && row.websites.length > 0),
          website_domain: row.websites?.[0]?.domain ?? "",
          website_analytics_id: row.websites?.[0]?.analytics_id ?? "",
          has_digisac: !!(row.digisac && row.digisac.length > 0),
          digisac_token: row.digisac?.[0]?.token ?? "",
          digisac_url: row.digisac?.[0]?.url ?? "",
          has_cloud_server: !!(row.cloud_server && row.cloud_server.length > 0),
          has_email_corporate: !!(row.email_corporate && row.email_corporate.length > 0),
          has_ia: !!(row.ia && row.ia.length > 0),
          has_management_system: !!(row.management_system && row.management_system.length > 0),
          has_marketing: !!(row.marketing && row.marketing.length > 0),
        }))

        return NextResponse.json({ companies, total: count ?? 0 })
      }

      case "createCompany": {
        const {
          business_name,
          email,
          logo,
          has_website,
          website_domain,
          website_analytics_id,
          has_digisac,
          digisac_token,
          digisac_url,
          has_cloud_server,
          has_email_corporate,
          has_ia,
          has_management_system,
          has_marketing,
        } = payload as CreateCompanyPayload

        const { data: createdCompany, error: createCompanyError } = await supabaseAdmin.from("business").insert([{ business_name, email, logo }]).select().single()
        if (createCompanyError) throw createCompanyError

        const companyId: string = createdCompany.id

        if (has_website) await supabaseAdmin.from("websites").insert([{ companyId, domain: website_domain, analytics_id: website_analytics_id }])
        if (has_digisac) await supabaseAdmin.from("digisac").insert([{ companyId, token: digisac_token, url: digisac_url }])
        if (has_cloud_server) await supabaseAdmin.from("cloud_server").insert([{ companyId }])
        if (has_email_corporate) await supabaseAdmin.from("email_corporate").insert([{ companyId }])
        if (has_ia) await supabaseAdmin.from("ia").insert([{ companyId }])
        if (has_management_system) await supabaseAdmin.from("management_system").insert([{ companyId }])
        if (has_marketing) await supabaseAdmin.from("marketing").insert([{ companyId }])

        return NextResponse.json({ success: true, id: companyId })
      }

      case "updateCompany": {
        const {
          id,
          business_name,
          email,
          logo,
          remove_logo,
          has_website,
          website_domain,
          website_analytics_id,
          has_digisac,
          digisac_token,
          digisac_url,
          has_cloud_server,
          has_email_corporate,
          has_ia,
          has_management_system,
          has_marketing,
        } = payload as UpdateCompanyPayload

        if (!id) throw new Error("ID da empresa não fornecido")

        if (remove_logo) {
          const { data: previousCompany, error: getPreviousError } = await supabaseAdmin.from("business").select("logo").eq("id", id).single()
          if (getPreviousError) throw getPreviousError

          const previousLogoPath = previousCompany?.logo ? extractStoragePathFromPublicUrl(previousCompany.logo) : null
          if (previousLogoPath) await supabaseAdmin.storage.from("business-logo").remove([previousLogoPath])
        }

        await supabaseAdmin.from("business").update({ business_name, email, logo: remove_logo ? null : logo }).eq("id", id)

        if (has_website) {
          const { count } = await supabaseAdmin.from("websites").select("*", { count: "exact", head: true }).eq("business_id", id)
          if (count === 0) await supabaseAdmin.from("websites").insert([{ business_id: id, domain: website_domain, analytics_id: website_analytics_id }])
          else await supabaseAdmin.from("websites").update({ domain: website_domain, analytics_id: website_analytics_id }).eq("business_id", id)
        } else await supabaseAdmin.from("websites").delete().eq("business_id", id)

        if (has_digisac) {
          const { count } = await supabaseAdmin.from("digisac").select("*", { count: "exact", head: true }).eq("business_id", id)
          if (count === 0) await supabaseAdmin.from("digisac").insert([{ business_id: id, token: digisac_token, url: digisac_url }])
          else await supabaseAdmin.from("digisac").update({ token: digisac_token, url: digisac_url }).eq("business_id", id)
        } else await supabaseAdmin.from("digisac").delete().eq("business_id", id)

        const featureTables: Array<{ tableName: "cloud_server" | "email_corporate" | "ia" | "management_system" | "marketing"; isEnabled: boolean }> = [
          { tableName: "cloud_server", isEnabled: has_cloud_server },
          { tableName: "email_corporate", isEnabled: has_email_corporate },
          { tableName: "ia", isEnabled: has_ia },
          { tableName: "management_system", isEnabled: has_management_system },
          { tableName: "marketing", isEnabled: has_marketing },
        ]

        for (const { tableName, isEnabled } of featureTables) {
          const { count } = await supabaseAdmin.from(tableName).select("*", { count: "exact", head: true }).eq("business_id", id)
          if (isEnabled && count === 0) await supabaseAdmin.from(tableName).insert([{ business_id: id }])
          if (!isEnabled && (count ?? 0) > 0) await supabaseAdmin.from(tableName).delete().eq("business_id", id)
        }

        return NextResponse.json({ success: true })
      }

      case "deleteCompany": {
        const { id } = payload as DeleteCompanyPayload
        if (!id) throw new Error("ID não fornecido")

        const { data: previousCompany, error: getPreviousError } = await supabaseAdmin.from("business").select("logo").eq("id", id).single()
        if (getPreviousError) throw getPreviousError

        const previousLogoPath = previousCompany?.logo ? extractStoragePathFromPublicUrl(previousCompany.logo) : null
        if (previousLogoPath) await supabaseAdmin.storage.from("business-logo").remove([previousLogoPath])

        const relatedTables = [
          "websites",
          "digisac",
          "cloud_server",
          "email_corporate",
          "ia",
          "management_system",
          "marketing",
        ] as const

        for (const tableName of relatedTables) await supabaseAdmin.from(tableName).delete().eq("business_id", id)
        await supabaseAdmin.from("business").delete().eq("id", id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
  } catch (error: unknown) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}