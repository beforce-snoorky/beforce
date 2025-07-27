import { Company } from "@/types/company"

export function calculateScore(company: Company): {
  score: number
  activeCount: number
  total: number
  inactiveSolutions: string[]
} {
  const solutionMap: { key: keyof Company; label: string }[] = [
    { key: "has_email_corp", label: "Email Corporativo" },
    { key: "has_cloud_server", label: "Servidor em Nuvem" },
    { key: "has_management_system", label: "Sistema de Gestão" },
    { key: "has_website", label: "Site" },
    { key: "has_whatsapp", label: "WhatsApp" },
    { key: "has_ia", label: "Inteligência Artificial" },
    { key: "has_mkt_digital", label: "Marketing Digital" },
  ]

  const active = solutionMap.filter(({ key }) => company[key])
  const inactive = solutionMap.filter(({ key }) => !company[key])
  const score = Math.round((active.length / solutionMap.length) * 100)

  return {
    score,
    activeCount: active.length,
    total: solutionMap.length,
    inactiveSolutions: inactive.map((s) => s.label),
  }
}