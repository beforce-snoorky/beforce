import { Company } from "@/types/company"
import { getSupabaseAdmin } from "@/utils/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

type ListCompaniesPayload = {
  page?: number | string
  per_page?: number | string
  query?: string
}

type CreateCompanyPayload = {
  business_name: string
  email: string
  logo: string | null
  has_website: boolean
  website_domain?: string
  website_analytics_id?: string
  has_digisac: boolean
  digisac_token?: string
  digisac_url?: string
  has_cloud_server: boolean
  has_email_corporate: boolean
  has_ia: boolean
  has_management_system: boolean
  has_marketing: boolean
}

type UpdateCompanyPayload = CreateCompanyPayload & { id: string; remove_logo?: boolean }
type DeleteCompanyPayload = { id: string }

function extractStoragePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    // Formato típico: /storage/v1/object/public/<bucket>/<path>
    const prefix = "/storage/v1/object/public/business-logo/"
    const idx = url.pathname.indexOf(prefix)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + prefix.length))
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

        const page = Number(pageRaw ?? 1)
        const per_page = Number(perPageRaw ?? 10)
        const query = String(queryRaw ?? "").trim()

        if (Number.isNaN(page) || Number.isNaN(per_page) || page < 1 || per_page < 1) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })

        const from = (page - 1) * per_page
        const to = from + per_page - 1

        const selectClause = `
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

        let queryBuilder = supabaseAdmin.from("business").select(selectClause, { count: "exact" })

        if (query.length > 0) queryBuilder = queryBuilder.ilike("business_name", `%${query}%`)

        const { data, count, error } = await queryBuilder.range(from, to)
        if (error) throw error

        const companies: Company[] = (data ?? []).map((b) => ({
          id: b.id,
          business_name: b.business_name,
          email: b.email,
          logo: b.logo,
          has_website: !!(b.websites && b.websites.length > 0),
          website_domain: b.websites?.[0]?.domain ?? "",
          website_analytics_id: b.websites?.[0]?.analytics_id ?? "",
          has_digisac: !!(b.digisac && b.digisac.length > 0),
          digisac_token: b.digisac?.[0]?.token ?? "",
          digisac_url: b.digisac?.[0]?.url ?? "",
          has_cloud_server: !!(b.cloud_server && b.cloud_server.length > 0),
          has_email_corporate: !!(b.email_corporate && b.email_corporate.length > 0),
          has_ia: !!(b.ia && b.ia.length > 0),
          has_management_system: !!(b.management_system && b.management_system.length > 0),
          has_marketing: !!(b.marketing && b.marketing.length > 0),
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

        const { data: business, error: businessError } = await supabaseAdmin.from("business").insert([{ business_name, email, logo }]).select().single()
        if (businessError) throw businessError

        const business_id: string = business.id

        if (has_website) await supabaseAdmin.from("websites").insert([{ business_id, domain: website_domain, analytics_id: website_analytics_id }])
        if (has_digisac) await supabaseAdmin.from("digisac").insert([{ business_id, token: digisac_token, url: digisac_url }])
        if (has_cloud_server) await supabaseAdmin.from("cloud_server").insert([{ business_id }])
        if (has_email_corporate) await supabaseAdmin.from("email_corporate").insert([{ business_id }])
        if (has_ia) await supabaseAdmin.from("ia").insert([{ business_id }])
        if (has_management_system) await supabaseAdmin.from("management_system").insert([{ business_id }])
        if (has_marketing) await supabaseAdmin.from("marketing").insert([{ business_id }])

        return NextResponse.json({ success: true, id: business_id })
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
          const { data: prev, error: getErr } = await supabaseAdmin.from("business").select("logo").eq("id", id).single()
          if (getErr) throw getErr

          const path = prev?.logo ? extractStoragePathFromPublicUrl(prev.logo) : null
          if (path) await supabaseAdmin.storage.from("business-logo").remove([path])
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

        const toggleTables: Array<{ name: "cloud_server" | "email_corporate" | "ia" | "management_system" | "marketing"; flag: boolean }> = [
          { name: "cloud_server", flag: has_cloud_server },
          { name: "email_corporate", flag: has_email_corporate },
          { name: "ia", flag: has_ia },
          { name: "management_system", flag: has_management_system },
          { name: "marketing", flag: has_marketing },
        ]

        for (const { name, flag } of toggleTables) {
          const { count } = await supabaseAdmin.from(name).select("*", { count: "exact", head: true }).eq("business_id", id)
          if (flag && count === 0) await supabaseAdmin.from(name).insert([{ business_id: id }])
          if (!flag && (count ?? 0) > 0) await supabaseAdmin.from(name).delete().eq("business_id", id)
        }

        return NextResponse.json({ success: true })
      }

      case "deleteCompany": {
        const { id } = payload as DeleteCompanyPayload
        if (!id) throw new Error("ID não fornecido")

        const { data: prev, error: getErr } = await supabaseAdmin.from("business").select("logo").eq("id", id).single()
        if (getErr) throw getErr

        const path = prev?.logo ? extractStoragePathFromPublicUrl(prev.logo) : null
        if (path) await supabaseAdmin.storage.from("business-logo").remove([path])

        const tables = [
          "websites",
          "digisac",
          "cloud_server",
          "email_corporate",
          "ia",
          "management_system",
          "marketing",
        ] as const

        for (const table of tables) await supabaseAdmin.from(table).delete().eq("business_id", id)
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