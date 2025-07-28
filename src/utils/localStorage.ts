export function setMonthlyCache<T>(key: string, data: T, period: string) {
  const value = {
    data,
    period,
    timestamp: Date.now(),
  }

  localStorage.setItem(`${key}:${period}`, JSON.stringify(value))
}

export function getMonthlyCache<T>(key: string, period: string): T | null {
  const raw = localStorage.getItem(`${key}:${period}`)
  if (!raw) return null

  try {
    const parsed: { data: T; period: string; timestamp: number } = JSON.parse(raw)
    return parsed.data
  } catch {
    return null
  }
}