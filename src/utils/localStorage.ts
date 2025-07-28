type CachedItem<T> = {
  data: T
  period: string
  timestamp: number
}

const EXPIRATION_TIME = 1000 * 60 * 60 * 24

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
    const parsed: CachedItem<T> = JSON.parse(raw)
    return parsed.data
  } catch {
    return null
  }
}