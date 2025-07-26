import { createClient } from "@/utils/supabase/server"

export interface Company {
  id: string
  business_name: string
  email: string
  has_website: boolean
  has_whatsapp: boolean
  has_cloud_server: boolean
  has_email_corp: boolean
  has_ia: boolean
  has_management_system: boolean
  has_mkt_digital: boolean
  website_domain: string
  whatsapp_token: string
  whatsapp_url: string
}

export async function getServerSession() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Usuário não conectado..")

  const domain = user.email.split("@")[1]
  const isAdmin = domain === "beforce.com.br"

  const { data } = await supabase.from("business").select("id").ilike("email", `%@${domain}`).single()
  if (!data?.id) throw new Error("Empresa não encontrada no banco..")

  const { data: company } = await supabase.rpc('get_user_profile', { business_uuid: data?.id }).single<Company>()
  if (!company) throw new Error("Empresa não retornou perfil..")

  return { user, company, isAdmin }
}