import type { SupabaseDatabaseSchema } from "@/types/supabase"

export interface Database extends SupabaseDatabaseSchema {}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
