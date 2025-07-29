export function getPreviousMonthPeriod() {
  const currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 1)
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
  return `${currentDate.getFullYear()}-${month}`
}