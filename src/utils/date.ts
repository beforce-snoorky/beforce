export function getCurrentPeriod() {
  const now = new Date()
  now.setDate(1)
  now.setMonth(now.getMonth() - 1)

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}