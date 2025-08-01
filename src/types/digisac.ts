export type DigisacReports = {
  id: string
  business_id: string
  period: string
  data: DigisacReportEntry[]
  created_at: string
}

export type DigisacReportEntry = {
  operator_name: string
  department: string
  ticket_time: string
  waiting_time: string
  waiting_time_after_bot: string
  waiting_time_avg: string
  sent_messages_count: number
  received_messages_count: number
  total_messages_count: number
  opened_tickets_count: number
  closed_tickets_count: number
  total_tickets_count: number
  contacts_count: number
}