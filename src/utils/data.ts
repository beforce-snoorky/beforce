export function formatPeriodToMonthYear(period: string): string {
  const [year, month] = period.split("-")
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  const monthIndex = parseInt(month, 10) - 1
  return `${monthNames[monthIndex]}/${year}`
}

export function toSeconds(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  return hours * 3600 + minutes * 60 + seconds
}

export function toMinutes(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  return hours * 60 + minutes + seconds / 60
}

export function toTimeString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":")
}

export function calculateAverageTime(timeStrings: string[]): string {
  const validTimes = timeStrings.filter((t): t is string => typeof t === "string")
  if (validTimes.length === 0) return "00:00:00"
  const totalSeconds = validTimes.reduce((sum, timeString) => sum + toSeconds(timeString), 0)
  const avgSeconds = Math.floor(totalSeconds / validTimes.length)
  return toTimeString(avgSeconds)
}

export function ensureFullPeriodFormat(input: string): string {
  if (/^\d{4}-\d{2}$/.test(input)) return `${input}-01`
  return input
}

export function getPreviousMonthAsPeriod() {
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 1)
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
  return `${currentDate.getFullYear()}-${month}`
}