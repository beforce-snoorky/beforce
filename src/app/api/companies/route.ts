import { getSupabaseAdmin } from "@/utils/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.json()
  const { action, payload } = body

  if (!action || !payload) return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })

  try {
    switch (action) {
      case "listCompanies": {
        const { data: companies, error } = await supabaseAdmin.rpc("get_business_data")
        if (error) throw error
        return NextResponse.json({ companies })
      }

      case "createCompany": {
        const {
          business_name,
          email,
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
          has_marketing
        } = payload

        const { data: business, error: businessError } = await supabaseAdmin
          .from("business")
          .insert([{ business_name, email }])
          .select()
          .single()

        if (businessError) throw businessError
        const business_id = business.id

        if (has_website) {
          await supabaseAdmin.from("website").insert([{ business_id, domain: website_domain, analytics_id: website_analytics_id }])
        }

        if (has_digisac) {
          await supabaseAdmin.from("digisac").insert([{ business_id, token: digisac_token, url: digisac_url }])
        }

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
          has_marketing
        } = payload

        if (!id) throw new Error("ID da empresa não fornecido")

        await supabaseAdmin.from("business").update({ business_name, email }).eq("id", id)

        // website
        if (has_website) {
          const { count } = await supabaseAdmin.from("website").select("*", { count: "exact", head: true }).eq("business_id", id)
          if (count === 0) {
            await supabaseAdmin.from("website").insert([{ business_id: id, domain: website_domain, analytics_id: website_analytics_id }])
          } else {
            await supabaseAdmin.from("website").update({ domain: website_domain, analytics_id: website_analytics_id }).eq("business_id", id)
          }
        } else {
          await supabaseAdmin.from("website").delete().eq("business_id", id)
        }

        // digisac
        if (has_digisac) {
          const { count } = await supabaseAdmin.from("digisac").select("*", { count: "exact", head: true }).eq("business_id", id)
          if (count === 0) {
            await supabaseAdmin.from("digisac").insert([{ business_id: id, token: digisac_token, url: digisac_url }])
          } else {
            await supabaseAdmin.from("digisac").update({ token: digisac_token, url: digisac_url }).eq("business_id", id)
          }
        } else {
          await supabaseAdmin.from("digisac").delete().eq("business_id", id)
        }

        // tabelas booleanas simples
        const toggleTables = [
          { name: "cloud_server", flag: has_cloud_server },
          { name: "email_corporate", flag: has_email_corporate },
          { name: "ia", flag: has_ia },
          { name: "management_system", flag: has_management_system },
          { name: "marketing", flag: has_marketing }
        ]

        for (const { name, flag } of toggleTables) {
          const { count } = await supabaseAdmin.from(name).select("*", { count: "exact", head: true }).eq("business_id", id)
          if (flag && count === 0) {
            await supabaseAdmin.from(name).insert([{ business_id: id }])
          }
          if (!flag && (count ?? 0) > 0) {
            await supabaseAdmin.from(name).delete().eq("business_id", id)
          }
        }

        return NextResponse.json({ success: true })
      }

      case "deleteCompany": {
        const { id } = payload

        const tables = [
          "website",
          "digisac",
          "cloud_server",
          "email_corporate",
          "ia",
          "management_system",
          "marketing"
        ]

        for (const table of tables) {
          await supabaseAdmin.from(table).delete().eq("business_id", id)
        }

        await supabaseAdmin.from("business").delete().eq("id", id)

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (error: unknown) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}