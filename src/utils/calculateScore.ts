import { solutions } from "@/constants/solutions"
import { Company } from "@/types/company"

export function calculateScore(company: Company) {
  const active = solutions.filter(({ key }) => company[key])
  const inactive = solutions.filter(({ key }) => !company[key])
  const score = Math.round((active.length / solutions.length) * 100)

  return {
    score,
    activeCount: active.length,
    total: solutions.length,
    inactiveSolutions: inactive.map(s => s.label),
  }
}