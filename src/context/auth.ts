import { Company } from "@/types/company"
import { createClient } from "@/utils/supabase/server"

export async function getServerSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Usuário não conectado..")

  const domain = user.email.split("@")[1]
  const isAdmin = domain === "beforce.com.br"

  const { data } = await supabase.from("business").select("id").ilike("email", `%@${domain}`).single()
  if (!data?.id) throw new Error("Empresa não encontrada no banco..")

  const { data: company } = await supabase.rpc("get_user_profile", { business_uuid: data?.id }).single<Company>()
  if (!company) throw new Error("Empresa não retornou perfil..")

  return { user, company, isAdmin }
}