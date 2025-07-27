import { Gauge } from "lucide-react"
import DashboardDataWrapper from "@/app/dashboard/wrapper"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center gap-2 mb-1 md">
        <Gauge className="w-6 h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold">Seu Score Digital</h1>
      </div>
      <p className="text-sm">Descubra como está sua transformação digital</p>

      <DashboardDataWrapper />
    </>
  )
}