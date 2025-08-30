import { NextRequest, NextResponse } from "next/server"
import { User } from "@supabase/supabase-js"
import { getSupabaseAdmin } from "@/utils/supabase/admin"

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

type UserMetadata = {
  email_confirmed_at?: string
  [key: string]: unknown
}

type DeleteUserPayload = { id: string }

function mapSupabaseUser(user: User) {
  const userMetadata = user.user_metadata as UserMetadata

  return {
    id: user.id,
    email: user.email ?? undefined,
    email_confirmed_at: user.email_confirmed_at ?? userMetadata.email_confirmed_at,
    phone: user.phone ?? "",
    confirmed_at: user.confirmed_at ?? undefined,
    last_sign_in_at: user.last_sign_in_at ?? undefined,
    created_at: user.created_at
  }
}

function normalizeToLowercase(value: unknown) {
  const stringValue = String(value ?? "").trim()
  return stringValue.toLowerCase()
}

async function hasNextUsersPage(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  currentPage: number
) {
  const nextPageResult = await supabaseAdmin.auth.admin.listUsers({ page: currentPage + 1, perPage: 1 })
  const hasNext = (nextPageResult?.data?.users?.length ?? 0) > 0
  return { hasNext }
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const body = await req.json()
  const { action, payload } = body as { action?: string; payload?: unknown }

  if (!action || payload === undefined) return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })

  try {
    switch (action) {
      case "listUsers": {
        const { page: pageRaw, per_page: perPageRaw, query: queryRaw } = payload as ListUsersPayload

        const page = Math.max(1, Number(pageRaw ?? 1))
        const per_page = Math.max(1, Number(perPageRaw ?? 10))
        const searchQuery = String(queryRaw ?? "").trim()

        if (searchQuery.length > 0) {
          const supabasePageSize = 1000
          let allUsers: User[] = []
          let currentPage = 1

          while (currentPage <= 10) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: currentPage, perPage: supabasePageSize })
            if (error) throw error

            const batch: User[] = (data?.users ?? []) as User[]
            allUsers = allUsers.concat(batch)

            if (batch.length < supabasePageSize) break
            currentPage += 1
          }

          const normalizedQuery = normalizeToLowercase(searchQuery)
          const filteredUsers = allUsers.filter((u: User) => normalizeToLowercase(u.email).includes(normalizedQuery))

          const total = filteredUsers.length
          const totalPages = Math.max(1, Math.ceil(total / per_page))
          const startIndex = (page - 1) * per_page
          const endIndex = startIndex + per_page
          const pageItems = filteredUsers.slice(startIndex, endIndex).map(mapSupabaseUser)

          return NextResponse.json({ users: pageItems, total, totalPages })
        }

        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: per_page })
        if (error) throw error

        const fetchedUsers: User[] = (data?.users ?? []) as User[]
        const users = fetchedUsers.map(mapSupabaseUser)

        const { hasNext } = await hasNextUsersPage(supabaseAdmin, page)
        const approximateTotal = (page - 1) * per_page + users.length + (hasNext ? per_page : 0)
        const approximateTotalPages = hasNext ? page + 1 : page

        return NextResponse.json({
          users,
          total: approximateTotal,
          totalPages: approximateTotalPages
        })
      }

      case "createUser": {
        const { email, password, phone, email_confirm, phone_confirm } = payload as CreateUserPayload

        if (!email || !password) return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })

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
        if (error) throw error

        return NextResponse.json({ success: true })
      }

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