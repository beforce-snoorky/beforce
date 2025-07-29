import { getServerSession } from "@/context/auth"
import { UserBase } from "@/types/users"
import supabaseAdmin from "@/utils/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 })

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    const users = data.users as UserBase[]
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ erroror: String(error) }, { status: 500 })
  }
}