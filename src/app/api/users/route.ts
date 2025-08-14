import { NextRequest, NextResponse } from "next/server"
import type { User as UiUser } from "@/components/users/userModal"
import { getSupabaseAdmin } from "@/utils/supabase/admin"

// ————————————————————————————————————————
// Tipos de payload
// ————————————————————————————————————————
type ListUsersPayload = {
  page?: number | string
  per_page?: number | string
  query?: string
}

type CreateUserPayload = {
  email: string
  password: string
  phone?: string
  email_confirm?: boolean
  phone_confirm?: boolean
}

type UpdateUserPayload = {
  id: string
  email?: string
  password?: string
  phone?: string
  email_confirm?: boolean
  phone_confirm?: boolean
}

type DeleteUserPayload = { id: string }

// ————————————————————————————————————————
// Helpers
// ————————————————————————————————————————
function mapSupabaseUser(u: any): UiUser {
  return {
    id: u.id,
    email: u.email,
    email_confirmed_at: u.email_confirmed_at ?? u.user_metadata?.email_confirmed_at,
    phone: u.phone ?? "",
    confirmed_at: u.confirmed_at ?? undefined,
    last_sign_in_at: u.last_sign_in_at ?? undefined,
    created_at: u.created_at
  }
}

function norm(v: unknown) {
  const s = String(v ?? "").trim()
  return s.toLowerCase()
}

// Fallback para total quando não temos count direto.
// Se a próxima página tiver pelo menos 1 usuário, sabemos que existe “mais uma” página.
// Isso mantém o “Próximo” funcionando corretamente.
// Para total exato, veja a seção “(Opcional) total exato via RPC” abaixo.
async function estimateTotal(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  page: number,
  per_page: number
) {
  const next = await supabaseAdmin.auth.admin.listUsers({ page: page + 1, perPage: 1 })
  const hasNext = (next?.data?.users?.length ?? 0) > 0
  return { hasNext }
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()

  try {
    const { action, payload } = (await req.json()) as {
      action?: string
      payload?: unknown
    }

    if (!action || payload === undefined) {
      return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })
    }

    switch (action) {
      // ————————————————————————————————————
      // LIST
      // ————————————————————————————————————
      case "listUsers": {
        const { page: pageRaw, per_page: perPageRaw, query: queryRaw } = payload as ListUsersPayload

        const page = Math.max(1, Number(pageRaw ?? 1))
        const per_page = Math.max(1, Number(perPageRaw ?? 10))
        const query = String(queryRaw ?? "").trim()

        // Quando tem busca, carregamos um “lote grande” e filtramos por email server-side.
        // Isso nos permite devolver total/totalPages corretos sem depender de count nativo.
        if (query.length > 0) {
          const MAX_PER_PAGE = 1000 // limite grande por página do GoTrue
          let acc: any[] = []
          let cur = 1

          // Busca paginando até esgotar (com um limite de segurança)
          while (cur <= 10) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({
              page: cur,
              perPage: MAX_PER_PAGE
            })
            if (error) throw error
            const batch = data?.users ?? []
            acc = acc.concat(batch)
            if (batch.length < MAX_PER_PAGE) break
            cur += 1
          }

          const q = norm(query)
          const filtered = acc.filter((u) => norm(u.email).includes(q))

          const total = filtered.length
          const totalPages = Math.max(1, Math.ceil(total / per_page))
          const from = (page - 1) * per_page
          const to = from + per_page
          const pageItems = filtered.slice(from, to).map(mapSupabaseUser)

          return NextResponse.json({ users: pageItems, total, totalPages })
        }

        // Sem busca: usamos a paginação nativa e estimamos se existe próxima página.
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: per_page
        }) // params oficiais: page / perPage
        if (error) throw error

        const usersRaw = data?.users ?? []
        const users = usersRaw.map(mapSupabaseUser)

        // (Opcional) se você criar a RPC count_auth_users, descomente:
        // const { data: countData } = await supabaseAdmin.rpc("count_auth_users")
        // const total = Number(countData?.count ?? 0)
        // const totalPages = Math.max(1, Math.ceil(total / per_page))

        // Fallback sem RPC: estimamos se existe próxima página para manter o “Próximo” correto.
        const { hasNext } = await estimateTotal(supabaseAdmin, page, per_page)
        const totalApprox =
          (page - 1) * per_page + users.length + (hasNext ? per_page : 0)
        const totalPagesApprox = hasNext ? page + 1 : page

        return NextResponse.json({
          users,
          total: totalApprox,
          totalPages: totalPagesApprox
        })
      }

      // ————————————————————————————————————
      // CREATE
      // ————————————————————————————————————
      case "createUser": {
        const { email, password, phone, email_confirm, phone_confirm } = payload as CreateUserPayload

        if (!email || !password) {
          return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          phone,
          email_confirm: !!email_confirm,
          phone_confirm: !!phone_confirm
        })
        if (error) throw error

        return NextResponse.json({ success: true, id: data.user?.id })
      }

      // ————————————————————————————————————
      // UPDATE
      // ————————————————————————————————————
      case "updateUser": {
        const { id, email, password, phone, email_confirm, phone_confirm } = payload as UpdateUserPayload
        if (!id) return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 })

        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
          ...(email ? { email } : {}),
          ...(password ? { password } : {}),
          ...(phone ? { phone } : {}),
          ...(email_confirm !== undefined ? { email_confirm } : {}),
          ...(phone_confirm !== undefined ? { phone_confirm } : {})
        })
        if (error) throw error // update de email/senha/confirm flags são suportados oficialmente

        return NextResponse.json({ success: true })
      }

      // ————————————————————————————————————
      // DELETE
      // ————————————————————————————————————
      case "deleteUser": {
        const { id } = payload as DeleteUserPayload
        if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })

        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) throw error

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
