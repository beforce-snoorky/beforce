import { SupabaseClient, User } from "@supabase/supabase-js"

export interface Company {
  id: string
  business_name: string
  email: string
  has_website: boolean
  website_domain: string
  website_analytics_id: string
  has_digisac: boolean
  digisac_token: string
  digisac_url: string
  has_cloud_server: boolean
  has_email_corporate: boolean
  has_ia: boolean
  has_management_system: boolean
  has_marketing: boolean
}

export type AuthContextType = {
  supabaseClient: SupabaseClient
  user: User | null
  company: Company | null
  isAdmin: boolean
  loading: boolean
}