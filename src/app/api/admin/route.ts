import { supabaseAdmin } from "@/utils/supabase"
import { NextRequest, NextResponse } from "next/server"

type UserUpdate = {
  email?: string
  user_metadata?: Record<string, unknown>
  password?: string
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, payload } = body

  if (!action || !payload) return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })

  try {
    switch (action) {
      case "createUser": {
        const { email, password, metadata } = payload
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: metadata ?? {}
        })
        if (error) throw error
        return NextResponse.json({ user: data.user })
      }

      case "updateUser": {
        const { id, email, user_metadata, password } = payload
        const updates: UserUpdate = {
          ...(email && { email }),
          ...(user_metadata && { user_metadata }),
          ...(password && { password })
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates)
        if (error) throw error
        return NextResponse.json({ user: data.user })
      }

      case "deleteUser": {
        const { id } = payload
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default: return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
  } catch (error: unknown) {
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}