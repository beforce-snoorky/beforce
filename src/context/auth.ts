import { createClient } from "@/utils/supabase/server"

export async function getServerSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return { user: null, company: null, isAdmin: false }

  const domain = user.email.split("@")[1]
  const isAdmin = domain === "beforce.com.br"

  const { data: company } = await supabase.from("users").select("*").ilike("email", `%@${domain}`).single()

  return { user, company, isAdmin }
}