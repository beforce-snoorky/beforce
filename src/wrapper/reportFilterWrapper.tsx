"use client"

import { ReportFilterProvider } from "@/context/reportFilter"

export function ReportFilterWrapper({ children }: { children: React.ReactNode }) {
  return <ReportFilterProvider>{children}</ReportFilterProvider>
}