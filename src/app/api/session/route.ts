import { getServerSession } from "@/context/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    return NextResponse.json(session)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 401 })
  }
}