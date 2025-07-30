import { User } from "@/components/users/userModal"
import { supabaseAdmin } from "@/utils/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })

    return NextResponse.json(data.users as User[])
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}