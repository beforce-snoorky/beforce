export type OpportunityStatus = "open" | "won" | "lost"

export type OpportunityPriority = "low" | "medium" | "high" | "urgent"

export type SupabaseDatabaseSchema = {
	public: {
		Tables: SchemaTablesWithRelationships<{
			companies: {
				Row: {
					id: string
					display_name: string
					logo_url: string | null
					status: CompanyStatus
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					display_name: string
					logo_url?: string | null
					status?: CompanyStatus
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					display_name?: string
					logo_url?: string | null
					status?: CompanyStatus
					created_at?: string | null
					updated_at?: string | null
				}
			}
			company_members: {
				Row: {
					id: string
					company_id: string
					user_id: string
					role: CompanyRole
					is_active: boolean | null
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					user_id: string
					role: CompanyRole
					is_active?: boolean | null
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					user_id?: string
					role?: CompanyRole
					is_active?: boolean | null
					created_at?: string | null
					updated_at?: string | null
				}
			}
			services: {
				Row: { id: string; code: string; name: string; created_at: string | null }
				Insert: { id?: string; code: string; name: string; created_at?: string | null }
				Update: { id?: string; code?: string; name?: string; created_at?: string | null }
			}
			company_services: {
				Row: {
					id: string
					company_id: string
					service_id: string
					is_active: boolean | null
					activated_at: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					service_id: string
					is_active?: boolean | null
					activated_at?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					service_id?: string
					is_active?: boolean | null
					activated_at?: string | null
					created_at?: string | null
				}
			}
			integrations_digisac: {
				Row: {
					id: string
					company_id: string
					token: string
					base_url: string
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					token: string
					base_url: string
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					token?: string
					base_url?: string
					created_at?: string | null
					updated_at?: string | null
				}
			}
			integrations_website: {
				Row: {
					id: string
					company_id: string
					domain: string
					analytics_id: string
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					domain: string
					analytics_id: string
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					domain?: string
					analytics_id?: string
					created_at?: string | null
					updated_at?: string | null
				}
			}
			monthly_reports: {
				Row: {
					id: string
					company_id: string
					service_id: string
					reference_month: string
					payload: Json
					created_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					service_id: string
					reference_month: string
					payload: Json
					created_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					service_id?: string
					reference_month?: string
					payload?: Json
					created_at?: string | null
				}
			}
			audit_logs: {
				Row: {
					id: string
					user_id: string | null
					company_id: string | null
					action: string
					entity: string | null
					entity_id: string | null
					changes: Json | null
					created_at: string | null
				}
				Insert: {
					id?: string
					user_id?: string | null
					company_id?: string | null
					action: string
					entity?: string | null
					entity_id?: string | null
					changes?: Json | null
					created_at?: string | null
				}
				Update: {
					id?: string
					user_id?: string | null
					company_id?: string | null
					action?: string
					entity?: string | null
					entity_id?: string | null
					changes?: Json | null
					created_at?: string | null
				}
			}
			crm_contacts: {
				Row: {
					id: string
					company_id: string
					name: string | null
					email: string | null
					phone: string | null
					instagram: string | null
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					name?: string | null
					email?: string | null
					phone?: string | null
					instagram?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					name?: string | null
					email?: string | null
					phone?: string | null
					instagram?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
			}
			crm_pipelines: {
				Row: { id: string; company_id: string; name: string; is_default: boolean | null; created_at: string | null }
				Insert: { id?: string; company_id: string; name: string; is_default?: boolean | null; created_at?: string | null }
				Update: { id?: string; company_id?: string; name?: string; is_default?: boolean | null; created_at?: string | null }
			}
			crm_pipeline_stages: {
				Row: { id: string; pipeline_id: string; name: string; position: number; created_at: string | null }
				Insert: { id?: string; pipeline_id: string; name: string; position: number; created_at?: string | null }
				Update: { id?: string; pipeline_id?: string; name?: string; position?: number; created_at?: string | null }
			}
			crm_opportunities: {
				Row: {
					id: string
					company_id: string
					contact_id: string
					pipeline_id: string
					stage_id: string
					name: string | null
					value: number | null
					status: OpportunityStatus
					priority: OpportunityPriority
					assigned_to: string | null
					created_at: string | null
					updated_at: string | null
				}
				Insert: {
					id?: string
					company_id: string
					contact_id: string
					pipeline_id: string
					stage_id: string
					name?: string | null
					value?: number | null
					status?: OpportunityStatus
					priority?: OpportunityPriority | null
					assigned_to?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
				Update: {
					id?: string
					company_id?: string
					contact_id?: string
					pipeline_id?: string
					stage_id?: string
					name?: string | null
					value?: number | null
					status?: OpportunityStatus
					priority?: OpportunityPriority | null
					assigned_to?: string | null
					created_at?: string | null
					updated_at?: string | null
				}
			}
		}>
		Views: Record<string, unknown>
		Functions: Record<string, unknown>
		Enums: Record<string, unknown>
		CompositeTypes: Record<string, unknown>
	}
}

export type SchemaTablesWithRelationships<
	TableMap extends Record<
		string,
		{
			Row: Record<string, Json | string | number | boolean | null | undefined>
			Insert: Record<string, Json | string | number | boolean | null | undefined>
			Update: Record<string, Json | string | number | boolean | null | undefined>
		}
	>,
> = { [Key in keyof TableMap]: TableMap[Key] & { Relationships: SupabaseRelationship[] } }

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type SupabaseRelationship = {
	foreignKeyName: string
	columns: string[]
	isOneToOne?: boolean
	referencedRelation: string
	referencedColumns: string[]
}

export type CompanyStatus = "active" | "suspended" | "blocked" | "trial" | "cancelled"

export type CompanyRole = "owner" | "admin" | "member" | "viewer"
